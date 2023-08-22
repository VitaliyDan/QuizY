<?php
namespace App\Controllers;
 use App\Models\Users;
 use App\Services\ErrorsService;
 use App\Models\HistoryLikes;
 use App\Models\Question;
 use App\Controllers\AuthenticationController;
 date_default_timezone_set('Europe/Kiev');
 class UserController {

    public function getStatisticForUsersAction() {
        $data = Users::getUsersDataForTop();
        if(empty($data)){
            return ErrorsService::returnEmptyData();
        }
        if ($data){
            echo json_encode(["valid"=> 1, "statistics" => $data]);
        } else {
            return ErrorsService::error('Users not Found');
        }
    }
     public function getUserDataAction(){
         $user_id = AuthenticationController::getAllDataForToken($_SERVER['HTTP_AUTHORIZATION'])->user_id;
         $data = Users::select('id', 'user_name', 'email', 'verification_code', 'email_verified', 'creation_date','time_demo')
             ->where('id', $user_id)
             ->first();

         if ($data && $data->time_demo !== null && date('Y-m-d H:i:s') > $data->time_demo) {
             $deletedHistoryLikes = HistoryLikes::where('user_id', $user_id)->delete();
             $deletedQuestions = Question::where('creator_id', $user_id)->delete();
             $deletedUser = Users::where('id', $user_id)->delete();
             if ($deletedHistoryLikes || $deletedQuestions || $deletedUser) {
                 return ErrorsService::error('Demo mode has ended. Please register a new account.');
             }
         } elseif ($data) {
             echo json_encode(["valid"=> 1, "data" => $data]);
         } else {
             return ErrorsService::error('Your account was deleted or not found in the service');
         }
     }
}
