from flask import Flask, render_template, request, jsonify
import json

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/translate', methods=['POST'])
def translate():
    data = request.json
    word = data.get('word', '').lower()
    with open('vocab.json', 'r', encoding='utf-8') as f:
        vocab = json.load(f)
    translation = vocab.get(word, 'Không tìm thấy từ')
    return jsonify({'translation': translation})

if __name__ == '__main__':
    app.run(debug=True)
