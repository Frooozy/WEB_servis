<?php
// api/get_slots.php
header('Content-Type: application/json');
require_once __DIR__ . '/config.php';

$date = filter_input(INPUT_GET, 'date', FILTER_SANITIZE_SPECIAL_CHARS);

if (!$date) {
    http_response_code(400);
    echo json_encode(['error' => 'Date parameter is required']);
    exit;
}

$pdo = getDbConnection();

// Safe execution using prepared statements (PDO)
$stmt = $pdo->prepare("SELECT booking_time FROM bookings WHERE booking_date = :bdate");
$stmt->execute([':bdate' => $date]);

$bookedSlots = $stmt->fetchAll(PDO::FETCH_COLUMN);

echo json_encode(['booked_slots' => $bookedSlots]);