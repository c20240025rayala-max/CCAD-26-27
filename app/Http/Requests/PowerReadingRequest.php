<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PowerReadingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if (is_string($this->input('station_code'))) {
            $this->merge([
                'station_code' => trim($this->input('station_code')),
            ]);
        }
    }

    public function rules(): array
    {
        return [
            'station_code' => [
                'required',
                'string',
                'max:50',
                'exists:power_stations,station_code',
            ],

            'kwh_generated' => [
                'required',
                'numeric',
                'min:0',
                'max:99999999999.999',
                'decimal:0,3',
            ],

            'peak_mw' => [
                'required',
                'numeric',
                'min:0',
                'max:999999999.999',
                'decimal:0,3',
            ],

            'reading_timestamp' => [
                'required',
                'date',
            ],

            'feed_in_tariff_rate' => [
                'required',
                'numeric',
                'min:0',
                'max:99999999.9999',
                'decimal:0,4',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'station_code.required' => 'Please select a power station.',
            'station_code.exists' => 'The selected power station does not exist.',

            'kwh_generated.required' => 'Please enter the energy generated.',
            'kwh_generated.numeric' => 'Generated energy must be numeric.',
            'kwh_generated.min' => 'Generated energy cannot be negative.',
            'kwh_generated.max' => 'Generated energy cannot exceed 99,999,999,999.999 kWh.',
            'kwh_generated.decimal' => 'Generated energy may have up to 3 decimal places.',

            'peak_mw.required' => 'Please enter the peak output.',
            'peak_mw.numeric' => 'Peak output must be numeric.',
            'peak_mw.min' => 'Peak output cannot be negative.',
            'peak_mw.max' => 'Peak output cannot exceed 999,999,999.999 MW.',
            'peak_mw.decimal' => 'Peak output may have up to 3 decimal places.',

            'reading_timestamp.required' => 'Please enter the reading date and time.',
            'reading_timestamp.date' => 'Please enter a valid date and time.',

            'feed_in_tariff_rate.required' => 'Please enter the feed-in tariff rate.',
            'feed_in_tariff_rate.numeric' => 'The tariff rate must be numeric.',
            'feed_in_tariff_rate.min' => 'The tariff rate cannot be negative.',
            'feed_in_tariff_rate.max' => 'The tariff rate cannot exceed 99,999,999.9999.',
            'feed_in_tariff_rate.decimal' => 'The tariff rate may have up to 4 decimal places.',
        ];
    }
}
