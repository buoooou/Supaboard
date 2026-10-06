<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TrafficLogResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $updatedAt = $this->updated_at ?? $this['updated_at'] ?? null;
        if ($updatedAt instanceof \DateTimeInterface) {
            $updatedAt = $updatedAt->getTimestamp();
        }
        $createdAt = $this->created_at ?? $this['created_at'] ?? null;
        if ($createdAt instanceof \DateTimeInterface) {
            $createdAt = $createdAt->getTimestamp();
        }

        $data = [
            "d" => $this['d'],
            "u" => $this['u'],
            "record_at" => $this['record_at'],
            "server_rate" => $this['server_rate'],
            "updated_at" => $updatedAt ? (int) $updatedAt : null,
            "created_at" => $createdAt ? (int) $createdAt : null,
        ];
        if(!config('hidden_features.enable_exposed_user_count_fix')) $data['user_id']= $this['user_id'];
        return $data;
    }
}
