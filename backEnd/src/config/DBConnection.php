<?php
namespace App\Config;
class DBConnection {
    private static $conn;

    public static function init($servername, $username, $password, $dbname) {
        self::$conn = new \mysqli($servername, $username, $password, $dbname);

        if (self::$conn->connect_error) {
            die("Connection failed: " . self::$conn->connect_error);
        }
    }

    public static function get() {
        return self::$conn;
    }
}
