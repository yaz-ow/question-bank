<?php

namespace Tests\Unit;

use App\Models\Question;
use App\Models\Subject;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class QuestionTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function question_belongs_to_subject()
    {
        $subject = Subject::factory()->create();
        $question = Question::factory()->create([
            'subject_id' => $subject->id
        ]);

        $this->assertInstanceOf(Subject::class, $question->subject);
        $this->assertEquals($subject->id, $question->subject->id);
    }

    /** @test */
    public function subject_has_many_questions()
    {
        $subject = Subject::factory()->create();
        $questions = Question::factory()->count(3)->create([
            'subject_id' => $subject->id
        ]);

        $this->assertCount(3, $subject->questions);
        $this->assertEquals($subject->id, $questions[0]->subject->id);
    }

    /** @test */
    public function question_can_be_created_with_valid_data()
    {
        $subject = Subject::factory()->create();
        $question = Question::create([
            'subject_id' => $subject->id,
            'question_text' => 'ما هو لون السماء؟',
            'option_a' => 'أزرق',
            'option_b' => 'أخضر',
            'option_c' => 'أحمر',
            'option_d' => 'أصفر',
            'correct_answer' => 'A'
        ]);

        $this->assertDatabaseHas('questions', [
            'id' => $question->id,
            'subject_id' => $subject->id,
            'question_text' => 'ما هو لون السماء؟',
            'option_a' => 'أزرق',
            'option_b' => 'أخضر',
            'option_c' => 'أحمر',
            'option_d' => 'أصفر',
            'correct_answer' => 'A'
        ]);
    }

    /** @test */
    public function question_can_be_updated()
    {
        $subject = Subject::factory()->create();
        $question = Question::factory()->create([
            'subject_id' => $subject->id,
            'question_text' => 'ما هو لون السماء؟',
            'option_a' => 'أزرق',
            'option_b' => 'أخضر',
            'option_c' => 'أحمر',
            'option_d' => 'أصفر',
            'correct_answer' => 'A'
        ]);

        $question->update([
            'question_text' => 'ما هو لون العشب؟',
            'correct_answer' => 'B'
        ]);

        $this->assertDatabaseHas('questions', [
            'id' => $question->id,
            'question_text' => 'ما هو لون العشب؟',
            'correct_answer' => 'B'
        ]);
    }

    /** @test */
    public function question_can_be_deleted()
    {
        $subject = Subject::factory()->create();
        $question = Question::factory()->create([
            'subject_id' => $subject->id
        ]);

        $question->delete();

        $this->assertDatabaseMissing('questions', [
            'id' => $question->id
        ]);
    }
}