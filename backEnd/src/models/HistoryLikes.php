<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HistoryLikes extends Model
{
    protected $table = 'history_likes';
    protected $primaryKey = 'id';
    public $timestamps = false;

    protected $fillable = [
        'id',
        'user_id',
        'question_id',
        'status'
    ];


}
