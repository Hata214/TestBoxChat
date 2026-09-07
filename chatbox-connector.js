// Kết nối giao diện HTML với bot Discord
// Lưu ý: File này cần được chạy trên server Node.js

const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const { Client, GatewayIntentBits, Partials } = require('discord.js');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const cors = require('cors');
require('dotenv').config();

// Khởi tạo Express app
const app = express();
const server = http.createServer(app);

// Cấu hình CORS từ biến môi trường
const corsAllowAllOrigins = process.env.CORS_ALLOW_ALL_ORIGINS === 'true';
const corsAllowedOrigins = process.env.CORS_ALLOWED_ORIGINS ?
    process.env.CORS_ALLOWED_ORIGINS.split(',') :
    [
        'http://localhost:3000',
        'https://testboxchat.vercel.app',
        'https://test-box-chat-6w6gb3eai-hata214s-projects.vercel.app',
        'https://test-box-chat-5zuuxs2co-hata214s-projects.vercel.app',
        'https://discord-chatbox-web.vercel.app'

    ];

// Cấu hình CORS
app.use(cors({
    origin: function (origin, callback) {
        // Cho phép tất cả các origin nếu được cấu hình
        if (corsAllowAllOrigins) {
            return callback(null, true);
        }

        // Cho phép requests không có origin (như từ Postman hoặc curl)
        if (!origin) return callback(null, true);

        if (corsAllowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
            callback(null, true);
        } else {
            console.log(`CORS blocked for origin: ${origin}`);
            callback(new Error('CORS policy violation'));
        }
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
    maxAge: 86400 // 24 giờ
}));

// Cấu hình WebSocket với CORS
const wss = new WebSocket.Server({
    server,
    verifyClient: (info, cb) => {
        const origin = info.origin || info.req.headers.origin;

        // Cho phép tất cả các origin nếu được cấu hình
        if (corsAllowAllOrigins) {
            return cb(true);
        }

        // Kiểm tra origin cho WebSocket
        if (corsAllowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development' || !origin) {
            cb(true);
        } else {
            console.log(`WebSocket CORS blocked for origin: ${origin}`);
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
        GatewayIntentBits.DirectMessages
    ],
    partials: [
        Partials.Channel,
        Partials.Message
    ]
});

// Khởi tạo Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-3.6-flash" });

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
    // Log tin nhắn nhận được để debug
    console.log(`[Discord Received] From: ${message.author.tag} | Content: "${message.content}" | Channel: ${message.channel.id}`);

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

    // Lệnh chào hỏi
    if (message.content.startsWith('!hello')) {
        return message.reply('Xin chào! Tôi là bot chat AI sử dụng Gemini.');
    }

    // Lệnh trợ giúp
    if (message.content.startsWith('!help')) {
        return message.reply('Các lệnh có sẵn:\n!hello - Chào hỏi\n!help - Hiển thị trợ giúp\n!date - Hiển thị ngày giờ hiện tại\n. [câu hỏi] - Đặt câu hỏi cho AI');
    }

    // Lệnh xem ngày giờ
    if (message.content.startsWith('!date') || message.content.startsWith('!time')) {
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
        return message.reply(`Thời gian hiện tại: ${now.toLocaleDateString('vi-VN', options)}`);
    }

    // Xử lý câu hỏi AI
    // 1. Nếu tin nhắn bắt đầu bằng dấu chấm "." (ví dụ: ". bạn giúp được gì?")
    // 2. Hoặc bắt đầu bằng !ask, !ai
    // 3. Hoặc bot được nhắc đến (@Botchat) trong server
    // 4. Hoặc nhắn tin riêng trong DM với bot
    const isDirectMessage = !message.guild;
    const isMentioned = message.mentions.has(client.user.id);
    const hasDotPrefix = message.content.startsWith('.');
    const hasAiCommand = message.content.startsWith('!ai ') || message.content.startsWith('!ask ');

    if (hasDotPrefix || hasAiCommand || isMentioned || isDirectMessage) {
        let query = message.content;

        if (hasDotPrefix) {
            query = query.slice(1).trim();
        } else if (message.content.startsWith('!ai ')) {
            query = query.slice(4).trim();
        } else if (message.content.startsWith('!ask ')) {
            query = query.slice(5).trim();
        } else if (isMentioned) {
            // Xóa mention bot khỏi prompt
            query = query.replace(new RegExp(`<@!?${client.user.id}>`, 'g'), '').trim();
        }

        if (!query) {
            return message.reply('Vui lòng nhập nội dung câu hỏi!');
        }

        try {
            await message.channel.sendTyping();

            const currentDate = new Date();
            const dateInfo = `Thông tin thời gian hiện tại: Hôm nay là ngày ${currentDate.getDate()} tháng ${currentDate.getMonth() + 1} năm ${currentDate.getFullYear()}. Giờ hiện tại là ${currentDate.getHours()}:${currentDate.getMinutes()}.`;
            const enhancedPrompt = `${dateInfo}\n\nCâu hỏi hoặc yêu cầu của người dùng: ${query}`;

            const result = await model.generateContent(enhancedPrompt);
            const responseText = result.response.text();

            if (responseText.length <= 2000) {
                await message.reply(responseText);
            } else {
                for (let i = 0; i < responseText.length; i += 2000) {
                    await message.channel.send(responseText.substring(i, i + 2000));
                }
            }
        } catch (error) {
            console.error('Gemini AI Error:', error);
            message.reply('Xin lỗi, tôi đang gặp vấn đề khi xử lý yêu cầu của bạn bằng Gemini AI.');
        }
    }
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
    // Thêm CORS headers cho API endpoints
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    res.json({
        status: 'online',
        connections: connections.length,
        discord_connected: client.isReady(),
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'production',
        cors_enabled: true
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/chatbox.html');
});

// Endpoint để kiểm tra CORS
app.get('/api/cors-test', (req, res) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.json({
        success: true,
        message: 'CORS is working correctly',
        origin: req.headers.origin || 'Unknown',
        timestamp: new Date().toISOString()
    });
});

// Xử lý lỗi CORS
app.use((err, req, res, next) => {
    if (err.message === 'CORS policy violation') {
        console.error(`CORS Error: ${req.headers.origin} tried to access ${req.path}`);
        res.status(403).json({
            error: 'CORS policy violation',
            message: 'Origin not allowed',
            origin: req.headers.origin || 'Unknown',
            path: req.path
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

// Hàm để đọc dữ liệu từ Google Sheets
async function readFromSheet(range) {
    try {
        const response = await fetch(`/api/sheets/read?range=${encodeURIComponent(range)}`);
        const data = await response.json();
        if (!data.success) {
            throw new Error(data.error);
        }
        return data.data;
    } catch (error) {
        console.error('Error reading from sheet:', error);
        throw error;
    }
}

// Hàm để ghi dữ liệu vào Google Sheets
async function writeToSheet(range, values) {
    try {
        const response = await fetch('/api/sheets/write', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ range, values }),
        });
        const data = await response.json();
        if (!data.success) {
            throw new Error(data.error);
        }
        return data.result;
    } catch (error) {
        console.error('Error writing to sheet:', error);
        throw error;
    }
}

// Hàm để thêm dữ liệu vào Google Sheets
async function appendToSheet(range, values) {
    try {
        const response = await fetch('/api/sheets/append', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ range, values }),
        });
        const data = await response.json();
        if (!data.success) {
            throw new Error(data.error);
        }
        return data.result;
    } catch (error) {
        console.error('Error appending to sheet:', error);
        throw error;
    }
}

// Thay thế bằng export nếu cần
module.exports = {
    readFromSheet,
    writeToSheet,
    appendToSheet
};

// Khởi động server
const PORT = process.env.PORT || 8080;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`WebSocket server is ready`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
}); 