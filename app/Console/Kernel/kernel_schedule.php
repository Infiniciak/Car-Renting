protected function schedule(Schedule $schedule)
{
    $schedule->command('rentals:complete-expired')->hourly();

    $schedule->call(function () {
        \App\Models\Rental::where('status', 'reserved')
            ->whereDate('start_date', '<=', Carbon::today())
            ->update(['status' => 'active']);
    })->daily();
}


