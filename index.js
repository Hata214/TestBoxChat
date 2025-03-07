// Require necessary packages
const { Client, GatewayIntentBits, Partials } = require('discord.js');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const express = require('express');
const { google } = require('googleapis');
const path = require('path');
require('dotenv').config();
const { readSheet, writeToSheet, appendToSheet } = require('./google-sheets-connector');

// Initialize Google AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Initialize Gemini model
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-002" });

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Function to get current date and time in Vietnamese format
function getCurrentDateTime() {
    const now = new Date();
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZone: 'Asia/Ho_Chi_Minh' // Vietnam timezone
    };
    return now.toLocaleDateString('vi-VN', options);
}

// Function to get response from Gemini AI
async function getGeminiResponse(prompt) {
    try {
        // Add current date information to the prompt
        const currentDate = new Date();
        const dateInfo = `Thông tin thời gian hiện tại: Hôm nay là ngày ${currentDate.getDate()} tháng ${currentDate.getMonth() + 1} năm ${currentDate.getFullYear()}. Giờ hiện tại là ${currentDate.getHours()}:${currentDate.getMinutes()}.`;

        const enhancedPrompt = `${dateInfo}\n\nCâu hỏi hoặc yêu cầu: ${prompt}`;

        const result = await model.generateContent(enhancedPrompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Error with Gemini AI:", error);
        return "Xin lỗi, tôi đang gặp vấn đề khi xử lý yêu cầu của bạn.";
    }
}

// Create a new client instance
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
    ],
    partials: [Partials.Channel]
});

// When the client is ready, run this code (only once)
client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

// Listen for messages
client.on('messageCreate', async message => {
    // Ignore messages from bots
    if (message.author.bot) return;

    // Simple command handling
    if (message.content.startsWith('!hello')) {
        message.reply('Xin chào! Tôi là bot chat AI sử dụng Gemini.');
    }

    if (message.content.startsWith('!help')) {
        message.reply('Các lệnh có sẵn:\n!hello - Chào hỏi\n!help - Hiển thị trợ giúp\n!date - Hiển thị ngày giờ hiện tại\n. [câu hỏi] - Đặt câu hỏi cho AI');
    }

    // Date and time command
    if (message.content.startsWith('!date') || message.content.startsWith('!time')) {
        const currentDateTime = getCurrentDateTime();
        message.reply(`Thời gian hiện tại: ${currentDateTime}`);
    }

    // AI chat command with "." prefix
    if (message.content.startsWith('.')) {
        const prompt = message.content.slice(1).trim(); // Remove the "." prefix

        if (!prompt) {
            message.reply('Vui lòng nhập nội dung sau dấu "."');
            return;
        }

        // Show typing indicator
        message.channel.sendTyping();

        try {
            // Get response from Gemini
            const response = await getGeminiResponse(prompt);

            // Discord has a 2000 character limit for messages
            if (response.length <= 2000) {
                message.reply(response);
            } else {
                // Split long responses into chunks
                const chunks = [];
                for (let i = 0; i < response.length; i += 2000) {
                    chunks.push(response.substring(i, i + 2000));
                }

                // Send each chunk as a separate message
                for (const chunk of chunks) {
                    await message.channel.send(chunk);
                }
            }
        } catch (error) {
            console.error('Error:', error);
            message.reply('Xin lỗi, đã xảy ra lỗi khi xử lý yêu cầu của bạn.');
        }
    }
});

// API endpoint để đọc dữ liệu từ Google Sheets
app.get('/api/sheets/read', async (req, res) => {
    try {
        const range = req.query.range || 'Sheet1!A1:Z100';
        const data = await readSheet(range);
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// API endpoint để ghi dữ liệu vào Google Sheets
app.post('/api/sheets/write', async (req, res) => {
    try {
        const { range, values } = req.body;
        if (!range || !values) {
            return res.status(400).json({ success: false, error: 'Range and values are required' });
        }
        const result = await writeToSheet(range, values);
        res.json({ success: true, result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// API endpoint để thêm dữ liệu vào Google Sheets
app.post('/api/sheets/append', async (req, res) => {
    try {
        const { range, values } = req.body;
        if (!range || !values) {
            return res.status(400).json({ success: false, error: 'Range and values are required' });
        }
        const result = await appendToSheet(range, values);
        res.json({ success: true, result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Login to Discord with your client's token
client.login(process.env.DISCORD_TOKEN); 