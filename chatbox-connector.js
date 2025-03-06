// Kết nối giao diện HTML với bot Discord
// Lưu ý: File này cần được chạy trên server Node.js

const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const { Client, GatewayIntentBits } = require('discord.js');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const cors = require('cors');
require('dotenv').config();

// Khởi tạo Express app
const app = express();
const server = http.createServer(app);

// Cấu hình CORS
app.use(cors({
    origin: function (origin, callback) {
        // Cho phép tất cả các origin hoặc danh sách cụ thể
        const allowedOrigins = [
            'http://localhost:3000',
            'http://localhost:5000',
            'https://testboxchat.vercel.app',
            'https://test-box-chat-6w6gb3eai-hata214s-projects.vercel.app'
        ];

        // Cho phép requests không có origin (như từ Postman hoặc curl)
        if (!origin) return callback(null, true);

        if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
            callback(null, true);
        } else {
            callback(new Error('CORS policy violation'));
        }
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    credentials: true
}));

// Cấu hình WebSocket với CORS
const wss = new WebSocket.Server({
    server,
    verifyClient: (info, cb) => {
        const origin = info.origin || info.req.headers.origin;

        // Kiểm tra origin cho WebSocket
        const allowedOrigins = [
            'http://localhost:3000',
            'http://localhost:5000',
            'https://testboxchat.vercel.app',
            'https://test-box-chat-6w6gb3eai-hata214s-projects.vercel.app'
        ];

        if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development' || !origin) {
            cb(true);
        } else {
            cb(false, 403, 'CORS policy violation');
        }
    }
});

// Middleware để xử lý JSON
app.use(express.json());

// Phục vụ các file tĩnh
app.use(express.static('.'));

// Khởi tạo Discord client
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
    ]
});

// Khởi tạo Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-002" });

// Lưu trữ kết nối WebSocket
let connections = [];

// Xử lý kết nối WebSocket
wss.on('connection', (ws, req) => {
    console.log('Client connected from:', req.socket.remoteAddress);
    connections.push(ws);

    // Gửi tin nhắn chào mừng
    ws.send(JSON.stringify({
        type: 'bot_message',
        content: 'Kết nối thành công với bot Discord!'
    }));

    // Xử lý tin nhắn từ client
    ws.on('message', async (message) => {
        try {
            const data = JSON.parse(message);

            if (data.type === 'user_message') {
                // Gửi trạng thái đang nhập
                ws.send(JSON.stringify({
                    type: 'typing',
                    isTyping: true
                }));

                // Xử lý tin nhắn
                let response = '';

                if (data.content === '!hello') {
                    response = 'Xin chào! Tôi là bot chat AI sử dụng Gemini.';
                } else if (data.content === '!help') {
                    response = 'Các lệnh có sẵn:<br>!hello - Chào hỏi<br>!help - Hiển thị trợ giúp<br>!date - Hiển thị ngày giờ hiện tại<br>. [câu hỏi] - Đặt câu hỏi cho AI';
                } else if (data.content === '!date' || data.content === '!time') {
                    const now = new Date();
                    const options = {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        timeZone: 'Asia/Ho_Chi_Minh'
                    };
                    response = `Thời gian hiện tại: ${now.toLocaleDateString('vi-VN', options)}`;
                } else if (data.content.startsWith('.')) {
                    // Xử lý câu hỏi với Gemini AI
                    const query = data.content.slice(1).trim();
                    if (query === '') {
                        response = 'Vui lòng nhập nội dung sau dấu "."';
                    } else {
                        try {
                            // Thêm thông tin thời gian hiện tại
                            const currentDate = new Date();
                            const dateInfo = `Thông tin thời gian hiện tại: Hôm nay là ngày ${currentDate.getDate()} tháng ${currentDate.getMonth() + 1} năm ${currentDate.getFullYear()}. Giờ hiện tại là ${currentDate.getHours()}:${currentDate.getMinutes()}.`;

                            const enhancedPrompt = `${dateInfo}\n\nCâu hỏi hoặc yêu cầu: ${query}`;

                            const result = await model.generateContent(enhancedPrompt);
                            response = result.response.text();
                        } catch (error) {
                            console.error('Gemini AI Error:', error);
                            response = 'Xin lỗi, tôi đang gặp vấn đề khi xử lý yêu cầu của bạn.';
                        }
                    }
                } else {
                    response = 'Tôi không hiểu lệnh này. Hãy thử sử dụng "!help" để xem danh sách các lệnh có sẵn hoặc bắt đầu câu hỏi bằng dấu "."';
                }

                // Gửi phản hồi
                setTimeout(() => {
                    // Tắt trạng thái đang nhập
                    ws.send(JSON.stringify({
                        type: 'typing',
                        isTyping: false
                    }));

                    // Gửi tin nhắn phản hồi
                    ws.send(JSON.stringify({
                        type: 'bot_message',
                        content: response
                    }));
                }, 1000);
            }
        } catch (error) {
            console.error('Error processing message:', error);
        }
    });

    // Xử lý khi client ngắt kết nối
    ws.on('close', () => {
        console.log('Client disconnected');
        connections = connections.filter(conn => conn !== ws);
    });
});

// Xử lý tin nhắn từ Discord
client.on('messageCreate', async (message) => {
    // Bỏ qua tin nhắn từ bot
    if (message.author.bot) return;

    // Gửi tin nhắn từ Discord đến tất cả các kết nối WebSocket
    connections.forEach(conn => {
        conn.send(JSON.stringify({
            type: 'discord_message',
            author: message.author.username,
            content: message.content,
            timestamp: message.createdAt
        }));
    });

    // Xử lý các lệnh như trong file index.js
    // ...
});

// Đăng nhập vào Discord
client.login(process.env.DISCORD_TOKEN)
    .then(() => {
        console.log(`Logged in as ${client.user.tag}!`);
    })
    .catch(error => {
        console.error('Discord login error:', error);
    });

// API endpoint để kiểm tra trạng thái server
app.get('/api/status', (req, res) => {
    res.json({
        status: 'online',
        connections: connections.length,
        discord_connected: client.isReady(),
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'production'
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/chatbox.html');
});

// Xử lý lỗi CORS
app.use((err, req, res, next) => {
    if (err.message === 'CORS policy violation') {
        res.status(403).json({
            error: 'CORS policy violation',
            message: 'Origin not allowed'
        });
    } else {
        next(err);
    }
});

// Xử lý lỗi 404
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: 'The requested resource was not found'
    });
});

// Xử lý lỗi 500
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message
    });
});

// Khởi động server
const PORT = process.env.PORT || 8080;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`WebSocket server is ready`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
}); 