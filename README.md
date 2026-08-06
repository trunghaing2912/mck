# MCK — Music & Visuals

Website mobile-first phát bộ sưu tập FLAC và MP4 từ Google Drive.

## Chạy project

Yêu cầu Node.js 18 trở lên. Tại thư mục project, chạy:

```powershell
npm run dev
```

Sau đó mở `http://localhost:4173`.

> Không mở trực tiếp `index.html` và không dùng server tĩnh thông thường: chúng không có proxy Google Drive nên media có thể không phát được.

## Cách hoạt động

- `app.js` chứa danh sách Google Drive ID.
- `server.mjs` cung cấp website và proxy media qua `/api/media/<id>`.
- Proxy chuyển tiếp HTTP byte-range để phát và tua FLAC/MP4 ổn định.
- File media không được sao chép vào source code; thư mục Drive cần được chia sẻ công khai và máy chạy cần có Internet.

Chrome, Edge và Firefox phiên bản mới được khuyến nghị để giải mã FLAC.

## Deploy lên Vercel

1. Import repository vào Vercel.
2. Framework Preset chọn **Other**; không cần Build Command và Output Directory.
3. Deploy. Frontend tĩnh và function `/api/media/[id]` sẽ được nhận diện tự động.

Các biến môi trường đều có giá trị mặc định nên bản deploy đầu tiên không bắt buộc cấu hình. Nếu muốn tùy chỉnh, thêm trong **Project Settings → Environment Variables**:

| Tên | Giá trị mặc định | Mục đích |
| --- | --- | --- |
| `GOOGLE_DRIVE_DOWNLOAD_ORIGIN` | `https://drive.usercontent.google.com` | Máy chủ tải media |
| `MEDIA_CACHE_SECONDS` | `3600` | Thời gian cache media |
| `EXTRA_MEDIA_IDS` | rỗng | Các Drive ID bổ sung, phân cách bằng dấu phẩy |

Sau khi thay đổi biến trên Vercel, cần redeploy để deployment mới nhận giá trị. `HOST` và `PORT` chỉ dành cho local, không cấu hình hai biến này trên Vercel.
# mck
