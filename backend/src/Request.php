<?php
/**
 * Request Class
 * مدیریت درخواست‌های HTTP
 */

class Request {
    private $method;
    private $path;
    private $query = [];
    private $body = [];
    private $headers = [];
    private $params = [];
    private $cookies = [];

    public function __construct() {
        $this->method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
        $this->path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);
        $this->query = $_GET ?? [];
        $this->headers = $this->parseHeaders();
        $this->cookies = $_COOKIE ?? [];
        
        // Parse body based on content type
        $contentType = $this->getHeader('Content-Type', '');
        
        if (strpos($contentType, 'application/json') !== false) {
            $this->body = json_decode(file_get_contents('php://input'), true) ?? [];
        } elseif (strpos($contentType, 'multipart/form-data') !== false) {
            $this->body = $_POST ?? [];
            $this->files = $_FILES ?? [];
        } else {
            $this->body = $_POST ?? [];
        }
    }

    /**
     * Parse headers from $_SERVER
     */
    private function parseHeaders() {
        $headers = [];
        
        foreach ($_SERVER as $key => $value) {
            if (strpos($key, 'HTTP_') === 0) {
                $header = str_replace('_', '-', substr($key, 5));
                $headers[$header] = $value;
            } elseif ($key === 'CONTENT_TYPE') {
                $headers['Content-Type'] = $value;
            } elseif ($key === 'CONTENT_LENGTH') {
                $headers['Content-Length'] = $value;
            }
        }
        
        return $headers;
    }

    /**
     * Get request method
     */
    public function getMethod() {
        return $this->method;
    }

    /**
     * Get request path
     */
    public function getPath() {
        return $this->path;
    }

    /**
     * Get header value
     */
    public function getHeader($name, $default = null) {
        return $this->headers[$name] ?? $default;
    }

    /**
     * Get all headers
     */
    public function getHeaders() {
        return $this->headers;
    }

    /**
     * Get query parameter
     */
    public function query($key, $default = null) {
        return $this->query[$key] ?? $default;
    }

    /**
     * Get body parameter
     */
    public function input($key, $default = null) {
        return $this->body[$key] ?? $default;
    }

    /**
     * Get all input data
     */
    public function all() {
        return array_merge($this->query, $this->body);
    }

    /**
     * Get cookie value
     */
    public function cookie($key, $default = null) {
        return $this->cookies[$key] ?? $default;
    }

    /**
     * Get uploaded file
     */
    public function file($key) {
        return $this->files[$key] ?? null;
    }

    /**
     * Check if request is AJAX
     */
    public function isAjax() {
        return $this->getHeader('X-Requested-With') === 'XMLHttpRequest';
    }

    /**
     * Check if request expects JSON
     */
    public function wantsJson() {
        $accept = $this->getHeader('Accept', '');
        return strpos($accept, 'application/json') !== false;
    }

    /**
     * Get client IP
     */
    public function ip() {
        $keys = ['HTTP_CF_CONNECTING_IP', 'HTTP_X_FORWARDED_FOR', 'HTTP_X_REAL_IP', 'REMOTE_ADDR'];
        
        foreach ($keys as $key) {
            if (!empty($_SERVER[$key])) {
                return $_SERVER[$key];
            }
        }
        
        return $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
    }

    /**
     * Get user agent
     */
    public function userAgent() {
        return $_SERVER['HTTP_USER_AGENT'] ?? '';
    }

    /**
     * Validate required fields
     */
    public function validate($required = []) {
        $errors = [];
        
        foreach ($required as $field) {
            if (empty($this->input($key)) && empty($this->query($key))) {
                $errors[] = "Field '{$field}' is required";
            }
        }
        
        return empty($errors) ? true : $errors;
    }

    /**
     * Set URL parameters (from router)
     */
    public function setParams($params) {
        $this->params = $params;
    }

    /**
     * Get URL parameter
     */
    public function param($key, $default = null) {
        return $this->params[$key] ?? $default;
    }

    /**
     * Get Bearer token from Authorization header
     */
    public function bearerToken() {
        $auth = $this->getHeader('Authorization', '');
        
        if (preg_match('/Bearer\s+(.*)$/i', $auth, $matches)) {
            return $matches[1];
        }
        
        return null;
    }

    /**
     * Get referrer URL
     */
    public function referrer() {
        return $_SERVER['HTTP_REFERER'] ?? null;
    }

    /**
     * Check if request is secure (HTTPS)
     */
    public function isSecure() {
        return (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ||
               $_SERVER['SERVER_PORT'] == 443 ||
               !empty($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https';
    }
}
