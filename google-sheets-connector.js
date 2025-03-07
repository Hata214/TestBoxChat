const { google } = require('googleapis');

// Hàm để xác thực với Google Sheets API
async function authorize() {
    const auth = new google.auth.GoogleAuth({
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const client = await auth.getClient();
    return google.sheets({ version: 'v4', auth: client });
}

// Hàm để đọc dữ liệu từ Google Sheets
async function readSheet(range) {
    try {
        const sheets = await authorize();
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: process.env.SPREADSHEET_ID,
            range: range,
        });
        return response.data.values;
    } catch (error) {
        console.error('Error reading from sheet:', error);
        throw error;
    }
}

// Hàm để ghi dữ liệu vào Google Sheets
async function writeToSheet(range, values) {
    try {
        const sheets = await authorize();
        const response = await sheets.spreadsheets.values.update({
            spreadsheetId: process.env.SPREADSHEET_ID,
            range: range,
            valueInputOption: 'USER_ENTERED',
            resource: {
                values: values,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error writing to sheet:', error);
        throw error;
    }
}

// Hàm để thêm dữ liệu vào Google Sheets
async function appendToSheet(range, values) {
    try {
        const sheets = await authorize();
        const response = await sheets.spreadsheets.values.append({
            spreadsheetId: process.env.SPREADSHEET_ID,
            range: range,
            valueInputOption: 'USER_ENTERED',
            resource: {
                values: values,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error appending to sheet:', error);
        throw error;
    }
}

module.exports = {
    readSheet,
    writeToSheet,
    appendToSheet
}; 