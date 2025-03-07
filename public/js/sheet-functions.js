// Các hàm để gọi API từ client
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

// Tương tự cho các hàm khác...

// Gán vào window nếu đang chạy trong trình duyệt
window.sheetFunctions = {
    readFromSheet,
    writeToSheet,
    appendToSheet
}; 