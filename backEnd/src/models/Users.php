<?php

namespace App\Models;

use App\Config\DBConnection;
use Illuminate\Database\Eloquent\Model;
class Users extends Model
{
    protected $table = 'users';
    protected $primaryKey = 'id';
    public $timestamps = false;

    protected $fillable = [
        'id',
        'user_name',
        'email',
        'password',
        'email_verified',
        'verification_code',
        'creation_date'
    ];

    public static function getUsersDataForTop()
    {
        try {
            DBConnection::init($_ENV['DB_HOST'], $_ENV['DB_USERNAME'], $_ENV['DB_PASSWORD'], $_ENV['DB_DATABASE']);

            $conn = DBConnection::get();

            $query = "
                SELECT
                    us.id,
                    us.user_name,
                    us.email,
                    COUNT(qs.question_id) AS quest_count,
                    COALESCE(SUM(CASE WHEN qs.status = 'public' THEN 1 ELSE 0 END), 0) AS published
                FROM users AS us
                LEFT JOIN questions AS qs ON qs.creator_id = us.id
                WHERE qs.creator_id = us.id
                GROUP BY us.id, us.user_name, us.email
            ";
            $result = $conn->query($query);

            if ($result) {
                $data = $result->fetch_all(MYSQLI_ASSOC);
                return $data;
            } else {
                throw new \Exception("Error: " . $conn->error);
            }

        } catch (\Exception $e) {
            echo $e->getMessage();
        }
    }
}
