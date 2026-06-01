<?php
/**
 * Database Connection Class
 * مدیریت اتصال به پایگاه داده PostgreSQL
 */

class Database {
    private static $instance = null;
    private $connection;
    private $config;

    private function __construct() {
        $this->config = require __DIR__ . '/../config/config.php';
        $this->connect();
    }

    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function connect() {
        $db = $this->config['database'];
        
        try {
            $dsn = sprintf(
                "pgsql:host=%s;port=%d;dbname=%s;user=%s;password=%s;charset=%s",
                $db['host'],
                $db['port'],
                $db['database'],
                $db['username'],
                $db['password'],
                $db['charset']
            );
            
            $this->connection = new PDO($dsn);
            $this->connection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->connection->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
            $this->connection->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
            
        } catch (PDOException $e) {
            throw new Exception("Database connection failed: " . $e->getMessage());
        }
    }

    public function getConnection() {
        return $this->connection;
    }

    /**
     * Execute a query with parameters
     */
    public function query($sql, $params = []) {
        try {
            $stmt = $this->connection->prepare($sql);
            $stmt->execute($params);
            return $stmt;
        } catch (PDOException $e) {
            throw new Exception("Query failed: " . $e->getMessage());
        }
    }

    /**
     * Fetch single row
     */
    public function fetchOne($sql, $params = []) {
        $stmt = $this->query($sql, $params);
        return $stmt->fetch();
    }

    /**
     * Fetch all rows
     */
    public function fetchAll($sql, $params = []) {
        $stmt = $this->query($sql, $params);
        return $stmt->fetchAll();
    }

    /**
     * Insert and return last insert ID
     */
    public function insert($table, $data) {
        $columns = implode(', ', array_keys($data));
        $placeholders = ':' . implode(', :', array_keys($data));
        
        $sql = "INSERT INTO {$table} ({$columns}) VALUES ({$placeholders}) RETURNING id";
        
        $stmt = $this->query($sql, $data);
        $result = $stmt->fetch();
        
        return $result['id'] ?? null;
    }

    /**
     * Update records
     */
    public function update($table, $data, $where, $whereParams = []) {
        $set = [];
        foreach (array_keys($data) as $column) {
            $set[] = "{$column} = :{$column}";
        }
        $setStr = implode(', ', $set);
        
        $sql = "UPDATE {$table} SET {$setStr} WHERE {$where}";
        
        $params = array_merge($data, $whereParams);
        $stmt = $this->query($sql, $params);
        
        return $stmt->rowCount();
    }

    /**
     * Delete records
     */
    public function delete($table, $where, $params = []) {
        $sql = "DELETE FROM {$table} WHERE {$where}";
        $stmt = $this->query($sql, $params);
        return $stmt->rowCount();
    }

    /**
     * Begin transaction
     */
    public function beginTransaction() {
        return $this->connection->beginTransaction();
    }

    /**
     * Commit transaction
     */
    public function commit() {
        return $this->connection->commit();
    }

    /**
     * Rollback transaction
     */
    public function rollback() {
        return $this->connection->rollBack();
    }

    /**
     * Check if table exists
     */
    public function tableExists($table) {
        $sql = "SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_name = ?
        )";
        $result = $this->fetchOne($sql, [$table]);
        return $result['exists'] ?? false;
    }

    /**
     * Get Redis connection
     */
    public function getRedis() {
        static $redis = null;
        
        if ($redis === null) {
            $config = $this->config['redis'];
            $redis = new Redis();
            $redis->connect($config['host'], $config['port']);
            
            if ($config['password']) {
                $redis->auth($config['password']);
            }
            
            $redis->select($config['database']);
        }
        
        return $redis;
    }

    // Prevent cloning
    private function __clone() {}

    // Prevent unserialization
    public function __wakeup() {
        throw new Exception("Cannot unserialize singleton");
    }
}
