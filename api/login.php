<?php
// api/login.php
session_start();
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method Not Allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$password = $input['password'] ?? '';

// Securely read password from environment variable
$adminPassword = $_ENV['ADMIN_PASSWORD'] ?? 'AdminSecurePass123!';

if ($password === $adminPassword) {
    $_SESSION['is_admin'] = true;
    echo json_encode(['success' => true, 'message' => 'Login successful']);
} else {
    http_response_code(401);
    echo json_encode(['error' => 'Invalid credentials']);
}