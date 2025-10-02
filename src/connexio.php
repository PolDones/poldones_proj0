<?php
$host = 'localhost';
$db   = 'a22poldonrod_proj0';
$user = 'a22poldonrod_admin_proj0';
$pass = 'u84HPK#p8u4+5Iw)';
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
  PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
  PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
];

try {
  $pdo = new PDO($dsn, $user, $pass, $options);
} catch (\PDOException $e) {
  echo "Error de connexió: " . $e->getMessage();
  exit;
}
