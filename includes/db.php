<?php
/**
 * Secure Database Connection for Digital CAD Atelier
 * Uses environment variables for configuration
 */

// Load environment configuration
require_once __DIR__ . '/env.php';

// Only load logger if it doesn't cause issues
if (file_exists(__DIR__ . '/logger.php')) {
    require_once __DIR__ . '/logger.php';
}

// Get database configuration from environment
$db_host = EnvLoader::get('DB_HOST', 'localhost');
$db_name = EnvLoader::get('DB_NAME', 'digital_cad_atelier');
$db_user = EnvLoader::get('DB_USER', 'root');
$db_pass = EnvLoader::get('DB_PASS', '');
$db_charset = EnvLoader::get('DB_CHARSET', 'utf8mb4');

// Enhanced PDO connection options
$options = [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES => false,
    PDO::ATTR_PERSISTENT => false,
    PDO::ATTR_TIMEOUT => 30,
    PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES $db_charset COLLATE {$db_charset}_unicode_ci"
];

// Database connection singleton
class Database {
    private static $instance = null;
    private $connection;
    private $host;
    private $name;
    private $username;
    private $password;
    private $charset;

    private function __construct() {
        $this->host = EnvLoader::get('DB_HOST', 'localhost');
        $this->name = EnvLoader::get('DB_NAME', 'digital_cad_atelier');
        $this->username = EnvLoader::get('DB_USER', 'root');
        $this->password = EnvLoader::get('DB_PASS', '');
        $this->charset = EnvLoader::get('DB_CHARSET', 'utf8mb4');
        
        $this->connect();
    }

    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function connect() {
        $dsn = "mysql:host={$this->host};dbname={$this->name};charset={$this->charset}";
        
        $options = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
            PDO::ATTR_PERSISTENT => false,
            PDO::ATTR_TIMEOUT => 30,
            PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES {$this->charset} COLLATE {$this->charset}_unicode_ci"
        ];

        try {
            $this->connection = new PDO($dsn, $this->username, $this->password, $options);
            
            // Log successful connection in debug mode
            if (EnvLoader::isDebug()) {
                Logger::info("Database connection established");
            }
        } catch (PDOException $e) {
            // Log the actual error for debugging
            Logger::error("Database connection failed", [
                'error' => $e->getMessage(),
                'host' => $this->host,
                'database' => $this->name
            ]);
            
            // Show user-friendly message
            if (EnvLoader::isProduction()) {
                die("Database connection error. Please try again later.");
            } else {
                die("Database connection failed: " . $e->getMessage());
            }
        }
    }

    public function getConnection() {
        // Check if connection is still alive
        try {
            $this->connection->query('SELECT 1');
        } catch (PDOException $e) {
            // Reconnect if connection is lost
            Logger::warning("Database connection lost, reconnecting", ['error' => $e->getMessage()]);
            $this->connect();
        }
        
        return $this->connection;
    }

    // Prevent cloning
    private function __clone() {}
    
    // Prevent unserialization
    public function __wakeup() {
        throw new Exception("Cannot unserialize singleton");
    }
}

// Create global PDO instance for backward compatibility
try {
    $pdo = Database::getInstance()->getConnection();
} catch (Exception $e) {
    Logger::critical("Failed to initialize database connection", ['error' => $e->getMessage()]);
    
    if (EnvLoader::isProduction()) {
        die("System temporarily unavailable. Please try again later.");
    } else {
        die("Database initialization failed: " . $e->getMessage());
    }
}
