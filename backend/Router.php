<?php
/**
 * Main Router
 * مسیریاب اصلی برنامه
 */

class Router {
    private $routes = [];
    private $basePath = '';

    public function setBasePath($path) {
        $this->basePath = $path;
    }

    /**
     * ثبت route GET
     */
    public function get($path, $handler) {
        $this->routes['GET'][$this->normalizePath($path)] = $handler;
    }

    /**
     * ثبت route POST
     */
    public function post($path, $handler) {
        $this->routes['POST'][$this->normalizePath($path)] = $handler;
    }

    /**
     * ثبت route PUT
     */
    public function put($path, $handler) {
        $this->routes['PUT'][$this->normalizePath($path)] = $handler;
    }

    /**
     * ثبت route DELETE
     */
    public function delete($path, $handler) {
        $this->routes['DELETE'][$this->normalizePath($path)] = $handler;
    }

    /**
     * نرمال‌سازی مسیر
     */
    private function normalizePath($path) {
        return rtrim($this->basePath . $path, '/');
    }

    /**
     * پردازش درخواست
     */
    public function dispatch() {
        $method = $_SERVER['REQUEST_METHOD'];
        $uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
        
        // حذف basePath از URI
        if ($this->basePath && strpos($uri, $this->basePath) === 0) {
            $uri = substr($uri, strlen($this->basePath));
        }
        
        $uri = rtrim($uri, '/');
        if (empty($uri)) {
            $uri = '/';
        }

        // بررسی CORS
        $this->handleCors();

        // بررسی OPTIONS برای preflight
        if ($method === 'OPTIONS') {
            http_response_code(200);
            exit;
        }

        // جستجوی route دقیق
        if (isset($this->routes[$method][$uri])) {
            $this->callHandler($this->routes[$method][$uri]);
            return;
        }

        // جستجوی route با پارامتر
        $matchedRoute = $this->matchWithParams($method, $uri);
        if ($matchedRoute) {
            $this->callHandler($matchedRoute['handler'], $matchedRoute['params']);
            return;
        }

        // Route یافت نشد
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'error' => 'Not Found',
            'message' => 'Route not found'
        ]);
    }

    /**
     * تطبیق route با پارامترها
     */
    private function matchWithParams($method, $uri) {
        if (!isset($this->routes[$method])) {
            return null;
        }

        foreach ($this->routes[$method] as $route => $handler) {
            // تبدیل route pattern به regex
            $pattern = preg_replace('/\{([a-zA-Z_]+)\}/', '(?P<$1>[^/]+)', $route);
            $pattern = '#^' . $pattern . '$#';

            if (preg_match($pattern, $uri, $matches)) {
                // استخراج پارامترها
                $params = array_filter($matches, 'is_string', ARRAY_FILTER_USE_KEY);
                return [
                    'handler' => $handler,
                    'params' => $params
                ];
            }
        }

        return null;
    }

    /**
     * فراخوانی handler
     */
    private function callHandler($handler, $params = []) {
        if (is_callable($handler)) {
            call_user_func_array($handler, $params);
        } elseif (is_array($handler) && count($handler) === 2) {
            list($controller, $method) = $handler;
            
            if (class_exists($controller)) {
                $instance = new $controller();
                if (method_exists($instance, $method)) {
                    call_user_func_array([$instance, $method], $params);
                    return;
                }
            }
            
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => 'Internal Server Error',
                'message' => "Method {$method} not found in {$controller}"
            ]);
        } else {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => 'Internal Server Error',
                'message' => 'Invalid handler'
            ]);
        }
    }

    /**
     * مدیریت CORS
     */
    private function handleCors() {
        header("Access-Control-Allow-Origin: *");
        header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
        header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
        header("Access-Control-Max-Age: 86400");
    }

    /**
     * دریافت middleware برای route خاص
     */
    public function middleware($middlewareName) {
        return new MiddlewareWrapper($this, $middlewareName);
    }
}

/**
 * Wrapper برای Middleware
 */
class MiddlewareWrapper {
    private $router;
    private $middleware;

    public function __construct($router, $middleware) {
        $this->router = $router;
        $this->middleware = $middleware;
    }

    public function group($callback) {
        // پیاده‌سازی گروه‌بندی routeها با middleware
        $callback();
    }
}
