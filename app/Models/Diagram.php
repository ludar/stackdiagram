<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Diagram extends Model
{
    use SoftDeletes;

    // Short base58 string PK, no auto-increment.
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = ['title', 'view', 'visibility', 'doc', 'layout', 'expires_at'];

    protected function casts(): array
    {
        return [
            'doc' => 'array',
            'layout' => 'array',
            'expires_at' => 'datetime',
        ];
    }

    /** Base58: no 0/O/I/l lookalikes. */
    private const ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

    public static function generateId(int $length = 6): string
    {
        // Collision retry; grow length as the space fills.
        for ($attempt = 0; $attempt < 8; $attempt++) {
            $len = $length + intdiv($attempt, 4); // after 4 collisions try 7 chars
            $id = '';
            for ($i = 0; $i < $len; $i++) {
                $id .= self::ALPHABET[random_int(0, strlen(self::ALPHABET) - 1)];
            }
            if (!static::whereKey($id)->exists()) {
                return $id;
            }
        }
        throw new \RuntimeException('Could not allocate diagram id');
    }

    public static function newClaimToken(): array
    {
        $token = 'ct_'.Str::random(40);
        return [$token, hash('sha256', $token)];
    }

    public function claimTokenMatches(?string $token): bool
    {
        return $token !== null
            && $this->claim_token_hash !== null
            && hash_equals($this->claim_token_hash, hash('sha256', $token));
    }

    public function isExpired(): bool
    {
        return $this->expires_at !== null && $this->expires_at->isPast();
    }

    public function forkFor(User $user): self
    {
        $fork = new self([
            'title' => $this->title,
            'view' => $this->view,
            'doc' => $this->doc,
            'layout' => $this->layout,
        ]);
        $fork->id = self::generateId();
        $fork->owner_id = $user->id;
        $fork->forked_from_id = $this->id;
        $fork->visibility = 'unlisted';
        $fork->expires_at = null; // owned from birth
        $fork->save();
        $fork->snapshotVersion($user->id);

        return $fork;
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function versions(): HasMany
    {
        return $this->hasMany(DiagramVersion::class)->orderByDesc('seq');
    }

    public function snapshotVersion(?int $authorId = null): void
    {
        $seq = (int) $this->versions()->max('seq') + 1;
        $this->versions()->create([
            'seq' => $seq,
            'doc' => $this->doc,
            'author_id' => $authorId,
            'created_at' => now(),
        ]);
        // Retention: keep last 50.
        $this->versions()->where('seq', '<=', $seq - 50)->delete();
    }
}
