from flask import Flask, request, jsonify, render_template
import numpy as np
import tensorflow as tf
import cv2
import os
from werkzeug.utils import secure_filename

app = Flask(__name__)

app.config['MODEL_PATH'] = "static/model.keras"
app.config['UPLOAD_FOLDER'] = "static/uploads"
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

model = tf.keras.models.load_model(app.config['MODEL_PATH'])

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def run_neural_network(filename):
    img = cv2.imread(filename)
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    img = cv2.resize(img, (256, 256))

    x_test = np.array([img])
    x_test = x_test.astype('float32')
    x_test = x_test / 255.0

    pred = model.predict(x_test)[0][0]
    print(pred)
    if pred >= 0.5:
        return "Melanoma likely", pred
    else:
        return "Melanoma unlikely", pred

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/contact')
def contact():
    return render_template('contact.html')

@app.route('/analyze')
def analyze():
    return render_template('analyze.html')

@app.route('/upload', methods=['POST'])
def classify_image():
    if 'image' not in request.files:
        return jsonify({'error': "No image uploaded"}), 400

    file = request.files['image']
    
    if file.filename == '':
        return jsonify({'error': "No image selected"}), 400

    if file and allowed_file(file.filename):
        filename = os.path.join(app.config['UPLOAD_FOLDER'], secure_filename(file.filename))
        file.save(filename)
        result, probability = run_neural_network(filename)
        return jsonify({
            'result': result,
            'probability': float(probability),
            'image_url': f"/static/uploads/{os.path.basename(filename)}"
        })
    
    return jsonify({'error': "Invalid file type"}), 400

if __name__ == "__main__":
    app.run(port=5000, debug=True)

