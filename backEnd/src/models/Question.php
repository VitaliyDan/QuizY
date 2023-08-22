<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Question extends Model
{
    protected $table = 'questions';
    protected $primaryKey = 'question_id';
    public $timestamps = false;

    protected $fillable = [
        'creator_id',
        'question_title',
        'answers',
        'right_answer',
        'status',
        'passed_by_others',
        'creation_date',
        'date_published',
        'liked',
    ];


}
