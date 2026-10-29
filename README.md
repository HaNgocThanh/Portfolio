# Portfolio — Hà Ngọc Thành

Portfolio cá nhân dùng Next.js App Router, React, TypeScript, Tailwind CSS và Motion. Chatbot gọi API AI phía server, lưu lịch sử và bộ đếm request trong Turso Cloud qua HTTP; ứng dụng trên Vercel không ghi SQLite cục bộ.

## Chỉnh nội dung

Xem [docs/CUSTOMIZE.md](docs/CUSTOMIZE.md).

- content/profile.ts: tên, giới thiệu, liên hệ, ảnh, đường dẫn CV, bản đồ và SEO.
- content/projects.ts: dự án.
- content/experience.ts: kinh nghiệm.
- content/tech-stack.ts: kỹ năng.
- public/: ảnh, biểu tượng và CV.

Các nội dung dự án/kinh nghiệm/mạng xã hội của mẫu được giữ để chủ sở hữu tự thay. Không đưa API key hoặc token vào content/.

## Chạy tại máy

Dùng Node.js 24.x (cùng runtime Vercel). Tại thư mục dự án:

```powershell
npm ci
if (-not (Test-Path .env.local)) { Copy-Item .env.example .env.local }
```

Điền TURSO_DATABASE_URL và TURSO_AUTH_TOKEN trong .env.local, rồi chạy:

```powershell
npm run db:setup
npm run db:check
npm run dev
```

db:setup tạo schema idempotent và không xóa dữ liệu đang có. Database URL phải là libsql://... hoặc https://..., có token đọc/ghi. Không hỗ trợ file: hoặc embedded replica trong ứng dụng triển khai.

Mở http://localhost:3000. Trang portfolio có thể build/render khi chưa cấu hình database hoặc AI; chat sẽ trả 503 nếu thiếu cấu hình dịch vụ. Không có thao tác tạo bảng/kết nối database trong lúc build.

## Biến môi trường

- NEXT_PUBLIC_BASE_URL: URL đầy đủ của website. Local dùng http://localhost:3000; trên Vercel có thể bỏ trống để dùng system URL. Nếu cấu hình thì phải dùng domain thực tế, không dùng localhost cho cloud.
- TURSO_DATABASE_URL, TURSO_AUTH_TOKEN: database Turso phía server; không dùng tiền tố NEXT_PUBLIC_.
- ROUTER_APIKEY, ROUTER_BASE_URL, ROUTER_MODEL: nhà cung cấp AI tương thích Chat Completions streaming. Base URL không thêm /chat/completions.
- CHAT_RETENTION_DAYS: số nguyên 1–365, mặc định 30.
- CHAT_TRUST_PROXY: chỉ cần ngoài Vercel; mặc định false. Trên Vercel, app tin x-real-ip do nền tảng ghi đè.
- CRON_SECRET: chuỗi ngẫu nhiên tối thiểu 32 ký tự để bảo vệ lịch dọn dữ liệu.

Sau khi đổi .env.local cần restart server. Sau khi đổi nội dung/domain cần build lại bản production.

## Kiểm tra và production

```powershell
npm run lint
npm run typecheck
npm run test:chat
npm run build
npm run start
```

Các test database dùng libSQL trong bộ nhớ, AI/fetch được giả lập; không dùng token hoặc dữ liệu Turso thật. next/font/google có thể cần mạng khi build. Trên Vercel dùng Node 24, Framework Next.js, Build Command npm run build; không đặt Output Directory thủ công.

Xem [docs/DEPLOY-VERCEL.md](docs/DEPLOY-VERCEL.md) để kết nối Turso, cấu hình môi trường và triển khai.

## Lịch sử và bảo trì

- Chỉ lưu trọn cặp câu hỏi/câu trả lời sau khi stream thành công.
- Xóa lịch sử làm tăng generation của session, chặn phản hồi cũ từ tab khác ghi lại hội thoại vừa xóa.
- API trả tối đa 100 tin nhắn mới nhất chưa hết hạn. Ngữ cảnh AI tối đa 10 tin, mỗi tin 4000 ký tự.
- Tin hết hạn không còn được trả về ngay từ truy vấn; Vercel cron dọn vật lý hằng ngày lúc 00:00 UTC (07:00 Việt Nam). Bản ghi có thể còn trong storage đến lượt cron kế tiếp; bản backup của nhà cung cấp có chính sách riêng.
- GET /api/cron/cleanup chỉ chạy khi Authorization khớp CRON_SECRET. Thiếu hoặc sai secret sẽ không gọi database.
- Có thể dọn thủ công bằng npm run chat:cleanup. Trên Vercel cron hoạt động sau khi production deployment và secret được cấu hình.
- Rate limit dùng transaction write của Turso, chia sẻ giữa các instance dùng cùng database; trả 429 và Retry-After khi bị giới hạn.
- Giới hạn mỗi phút cho client/session: gửi 10, đọc 60, xóa 10; trần toàn app lần lượt 60/300/60. Ngoài Vercel khi không tin proxy, khách chia sẻ hạn mức client.
- Origin phải khớp canonical hoặc URL Vercel của chính deployment; không cho phép mọi domain *.vercel.app. Preview có noindex và nên dùng database/token riêng.

## Dữ liệu SQLite cũ

Thư mục data/ cũ được giữ nguyên và không upload trong deployment. Ứng dụng mới không đọc file đó.
Nếu muốn chuyển lịch sử còn thời hạn sang Turso, đây là thao tác tùy chọn có chủ ý:

```powershell
npm run db:import -- --source .\data\chat.db --confirm-upload
```

Script chỉ đọc nguồn, bỏ qua ID đã tồn tại, không in nội dung hội thoại và có thể chạy lại. Không tự nhập dữ liệu khi deploy.

