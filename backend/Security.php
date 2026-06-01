<?php
/**
 * Security Helper Functions
 * توابع کمکی امنیتی
 */

class Security {
    
    /**
     * تولید توکن CSRF
     */
    public static function generateCsrfToken() {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        
        $token = bin2hex(random_bytes(32));
        $_SESSION['csrf_token'] = $token;
        return $token;
    }

    /**
     * بررسی توکن CSRF
     */
    public static function validateCsrfToken($token) {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        
        if (!isset($_SESSION['csrf_token']) || empty($token)) {
            return false;
        }
        
        return hash_equals($_SESSION['csrf_token'], $token);
    }

    /**
     * تمیز کردن ورودی برای جلوگیری از XSS
     */
    public static function sanitizeInput($input) {
        if (is_array($input)) {
            return array_map([self::class, 'sanitizeInput'], $input);
        }
        
        $input = trim($input);
        $input = stripslashes($input);
        $input = htmlspecialchars($input, ENT_QUOTES, 'UTF-8');
        
        return $input;
    }

    /**
     * رمزنگاری پسورد
     */
    public static function hashPassword($password) {
        $config = require __DIR__ . '/config.php';
        $cost = $config['security']['hash_cost'] ?? 12;
        
        return password_hash($password, PASSWORD_BCRYPT, ['cost' => $cost]);
    }

    /**
     * بررسی پسورد
     */
    public static function verifyPassword($password, $hash) {
        return password_verify($password, $hash);
    }

    /**
     * تولید JWT Token
     */
    public static function generateJwt($payload, $expiresIn = 3600) {
        $config = require __DIR__ . '/config.php';
        $secret = $config['security']['jwt_secret'];
        
        $header = [
            'alg' => 'HS256',
            'typ' => 'JWT'
        ];
        
        $payload['iat'] = time();
        $payload['exp'] = time() + $expiresIn;
        
        $base64Header = self::base64UrlEncode(json_encode($header));
        $base64Payload = self::base64UrlEncode(json_encode($payload));
        
        $signature = hash_hmac('sha256', "{$base64Header}.{$base64Payload}", $secret, true);
        $base64Signature = self::base64UrlEncode($signature);
        
        return "{$base64Header}.{$base64Payload}.{$base64Signature}";
    }

    /**
     * بررسی JWT Token
     */
    public static function verifyJwt($token) {
        $config = require __DIR__ . '/config.php';
        $secret = $config['security']['jwt_secret'];
        
        $parts = explode('.', $token);
        
        if (count($parts) !== 3) {
            return false;
        }
        
        list($base64Header, $base64Payload, $base64Signature) = $parts;
        
        $header = json_decode(self::base64UrlDecode($base64Header), true);
        $payload = json_decode(self::base64UrlDecode($base64Payload), true);
        
        if (!$header || !$payload) {
            return false;
        }
        
        // بررسی انقضا
        if (isset($payload['exp']) && $payload['exp'] < time()) {
            return false;
        }
        
        // بررسی امضا
        $signature = hash_hmac('sha256', "{$base64Header}.{$base64Payload}", $secret, true);
        $base64Signature = self::base64UrlEncode($signature);
        
        if (!hash_equals($base64Signature, $parts[2])) {
            return false;
        }
        
        return $payload;
    }

    /**
     * Base64 URL Safe Encode
     */
    private static function base64UrlEncode($data) {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    /**
     * Base64 URL Safe Decode
     */
    private static function base64UrlDecode($data) {
        $remainder = strlen($data) % 4;
        if ($remainder) {
            $padlen = 4 - $remainder;
            $data .= str_repeat('=', $padlen);
        }
        return base64_decode(strtr($data, '-_', '+/'));
    }

    /**
     * جلوگیری از SQL Injection
     */
    public static function escapeString($string) {
        return addslashes($string);
    }

    /**
     * Rate Limiting
     */
    public static function checkRateLimit($identifier, $limit = 100, $period = 3600) {
        $redis = RedisClient::getInstance()->getConnection();
        $key = "rate_limit:{$identifier}";
        
        $current = $redis->get($key);
        
        if ($current === false) {
            $redis->setex($key, $period, 1);
            return true;
        }
        
        if ($current >= $limit) {
            return false;
        }
        
        $redis->incr($key);
        return true;
    }

    /**
     * دریافت IP کاربر
     */
    public static function getUserIp() {
        $ipKeys = [
            'HTTP_CF_CONNECTING_IP',
            'HTTP_X_FORWARDED_FOR',
            'HTTP_X_REAL_IP',
            'REMOTE_ADDR'
        ];
        
        foreach ($ipKeys as $key) {
            if (!empty($_SERVER[$key])) {
                $ip = explode(',', $_SERVER[$key])[0];
                if (filter_var($ip, FILTER_VALIDATE_IP)) {
                    return $ip;
                }
            }
        }
        
        return $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
    }

    /**
     * تنظیم هدرهای امنیتی
     */
    public static function setSecurityHeaders() {
        header("X-Frame-Options: DENY");
        header("X-Content-Type-Options: nosniff");
        header("X-XSS-Protection: 1; mode=block");
        header("Referrer-Policy: strict-origin-when-cross-origin");
        header("Permissions-Policy: geolocation=(), microphone=(), camera=()");
    }
}
