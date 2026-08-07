# MCK — Music & Visuals

Website mobile-first phát FLAC và MP4 từ Google Drive, triển khai trực tiếp trên Vercel.

## Cấu trúc

- `index.html`: cấu trúc giao diện.
- `styles.css`: toàn bộ CSS, chia section bằng comment.
- `app.js`: player và tương tác giao diện.
- `media.json`: nguồn dữ liệu duy nhất cho danh sách FLAC/MP4.
- `api/media/[id].mjs`: Vercel Function proxy media và HTTP byte-range.

## Deploy

Import repository vào Vercel, chọn Framework Preset **Other** rồi deploy. Không cần Build Command hoặc Output Directory.

Các biến môi trường đều có giá trị mặc định:

| Tên | Mặc định | Mục đích |
| --- | --- | --- |
| `GOOGLE_DRIVE_DOWNLOAD_ORIGIN` | `https://drive.usercontent.google.com` | Máy chủ tải media |
| `MEDIA_CACHE_SECONDS` | `3600` | Thời gian cache media |
| `EXTRA_MEDIA_IDS` | rỗng | Drive ID bổ sung, phân cách bằng dấu phẩy |

Sau khi thay đổi biến môi trường, cần redeploy.

## Thêm media

Thêm một object vào `media.json`:

```json
{
  "id": "GOOGLE_DRIVE_FILE_ID",
  "file": "Tên bài hát.flac"
}
```

Định dạng được hỗ trợ: `.flac` và `.mp4`.
