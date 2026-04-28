const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
app.use(express.json());

// Phục vụ file tĩnh từ thư mục static
app.use(express.static(path.join(__dirname, 'static')));

// 1. Kết nối MongoDB Local
const uri = "mongodb://localhost:27017/translatorDB";
mongoose.connect(uri)
    .then(() => console.log("✅ MongoDB đã sẵn sàng!"))
    .catch(err => console.error("❌ Lỗi kết nối DB:", err));

// 2. Schema & Model
const translationSchema = new mongoose.Schema({
    sourceText: String,
    translatedText: String,
    createdAt: { type: Date, default: Date.now }
});
const Translation = mongoose.model('Translation', translationSchema);

// 3. API lưu lịch sử
app.post('/api/translate/history', async (req, res) => {
    try {
        const { sourceText, translatedText } = req.body;
        const newDoc = new Translation({ sourceText, translatedText });
        await newDoc.save();
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 4. API lấy lịch sử (Hiện 10 câu mới nhất)
app.get('/api/translate/history', async (req, res) => {
    try {
        const history = await Translation.find().sort({ createdAt: -1 }).limit(10);
        res.json(history);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 5. Trả về file giao diện
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'templates', 'index.html'));
});

const PORT = 3000;
app.listen(PORT, () => console.log(`🚀 Web chạy tại: http://localhost:${PORT}`));