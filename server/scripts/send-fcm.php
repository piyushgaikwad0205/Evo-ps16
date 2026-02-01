<?php
// Usage: php send-fcm.php FCM_TOKEN "Title" "Body"
$token = $argv[1] ?? null;
$title = $argv[2] ?? 'Campus Connect';
$body = $argv[3] ?? 'Test notification';
if (!$token) {
  fwrite(STDERR, "Usage: php send-fcm.php <FCM_TOKEN> [Title] [Body]\n");
  exit(1);
}

$serverKey = getenv('FCM_SERVER_KEY');
if (!$serverKey) {
  fwrite(STDERR, "Set FCM_SERVER_KEY env var.\n");
  exit(1);
}

$payload = [
  'to' => $token,
  'notification' => [
    'title' => $title,
    'body' => $body,
    'click_action' => 'OPEN_APP'
  ],
  'data' => [
    'type' => 'test',
    'id' => '123'
  ]
];

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'https://fcm.googleapis.com/fcm/send');
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
  'Content-Type: application/json',
  'Authorization: key=' . $serverKey
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
$result = curl_exec($ch);
if ($result === false) {
  fwrite(STDERR, 'Curl failed: ' . curl_error($ch) . "\n");
  exit(1);
}
echo $result, "\n";
curl_close($ch);
?>

