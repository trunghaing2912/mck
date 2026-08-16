# MCK — Music & Visuals

Website mobile-first phát FLAC và MP4 từ Cloudflare R2, triển khai trực tiếp trên Vercel.

## Cấu trúc

- `index.html`: cấu trúc giao diện.
- `styles.css`: toàn bộ CSS, chia section bằng comment.
- `app.js`: player và tương tác giao diện.
- `media.json`: nguồn dữ liệu duy nhất cho danh sách và object key FLAC/MP4.
- `api/media/[id].mjs`: Vercel Function ký request R2 và proxy HTTP byte-range.

## Deploy

Import repository vào Vercel, chọn Framework Preset **Other** rồi deploy. Không cần Build Command hoặc Output Directory.

Đặt các biến môi trường sau trong Vercel rồi redeploy:

| Tên | Mặc định | Mục đích |
| --- | --- | --- |
| `R2_ENDPOINT` | không có | S3 API endpoint của tài khoản R2 |
| `R2_BUCKET` | `mck` | Tên bucket |
| `R2_ACCESS_KEY_ID` | không có | Access Key ID chỉ có quyền đọc bucket |
| `R2_SECRET_ACCESS_KEY` | không có | Secret Access Key chỉ dùng server-side |
| `MEDIA_CACHE_SECONDS` | `3600` | Thời gian cache media |

Sau khi thay đổi biến môi trường, cần redeploy.

## Thêm media

Thêm một object vào `media.json`:

```json
{
  "id": "stable-unique-id",
  "file": "Tên bài hát.flac"
}
```

`file` phải khớp chính xác object key trong bucket R2. Định dạng được hỗ trợ: `.flac` và `.mp4`.
