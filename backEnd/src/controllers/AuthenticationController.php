<?php
namespace App\Controllers;

require 'src/config/cors.php';

use Firebase\JWT\JWT;
use Ramsey\Uuid\Uuid;
use App\Services\ErrorsService;
use Symfony\Component\HttpFoundation\Request;
use App\Config\DBConnection;
use App\Models\Users;
use App\Services\sendVerificationEmail;

class AuthenticationController
{
    public function registrationAction()
    {
        $rawBody = json_decode((Request::createFromGlobals())->getContent());
        $userModel = new Users();
        if ($userModel->where('email', $rawBody->email)->exists()) {
            return ErrorsService::error("Email already exists. Please choose a different one.");
        }

        $verificationCode = substr(str_replace('-', '', (Uuid::uuid4())->toString()), 0, 6);;
        $userModel->user_name = $rawBody->username;
        $userModel->email = $rawBody->email;
        $userModel->password = password_hash($rawBody->password, PASSWORD_DEFAULT);
        if(sendVerificationEmail::sendVerificationEmail($rawBody->email, $rawBody->username, $verificationCode)){
            $userModel->verification_code = $verificationCode;
        }
        $userModel->save();

        $tokenPayload = [
            "user_id" => $userModel->id,
            "user_name"=> $rawBody->username,
            "email" => $rawBody->email
        ];
        $token = JWT::encode($tokenPayload, $_ENV['JWT_SECRET'], 'HS256');
        echo json_encode(["valid"=> 1, "message"=> "Registration Successfully", "token" => $token]);
    }

    public function checkEmailCodeAction()
    {
        $rawBody = json_decode((Request::createFromGlobals())->getContent());
        $email = $this->getAllDataForToken($_SERVER['HTTP_AUTHORIZATION'])->email;
        $user = Users::where('email', $email)->first();

        if (!$user) {
            return ErrorsService::error("User not found.");
        }

        if ($rawBody->verification_code === 'demo') {
            $user->verification_code = null;
            $user->time_demo = date('Y-m-d H:i:s', strtotime('+24 hours', strtotime($user->creation_date)));
            $user->save();
            echo json_encode(["valid" => 1, "message" => "Demo mode is active. Account will be deleted after 24 hours."]);
            return;
        }

        if ($user->verification_code !== $rawBody->verification_code) {
            return ErrorsService::error("Invalid verification code.");
        }

        $user->verification_code = null;
        $user->email_verified = true;
        if($user->save()){
            echo json_encode(["valid" => 1, "message" => "Email verified successfully."]);
        } else {
            return ErrorsService::error('Verification code not found');
        }
    }

    public function loginAction()
    {

        $rawBody = json_decode((Request::createFromGlobals())->getContent());
        $conn = DBConnection::get();

        $stmt = $conn->prepare("SELECT * FROM users WHERE email = ?");
        $stmt->bind_param("s", $rawBody->email);
        $stmt->execute();
        $result = $stmt->get_result()->fetch_assoc();
        $stmt->close();
        if (!$result) {
            return ErrorsService::error("Invalid email.");
        }
        if (!password_verify($rawBody->password, $result['password'])) {
            return ErrorsService::error("Invalid password.");

        }

        $tokenPayload = [
            "user_id" => $result['id'],
            "user_name" => $result['user_name'],
            "email" => $result['email']
        ];
        $token = JWT::encode($tokenPayload, $_ENV['JWT_SECRET'], 'HS256');

        echo json_encode(["valid"=> 1, "message"=> "Welcome to QuizY", "token" => $token]);
    }

    public static function getAllDataForToken($JWT_token){
        $token = str_replace('Bearer ', '', $JWT_token);
        $tokenParts = explode('.', $token);
        $payloadData = json_decode(base64_decode($tokenParts[1]), false);
        return $payloadData;
    }
}
