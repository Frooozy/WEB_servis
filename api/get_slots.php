<?php
// api/get_slots.php

// Explicitly set response headers and prevent direct HTML error output
header('Content-Type: application/json; charset=utf-8');
ini_set('display_errors', '0');
error_reporting(E_ALL);

require_once __DIR__ . '/config.php';

try {
    $date = filter_input(INPUT_GET, 'date', FILTER_SANITIZE_SPECIAL_CHARS);

    if (!$date) {
        http_response_code(400);
        echo json_encode(['error' => 'Date parameter is required']);
        exit;
    }

    $pdo = getDbConnection();

    // Query occupied slots safely using PDO prepared statements
    $stmt = $pdo->prepare("SELECT booking_time FROM bookings WHERE booking_date = :bdate");
    $stmt->execute([':bdate' => $date]);

    $bookedSlots = $stmt->fetchAll(PDO::FETCH_COLUMN);

    echo json_encode(['booked_slots' => $bookedSlots]);
} catch (Throwable $e) {
    // Log actual server exception and return formatted JSON error response
    error_log($e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Internal server error: ' . $e->getMessage()]);
}