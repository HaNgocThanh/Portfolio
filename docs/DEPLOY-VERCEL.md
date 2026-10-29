# Triển khai Vercel + Turso Free

## 1. Database

Tạo database Turso Cloud bằng tài khoản của bạn, chọn khu vực gần nơi chạy Vercel Functions. Tạo token có quyền đọc/ghi.
Điền vào D:\Portfolio\.env.local:

TURSO_DATABASE_URL=libsql://<database-host>
TURSO_AUTH_TOKEN=<token-của-bạn>

Không gửi token trong chat, không commit file này. Giữ Overages tắt nếu bạn chỉ muốn dùng hạn mức miễn phí; kiểm tra hạn mức trong tài khoản Turso.

Tại D:\Portfolio, dùng Node.js 24.x:
npm run db:setup
npm run db:check

Schema gồm messages, chat_rate_limits và chat_sessions. Không cần giữ file chat.db trên Vercel. Chỉ chạy db:import nếu muốn chủ động chuyển lịch sử cũ.

## 2. Vercel

Tạo/import project từ nguồn Portfolio, chọn Framework Next.js và Node.js 24.x, giữ Fluid Compute bật.
Build Command: npm run build. Install Command: npm ci. Không điền Output Directory.

Thêm biến môi trường phía server:
- TURSO_DATABASE_URL
- TURSO_AUTH_TOKEN
- ROUTER_APIKEY, ROUTER_BASE_URL, ROUTER_MODEL nếu dùng AI
- CHAT_RETENTION_DAYS=30
- CRON_SECRET: ít nhất 32 ký tự ngẫu nhiên

Có thể tạo secret cục bộ bằng Node.js crypto, lưu vào .env.local rồi copy vào Environment Variables của Vercel. Không dán secret vào nội dung commit hoặc chat.

Không sao chép NEXT_PUBLIC_BASE_URL=http://localhost:3000 sang Vercel. Để trống khi dùng domain Vercel tự cấp; khi có domain riêng, đặt URL HTTPS đầy đủ. Các system URL của Vercel được dùng tự động cho canonical/origin của deployment.

Production và Preview nên dùng database/token riêng. Không trỏ Preview vào database production nếu không muốn lịch sử/quota thử nghiệm dùng chung dữ liệu thật.

## 3. Build và lịch dọn

npm run lint
npm run typecheck
npm run test:chat
npm run build

vercel.json đã có cron /api/cron/cleanup, chạy 00:00 UTC hằng ngày (07:00 Việt Nam).
Vercel tự gửi Authorization: Bearer <CRON_SECRET>. Cron chỉ có hiệu lực sau production deployment; secret thiếu/sai không được xóa dữ liệu.

maxDuration của chat là 90 giây, AI bị giới hạn 60 giây; yêu cầu Fluid Compute của Vercel. Không giữ transaction database trong thời gian chờ AI.

## 4. Kiểm thử sau deploy

- Trang chủ, ảnh, CSS và metadata trả 200.
- sitemap.xml và robots.txt có domain đúng; preview không được index.
- Mở chat tạo cookie HttpOnly/Secure; tải lại vẫn thấy hội thoại đã lưu.
- Gửi câu hỏi rồi chờ stream hoàn tất; lỗi không tạo hội thoại lưu một nửa.
- Xóa lịch sử; reload xác nhận rỗng.
- Request từ origin khác trả 403; quá quota trả 429 và Retry-After.
- Gọi cron không Authorization trả 401, không xóa dữ liệu; kiểm tra lượt cron hợp lệ trong Dashboard.
- Kiểm tra log không có API key/token hoặc nội dung hội thoại.

Không dùng câu hỏi thật với AI để test hàng loạt nếu chưa xác nhận hạn mức nhà cung cấp.

## 5. Nội dung cần tự hoàn thiện

Các dự án, kinh nghiệm, social và ảnh mẫu chưa được thay theo hồ sơ thực tế, đúng yêu cầu tự chỉnh của bạn.
Đường dẫn CV đã đặt nhưng file tương ứng chưa có: nút tải CV được ẩn ở build nếu file chưa tồn tại. Thêm file vào public/ rồi redeploy để hiện nút; không thay bằng CV của tác giả mẫu.

## Tham khảo chính thức

- https://docs.turso.tech/sdk/ts/reference
- https://vercel.com/docs/cron-jobs/manage-cron-jobs
- https://vercel.com/docs/environment-variables/system-environment-variables
- https://vercel.com/docs/functions/configuring-functions/duration

