<?php
/**
 * Response Class
 * مدیریت پاسخ‌های HTTP
 */

class Response {
    private $headers = [];
    private $statusCode = 200;

    /**
     * Set header
     */
    public function header($name, $value) {
        $this->headers[$name] = $value;
        return $this;
    }

    /**
     * Set content type
     */
    public function contentType($type) {
        return $this->header('Content-Type', $type);
    }

    /**
     * Set status code
     */
    public function status($code) {
        $this->statusCode = $code;
        return $this;
    }

    /**
     * Send JSON response
     */
    public function json($data, $statusCode = null) {
        if ($statusCode !== null) {
            $this->statusCode = $statusCode;
        }

        $this->contentType('application/json; charset=utf-8');
        
        // Add security headers
        $this->addSecurityHeaders();
        
        // Send headers
        http_response_code($this->statusCode);
        foreach ($this->headers as $name => $value) {
            header("{$name}: {$value}");
        }

        echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        exit;
    }

    /**
     * Send HTML response
     */
    public function html($content, $statusCode = null) {
        if ($statusCode !== null) {
            $this->statusCode = $statusCode;
        }

        $this->contentType('text/html; charset=utf-8');
        
        http_response_code($this->statusCode);
        foreach ($this->headers as $name => $value) {
            header("{$name}: {$value}");
        }

        echo $content;
        exit;
    }

    /**
     * Send file download
     */
    public function download($filePath, $fileName = null) {
        if (!file_exists($filePath)) {
            return $this->json([
                'success' => false,
                'message' => 'File not found'
            ], 404);
        }

        $fileName = $fileName ?? basename($filePath);
        $fileSize = filesize($filePath);

        $this->header('Content-Type', 'application/octet-stream')
             ->header('Content-Disposition', "attachment; filename=\"{$fileName}\"")
             ->header('Content-Length', $fileSize)
             ->header('Cache-Control', 'no-cache, must-revalidate')
             ->header('Pragma', 'no-cache');

        http_response_code(200);
        
        foreach ($this->headers as $name => $value) {
            header("{$name}: {$value}");
        }

        readfile($filePath);
        exit;
    }

    /**
     * Redirect to URL
     */
    public function redirect($url, $statusCode = 302) {
        header("Location: {$url}", true, $statusCode);
        exit;
    }

    /**
     * Success response
     */
    public function success($data = null, $message = 'Success') {
        return $this->json([
            'success' => true,
            'message' => $message,
            'data' => $data
        ]);
    }

    /**
     * Error response
     */
    public function error($message, $statusCode = 400, $errors = null) {
        return $this->json([
            'success' => false,
            'message' => $message,
            'errors' => $errors
        ], $statusCode);
    }

    /**
     * Validation error response
     */
    public function validationError($errors) {
        return $this->json([
            'success' => false,
            'message' => 'Validation failed',
            'errors' => $errors
        ], 422);
    }

    /**
     * Unauthorized response
     */
    public function unauthorized($message = 'Unauthorized') {
        return $this->json([
            'success' => false,
            'message' => $message
        ], 401);
    }

    /**
     * Forbidden response
     */
    public function forbidden($message = 'Forbidden') {
        return $this->json([
            'success' => false,
            'message' => $message
        ], 403);
    }

    /**
     * Not found response
     */
    public function notFound($message = 'Not Found') {
        return $this->json([
            'success' => false,
            'message' => $message
        ], 404);
    }

    /**
     * Add security headers
     */
    private function addSecurityHeaders() {
        header('X-Content-Type-Options: nosniff');
        header('X-Frame-Options: SAMEORIGIN');
        header('X-XSS-Protection: 1; mode=block');
        header('Referrer-Policy: strict-origin-when-cross-origin');
        header('Permissions-Policy: geolocation=(), microphone=(), camera=()');
    }

    /**
     * Set CORS headers
     */
    public function cors($allowedOrigin = '*') {
        header("Access-Control-Allow-Origin: {$allowedOrigin}");
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization');
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Max-Age: 86400');
        return $this;
    }

    /**
     * Set cache headers
     */
    public function cache($maxAge = 3600, $public = true) {
        $visibility = $public ? 'public' : 'private';
        header("Cache-Control: {$visibility}, max-age={$maxAge}");
        header('Expires: ' . gmdate('D, d M Y H:i:s', time() + $maxAge) . ' GMT');
        return $this;
    }

    /**
     * No cache headers
     */
    public function noCache() {
        header('Cache-Control: no-cache, no-store, must-revalidate');
        header('Pragma: no-cache');
        header('Expires: 0');
        return $this;
    }
}
