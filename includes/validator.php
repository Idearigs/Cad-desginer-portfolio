<?php
/**
 * Comprehensive Input Validation System
 * Provides security-focused validation for all inputs
 */

class Validator {
    private $errors = [];
    private $data = [];

    /**
     * Create new validator instance
     */
    public function __construct(array $data = []) {
        $this->data = $data;
    }

    /**
     * Validate required field
     */
    public function required($field, $message = null) {
        $message = $message ?? "The {$field} field is required.";
        
        if (!isset($this->data[$field]) || $this->isEmpty($this->data[$field])) {
            $this->addError($field, $message);
        }
        
        return $this;
    }

    /**
     * Validate string length
     */
    public function length($field, $min = null, $max = null, $message = null) {
        if (!isset($this->data[$field])) {
            return $this;
        }

        $length = mb_strlen($this->data[$field]);
        
        if ($min !== null && $length < $min) {
            $message = $message ?? "The {$field} must be at least {$min} characters.";
            $this->addError($field, $message);
        }
        
        if ($max !== null && $length > $max) {
            $message = $message ?? "The {$field} must not exceed {$max} characters.";
            $this->addError($field, $message);
        }
        
        return $this;
    }

    /**
     * Validate email format
     */
    public function email($field, $message = null) {
        if (!isset($this->data[$field]) || $this->isEmpty($this->data[$field])) {
            return $this;
        }

        if (!filter_var($this->data[$field], FILTER_VALIDATE_EMAIL)) {
            $message = $message ?? "The {$field} must be a valid email address.";
            $this->addError($field, $message);
        }
        
        return $this;
    }

    /**
     * Validate numeric value
     */
    public function numeric($field, $min = null, $max = null, $message = null) {
        if (!isset($this->data[$field]) || $this->isEmpty($this->data[$field])) {
            return $this;
        }

        if (!is_numeric($this->data[$field])) {
            $message = $message ?? "The {$field} must be a number.";
            $this->addError($field, $message);
            return $this;
        }

        $value = (float) $this->data[$field];
        
        if ($min !== null && $value < $min) {
            $message = $message ?? "The {$field} must be at least {$min}.";
            $this->addError($field, $message);
        }
        
        if ($max !== null && $value > $max) {
            $message = $message ?? "The {$field} must not exceed {$max}.";
            $this->addError($field, $message);
        }
        
        return $this;
    }

    /**
     * Validate integer value
     */
    public function integer($field, $min = null, $max = null, $message = null) {
        if (!isset($this->data[$field]) || $this->isEmpty($this->data[$field])) {
            return $this;
        }

        if (!filter_var($this->data[$field], FILTER_VALIDATE_INT)) {
            $message = $message ?? "The {$field} must be an integer.";
            $this->addError($field, $message);
            return $this;
        }

        $value = (int) $this->data[$field];
        
        if ($min !== null && $value < $min) {
            $message = $message ?? "The {$field} must be at least {$min}.";
            $this->addError($field, $message);
        }
        
        if ($max !== null && $value > $max) {
            $message = $message ?? "The {$field} must not exceed {$max}.";
            $this->addError($field, $message);
        }
        
        return $this;
    }

    /**
     * Validate date format
     */
    public function date($field, $format = 'Y-m-d', $message = null) {
        if (!isset($this->data[$field]) || $this->isEmpty($this->data[$field])) {
            return $this;
        }

        $date = DateTime::createFromFormat($format, $this->data[$field]);
        
        if (!$date || $date->format($format) !== $this->data[$field]) {
            $message = $message ?? "The {$field} must be a valid date in format {$format}.";
            $this->addError($field, $message);
        }
        
        return $this;
    }

    /**
     * Validate URL format
     */
    public function url($field, $message = null) {
        if (!isset($this->data[$field]) || $this->isEmpty($this->data[$field])) {
            return $this;
        }

        if (!filter_var($this->data[$field], FILTER_VALIDATE_URL)) {
            $message = $message ?? "The {$field} must be a valid URL.";
            $this->addError($field, $message);
        }
        
        return $this;
    }

    /**
     * Validate against regex pattern
     */
    public function pattern($field, $pattern, $message = null) {
        if (!isset($this->data[$field]) || $this->isEmpty($this->data[$field])) {
            return $this;
        }

        if (!preg_match($pattern, $this->data[$field])) {
            $message = $message ?? "The {$field} format is invalid.";
            $this->addError($field, $message);
        }
        
        return $this;
    }

    /**
     * Validate value is in allowed list
     */
    public function in($field, array $allowed, $message = null) {
        if (!isset($this->data[$field]) || $this->isEmpty($this->data[$field])) {
            return $this;
        }

        if (!in_array($this->data[$field], $allowed, true)) {
            $allowedStr = implode(', ', $allowed);
            $message = $message ?? "The {$field} must be one of: {$allowedStr}.";
            $this->addError($field, $message);
        }
        
        return $this;
    }

    /**
     * Validate file upload
     */
    public function file($field, array $options = [], $message = null) {
        if (!isset($_FILES[$field])) {
            return $this;
        }

        $file = $_FILES[$field];
        
        // Skip validation if no file uploaded and it's optional
        if ($file['error'] === UPLOAD_ERR_NO_FILE) {
            return $this;
        }

        // Check for upload errors
        if ($file['error'] !== UPLOAD_ERR_OK) {
            $message = $message ?? "File upload failed.";
            $this->addError($field, $message);
            return $this;
        }

        // Validate file size
        if (isset($options['max_size'])) {
            if ($file['size'] > $options['max_size']) {
                $maxMB = round($options['max_size'] / 1024 / 1024, 2);
                $message = $message ?? "File size must not exceed {$maxMB}MB.";
                $this->addError($field, $message);
            }
        }

        // Validate file type
        if (isset($options['allowed_types'])) {
            $finfo = finfo_open(FILEINFO_MIME_TYPE);
            $mimeType = finfo_file($finfo, $file['tmp_name']);
            finfo_close($finfo);

            if (!in_array($mimeType, $options['allowed_types'])) {
                $allowedStr = implode(', ', $options['allowed_types']);
                $message = $message ?? "File type must be one of: {$allowedStr}.";
                $this->addError($field, $message);
            }
        }

        // Validate file extension
        if (isset($options['allowed_extensions'])) {
            $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
            
            if (!in_array($extension, $options['allowed_extensions'])) {
                $allowedStr = implode(', ', $options['allowed_extensions']);
                $message = $message ?? "File extension must be one of: {$allowedStr}.";
                $this->addError($field, $message);
            }
        }
        
        return $this;
    }

    /**
     * Sanitize string input
     */
    public function sanitize($field, $type = 'string') {
        if (!isset($this->data[$field])) {
            return $this;
        }

        switch ($type) {
            case 'string':
                $this->data[$field] = filter_var($this->data[$field], FILTER_SANITIZE_STRING);
                break;
            case 'email':
                $this->data[$field] = filter_var($this->data[$field], FILTER_SANITIZE_EMAIL);
                break;
            case 'url':
                $this->data[$field] = filter_var($this->data[$field], FILTER_SANITIZE_URL);
                break;
            case 'int':
                $this->data[$field] = filter_var($this->data[$field], FILTER_SANITIZE_NUMBER_INT);
                break;
            case 'float':
                $this->data[$field] = filter_var($this->data[$field], FILTER_SANITIZE_NUMBER_FLOAT, FILTER_FLAG_ALLOW_FRACTION);
                break;
            case 'html':
                $this->data[$field] = htmlspecialchars($this->data[$field], ENT_QUOTES, 'UTF-8');
                break;
        }
        
        return $this;
    }

    /**
     * Custom validation rule
     */
    public function custom($field, callable $callback, $message = null) {
        if (!isset($this->data[$field])) {
            return $this;
        }

        $result = $callback($this->data[$field]);
        
        if ($result !== true) {
            $message = $message ?? (is_string($result) ? $result : "The {$field} is invalid.");
            $this->addError($field, $message);
        }
        
        return $this;
    }

    /**
     * Check if validation passed
     */
    public function passes() {
        return empty($this->errors);
    }

    /**
     * Check if validation failed
     */
    public function fails() {
        return !$this->passes();
    }

    /**
     * Get all errors
     */
    public function errors() {
        return $this->errors;
    }

    /**
     * Get first error message
     */
    public function firstError() {
        if (empty($this->errors)) {
            return null;
        }

        $firstField = array_keys($this->errors)[0];
        return $this->errors[$firstField][0];
    }

    /**
     * Get validated data
     */
    public function validated() {
        return $this->data;
    }

    /**
     * Add error message
     */
    private function addError($field, $message) {
        if (!isset($this->errors[$field])) {
            $this->errors[$field] = [];
        }
        
        $this->errors[$field][] = $message;
    }

    /**
     * Check if value is empty
     */
    private function isEmpty($value) {
        return $value === null || $value === '' || (is_array($value) && empty($value));
    }

    /**
     * Static factory method
     */
    public static function make(array $data) {
        return new self($data);
    }

    /**
     * Quick validation for common patterns
     */
    public static function validateArticle(array $data) {
        return self::make($data)
            ->required('title')->length('title', 1, 255)
            ->required('content')->length('content', 1, 10000)
            ->length('author', 0, 100)
            ->length('publication', 0, 100)
            ->date('date')
            ->sanitize('title', 'html')
            ->sanitize('content', 'html')
            ->sanitize('author', 'string')
            ->sanitize('publication', 'string');
    }

    /**
     * Quick validation for events
     */
    public static function validateEvent(array $data) {
        return self::make($data)
            ->required('title')->length('title', 1, 255)
            ->required('date')->date('date')
            ->length('location', 0, 255)
            ->length('description', 0, 1000)
            ->sanitize('title', 'html')
            ->sanitize('location', 'string')
            ->sanitize('description', 'html');
    }

    /**
     * Quick validation for gallery images
     */
    public static function validateGalleryImage(array $data) {
        return self::make($data)
            ->required('title')->length('title', 1, 255)
            ->length('description', 0, 500)
            ->sanitize('title', 'html')
            ->sanitize('description', 'html');
    }
}