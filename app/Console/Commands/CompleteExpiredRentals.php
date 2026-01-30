<?php

namespace App\Console\Commands;

use App\Models\Rental;
use Illuminate\Console\Command;

class CompleteExpiredRentals extends Command
{
    protected $signature = 'rentals:complete-expired';

    protected $description = 'Mark expired active rentals as completed';

    public function handle()
    {
        $updated = Rental::where('status', 'active')
            ->where('planned_end_date', '<', now())
            ->update([
                'status' => 'completed',
                'actual_end_date' => now()
            ]);

        foreach (Rental::where('status', 'completed')->whereNull('actual_end_date')->get() as $rental) {
            $rental->car->update(['status' => 'available']);
        }

        $this->info("Zaktualizowano {$updated} wypożyczeń.");
        
        return 0;
    }
}
