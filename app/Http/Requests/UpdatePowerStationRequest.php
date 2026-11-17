<?php

namespace App\Http\Requests;

use App\Models\PowerStation;
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
        if (is_string($this->input('station_status'))) {
            $this->merge(['station_status' => trim($this->input('station_status'))]);
        }
    }

    public function rules(): array
    {
        return [
            'station_type_id' => ['required', 'integer', 'exists:station_types,station_type_id'],
            'operator_id' => ['required', 'integer', 'exists:operators,operator_id'],
            'grid_zone_id' => ['required', 'integer', 'exists:grid_zones,grid_zone_id'],
            'station_status' => ['required', 'string', Rule::in($this->allowedStatuses())],
            'installed_capacity_mw' => ['required', 'numeric', 'min:0.001', 'max:999999999.999', 'decimal:0,3'],
        ];
    }

    private function allowedStatuses(): array
    {
        $statuses = ['Active', 'Inactive', 'Maintenance'];
        $station = PowerStation::find($this->route('power_station'));

        if ($station && ! in_array($station->station_status, $statuses, true)) {
            $statuses[] = $station->station_status;
        }

        return $statuses;
    }

    public function messages(): array
    {
        return [
            'station_type_id.required' => 'Please select a station type.',
            'station_type_id.exists' => 'The selected station type does not exist.',
            'operator_id.required' => 'Please select an operator.',
            'operator_id.exists' => 'The selected operator does not exist.',
            'grid_zone_id.required' => 'Please select a grid zone.',
            'grid_zone_id.exists' => 'The selected grid zone does not exist.',
            'station_status.required' => 'Please select a station status.',
            'station_status.in' => 'Please select a valid station status.',
            'installed_capacity_mw.required' => 'Please enter the plant installed capacity.',
            'installed_capacity_mw.numeric' => 'Installed capacity must be numeric.',
            'installed_capacity_mw.min' => 'Installed capacity must be greater than zero.',
            'installed_capacity_mw.decimal' => 'Installed capacity may have up to 3 decimal places.',
        ];
    }
}