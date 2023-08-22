<?php

namespace App\Services;

class ErrorsService
{

    public static function entityNotFound() {
        echo json_encode(['valid' => 0, 'error_msg' => "Record(s) in database not found"]);
    }

    public static function permissionsDenied() {
        echo json_encode(['valid' => 0, 'error_msg' => "You don't have access for it"]);
    }

    public static function error($errorMessage) {
        echo json_encode(['valid' => 0, 'error_msg' => $errorMessage]);
    }

    public static function returnEmptyData() {
        echo json_encode(['valid' => 0, 'data' => []]);
    }

}
