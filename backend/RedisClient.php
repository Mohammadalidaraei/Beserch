<?php
/**
 * Redis Client
 * کلاینت Redis برای کش و Rate Limiting
 */

class RedisClient {
    private static $instance = null;
    private $connection;
    private $config;

    private function __construct() {
        $this->config = require __DIR__ . '/config.php';
        $redisConfig = $this->config['redis'];
        
        try {
            $this->connection = new Redis();
            $this->connection->connect(
                $redisConfig['host'],
                $redisConfig['port'],
                2.5
            );
            
            if ($redisConfig['password']) {
                $this->connection->auth($redisConfig['password']);
            }
            
            $this->connection->select($redisConfig['database']);
        } catch (Exception $e) {
            if ($this->config['app']['debug']) {
                die("Redis Connection Error: " . $e->getMessage());
            }
            $this->connection = null;
        }
    }

    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function getConnection() {
        return $this->connection;
    }

    public function isConnected() {
        return $this->connection !== null;
    }

    public function get($key) {
        if (!$this->isConnected()) return false;
        return $this->connection->get($key);
    }

    public function set($key, $value, $ttl = null) {
        if (!$this->isConnected()) return false;
        
        if ($ttl) {
            return $this->connection->setex($key, $ttl, $value);
        }
        
        return $this->connection->set($key, $value);
    }

    public function delete($key) {
        if (!$this->isConnected()) return false;
        return $this->connection->delete($key);
    }

    public function exists($key) {
        if (!$this->isConnected()) return false;
        return $this->connection->exists($key);
    }

    public function incr($key) {
        if (!$this->isConnected()) return false;
        return $this->connection->incr($key);
    }

    public function decr($key) {
        if (!$this->isConnected()) return false;
        return $this->connection->decr($key);
    }

    public function expire($key, $seconds) {
        if (!$this->isConnected()) return false;
        return $this->connection->expire($key, $seconds);
    }

    public function hGet($key, $field) {
        if (!$this->isConnected()) return false;
        return $this->connection->hGet($key, $field);
    }

    public function hSet($key, $field, $value) {
        if (!$this->isConnected()) return false;
        return $this->connection->hSet($key, $field, $value);
    }

    public function hGetAll($key) {
        if (!$this->isConnected()) return [];
        return $this->connection->hGetAll($key);
    }

    public function lPush($key, $value) {
        if (!$this->isConnected()) return false;
        return $this->connection->lPush($key, $value);
    }

    public function rPop($key) {
        if (!$this->isConnected()) return false;
        return $this->connection->rPop($key);
    }

    public function lRange($key, $start, $end) {
        if (!$this->isConnected()) return [];
        return $this->connection->lRange($key, $start, $end);
    }

    public function sAdd($key, $member) {
        if (!$this->isConnected()) return false;
        return $this->connection->sAdd($key, $member);
    }

    public function sIsMember($key, $member) {
        if (!$this->isConnected()) return false;
        return $this->connection->sIsMember($key, $member);
    }

    public function zAdd($key, $score, $member) {
        if (!$this->isConnected()) return false;
        return $this->connection->zAdd($key, $score, $member);
    }

    public function zRevRange($key, $start, $end, $withScores = false) {
        if (!$this->isConnected()) return [];
        
        if ($withScores) {
            return $this->connection->zRevRange($key, $start, $end, true);
        }
        
        return $this->connection->zRevRange($key, $start, $end);
    }

    public function zScore($key, $member) {
        if (!$this->isConnected()) return false;
        return $this->connection->zScore($key, $member);
    }

    public function flushDb() {
        if (!$this->isConnected()) return false;
        return $this->connection->flushDb();
    }
}
