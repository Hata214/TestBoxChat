# Discord Chatbox Bot với Gemini AI & Google Sheets

Bot Discord thông minh được xây dựng bằng Node.js & Express, tích hợp **Gemini 3.6 Flash** của Google, hỗ trợ Web giao diện Chatbox và tích hợp **Google Sheets**.

---

## 🚀 Tính năng nổi bật

- **Tích hợp Gemini 3.6 Flash**: Tốc độ xử lý siêu nhanh, trả lời thông minh, hỗ trợ nhận biết thời gian thực theo múi giờ Việt Nam (`Asia/Ho_Chi_Minh`).
- **Nhiều phương thức kích hoạt AI**:
  - Nhắn tin riêng (Direct Message / DM): Tự động trả lời mọi câu hỏi với AI.
  - Trong Server: Tag bot `@Botchat [câu hỏi]`, bắt đầu bằng dấu chấm `. [câu hỏi]`, hoặc dùng lệnh `!ai [câu hỏi]`, `!ask [câu hỏi]`.
- **Tự động chia nhỏ tin nhắn**: Phản hồi dài sẽ tự động chia nhỏ theo giới hạn 2000 ký tự của Discord.
- **Giao diện Web Chatbox**: Kết nối hai chiều thời gian thực qua WebSocket và API RESTful.
- **Tích hợp Google Sheets**: Hỗ trợ đọc, ghi và thêm hàng mới vào Google Sheets.

---

## 🛠️ Cài đặt & Chuẩn bị

### 1. Cài đặt thư viện
```bash
npm install
```

### 2. Cấu hình Discord Bot
1. Truy cập [Discord Developer Portal](https://discord.com/developers/applications) và tạo một Bot mới.
2. Vào mục **Bot** > **Privileged Gateway Intents** và bật đủ:
   - ✅ **PRESENCE INTENT**
   - ✅ **SERVER MEMBERS INTENT**
   - ✅ **MESSAGE CONTENT INTENT** *(Bắt buộc để bot đọc và trả lời tin nhắn)*
3. Vào mục **OAuth2** > **URL Generator**:
   - Chọn scope: `bot`
   - Chọn permissions: `Send Messages`, `Read Message History`, `View Channels`, `Embed Links`, `Attach Files`
   - Mời bot vào server của bạn.

### 3. Lấy API Key Gemini
Truy cập [Google AI Studio](https://aistudio.google.com/app/apikey) để tạo `GEMINI_API_KEY`.

### 4. Cấu hình biến môi trường (`.env`)
Tạo hoặc chỉnh sửa file `.env`:
```env
# Discord Token
DISCORD_TOKEN=your_discord_bot_token_here

# Google Gemini API Key
GEMINI_API_KEY=your_gemini_api_key_here

# Port & Server
PORT=3000
NODE_ENV=development

# CORS
CORS_ALLOW_ALL_ORIGINS=true
CORS_ALLOWED_ORIGINS=http://localhost:3000,https://testboxchat.vercel.app

# Google Sheets (nếu dùng)
GOOGLE_APPLICATION_CREDENTIALS=./credentials.json
SPREADSHEET_ID=your_spreadsheet_id_here
```

---

## 💻 Cách khởi chạy

### Chế độ Development (chạy server + bot + web connector):
```bash
npm run dev
```

### Chế độ Production:
```bash
npm start
```

### Chỉ chạy Bot Discord độc lập:
```bash
npm run bot
```

---

## 📜 Danh sách các lệnh Discord

| Lệnh / Cú pháp | Chức năng | Ví dụ |
| :--- | :--- | :--- |
| `!hello` | Chào hỏi bot | `!hello` |
| `!help` | Hiển thị menu trợ giúp | `!help` |
| `!date` / `!time` | Hiển thị ngày giờ hiện tại (Việt Nam) | `!time` |
| `. [câu hỏi]` | Đặt câu hỏi cho Gemini AI | `. hôm nay thời tiết thế nào?` |
| `!ai [câu hỏi]` / `!ask [câu hỏi]` | Hỏi đáp với Gemini AI | `!ai viết cho tôi một bài thơ` |
| `@Botchat [câu hỏi]` | Nhắc tên bot trong server để hỏi AI | `@Botchat giới thiệu bản thân đi` |
| *Nhắn tin riêng (DM)* | Mọi tin nhắn trong DM tự động hỏi AI | `bạn có thể giúp được gì?` |

---

## 🌐 Giao diện Web & Google Sheets API

- **Web Chatbox**: Truy cập tại `http://localhost:3000`
- **Trạng thái Server**: `GET /api/status`
- **Google Sheets API**:
  - `GET /api/sheets/read?range=Sheet1!A1:Z100` : Đọc dữ liệu từ Sheet
  - `POST /api/sheets/write` : Ghi dữ liệu vào Sheet
  - `POST /api/sheets/append` : Thêm dòng dữ liệu mới vào Sheet

---

## 🚀 Triển khai (Deployment)

- **Frontend (Giao diện Web)**: Có thể triển khai lên [Vercel](https://vercel.com) với file `vercel.json`.
- **Backend (Bot & WebSocket)**: Triển khai trên các dịch vụ hỗ trợ Node.js chạy liên tục (như [Render](https://render.com), [Railway](https://railway.app), [Fly.io](https://fly.io), [VPS](https://digitalocean.com)).