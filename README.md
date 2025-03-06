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
7. Chỉnh sửa file `.env` và thêm:
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

## Tùy chỉnh

Bạn có thể thêm các lệnh mới hoặc điều chỉnh cách bot tương tác với Gemini AI bằng cách chỉnh sửa file `index.js`.

## Phiên bản Gemini AI

Bot sử dụng phiên bản Gemini 1.5 Flash-002, là phiên bản ổn định mới nhất của Gemini AI (tính đến tháng 10/2024), cung cấp khả năng xử lý ngôn ngữ tự nhiên nhanh và hiệu quả. 