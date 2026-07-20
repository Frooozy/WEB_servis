<?php
// api/get_bookings.php
session_start();
header('Content-Type: application/json');
require_once __DIR__ . '/config.php';

// Session-based access restriction
if (empty($_SESSION['is_admin'])) {
    http_response_code(403);
    echo json_encode(['error' => 'Access denied. Authentication required.']);
    exit;
}

$pdo = getDbConnection();

$stmt = $pdo->query("SELECT id, client_name, client_phone, service_type, booking_date, booking_time, created_at FROM bookings ORDER BY booking_date DESC, booking_time ASC");
$bookings = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode(['bookings' => $bookings]);