<?php

namespace Plugin\StalwartMarketing\Services;

use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class StalwartJmapMailer
{
    protected const CORE_CAPABILITY = 'urn:ietf:params:jmap:core';
    protected const MAIL_CAPABILITY = 'urn:ietf:params:jmap:mail';
    protected const SUBMISSION_CAPABILITY = 'urn:ietf:params:jmap:submission';

    protected array $config;
    protected ?array $session = null;
    protected ?string $accountId = null;
    protected ?string $identityId = null;
    protected ?string $draftMailboxId = null;

    public function __construct(array $config)
    {
        $this->config = $config;
    }

    public function sendBatch(array $payload): array
    {
        $recipients = $payload['recipients'] ?? [];

        if (!is_array($recipients) || empty($recipients)) {
            throw new \InvalidArgumentException('Recipients are required.');
        }

        if (!empty($payload['dry_run'])) {
            return [
                'dry_run' => true,
                'accepted' => count($recipients),
                'failed' => 0,
                'results' => array_map(function ($r) {
                    $email = is_array($r) ? $r['email'] : $r;
                    return ['email' => $email, 'status' => 'validated'];
                }, $recipients),
            ];
        }

        $this->assertConfigured();
        $this->loadSessionIfNeeded();
        $this->accountId = $this->resolveAccountId();
        $this->identityId = $this->resolveIdentityId();
        $this->draftMailboxId = $this->resolveDraftMailboxId();

        $batchSize = max(1, (int) ($this->config['batch_size'] ?? 20));
        $delayMs = max(0, (int) ($this->config['delay_ms'] ?? 200));

        $allResults = [
            'accepted' => 0,
            'failed' => 0,
            'results' => [],
        ];

        $chunks = array_chunk($recipients, $batchSize);
        
        foreach ($chunks as $index => $chunk) {
            if ($index > 0 && $delayMs > 0) {
                usleep($delayMs * 1000);
            }
            
            $batchResult = $this->submitBatch($chunk, $payload);
            
            $allResults['accepted'] += $batchResult['accepted'];
            $allResults['failed'] += $batchResult['failed'];
            $allResults['results'] = array_merge($allResults['results'], $batchResult['results']);
        }

        return $allResults;
    }

    protected function submitBatch(array $recipients, array $payload): array
    {
        $messages = [];
        $emailCreates = [];
        $submissionCreates = [];
        $from = $this->resolveFrom($payload);
        $fromEmail = $from['email'];
        $fromName = $from['name'];
        $replyTo = ($payload['reply_to'] ?? null) ?: ($this->config['reply_to'] ?? '');

        if (!filter_var($fromEmail, FILTER_VALIDATE_EMAIL)) {
            throw new \InvalidArgumentException('A valid sender email is required.');
        }

        foreach ($recipients as $recipient) {
            $recipientEmail = is_array($recipient) ? $recipient['email'] : $recipient;
            $personalizedPayload = is_array($recipient) ? array_merge($payload, $recipient) : $payload;

            $messageCreateId = $this->generateCreationId('msg');
            $submissionCreateId = $this->generateCreationId('send');

            $messages[] = [
                'recipient' => $recipientEmail,
                'message_create_id' => $messageCreateId,
                'submission_create_id' => $submissionCreateId,
            ];

            $emailCreates[$messageCreateId] = $this->buildEmailObject($personalizedPayload, $recipientEmail, $fromEmail, $fromName, $replyTo);
            $submissionCreates[$submissionCreateId] = [
                'emailId' => '#' . $messageCreateId,
                'identityId' => $this->identityId,
                'envelope' => [
                    'mailFrom' => ['email' => $fromEmail],
                    'rcptTo' => [
                        ['email' => $recipientEmail],
                    ],
                ],
            ];
        }

        $response = $this->jmap([
            [
                'Email/set',
                [
                    'accountId' => $this->accountId,
                    'create' => $emailCreates,
                ],
                'a',
            ],
            [
                'EmailSubmission/set',
                [
                    'accountId' => $this->accountId,
                    'create' => $submissionCreates,
                    'onSuccessDestroyEmail' => array_values(array_map(
                        fn ($message) => '#' . $message['message_create_id'],
                        $messages
                    )),
                ],
                'b',
            ],
        ]);

        $emailSet = $this->methodResponse($response, 'Email/set');
        $submissionSet = $this->methodResponse($response, 'EmailSubmission/set');
        $results = [];
        $cleanupEmailIds = [];

        foreach ($messages as $message) {
            $messageCreateId = $message['message_create_id'];
            $submissionCreateId = $message['submission_create_id'];
            $emailError = $emailSet['notCreated'][$messageCreateId] ?? null;
            $submissionError = $submissionSet['notCreated'][$submissionCreateId] ?? null;

            if ($emailError || $submissionError) {
                if (!empty($emailSet['created'][$messageCreateId]['id'])) {
                    $cleanupEmailIds[] = $emailSet['created'][$messageCreateId]['id'];
                }

                $results[] = [
                    'email' => $message['recipient'],
                    'status' => 'failed',
                    'error' => $this->formatSetError($emailError ?: $submissionError),
                ];

                continue;
            }

            $results[] = [
                'email' => $message['recipient'],
                'status' => 'sent',
                'submission_id' => $submissionSet['created'][$submissionCreateId]['id'] ?? $submissionCreateId,
            ];
        }

        if (!empty($cleanupEmailIds)) {
            $this->destroyDrafts($cleanupEmailIds);
        }

        return [
            'accepted' => count(array_filter($results, fn ($row) => $row['status'] === 'sent')),
            'failed' => count(array_filter($results, fn ($row) => $row['status'] !== 'sent')),
            'results' => $results,
        ];
    }

    protected function generateCreationId(string $prefix): string
    {
        return $prefix . '_' . Str::lower(Str::random(12));
    }

    protected function destroyDrafts(array $emailIds): void
    {
        try {
            $this->jmap([
                [
                    'Email/set',
                    [
                        'accountId' => $this->accountId,
                        'destroy' => array_values($emailIds),
                    ],
                    'cleanup',
                ],
            ]);
        } catch (\Throwable) {
            // The send result is more important than best-effort draft cleanup.
        }
    }

    protected function buildEmailObject(array $payload, string $recipient, string $fromEmail, string $fromName, string $replyTo): array
    {
        $bodyValues = [];
        $headers = is_array($payload['headers'] ?? null) ? $payload['headers'] : [];

        $email = [
            'from' => [
                ['name' => $fromName, 'email' => $fromEmail],
            ],
            'to' => [
                ['email' => $recipient],
            ],
            'subject' => (string) ($payload['subject'] ?? ''),
            'mailboxIds' => [
                $this->draftMailboxId => true,
            ],
            'keywords' => ['$draft' => true],
        ];

        if ($replyTo !== '') {
            $email['replyTo'] = [
                ['email' => $replyTo],
            ];
        }

        if (!empty($payload['message_id'])) {
            $headers['Message-ID'] = (string) $payload['message_id'];
        }

        foreach ($headers as $headerName => $headerValue) {
            $headerName = trim((string) $headerName);

            if ($headerName === '' || str_starts_with(strtolower($headerName), 'content-')) {
                continue;
            }

            $email["header:{$headerName}:asText"] = (string) $headerValue;
        }

        if (!empty($payload['text'])) {
            $email['textBody'] = [['partId' => 'text', 'type' => 'text/plain']];
            $bodyValues['text'] = [
                'value' => (string) ($payload['text'] ?? ''),
            ];
        }

        if (!empty($payload['html'])) {
            $email['htmlBody'] = [['partId' => 'html', 'type' => 'text/html']];
            $bodyValues['html'] = [
                'value' => (string) ($payload['html'] ?? ''),
            ];
        }

        $email['bodyValues'] = $bodyValues;

        return $email;
    }

    protected function resolveFrom(array $payload): array
    {
        if (!empty($payload['from'])) {
            $from = $this->parseEmailAddress((string) $payload['from']);

            if ($from['email'] !== '') {
                return $from;
            }
        }

        return [
            'name' => (string) (($payload['from_name'] ?? null) ?: ($this->config['from_name'] ?? '')),
            'email' => (string) (($payload['from_email'] ?? null) ?: ($this->config['from_email'] ?? '')),
        ];
    }

    protected function parseEmailAddress(string $address): array
    {
        if (preg_match('/^(.*?)\s*<(.+)>$/', $address, $matches)) {
            return [
                'name' => trim($matches[1]),
                'email' => trim($matches[2]),
            ];
        }

        return [
            'name' => '',
            'email' => trim($address),
        ];
    }

    protected function loadSessionIfNeeded(): void
    {
        if (!empty($this->config['account_id']) && !empty($this->config['identity_id']) && !empty($this->config['draft_mailbox_id'])) {
            return;
        }

        $this->loadSession();
    }

    protected function loadSession(): array
    {
        if ($this->session !== null) {
            return $this->session;
        }

        $url = $this->wellKnownUrl();
        $response = $this->http()->get($url);

        if (!$response->successful()) {
            throw new \RuntimeException("Unable to load JMAP session from {$url}: HTTP {$response->status()}");
        }

        $this->session = $response->json();

        if (!is_array($this->session)) {
            throw new \RuntimeException('Invalid JMAP session response.');
        }

        return $this->session;
    }

    protected function resolveAccountId(): string
    {
        if (!empty($this->config['account_id'])) {
            return (string) $this->config['account_id'];
        }

        $this->loadSession();

        $accounts = $this->session['primaryAccounts'] ?? [];

        if (!empty($accounts[self::MAIL_CAPABILITY])) {
            return (string) $accounts[self::MAIL_CAPABILITY];
        }

        $allAccounts = $this->session['accounts'] ?? [];
        $firstAccountId = array_key_first($allAccounts);

        if ($firstAccountId) {
            return (string) $firstAccountId;
        }

        throw new \RuntimeException('Unable to resolve JMAP account_id. Set it in plugin config.');
    }

    protected function resolveIdentityId(): string
    {
        if (!empty($this->config['identity_id'])) {
            return (string) $this->config['identity_id'];
        }

        $this->loadSession();

        $response = $this->jmap([
            [
                'Identity/get',
                [
                    'accountId' => $this->accountId,
                    'ids' => null,
                ],
                'i1',
            ],
        ]);

        $list = $this->methodResponse($response, 'Identity/get')['list'] ?? [];

        if (!empty($list[0]['id'])) {
            return (string) $list[0]['id'];
        }

        throw new \RuntimeException('Unable to resolve JMAP identity_id. Set it in plugin config.');
    }

    protected function resolveDraftMailboxId(): string
    {
        if (!empty($this->config['draft_mailbox_id'])) {
            return (string) $this->config['draft_mailbox_id'];
        }

        $this->loadSession();

        $response = $this->jmap([
            [
                'Mailbox/get',
                [
                    'accountId' => $this->accountId,
                    'ids' => null,
                    'properties' => ['id', 'name', 'role'],
                ],
                'm1',
            ],
        ]);

        $mailboxes = $this->methodResponse($response, 'Mailbox/get')['list'] ?? [];

        foreach ($mailboxes as $mailbox) {
            if (($mailbox['role'] ?? '') === 'drafts') {
                return (string) $mailbox['id'];
            }
        }

        foreach ($mailboxes as $mailbox) {
            if (strtolower((string) ($mailbox['name'] ?? '')) === 'drafts') {
                return (string) $mailbox['id'];
            }
        }

        throw new \RuntimeException('Unable to resolve drafts mailbox. Set draft_mailbox_id in plugin config.');
    }

    protected function jmap(array $methodCalls): array
    {
        $apiUrl = $this->jmapUrl();
        $payload = json_encode([
            'using' => [
                self::CORE_CAPABILITY,
                self::MAIL_CAPABILITY,
                self::SUBMISSION_CAPABILITY,
            ],
            'methodCalls' => $methodCalls,
        ], JSON_UNESCAPED_SLASHES);

        $response = $this->http()->withBody($payload, 'application/json')->post($apiUrl);

        if (!$response->successful()) {
            throw new \RuntimeException("JMAP request failed: HTTP {$response->status()} {$response->body()}");
        }

        $json = $response->json();

        if (!is_array($json)) {
            throw new \RuntimeException('Invalid JMAP response.');
        }

        if (!empty($json['methodResponses'])) {
            foreach ($json['methodResponses'] as $methodResponse) {
                if (($methodResponse[0] ?? '') === 'error') {
                    $description = $methodResponse[1]['description'] ?? $methodResponse[1]['type'] ?? 'Unknown JMAP error';
                    throw new \RuntimeException($description);
                }
            }
        }

        return $json;
    }

    protected function methodResponse(array $response, string $name): array
    {
        foreach ($response['methodResponses'] ?? [] as $methodResponse) {
            if (($methodResponse[0] ?? null) === $name) {
                return $methodResponse[1] ?? [];
            }
        }

        return [];
    }

    protected function collectSetErrors(array $response): string
    {
        $messages = [];

        foreach ($response['methodResponses'] ?? [] as $methodResponse) {
            $payload = $methodResponse[1] ?? [];

            foreach (['notCreated', 'notUpdated', 'notDestroyed'] as $key) {
                foreach (($payload[$key] ?? []) as $id => $error) {
                    $type = $error['type'] ?? 'unknown';
                    $description = $error['description'] ?? '';
                    $messages[] = trim("{$key}.{$id}: {$type} {$description}");
                }
            }
        }

        return implode('; ', $messages);
    }

    protected function formatSetError(?array $error): string
    {
        if (!$error) {
            return 'Unknown Stalwart API error.';
        }

        $type = $error['type'] ?? 'unknown';
        $description = $error['description'] ?? '';

        return trim("{$type} {$description}") ?: json_encode($error);
    }

    protected function http(): PendingRequest
    {
        $request = Http::acceptJson()
            ->asJson()
            ->timeout(max(1, (int) ($this->config['timeout'] ?? 30)));

        if (($this->config['auth_type'] ?? 'basic') === 'bearer') {
            return $request->withToken((string) ($this->config['bearer_token'] ?? ''));
        }

        return $request->withBasicAuth(
            (string) ($this->config['username'] ?? ''),
            (string) ($this->config['password'] ?? '')
        );
    }

    protected function assertConfigured(): void
    {
        if ($this->baseUrl() === '') {
            throw new \InvalidArgumentException('Stalwart base_url is required.');
        }

        if (($this->config['auth_type'] ?? 'basic') === 'bearer') {
            if (empty($this->config['bearer_token'])) {
                throw new \InvalidArgumentException('bearer_token is required when auth_type is bearer.');
            }

            return;
        }

        if (empty($this->config['username']) || empty($this->config['password'])) {
            throw new \InvalidArgumentException('username and password are required when auth_type is basic.');
        }
    }

    protected function baseUrl(): string
    {
        $url = rtrim((string) ($this->config['base_url'] ?? ''), '/');

        if (str_ends_with($url, '/jmap')) {
            return substr($url, 0, -5);
        }

        return $url;
    }

    protected function jmapUrl(): string
    {
        $configured = rtrim((string) ($this->config['base_url'] ?? ''), '/');

        if (str_ends_with($configured, '/jmap')) {
            return $configured;
        }

        return $this->session['apiUrl'] ?? ($this->baseUrl() . '/jmap');
    }

    protected function wellKnownUrl(): string
    {
        return $this->baseUrl() . '/.well-known/jmap';
    }
}
