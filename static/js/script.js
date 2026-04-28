async function handleTranslate() {
    const sourceText = document.getElementById('inputText').value;
    const outputTextArea = document.getElementById('outputText');
    let sLang = document.getElementById('sourceLang').value;
    const tLang = document.getElementById('targetLang').value;

    if (!sourceText.trim()) return;
    outputTextArea.value = "Đang dịch...";

    // CẤU HÌNH QUAN TRỌNG: 
    // Nếu sLang là "auto" hoặc rỗng, ta phải gửi tham số là "autodetect" 
    // hoặc chỉ gửi đích đến kèm dấu gạch đứng để MyMemory hiểu.
    const finalSourceLang = (sLang === "auto" || sLang === "") ? "autodetect" : sLang;
    const langPair = `${finalSourceLang}|${tLang}`;

    try {
        const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(sourceText)}&langpair=${langPair}`;
        const res = await fetch(url);
        const data = await res.json();
        
        if (data.responseData && data.responseStatus === 200) {
            const translated = data.responseData.translatedText;
            outputTextArea.value = translated;

            // Lưu vào DB
            await fetch('/api/translate/history', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sourceText, translatedText: translated })
            });
            loadHistory();
        } else {
            // Nếu API báo lỗi, hiển thị thông báo dễ hiểu hơn
            outputTextArea.value = "API không hỗ trợ cặp ngôn ngữ này Quyên ơi!";
            console.error("Lỗi API:", data.responseDetails);
        }
    } catch (e) {
        outputTextArea.value = "Lỗi kết nối rồi!";
        console.error(e);
    }
}

function handleSpeak() {
    const text = document.getElementById('outputText').value;
    const tLang = document.getElementById('targetLang').value;
    
    if (!text || text === "Đang dịch...") return;

    // Giải quyết vấn đề im ru: Hủy lệnh cũ, đánh thức hệ thống
    window.speechSynthesis.cancel();
    
    const speech = new SpeechSynthesisUtterance(text);
    
    // Bản đồ ngôn ngữ chuẩn
    const langMap = {
        'vi': 'vi-VN', 'en': 'en-US', 'id': 'id-ID', 'ja': 'ja-JP',
        'ko': 'ko-KR', 'zh': 'zh-CN', 'fr': 'fr-FR', 'th': 'th-TH'
    };
    speech.lang = langMap[tLang] || tLang;

    // Tìm giọng đọc chuẩn nhất có trong máy
    let voices = window.speechSynthesis.getVoices();
    let voice = voices.find(v => v.lang.includes(tLang)) || voices[0];
    if (voice) speech.voice = voice;

    speech.rate = 0.9; // Đọc hơi chậm lại xíu cho hay
    
    // Đánh thức trình duyệt trước khi nói
    window.speechSynthesis.resume();
    window.speechSynthesis.speak(speech);
}

async function loadHistory() {
    try {
        const res = await fetch('/api/translate/history');
        const data = await res.json();
        const list = document.getElementById('history-list');
        list.innerHTML = data.map(item => `
            <div class="history-item">
                <p style="color: #ffd1dc; margin: 0; font-size: 0.9rem;"><b>Gốc:</b> ${item.sourceText}</p>
                <p style="color: white; margin: 5px 0 0 0;"><b>Dịch:</b> ${item.translatedText}</p>
            </div>
        `).join('');
    } catch (e) { console.log("Chưa có lịch sử"); }
}

// Cần thiết để Chrome nạp giọng đọc ngay khi mở trang
window.speechSynthesis.onvoiceschanged = () => { window.speechSynthesis.getVoices(); };
window.onload = loadHistory;