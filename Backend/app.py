from flask import Flask, request, jsonify
import pandas as pd
from scripts.predict import predict_failure_dates_df

app = Flask(__name__)

@app.route('/predict_csv', methods=['POST'])
def predict_csv():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    df = pd.read_csv(file)
    result = predict_failure_dates_df(df)
    return result.to_json(orient='records')

if __name__ == '__main__':
    app.run(debug=True)