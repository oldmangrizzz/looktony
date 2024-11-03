from flask import Flask, send_from_directory
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__, static_folder='dist')

@app.route('/')
def serve():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:path>')
def static_file(path):
    return send_from_directory(app.static_folder, path)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 7860)))