<!doctype html>
<html lang="zh-CN">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="api-config-url" content="/api/v1/plugin/stalwart-marketing/config">
    <meta name="api-recipients-url" content="/api/v1/plugin/stalwart-marketing/recipients">
    <meta name="api-test-url" content="/api/v1/plugin/stalwart-marketing/test">
    <meta name="api-send-url" content="/api/v1/plugin/stalwart-marketing/send">
    <title>Stalwart Marketing</title>
    <style>
        :root {
            color-scheme: light;
            --bg: #f7f8fb;
            --panel: #ffffff;
            --text: #111827;
            --muted: #667085;
            --line: #d9dee8;
            --primary: #0f172a;
            --danger: #dc2626;
            --ok: #047857;
        }
        * { box-sizing: border-box; }
        body {
            margin: 0;
            background: var(--bg);
            color: var(--text);
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }
        main {
            width: min(1120px, calc(100vw - 32px));
            margin: 24px auto;
        }
        h1 { margin: 0 0 8px; font-size: 24px; }
        h2 { margin: 0 0 16px; font-size: 18px; }
        p { margin: 0; color: var(--muted); }
        .grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
            margin-top: 16px;
        }
        .panel {
            background: var(--panel);
            border: 1px solid var(--line);
            border-radius: 8px;
            padding: 18px;
        }
        .status {
            display: grid;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 12px;
            margin-top: 16px;
        }
        .metric {
            background: var(--panel);
            border: 1px solid var(--line);
            border-radius: 8px;
            padding: 12px;
            min-width: 0;
        }
        .metric span {
            display: block;
            color: var(--muted);
            font-size: 12px;
            margin-bottom: 5px;
        }
        .metric strong {
            display: block;
            overflow-wrap: anywhere;
            font-size: 14px;
        }
        label {
            display: block;
            margin: 12px 0 6px;
            font-size: 13px;
            color: #344054;
            font-weight: 600;
        }
        input, textarea, select {
            width: 100%;
            border: 1px solid var(--line);
            border-radius: 6px;
            padding: 10px 12px;
            font: inherit;
            background: #fff;
            color: var(--text);
        }
        select { height: 43px; }
        textarea {
            min-height: 120px;
            resize: vertical;
        }
        .row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
        }
        .hint {
            margin-top: 8px;
            font-size: 13px;
            color: var(--muted);
            line-height: 1.5;
        }
        .hide { display: none; }
        .actions {
            display: flex;
            gap: 10px;
            align-items: center;
            margin-top: 14px;
        }
        button {
            border: 0;
            border-radius: 6px;
            padding: 10px 14px;
            background: var(--primary);
            color: #fff;
            cursor: pointer;
            font-weight: 700;
        }
        button.secondary {
            background: #475467;
        }
        button:disabled {
            opacity: .55;
            cursor: not-allowed;
        }
        pre {
            white-space: pre-wrap;
            word-break: break-word;
            background: #101828;
            color: #eef2ff;
            border-radius: 8px;
            padding: 14px;
            min-height: 120px;
            margin: 0;
            font-size: 13px;
        }
        .ok { color: var(--ok); }
        .fail { color: var(--danger); }
        @media (max-width: 860px) {
            .grid, .status, .row {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
<main>
    <h1>Stalwart Marketing</h1>
    <p>通过你部署的 Stalwart JMAP API 发送测试邮件和批量营销邮件。</p>

    <section class="panel" style="margin-top:16px">
        <h2>后台认证</h2>
        <div class="row">
            <div>
                <label for="authToken">Authorization</label>
                <input id="authToken" type="password" placeholder="Bearer eyJ...">
            </div>
            <div>
                <label for="stableUrl">稳定入口</label>
                <input id="stableUrl" readonly value="/plugin/stalwart-marketing">
            </div>
        </div>
        <p class="hint">页面会自动从 localStorage、sessionStorage 和 cookie 里找后台 token。找不到时，把 Xboard 请求里的 Authorization 粘到这里，页面会保存在本浏览器。</p>
        <div class="actions">
            <button type="button" id="saveAuthButton">保存 Authorization</button>
            <button class="secondary" type="button" id="loadConfigButton">读取插件配置</button>
        </div>
    </section>

    <section class="status">
        <div class="metric">
            <span>状态</span>
            <strong id="metricEnabled" class="{{ $enabled ? 'ok' : 'fail' }}">{{ $enabled ? '已启用' : '未启用' }}</strong>
        </div>
        <div class="metric">
            <span>Stalwart URL</span>
            <strong id="metricBaseUrl">{{ $base_url ?: '未配置' }}</strong>
        </div>
        <div class="metric">
            <span>发件人</span>
            <strong id="metricFrom">{{ trim(($from_name ? $from_name . ' ' : '') . '<' . $from_email . '>') }}</strong>
        </div>
        <div class="metric">
            <span>单次上限</span>
            <strong id="metricLimits">{{ $batch_size }}</strong>
        </div>
    </section>

    <section class="grid">
        <div class="panel">
            <h2>测试发送</h2>
            <form id="testForm">
                <label for="testEmail">收件邮箱</label>
                <input id="testEmail" name="email" type="email" placeholder="you@example.com" required>
                <div class="actions">
                    <button type="submit">发送测试邮件</button>
                </div>
            </form>
        </div>

        <div class="panel">
            <h2>批量发送</h2>
            <form id="sendForm">
                <div class="row">
                    <div>
                        <label for="recipientSource">收件人来源</label>
                        <select id="recipientSource" name="recipient_source">
                            <option value="manual">手动输入</option>
                            <option value="system">系统用户列表</option>
                        </select>
                    </div>
                    <div>
                        <label for="targetStatus">系统用户分组</label>
                        <select id="targetStatus" name="target_status">
                            <option value="subscribed">订阅用户</option>
                            <option value="active">订阅且有剩余流量</option>
                            <option value="free">免费用户</option>
                            <option value="expired">已过期用户</option>
                            <option value="free_or_expired">免费或已过期用户</option>
                            <option value="banned">封禁用户</option>
                            <option value="all">全部用户</option>
                        </select>
                    </div>
                </div>

                <div id="systemTargetFields" class="hide">
                    <div class="row">
                        <div>
                            <label for="targetKeyword">搜索邮箱/套餐</label>
                            <input id="targetKeyword" name="target_keyword" placeholder="可留空">
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                            <div>
                                <label for="targetLimit">最多取多少用户</label>
                                <input id="targetLimit" name="target_limit" type="number" min="1" value="{{ $batch_size }}">
                            </div>
                            <div>
                                <label for="targetOffset">跳过多少用户</label>
                                <input id="targetOffset" name="target_offset" type="number" min="0" value="0">
                            </div>
                        </div>
                    </div>
                    <div class="actions">
                        <button class="secondary" type="button" id="previewRecipientsButton">预览系统收件人</button>
                    </div>
                </div>

                <label for="recipients">收件人</label>
                <textarea id="recipients" name="recipients" placeholder="a@example.com, b@example.com" required></textarea>

                <label for="from">发件人</label>
                <input id="from" name="from" value="{{ $from_name ? $from_name . ' <' . $from_email . '>' : $from_email }}">

                <label for="subject">标题</label>
                <input id="subject" name="subject" required>

                <label for="text">邮件正文（支持直接换行，将自动套用内置整洁模版）</label>
                <textarea id="text" name="text" placeholder="尊敬的用户您好：&#10;&#10;这是您的激活邮件..."></textarea>

                <details style="margin-top: 12px; margin-bottom: 12px;">
                    <summary style="cursor: pointer; color: var(--muted); font-size: 13px; outline: none; user-select: none;">高级：手动输入 HTML（留空则自动使用内置模版）</summary>
                    <div style="margin-top: 8px;">
                        <textarea id="html" name="html" placeholder="<html>...</html>" style="min-height: 80px;"></textarea>
                    </div>
                </details>

                <div class="actions">
                    <button type="submit">发送</button>
                    <button class="secondary" type="button" id="dryRunButton">Dry Run</button>
                </div>
            </form>
        </div>
    </section>

    <section class="panel" style="margin-top:16px">
        <h2>结果</h2>
        <pre id="result">等待操作...</pre>
    </section>
</main>

<script>
    const apiConfigUrl = document.querySelector('meta[name="api-config-url"]').content;
    const apiRecipientsUrl = document.querySelector('meta[name="api-recipients-url"]').content;
    const apiTestUrl = document.querySelector('meta[name="api-test-url"]').content;
    const apiSendUrl = document.querySelector('meta[name="api-send-url"]').content;
    const result = document.getElementById('result');
    const testForm = document.getElementById('testForm');
    const sendForm = document.getElementById('sendForm');
    const dryRunButton = document.getElementById('dryRunButton');
    const authTokenInput = document.getElementById('authToken');
    const saveAuthButton = document.getElementById('saveAuthButton');
    const loadConfigButton = document.getElementById('loadConfigButton');
    const recipientSource = document.getElementById('recipientSource');
    const systemTargetFields = document.getElementById('systemTargetFields');
    const previewRecipientsButton = document.getElementById('previewRecipientsButton');
    const recipientsTextarea = document.getElementById('recipients');

    authTokenInput.value = localStorage.getItem('stalwart_marketing_authorization') || '';

    function findAdminToken() {
        const preferredKeys = [
            'authorization',
            'Authorization',
            'token',
            'access_token',
            'admin_token',
            'xboard_token',
        ];

        const manualToken = authTokenInput.value || localStorage.getItem('stalwart_marketing_authorization');

        if (manualToken) {
            return normalizeToken(manualToken);
        }

        for (const storage of [localStorage, sessionStorage]) {
            for (const key of preferredKeys) {
                const value = storage.getItem(key);
                if (value) {
                    return normalizeToken(value);
                }
            }
        }

        for (const storage of [localStorage, sessionStorage]) {
            for (let index = 0; index < storage.length; index++) {
                const key = storage.key(index);
                const value = storage.getItem(key);

                if (!value) {
                    continue;
                }

                const token = extractToken(value);
                if (token) {
                    return normalizeToken(token);
                }
            }
        }

        for (const cookie of document.cookie.split(';')) {
            const value = cookie.split('=').slice(1).join('=');
            if (value) {
                const token = extractToken(decodeURIComponent(value));
                if (token) {
                    return normalizeToken(token);
                }
            }
        }

        return '';
    }

    function extractToken(value) {
        if (/^(Bearer|Basic)\s+/i.test(value) || /^[A-Za-z0-9._-]{20,}$/.test(value)) {
            return value;
        }

        try {
            const parsed = JSON.parse(value);
            return findTokenInObject(parsed);
        } catch (_) {
            return '';
        }
    }

    function findTokenInObject(value) {
        if (!value || typeof value !== 'object') {
            return '';
        }

        for (const key of ['authorization', 'token', 'access_token', 'admin_token']) {
            if (typeof value[key] === 'string') {
                return value[key];
            }
        }

        for (const child of Object.values(value)) {
            const token = findTokenInObject(child);
            if (token) {
                return token;
            }
        }

        return '';
    }

    function normalizeToken(value) {
        const token = String(value).trim().replace(/^"|"$/g, '');
        return /^(Bearer|Basic)\s+/i.test(token) ? token : `Bearer ${token}`;
    }

    function show(data) {
        result.textContent = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
    }

    async function post(url, payload) {
        return request(url, {
            method: 'POST',
            body: JSON.stringify(payload),
        });
    }

    async function get(url, params = {}) {
        const target = new URL(url, window.location.origin);
        for (const [key, value] of Object.entries(params)) {
            if (value !== undefined && value !== null && value !== '') {
                target.searchParams.set(key, value);
            }
        }

        return request(target.toString(), {
            method: 'GET',
        });
    }

    async function request(url, options) {
        const authorization = findAdminToken();

        if (!authorization) {
            throw '没有找到管理员 token。请先打开 /onlineboard 登录后台；如果仍失败，请在页面顶部粘贴 Authorization 后保存。';
        }

        const response = await fetch(url, {
            method: options.method,
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': authorization,
            },
            body: options.body,
        });

        const text = await response.text();
        let data = text;

        try {
            data = JSON.parse(text);
        } catch (_) {}

        if (!response.ok) {
            throw data;
        }

        return data;
    }

    function unwrapData(response) {
        return response?.data ?? response;
    }

    function applyConfig(config) {
        const data = unwrapData(config);
        const from = data.from_name ? `${data.from_name} <${data.from_email}>` : data.from_email;

        document.getElementById('metricEnabled').textContent = data.enabled ? '已启用' : '未启用';
        document.getElementById('metricBaseUrl').textContent = data.base_url || '未配置';
        document.getElementById('metricFrom').textContent = from || '<>';
        document.getElementById('metricLimits').textContent = `${data.batch_size} / ${data.max_send_recipients}`;
        document.getElementById('from').value = from || document.getElementById('from').value;
        document.getElementById('targetLimit').value = data.batch_size || 20;
    }

    saveAuthButton.addEventListener('click', () => {
        localStorage.setItem('stalwart_marketing_authorization', authTokenInput.value.trim());
        show('Authorization 已保存到本浏览器。');
    });

    loadConfigButton.addEventListener('click', async () => {
        try {
            const config = await get(apiConfigUrl);
            applyConfig(config);
            show(config);
        } catch (error) {
            show(error);
        }
    });

    recipientSource.addEventListener('change', () => {
        const systemMode = recipientSource.value === 'system';
        systemTargetFields.classList.toggle('hide', !systemMode);
        recipientsTextarea.required = !systemMode;
        recipientsTextarea.placeholder = systemMode ? '点击“预览系统收件人”后自动填充，也可以留空直接按筛选发送' : 'a@example.com, b@example.com';
    });

    previewRecipientsButton.addEventListener('click', async () => {
        show('读取系统用户中...');

        try {
            const data = await get(apiRecipientsUrl, {
                status: document.getElementById('targetStatus').value,
                keyword: document.getElementById('targetKeyword').value,
                limit: document.getElementById('targetLimit').value,
                offset: document.getElementById('targetOffset').value,
            });
            const payload = unwrapData(data);
            recipientsTextarea.value = (payload.emails || []).join(', ');
            show(data);
        } catch (error) {
            show(error);
        }
    });

    testForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        show('发送中...');

        try {
            show(await post(apiTestUrl, {
                email: new FormData(testForm).get('email'),
            }));
        } catch (error) {
            show(error);
        }
    });

    async function submitBatch(dryRun) {
        const form = new FormData(sendForm);
        const payload = {
            recipient_source: form.get('recipient_source'),
            recipients: form.get('recipients'),
            target_status: form.get('target_status'),
            target_keyword: form.get('target_keyword'),
            target_limit: form.get('target_limit'),
            target_offset: form.get('target_offset'),
            from: form.get('from'),
            subject: form.get('subject'),
            html: form.get('html'),
            text: form.get('text'),
            dry_run: dryRun,
        };

        show(dryRun ? '验证中...' : '发送中...');
        show(await post(apiSendUrl, payload));
    }

    sendForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        try {
            await submitBatch(false);
        } catch (error) {
            show(error);
        }
    });

    dryRunButton.addEventListener('click', async () => {
        try {
            await submitBatch(true);
        } catch (error) {
            show(error);
        }
    });

    get(apiConfigUrl).then(applyConfig).catch(() => {});
</script>
</body>
</html>
