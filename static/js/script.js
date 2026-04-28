let vocab = {};

fetch('/static/vocab.json?' + new Date().getTime())
  .then(response => response.json())
  .then(data => {
    vocab = data;
    console.log("Vocab loaded:", vocab);  // 👈 In ra từ điển
  })
  .catch(error => {
    console.error('Lỗi tải từ điển:', error);
  });

function handleTranslate() {
  const input = document.getElementById('inputText').value.trim();
  const output = document.getElementById('outputText');

  if (!input) {
    output.value = "Vui lòng nhập văn bản.";
    return;
  }

  const words = input.split(/\s+/);
  const translatedWords = words.map(word => {
    const t = vocab[word.toLowerCase()] || word;
    console.log(`Dịch '${word}' ➡️ '${t}'`);  // 👈 In từng từ
    return t;
  });

  output.value = translatedWords.join(' ');
}

function handleSpeak() {
  const output = document.getElementById('outputText').value;
  if (!output.trim()) {
    alert("Không có gì để đọc cả!");
    return;
  }

  const utterance = new SpeechSynthesisUtterance(output);
  utterance.lang = 'vi-VN'; // hoặc 'en-US' nếu là tiếng Việt
  speechSynthesis.speak(utterance);
}

// Kiểm tra hỗ trợ SpeechSynthesis
if ('speechSynthesis' in window) {
  console.log('SpeechSynthesis is supported!');
} else {
  console.log('SpeechSynthesis is not supported!');
}
