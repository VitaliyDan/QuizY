<?php
use App\Config\DBConnection;
use Dotenv\Dotenv;
use FastRoute\Dispatcher;


require_once __DIR__ . '/vendor/autoload.php';
require 'src/config/cors.php';
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: *");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

$dotenv = Dotenv::createImmutable(__DIR__);
$dotenv->load();

require_once __DIR__ . '/src/config/eloquent.php';

DBConnection::init($_ENV['DB_HOST'], $_ENV['DB_USERNAME'], $_ENV['DB_PASSWORD'], $_ENV['DB_DATABASE']);
$conn = DBConnection::get();

$routesDefinition = require_once __DIR__ . '/src/config/Routes.php';
$dispatcher = FastRoute\simpleDispatcher($routesDefinition);

$httpMethod = $_SERVER['REQUEST_METHOD'];
$uri = $_SERVER['REQUEST_URI'];

$routeInfo = $dispatcher->dispatch($httpMethod, $uri);
switch ($routeInfo[0]) {
    case Dispatcher::NOT_FOUND:
        header("HTTP/1.1 404 Not Found");
        echo "404 Not Found";
        break;
    case Dispatcher::METHOD_NOT_ALLOWED:
        $allowedMethods = $routeInfo[1];
        header("HTTP/1.1 405 Method Not Allowed");
        echo "Method Not Allowed. Allowed methods: " . implode(', ', $allowedMethods);
        break;
    case Dispatcher::FOUND:
        $handler = $routeInfo[1];
        list($controller, $method) = explode('@', $handler);

        $controller = "App\\Controllers\\{$controller}";
        $controllerInstance = new $controller($conn);

        if (method_exists($controllerInstance, $method)) {
            $controllerInstance->$method();
        } else {
            header("HTTP/1.1 404 Not Found");
            echo "404 Not Found";
        }
        break;
}
