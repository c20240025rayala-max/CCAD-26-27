<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePowerStationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        foreach (['station_code', 'station_status'] as $field) {
            if (is_string($this->input($field))) {
                $this->merge([$field => trim($this->input($field))]);
            }
        }
    }

    public function rules(): array
    {
        return [
            'station_code' => ['required', 'string', 'max:100', Rule::unique('power_stations', 'station_code')],
            'station_type_id' => ['required', 'integer', 'exists:station_types,station_type_id'],
            'operator_id' => ['required', 'integer', 'exists:operators,operator_id'],
            'grid_zone_id' => ['required', 'integer', 'exists:grid_zones,grid_zone_id'],
            'station_status' => ['required', 'string', 'max:50'],
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
        ];
    }
}