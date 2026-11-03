<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StationTypeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if (is_string($this->input('type_name'))) {
            $this->merge([
                'type_name' => trim($this->input('type_name')),
            ]);
        }
    }

    public function rules(): array
    {
        $stationType = $this->route('stationType')
            ?? $this->route('station_type')
            ?? $this->route('id');

        $id = is_object($stationType)
            ? $stationType->station_type_id
            : $stationType;

        $nameRule = Rule::unique('station_types', 'type_name');

        if ($this->isMethod('PUT') || $this->isMethod('PATCH')) {
            $nameRule->ignore($id, 'station_type_id');
        }

        return [
            'type_name' => [
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
            'type_name.required' => 'Please enter a station type name.',
            'type_name.string' => 'The station type name must be text.',
            'type_name.max' => 'The station type name cannot exceed 100 characters.',
            'type_name.unique' => 'This station type already exists.',
        ];
    }
}