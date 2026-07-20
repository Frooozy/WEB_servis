<?php
// api/book.php
header('Content-Type: application/json');
require_once __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method Not Allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

$name = trim($input['name'] ?? '');
$phone = trim($input['phone'] ?? '');
$service = trim($input['service'] ?? '');
$date = trim($input['date'] ?? '');
$time = trim($input['time'] ?? '');

// Input validation
if (!$name || !$phone || !$service || !$date || !$time) {
    http_response_code(422);
    echo json_encode(['error' => 'All fields are required']);
    exit;
}

$pdo = getDbConnection();

// Check if the requested slot is already occupied
$checkStmt = $pdo->prepare("SELECT COUNT(*) FROM bookings WHERE booking_date = :bdate AND booking_time = :btime");
$checkStmt->execute([':bdate' => $date, ':btime' => $time]);

if ($checkStmt->fetchColumn() > 0) {
    http_response_code(409);
    echo json_encode(['error' => 'Selected slot is already booked. Please select another time.']);
    exit;
}

// Insert new booking record
$insertStmt = $pdo->prepare("
    INSERT INTO bookings (client_name, client_phone, service_type, booking_date, booking_time)
    VALUES (:cname, :cphone, :stype, :bdate, :btime)
");

$success = $insertStmt->execute([
    ':cname'  => htmlspecialchars($name, ENT_QUOTES, 'UTF-8'),
    ':cphone' => htmlspecialchars($phone, ENT_QUOTES, 'UTF-8'),
    ':stype'  => htmlspecialchars($service, ENT_QUOTES, 'UTF-8'),
    ':bdate'  => $date,
    ':btime'  => $time
]);

if ($success) {
    echo json_encode(['success' => true, 'message' => 'Booking created successfully!']);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to save booking']);
}