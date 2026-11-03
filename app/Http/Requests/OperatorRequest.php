<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class OperatorRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if (is_string($this->input('operator_name'))) {
            $this->merge([
                'operator_name' => trim($this->input('operator_name')),
            ]);
        }
    }

    public function rules(): array
    {
        return [
            'operator_name' => [
                'required',
                'string',
                'max:150',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'operator_name.required' => 'Please enter an operator name.',
            'operator_name.string' => 'The operator name must be text.',
            'operator_name.max' => 'The operator name cannot exceed 150 characters.',
        ];
    }
}