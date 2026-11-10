<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePowerStationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        foreach (['station_code', 'station_status'] as $field) {
            if (is_string($this->input($field))) {
                $value = trim($this->input($field));
                $this->merge([$field => $field === 'station_code' ? strtoupper($value) : $value]);
            }
        }
    }

    public function rules(): array
    {
        $stationCode = $this->route('power_station');

        return [
            'station_code' => [
                'required',
                'string',
                'max:100',
                Rule::unique('power_stations', 'station_code')->ignore($stationCode, 'station_code'),
            ],
            'station_type_id' => ['required', 'integer', 'exists:station_types,station_type_id'],
            'operator_id' => ['required', 'integer', 'exists:operators,operator_id'],
            'grid_zone_id' => ['required', 'integer', 'exists:grid_zones,grid_zone_id'],
            'station_status' => ['required', 'string', 'max:50'],
            'installed_capacity_mw' => ['required', 'numeric', 'min:0.001', 'max:999999999.999', 'decimal:0,3'],
        ];
    }

    public function messages(): array
    {
        return [
            'station_code.required' => 'Please enter a station code.',
            'station_code.unique' => 'This station code already exists.',
            'station_code.max' => 'The station code cannot exceed 100 characters.',
            'station_type_id.required' => 'Please select a station type.',
            'station_type_id.exists' => 'The selected station type does not exist.',
            'operator_id.required' => 'Please select an operator.',
            'operator_id.exists' => 'The selected operator does not exist.',
            'grid_zone_id.required' => 'Please select a grid zone.',
            'grid_zone_id.exists' => 'The selected grid zone does not exist.',
            'station_status.required' => 'Please enter a station status.',
            'station_status.max' => 'The station status cannot exceed 50 characters.',
            'installed_capacity_mw.required' => 'Please enter the plant installed capacity.',
            'installed_capacity_mw.numeric' => 'Installed capacity must be numeric.',
            'installed_capacity_mw.min' => 'Installed capacity must be greater than zero.',
            'installed_capacity_mw.decimal' => 'Installed capacity may have up to 3 decimal places.',
        ];
    }
}