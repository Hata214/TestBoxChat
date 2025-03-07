# Discord Chatbox Bot với Gemini AI

Một bot Discord thông minh được viết bằng JavaScript, tích hợp với Gemini AI của Google.

## Cài đặt

1. Clone repository này
2. Cài đặt các dependencies:
```
npm install
```
3. Tạo một Discord bot mới tại [Discord Developer Portal](https://discord.com/developers/applications)
4. Trong phần "Bot", bật các intents sau:
   - PRESENCE INTENT
   - SERVER MEMBERS INTENT
   - MESSAGE CONTENT INTENT
5. Sao chép token của bot
6. Lấy API key của Gemini AI từ [Google AI Studio](https://makersuite.google.com/app/apikey)
7. Tạo file `.env` và thêm:
   ```
   DISCORD_TOKEN=your_discord_bot_token_here
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
8. Mời bot vào server của bạn bằng cách tạo một URL mời trong phần "OAuth2" > "URL Generator"
   - Chọn scopes: `bot`
   - Chọn permissions: `Send Messages`, `Read Message History`, `Read Messages/View Channels`

## Chạy bot

```
npm start
```
hoặc
```
node index.js
```

## Các lệnh có sẵn

- `!hello` - Bot sẽ chào bạn
- `!help` - Hiển thị danh sách các lệnh có sẵn
- `!date` hoặc `!time` - Hiển thị ngày giờ hiện tại theo múi giờ Việt Nam
- `. [câu hỏi]` - Đặt câu hỏi hoặc trò chuyện với AI (ví dụ: `.hôm nay thời tiết thế nào?`)

## Tính năng

- **Tích hợp Gemini AI**: Bot sử dụng API Gemini AI của Google để trả lời câu hỏi và trò chuyện
- **Xử lý tin nhắn dài**: Bot tự động chia các phản hồi dài thành nhiều tin nhắn để tuân thủ giới hạn 2000 ký tự của Discord
- **Hiển thị trạng thái đang nhập**: Bot hiển thị trạng thái "đang nhập" khi xử lý yêu cầu
- **Nhận biết thời gian thực**: Bot tự động cung cấp thông tin về ngày tháng hiện tại cho AI, giúp trả lời chính xác các câu hỏi liên quan đến thời gian
- **Prefix đơn giản**: Sử dụng dấu `.` làm prefix thay vì các lệnh dài như `!ask` hoặc `!chat`
- **Hiển thị thời gian chính xác**: Lệnh `!date` hoặc `!time` hiển thị thời gian hiện tại theo múi giờ Việt Nam

## Triển khai (Deployment)

### Triển khai giao diện web lên Vercel

1. Fork repository này hoặc tạo repository mới trên GitHub
2. Đăng nhập vào [Vercel](https://vercel.com) và tạo dự án mới
3. Kết nối với repository GitHub của bạn
4. Vercel sẽ tự động phát hiện cấu hình từ file `vercel.json`
5. Nhấp vào "Deploy" để triển khai giao diện web

Lưu ý: Giao diện web trên Vercel sẽ chạy ở chế độ demo, không có kết nối thực với bot Discord.

### Triển khai backend

Bạn có thể triển khai backend trên bất kỳ dịch vụ hosting nào hỗ trợ Node.js, như:

- [Railway](https://railway.app)
- [DigitalOcean](https://www.digitalocean.com)
- [Azure](https://azure.microsoft.com)
- [Google Cloud](https://cloud.google.com)

Các bước cơ bản:
1. Chọn nhà cung cấp hosting phù hợp
2. Thiết lập các biến môi trường:
   - DISCORD_TOKEN
   - GEMINI_API_KEY
   - NODE_ENV=production
3. Deploy ứng dụng theo hướng dẫn của nhà cung cấp

Sau khi triển khai backend, cập nhật URL WebSocket trong giao diện web để kết nối với backend của bạn.

## Tùy chỉnh

Bạn có thể thêm các lệnh mới hoặc điều chỉnh cách bot tương tác với Gemini AI bằng cách chỉnh sửa file `index.js`.

## Phiên bản Gemini AI

Bot sử dụng phiên bản Gemini 1.5 Flash-002, là phiên bản ổn định mới nhất của Gemini AI, cung cấp khả năng xử lý ngôn ngữ tự nhiên nhanh và hiệu quả.

# Chatbox with Google Sheets Integration

Ứng dụng chatbox có tích hợp với Google Sheets, cho phép người dùng đọc, ghi và thêm dữ liệu vào Google Sheets.

## Cài đặt

1. Clone repository
2. Chạy `npm install` để cài đặt các dependencies
3. Tạo file credentials.json từ Google Cloud Console
4. Cập nhật file .env với thông tin cần thiết
5. Chạy `npm start` để khởi động ứng dụng

## Tính năng

- Chatbox cơ bản
- Tích hợp với Google Sheets:
  - Đọc dữ liệu từ Google Sheets
  - Ghi dữ liệu vào Google Sheets
  - Thêm dữ liệu vào Google Sheets

## Cách sử dụng

1. Truy cập ứng dụng tại http://localhost:3000
2. Sử dụng chatbox như bình thường
3. Sử dụng phần Google Sheets Integration để tương tác với Google Sheets 