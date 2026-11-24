<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class GridZoneRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if (is_string($this->input('zone_name'))) {
            $this->merge([
                'zone_name' => trim(strip_tags($this->input('zone_name'))),
            ]);
        }
    }

    public function rules(): array
    {
        $gridZone = $this->route('gridZone')
            ?? $this->route('grid_zone')
            ?? $this->route('id');

        $id = is_object($gridZone)
            ? $gridZone->grid_zone_id
            : $gridZone;

        $nameRule = Rule::unique('grid_zones', 'zone_name');

        if ($this->isMethod('PUT') || $this->isMethod('PATCH')) {
            $nameRule->ignore($id, 'grid_zone_id');
        }

        return [
            'zone_name' => [
                'required',
                'string',
                'max:100',
                $nameRule,
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'zone_name.required' => 'Grid zone name cannot be empty.',
            'zone_name.string' => 'The grid zone name must be text.',
            'zone_name.max' => 'Grid zone name must not exceed 100 characters.',
            'zone_name.unique' => 'This grid zone already exists.',
        ];
    }
}