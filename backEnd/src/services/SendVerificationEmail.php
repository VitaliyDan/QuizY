<?php
namespace App\Services;

use SendGrid\Mail\Mail;
use SendGrid\Mail\TypeException;
use SendGrid\Mail\From;
require __DIR__ . '/../../vendor/autoload.php';

class SendVerificationEmail{
    public static function sendVerificationEmail($recipientEmail, $user_name, $verificationCode) {
        $email = new Mail();
        $email->setFrom(new From('quizyyua@gmail.com', 'QuizyY'));
        $email->setSubject('Verification Code');
        $email->addTo($recipientEmail, $user_name);
        $email->addContent("text/html", "Your verification code is: $verificationCode");
        $sendgrid = new \SendGrid($_ENV['SENDGRID_API_KEY']);

        try {
            $response = $sendgrid->send($email);
            return $response->statusCode();
        } catch (TypeException $e) {
            echo "Message could not be sent. Error: {$e->getMessage()}";
        }
    }
}