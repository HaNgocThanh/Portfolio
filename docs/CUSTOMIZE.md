# Tự chỉnh sửa Portfolio

Nội dung RyHar hiện được giữ làm mẫu theo yêu cầu của bạn. Chưa có thông tin cá nhân nào được suy đoán hoặc thay thế.

## 1. Hồ sơ và liên hệ — D:\Portfolio\content\profile.ts

Sửa đối tượng profile:
- name, shortName, brand, copyrightName: tên đầy đủ, tên trên Hero, thương hiệu và chân trang.
- role, roles, highlights: chức danh, các dòng chữ chạy và các điểm nổi bật.
- intro, biography, approach: giới thiệu, phần About và cách làm việc.
- email, phone, whatsapp: liên hệ. Link WhatsApp tự tạo từ số phone; đặt whatsapp=false nếu không dùng.
- birthplace, location, education, gpa: thông tin cá nhân và học vấn.
- socials: đổi label và href của GitHub, LinkedIn, Instagram, TikTok. Xóa một mục khỏi mảng nếu không dùng.
- map.title, map.location, map.embedUrl: tên và vị trí bản đồ. Đặt embedUrl="" để ẩn bản đồ.
- image, cv: đường dẫn tính từ public/, xem mục 5.
- siteUrl, seoDescription, twitterHandle, googleVerification: domain, mô tả SEO và tài khoản/xác minh của chính bạn. Mã Google của tác giả gốc đã được bỏ.
- language, locale, dateLocale, chatLanguage: ngôn ngữ HTML, locale chia sẻ, định dạng thời gian và ngôn ngữ trả lời AI. Ví dụ vi / vi_VN / vi-VN / tiếng Việt.
Các trường ngôn ngữ này không tự dịch toàn bộ nhãn giao diện. Các nhãn như About Me, Selected Works nằm trong app/ và components/.

Header/footer, phần giới thiệu, liên hệ, metadata và chatbot cùng dùng dữ liệu này. Các file content/ chỉ chứa thông tin công khai; không đặt mật khẩu hay API key.

## 2. Dự án — D:\Portfolio\content\projects.ts

Thêm/sửa/xóa phần tử trong projects:
- index phải là số duy nhất trong mảng.
- title, shortDescription, createdAt, features, tech: nội dung giới thiệu.
- imagePath: ảnh dự án trong public/.
- liveDemoUrl: link bản chạy thật.
- githubUrl: link repository; isPrivateRepo=true nếu không công khai mã nguồn.
Một ProjectCard dùng chung cho desktop/mobile. Chatbot tự lấy danh sách dự án tại đây.

## 3. Kinh nghiệm — D:\Portfolio\content\experience.ts

Sửa experiences: id duy nhất, company, role, date, description và skills.
Danh sách này được dùng cho cả timeline và ngữ cảnh chatbot.

## 4. Kỹ năng — D:\Portfolio\content\tech-stack.ts

Sửa techCategories: title, description và technologies.
Mỗi công nghệ có name và icon, ví dụ icon: "/icons/react.svg".
Đặt file biểu tượng vào public/icons/. Dùng đường dẫn ảnh, không nhúng HTML/SVG dưới dạng chuỗi.

## 5. Ảnh và CV — D:\Portfolio\public

Ví dụ đặt ảnh tại D:\Portfolio\public\images\avatar.jpg rồi sửa profile.image thành "/images/avatar.jpg".
Đặt CV tại D:\Portfolio\public\CV.pdf rồi sửa profile.cv thành "/CV.pdf".
Đổi ảnh dự án tương tự qua imagePath. File cũ chỉ nên xóa sau khi đã đổi hết đường dẫn tham chiếu.
Không ghi các đường dẫn kiểu D:\... vào trường src/href của website.

## 6. Cấu hình chạy — D:\Portfolio\.env.local

NEXT_PUBLIC_BASE_URL phải là URL website thực tế (http://localhost:3000 khi chạy local). Biến này ưu tiên hơn profile.siteUrl; trên Vercel có thể bỏ trống để dùng system URL của deployment. Không đưa URL localhost lên Vercel.
Các biến ROUTER_* và CHAT_* vẫn ở .env.local, không đặt trong content/.
Restart dev server sau khi đổi .env.local; build lại bản production sau khi đổi nội dung hoặc domain.

## 7. Các component sau khi tách

- app/contact.tsx: bố cục liên hệ.
- components/chat/ChatWidget.tsx: cửa sổ chat.
- components/chat/ChatMessages.tsx, ChatMarkdown.tsx, ChatInput.tsx: hiển thị tin nhắn/Markdown và ô nhập.
- hooks/useChat.ts: gọi API, streaming, xử lý lỗi và xóa lịch sử.
- app/project.tsx: bố cục danh sách dự án.
- components/projects/ProjectCard.tsx, ProjectModal.tsx: thẻ và cửa sổ chi tiết.
- lib/chat-prompt.ts: sinh system prompt từ content/; không cần sửa khi đổi hồ sơ.
- app/layout.tsx, app/robots.ts, app/sitemap.ts: SEO, đã nối với profile và cấu hình domain.
- components/PageLoader.tsx, components/Header.tsx, components/Footer.tsx: phần khung website.

## 8. Kiểm tra sau khi tự sửa

Chạy tại D:\Portfolio:
npm run lint
npm run typecheck
npm run dev

Kiểm tra tên, liên hệ, CV, ảnh, link dự án, giao diện mobile và chatbot.
Hồ sơ cũ không còn phù hợp sau khi bạn thay thông tin: dùng nút xóa lịch sử chat để bắt đầu ngữ cảnh mới.


Sau bước 6: chatbot dùng Turso Cloud. Khung chat được ẩn nếu thiếu biến Turso hoặc AI; thêm cấu hình rồi redeploy để bật. Nút tải CV chỉ hiện khi file tương ứng đã có trong public/ lúc build. Xem docs/DEPLOY-VERCEL.md để triển khai.

