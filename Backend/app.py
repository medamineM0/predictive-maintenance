from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import io
import os
from scripts.predict import predict_failure_dates, preprocess_new_data
import joblib

app = Flask(__name__)
CORS(app)  # Permet les requêtes cross-origin depuis React

# Charger le modèle
model = joblib.load('./model/random_forest_model.pkl')
scaler = joblib.load('./model/scaler.pkl')
feature_names = joblib.load('./model/feature_names.pkl')

@app.route('/upload-csv', methods=['POST'])
def upload_csv():
    """Endpoint pour recevoir le fichier CSV et le sauvegarder tel quel"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'Aucun fichier trouvé'}), 400

        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'Nom de fichier vide'}), 400

        # Lire le CSV depuis la mémoire
        csv_data = file.read().decode('utf-8')
        df = pd.read_csv(io.StringIO(csv_data))

        # Sauvegarder tel quel sans traitement
        temp_file = 'temp_processed.csv'
        df.to_csv(temp_file, index=False)

        return jsonify({
            'message': 'Fichier reçu et sauvegardé tel quel',
            'rows': len(df),
            'devices': df['device'].nunique() if 'device' in df.columns else 'non spécifié',
            'columns': list(df.columns)
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/predict', methods=['POST'])
def predict():
    try:
        temp_file = 'temp_processed.csv'
        if not os.path.exists(temp_file):
            return jsonify({'error': 'Aucun fichier traité trouvé. Veuillez d\'abord uploader un CSV.'}), 400

        predictions = predict_failure_dates(temp_file)

        result = []
        for _, row in predictions.iterrows():
            result.append({
                'device': row['device'],
                'current_date': row['original_date'].strftime('%Y-%m-%d'),
                'predicted_rul_days': float(row['predicted_RUL_days']),
                'predicted_failure_date': row['predicted_failure_date'].strftime('%Y-%m-%d')
            })

        os.remove(temp_file)
        return jsonify({'predictions': result}), 200

    except Exception as e:
        print(f"Erreur dans /predict: {e}")  # 👈 Affiche l'erreur dans la console
        return jsonify({'error': str(e)}), 500


@app.route('/health', methods=['GET'])
def health():
    """Endpoint pour vérifier l'état du serveur"""
    return jsonify({'status': 'OK'}), 200

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5002)