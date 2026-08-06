# MCK — Music & Visuals

Website mobile-first phát bộ sưu tập FLAC và MP4 từ Google Drive.

## Chạy project

Yêu cầu Node.js 18 trở lên. Tại thư mục project, chạy:

```powershell
node server.mjs
```

Sau đó mở `http://localhost:4173`.

> Không mở trực tiếp `index.html` và không dùng server tĩnh thông thường: chúng không có proxy Google Drive nên media có thể không phát được.

## Cách hoạt động

- `app.js` chứa danh sách Google Drive ID.
- `server.mjs` cung cấp website và proxy media qua `/api/media/<id>`.
- Proxy chuyển tiếp HTTP byte-range để phát và tua FLAC/MP4 ổn định.
- File media không được sao chép vào source code; thư mục Drive cần được chia sẻ công khai và máy chạy cần có Internet.

Chrome, Edge và Firefox phiên bản mới được khuyến nghị để giải mã FLAC.
# mck
