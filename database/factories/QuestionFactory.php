<?php

namespace Database\Factories;

use App\Models\Question;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Question>
 */
class QuestionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'subject_id' => \App\Models\Subject::factory(),
            'question_text' => $this->faker->sentence(6),
            'option_a' => $this->faker->sentence(4),
            'option_b' => $this->faker->sentence(4),
            'option_c' => $this->faker->sentence(4),
            'option_d' => $this->faker->sentence(4),
            'correct_answer' => $this->faker->randomElement(['A', 'B', 'C', 'D']),
        ];
    }
}
