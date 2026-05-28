# Hướng Dẫn Cài Đặt - App Thông Báo iOS

## Kiến Trúc Hệ Thống

```
Web Server của bạn
       ↓  POST /api/notify
   API Server (Replit)
       ↓  Expo Push Service
   iPhone (Expo App)
       ↓  lưu vào
   Firebase Realtime Database
```

---

## BƯỚC 1: Tạo Firebase Project

1. Vào https://console.firebase.google.com
2. Tạo project mới (chọn free Spark plan)
3. Vào **Build → Realtime Database** → Create database
4. Chọn vùng gần nhất, chọn **Start in test mode**
5. Vào **Project Settings → General** → copy các thông tin config

---

## BƯỚC 2: Cài Đặt Biến Môi Trường

Tạo file `.env` trong thư mục `artifacts/notify-app/`:

```bash
EXPO_PUBLIC_API_URL=https://your-replit-domain.replit.app/api
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSy...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1234567890
EXPO_PUBLIC_FIREBASE_APP_ID=1:1234567890:ios:abc123def456
```

---

## BƯỚC 3: Chạy App Trên Điện Thoại

```bash
# Trong thư mục artifacts/notify-app
pnpm install
npx expo start
```

Dùng **Expo Go** trên iPhone để scan QR code.

---

## BƯỚC 4: Gửi Thông Báo Từ Web Server

### API Endpoint

```
POST https://your-replit-domain.replit.app/api/notify
Content-Type: application/json
```

### Request Body

```json
{
  "title": "Tiêu đề thông báo",
  "body": "Nội dung thông báo của bạn",
  "sound": "default"
}
```

> Trường `sound` là tùy chọn. Nếu có, app sẽ phát âm thanh khi nhận thông báo.

### Ví Dụ (cURL)

```bash
curl -X POST https://your-replit-domain.replit.app/api/notify \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Đơn hàng mới",
    "body": "Bạn có đơn hàng #1234 vừa được đặt",
    "sound": "default"
  }'
```

### Ví Dụ (PHP)

```php
$data = [
    'title' => 'Tiêu đề',
    'body'  => 'Nội dung thông báo',
    'sound' => 'default',
];
$ch = curl_init('https://your-replit-domain.replit.app/api/notify');
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$result = curl_exec($ch);
curl_close($ch);
```

### Ví Dụ (Python)

```python
import requests

requests.post(
    'https://your-replit-domain.replit.app/api/notify',
    json={
        'title': 'Tiêu đề',
        'body': 'Nội dung thông báo',
        'sound': 'default',
    }
)
```

---

## Các API Khác

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/api/notify` | Gửi thông báo đến tất cả thiết bị |
| POST | `/api/register-token` | Đăng ký Expo push token (app tự gọi) |
| GET | `/api/notifications?page=1&perPage=5&limit=100` | Lấy danh sách thông báo |
| DELETE | `/api/notifications/:id` | Xóa 1 thông báo |
| DELETE | `/api/tokens` | Hủy đăng ký thiết bị |

---

## Luồng Hoạt Động

1. **App khởi động** → xin quyền thông báo → lấy Expo push token → gửi token lên API server
2. **Web server gọi** `POST /api/notify` → API server gửi push notification qua Expo Push Service
3. **App nhận thông báo** → hiển thị notification → lưu vào Firebase Realtime Database
4. **Mở app** → đọc dữ liệu từ Firebase → hiển thị danh sách phân trang (5 tin/trang)

---

## Lưu Ý

- Mỗi điện thoại cài app đều được đăng ký token → tất cả đều nhận thông báo cùng lúc
- Token được lưu tại `artifacts/api-server/data/tokens.json`
- Thông báo backup được lưu tại `artifacts/api-server/data/notifications.json`
- Firebase là nguồn dữ liệu chính hiển thị trong app
