<?php
/**
 * API Endpoints Test
 * Test file to diagnose API endpoint issues
 * Access via: domain.com/test-api-endpoints.php
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$results = [
    'timestamp' => date('Y-m-d H:i:s'),
    'api_tests' => []
];

// Test 1: Login API direct test
function testLoginAPI() {
    $loginPath = __DIR__ . '/api/auth/login.php';
    
    $test = [
        'endpoint' => '/api/auth/login.php',
        'file_exists' => file_exists($loginPath),
        'file_readable' => is_readable($loginPath),
        'direct_execution' => null,
        'post_simulation' => null
    ];
    
    if (!$test['file_exists']) {
        $test['error'] = 'Login API file does not exist';
        return $test;
    }
    
    // Test direct execution (GET request simulation)
    ob_start();
    $_SERVER['REQUEST_METHOD'] = 'GET';
    try {
        include $loginPath;
        $output = ob_get_contents();
        $test['direct_execution'] = [
            'success' => true,
            'output' => $output
        ];
    } catch (Exception $e) {
        $test['direct_execution'] = [
            'success' => false,
            'error' => $e->getMessage()
        ];
    }
    ob_end_clean();
    
    // Test POST simulation
    ob_start();
    $_SERVER['REQUEST_METHOD'] = 'POST';
    $_POST = [
        'username' => 'test',
        'password' => 'test'
    ];
    
    try {
        include $loginPath;
        $output = ob_get_contents();
        $test['post_simulation'] = [
            'success' => true,
            'output' => $output
        ];
    } catch (Exception $e) {
        $test['post_simulation'] = [
            'success' => false,
            'error' => $e->getMessage()
        ];
    }
    ob_end_clean();
    
    // Reset globals
    unset($_POST);
    $_SERVER['REQUEST_METHOD'] = 'GET';
    
    return $test;
}

// Test 2: Other API endpoints
function testOtherEndpoints() {
    $endpoints = [
        '/api/gallery/index.php',
        '/api/news/index.php',
        '/api/events/index.php',
        '/api/health/index.php'
    ];
    
    $tests = [];
    
    foreach ($endpoints as $endpoint) {
        $filePath = __DIR__ . $endpoint;
        $test = [
            'endpoint' => $endpoint,
            'file_exists' => file_exists($filePath),
            'file_readable' => is_readable($filePath),
            'file_size' => file_exists($filePath) ? filesize($filePath) : 0
        ];
        
        if ($test['file_exists'] && $test['file_readable']) {
            // Try to get first few lines to check for syntax errors
            $content = file_get_contents($filePath, false, null, 0, 500);
            $test['content_preview'] = substr($content, 0, 200) . '...';
            
            // Check for obvious syntax issues
            $test['starts_with_php'] = strpos($content, '<?php') === 0;
        }
        
        $tests[] = $test;
    }
    
    return $tests;
}

// Test 3: Include files test
function testIncludeFiles() {
    $includes = [
        '/includes/config.php',
        '/includes/db.php',
        '/includes/env.php',
        '/includes/logger.php',
        '/includes/csrf.php',
        '/includes/rate_limiter.php',
        '/includes/validator.php'
    ];
    
    $tests = [];
    
    foreach ($includes as $include) {
        $filePath = __DIR__ . $include;
        $test = [
            'file' => $include,
            'exists' => file_exists($filePath),
            'readable' => is_readable($filePath),
            'size' => file_exists($filePath) ? filesize($filePath) : 0
        ];
        
        if ($test['exists'] && $test['readable']) {
            // Test if file can be included without errors
            ob_start();
            try {
                include_once $filePath;
                $test['include_successful'] = true;
                $test['include_output'] = ob_get_contents();
            } catch (Exception $e) {
                $test['include_successful'] = false;
                $test['include_error'] = $e->getMessage();
            } catch (Error $e) {
                $test['include_successful'] = false;
                $test['include_error'] = $e->getMessage();
            }
            ob_end_clean();
        }
        
        $tests[] = $test;
    }
    
    return $tests;
}

// Test 4: cURL test to login endpoint
function testLoginEndpointWithCurl() {
    $loginUrl = 'http://' . $_SERVER['HTTP_HOST'] . dirname($_SERVER['REQUEST_URI']) . '/api/auth/login.php';
    
    $test = [
        'url' => $loginUrl,
        'curl_available' => function_exists('curl_init'),
        'response' => null
    ];
    
    if (!$test['curl_available']) {
        $test['error'] = 'cURL not available';
        return $test;
    }
    
    $postData = [
        'username' => 'test',
        'password' => 'test'
    ];
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $loginUrl);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($postData));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);
    
    $test['response'] = [
        'http_code' => $httpCode,
        'response_body' => $response,
        'curl_error' => $error,
        'response_length' => strlen($response)
    ];
    
    // Try to decode JSON response
    $jsonResponse = json_decode($response, true);
    if (json_last_error() === JSON_ERROR_NONE) {
        $test['response']['json_decoded'] = $jsonResponse;
    } else {
        $test['response']['json_decode_error'] = json_last_error_msg();
    }
    
    return $test;
}

// Run all tests
$results['api_tests']['login_direct'] = testLoginAPI();
$results['api_tests']['other_endpoints'] = testOtherEndpoints();
$results['api_tests']['include_files'] = testIncludeFiles();
$results['api_tests']['login_curl'] = testLoginEndpointWithCurl();

// Test 5: Error log check
$errorLogPath = __DIR__ . '/php_errors.log';
if (file_exists($errorLogPath)) {
    $results['error_log'] = [
        'exists' => true,
        'size' => filesize($errorLogPath),
        'last_modified' => date('Y-m-d H:i:s', filemtime($errorLogPath)),
        'last_10_lines' => array_slice(file($errorLogPath, FILE_IGNORE_NEW_LINES), -10)
    ];
} else {
    $results['error_log'] = ['exists' => false];
}

// Output results
echo json_encode($results, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
?>