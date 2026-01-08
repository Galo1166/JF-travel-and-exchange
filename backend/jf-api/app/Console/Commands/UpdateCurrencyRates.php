<?php

namespace App\Console\Commands;

use App\Services\CurrencyRateService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class UpdateCurrencyRates extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'currency:update {base=USD}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Update exchange rates from live API';

    /**
     * Execute the console command.
     */
    public function handle(CurrencyRateService $service)
    {
        $base = $this->argument('base');
        $this->info("Updating currency rates for base: {$base}...");
        
        Log::info("Command currency:update started for base: {$base}");

        if ($service->updateDatabaseRates($base)) {
            $this->info('Currency rates updated successfully.');
            Log::info("Command currency:update completed successfully.");
            return Command::SUCCESS;
        } else {
            $this->error('Failed to update currency rates. Check logs/connection.');
            Log::error("Command currency:update failed.");
            return Command::FAILURE;
        }
    }
}
