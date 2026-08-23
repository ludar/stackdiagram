<?php

namespace App\Console\Commands;

use App\Models\Diagram;
use App\Models\DiagramVersion;
use Illuminate\Console\Command;

class PurgeExpiredDiagrams extends Command
{
    protected $signature = 'diagrams:purge-expired {--chunk=500}';

    protected $description = 'Hard-delete unclaimed diagrams past their one-year expiry';

    public function handle(): int
    {
        $total = 0;
        do {
            $ids = Diagram::whereNotNull('expires_at')
                ->where('expires_at', '<', now())
                ->limit((int) $this->option('chunk'))
                ->pluck('id');
            if ($ids->isNotEmpty()) {
                DiagramVersion::whereIn('diagram_id', $ids)->delete();
                Diagram::whereIn('id', $ids)->delete();
                $total += $ids->count();
            }
        } while ($ids->isNotEmpty());

        $this->info("Purged $total expired diagrams.");

        return self::SUCCESS;
    }
}
