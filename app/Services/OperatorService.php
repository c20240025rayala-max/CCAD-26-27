<?php

namespace App\Services;

use App\Models\Operator;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class OperatorService
{
    private function sanitize(array $data): array
    {
        if (isset($data['operator_name'])) {
            $data['operator_name'] = trim(strip_tags($data['operator_name']));
        }

        return $data;
    }

    private function checkConstraints(array $data): void
    {
        if (isset($data['operator_name']) && $data['operator_name'] === '') {
            throw ValidationException::withMessages([
                'operator_name' => 'Operator name cannot be empty.',
            ]);
        }

        if (isset($data['operator_name']) && strlen($data['operator_name']) > 150) {
            throw ValidationException::withMessages([
                'operator_name' => 'Operator name must not exceed 150 characters.',
            ]);
        }
    }

    public function create(array $data): Operator
    {
        return DB::transaction(function () use ($data) {
            $data = $this->sanitize($data);
            $this->checkConstraints($data);

            return Operator::create($data);
        });
    }

    public function update(Operator $operator, array $data): Operator
    {
        return DB::transaction(function () use ($operator, $data) {
            $data = $this->sanitize($data);
            $this->checkConstraints($data);

            $operator->update($data);

            return $operator->refresh();
        });
    }
}
