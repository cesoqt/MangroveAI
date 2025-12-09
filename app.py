from flask import Flask, render_template, request, jsonify, url_for
from werkzeug.utils import secure_filename
import os
import numpy as np
from tensorflow.keras.preprocessing import image
from tensorflow.keras.models import load_model
from tensorflow.keras.applications.efficientnet import preprocess_input
import json

app = Flask(__name__)

# --- KONFIGURASI ---
UPLOAD_FOLDER = 'static/uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# --- LOAD MODEL & LABEL ---
# Pastikan file model dan json ada di folder yang sama
try:
    model = load_model('model_klasifikasi_pro.h5')
    with open('labels.json') as f:
        class_names = json.load(f)
except Exception as e:
    print(f"Error loading model/labels: {e}")

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def predict_label(img_path):
    img = image.load_img(img_path, target_size=(260, 260))
    img_array = image.img_to_array(img)
    img_array = preprocess_input(img_array)
    img_array = np.expand_dims(img_array, axis=0)
    
    prediction = model.predict(img_array)
    idx = np.argmax(prediction)
    confidence = prediction[0][idx] * 100
    label = class_names[str(idx)]
    
    return label, f"{confidence:.2f}%"

# --- ROUTE UTAMA (Halaman Web) ---
@app.route('/')
def index():
    return render_template('index.html')

# --- ROUTE API (Untuk AJAX - Tanpa Reload) ---
@app.route('/predict', methods=['POST'])
def predict_api():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)

        predicted_class, confidence = predict_label(filepath)

        # Kembalikan JSON (Data mentah), bukan HTML
        return jsonify({
            'status': 'success',
            'prediction': predicted_class,
            'confidence': confidence,
            'image_url': filepath
        })
    
    return jsonify({'error': 'Invalid file type'}), 400

if __name__ == '__main__':
    # Hapus ssl_context jika tes di localhost/HTTP biasa
    app.run(host='0.0.0.0', port=5000, debug=True)
