<?php
namespace App\Controllers;

use App\Services\ErrorsService;
use App\Controllers\AuthenticationController;
use Symfony\Component\HttpFoundation\Request;
use App\Models\Question;
use App\Models\HistoryLikes;
use Carbon\Carbon;
class QuestionsController
    {
    private $conn;

    public function __construct($conn)
    {
    $this->conn = $conn;
    }

    public function createQuestionAction()
    {
        $rawBody = json_decode((Request::createFromGlobals())->getContent());
        $creator_id = AuthenticationController::getAllDataForToken($_SERVER['HTTP_AUTHORIZATION'])->user_id;

        if (!isset($rawBody->question_title, $rawBody->answers, $rawBody->right_answer)) {
            return ErrorsService::error("Missing required fields.");
        }
        if (!$rawBody->question_title || !$rawBody->answers || !$rawBody->right_answer) {
            return ErrorsService::error("Missing required fields.");
        }

        $question_title = $rawBody->question_title;
        $answers = json_encode($rawBody->answers);
        $right_answer = $rawBody->right_answer;

        $question = new Question([
            'creator_id' => $creator_id,
            'question_title' => $question_title,
            'answers' => $answers,
            'right_answer' => $right_answer
        ]);

        if ($question->save()) {
            echo json_encode(['valid'=> 1, 'message' => 'Question created successfully.']);
        } else {
            return ErrorsService::error("Failed to create question.");
        }
    }

    public function updateQuestionAction()
    {
        $rawBody = json_decode((Request::createFromGlobals())->getContent());
        if(!isset($rawBody->question_id)){
            return ErrorsService::error("question_id not found.");
        }

        $question = Question::find($rawBody->question_id);

        if (!$question) {
            return ErrorsService::error("Question not found.");
        }
        if(AuthenticationController::getAllDataForToken($_SERVER['HTTP_AUTHORIZATION'])->user_id !== $question->creator_id){
            return ErrorsService::permissionsDenied();
        }

        if (isset($rawBody->question_title)) {
            $question->question_title = $rawBody->question_title;
        }
        if (isset($rawBody->answers)) {
            $question->answers = json_encode($rawBody->answers);
        }
        if (isset($rawBody->right_answer)) {
            $question->right_answer = $rawBody->right_answer;
        }

        if ($question->save()) {
            echo json_encode(['valid'=> 1, 'message' => 'Question updated successfully.']);
        } else {
            return ErrorsService::error("Failed to update question.");
        }
    }
    public function deleteQuestionsAction()
    {
        $rawBody = json_decode((Request::createFromGlobals())->getContent());
        $user_id = AuthenticationController::getAllDataForToken($_SERVER['HTTP_AUTHORIZATION'])->user_id;

        if(!isset($rawBody->question_ids) || !is_array($rawBody->question_ids)){
            return ErrorsService::error("Invalid question_ids data.");
        }
        foreach ($rawBody->question_ids as $questionId) {
            $question = Question::find($questionId);
            if ($question === null) {
                continue;
            }else{
                if (+$user_id !== +$question->creator_id) {
                    continue;
                }else{
                    $question->delete();
                }
            }
        }
        echo json_encode(['valid'=> 1, 'message' => 'Question(s) was deleted successfully.']);
    }


    public function readQuestionAction()
    {
        $creator_id = AuthenticationController::getAllDataForToken($_SERVER['HTTP_AUTHORIZATION'])->user_id;
        $questions = Question::where('creator_id', $creator_id)->get();

        if ($questions->isEmpty()) {
            echo json_encode(['valid'=> 1, 'message' => 'No questions found for you. You can create']);
        } else {
            echo json_encode(['valid'=> 1, 'questions' => $questions]);
        }

    }

    public function setStatusQuestionAction()
    {
        $rawBody = json_decode((Request::createFromGlobals())->getContent());

        if (!isset($rawBody->status) || !isset($rawBody->question_ids)) {
            return ErrorsService::error("Missing status or question_ids.");
        }
        foreach ($rawBody->question_ids as $questionId) {
            $question = Question::find($questionId);
            if (!$question) {
                continue;
            }
            if ($question && +AuthenticationController::getAllDataForToken($_SERVER['HTTP_AUTHORIZATION'])->user_id !== +$question->creator_id) {
                return ErrorsService::permissionsDenied();
            }
            $question->status = $rawBody->status;
            $question->date_published = Carbon::now();
            $question->save();
        }

        echo json_encode(['valid' => 1, 'message' => "The questions statuses were updated."]);
    }

    public function readPublicQuestionAction()
    {
        try {
            $user_id = +AuthenticationController::getAllDataForToken($_SERVER['HTTP_AUTHORIZATION'])->user_id;
            $publicQuestionIds = Question::where('status', 'public')->pluck('question_id');

            $questions = Question::select(
                'questions.question_id',
                'questions.creator_id',
                'questions.question_title',
                'questions.answers',
                'questions.right_answer',
                'questions.status',
                'questions.liked',
                'history_likes.status AS liked_status',
                'questions.passed_by_others',
                'users.user_name',
                'users.email'
            )
                ->join('users', 'users.id', '=', 'questions.creator_id')
                ->leftJoin('history_likes', function ($join) use ($user_id) {
                    $join->on('history_likes.question_id', '=', 'questions.question_id')
                        ->where('history_likes.user_id', '=', $user_id);
                })
                ->whereIn('questions.question_id', $publicQuestionIds)
                ->orderByDesc('questions.date_published')
                ->get();

            if (!$questions->isEmpty()) {
                echo json_encode(['valid' => 1, 'questions' => $questions]);
            } else {
                echo ErrorsService::error('At this moment no questions which was published.');
            }
        } catch (\Exception $e) {
            echo ErrorsService::error('An error occurred while fetching public questions.');
        }
    }

    public function likeQuestionAction(){
        try {
            $rawBody = json_decode((Request::createFromGlobals())->getContent());
            if (!isset($rawBody->question_id) || empty($rawBody->question_id)) {
                return ErrorsService::error('Invalid Data');
            }

            $user_id = +AuthenticationController::getAllDataForToken($_SERVER['HTTP_AUTHORIZATION'])->user_id;
            $question_id = $rawBody->question_id;
            $status = $rawBody->status;
            $question = Question::find($question_id);
            if (!$question) {
                return ErrorsService::entityNotFound();
            }

            $currentLikedRecord = HistoryLikes::where('user_id', $user_id)
                ->where('question_id', $question_id)
                ->first();

            if ($status === 'liked' && $currentLikedRecord === null) {
                $question->liked += 1;
                HistoryLikes::create([
                    'user_id' => $user_id,
                    'question_id' => $question_id,
                    'status' => 'liked'
                ]);
            } elseif ($status === 'not liked' && $currentLikedRecord !== null && $currentLikedRecord->status === 'liked') {
                $question->liked -= 1;
                $currentLikedRecord->delete(); // Видалення запису, якщо користувач відміняє лайк
            } elseif ($status !== 'liked' && $status !== 'not liked') {
                return ErrorsService::error('Invalid Status');
            }

            if ($question->save()) {
                echo json_encode(['valid' => 1, 'message' => "Question " . ($status !== 'liked' ? 'disliked' : $status)]);
            } else {
                return ErrorsService::error('Failed to update status');
            }
        } catch (Exception $e) {
            return ErrorsService::error($e->getMessage());
        }
    }

    public function checkAnswerForQuestionAction(){
        try {
            $rawBody = json_decode((Request::createFromGlobals())->getContent());

            if (empty($rawBody->question_id) || empty($rawBody->answer)) {
                throw new \Exception('Missing question_id or answer');
            }

            $question = Question::find($rawBody->question_id);

            if (!$question) {
                throw new \Exception('Question not found');
            }

            $rightAnswer = $question->right_answer;
            $message = ((($rightAnswer === $rawBody->answer) ? 1 : 0) === 1) ? 'Correct answer' : 'Incorrect answer';
            $question->passed_by_others += 1;
            $question->save();
            echo json_encode(['valid' => 1, 'message' => $message]);
        } catch (\Exception $e) {
            echo json_encode(['valid' => 0, 'message' => 'Error: ' . $e->getMessage()]);
        }
    }
}
