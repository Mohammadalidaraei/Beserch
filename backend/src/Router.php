<?php
/**
 * Router Class
 * مدیریت مسیرها و روتینگ
 */

class Router {
    private $routes = [];
    private $basePath = '/';

    /**
     * Add GET route
     */
    public function get($path, $handler) {
        $this->addRoute('GET', $path, $handler);
        return $this;
    }

    /**
     * Add POST route
     */
    public function post($path, $handler) {
        $this->addRoute('POST', $path, $handler);
        return $this;
    }

    /**
     * Add PUT route
     */
    public function put($path, $handler) {
        $this->addRoute('PUT', $path, $handler);
        return $this;
    }

    /**
     * Add DELETE route
     */
    public function delete($path, $handler) {
        $this->addRoute('DELETE', $path, $handler);
        return $this;
    }

    /**
     * Add route to collection
     */
    private function addRoute($method, $path, $handler) {
        $path = $this->normalizePath($path);
        
        if (!isset($this->routes[$method])) {
            $this->routes[$method] = [];
        }
        
        $this->routes[$method][$path] = $handler;
    }

    /**
     * Normalize path
     */
    private function normalizePath($path) {
        $path = trim($path, '/');
        return $path ? '/' . $path : '/';
    }

    /**
     * Dispatch request to handler
     */
    public function dispatch(Request $request) {
        $method = $request->getMethod();
        $path = $this->normalizePath($request->getPath());
        
        // Check for exact match
        if (isset($this->routes[$method][$path])) {
            return $this->callHandler($this->routes[$method][$path], $request, []);
        }
        
        // Check for parameterized routes
        foreach ($this->routes[$method] as $route => $handler) {
            $params = $this->matchRoute($route, $path);
            if ($params !== false) {
                return $this->callHandler($handler, $request, $params);
            }
        }
        
        // No route found
        http_response_code(404);
        return [
            'success' => false,
            'message' => 'Route not found'
        ];
    }

    /**
     * Match route with parameters
     */
    private function matchRoute($route, $path) {
        $routeParts = explode('/', trim($route, '/'));
        $pathParts = explode('/', trim($path, '/'));
        
        if (count($routeParts) !== count($pathParts)) {
            return false;
        }
        
        $params = [];
        
        foreach ($routeParts as $index => $part) {
            if (strpos($part, '{') === 0 && strpos($part, '}') === strlen($part) - 1) {
                // This is a parameter
                $paramName = trim($part, '{}');
                $params[$paramName] = $pathParts[$index];
            } elseif ($part !== $pathParts[$index]) {
                // Parts don't match
                return false;
            }
        }
        
        return $params;
    }

    /**
     * Call handler method
     */
    private function callHandler($handler, Request $request, $params = []) {
        if (is_callable($handler)) {
            return call_user_func($handler, $request);
        }
        
        if (is_string($handler) && strpos($handler, '@') !== false) {
            list($controller, $method) = explode('@', $handler);
            
            if (class_exists($controller)) {
                $instance = new $controller();
                
                if (method_exists($instance, $method)) {
                    // Merge URL params with query/body params
                    $request->setParams(array_merge($request->all(), $params));
                    return call_user_func([$instance, $method], $request);
                }
            }
            
            throw new Exception("Controller or method not found: {$handler}", 404);
        }
        
        throw new Exception("Invalid handler", 500);
    }

    /**
     * Get all routes
     */
    public function getRoutes() {
        return $this->routes;
    }

    /**
     * Set base path
     */
    public function setBasePath($path) {
        $this->basePath = $this->normalizePath($path);
    }
}
