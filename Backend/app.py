from flask import Flask, request, jsonify
import pickle

app = Flask(__name__)

# Load the machine learning model
with open('model/model.pkl', 'rb') as model_file:
    model = pickle.load(model_file)

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    features = data['features']
    
    # Make prediction
    prediction = model.predict([features])
    
    return jsonify({'prediction': prediction[0]})

if __name__ == '__main__':
    app.run(debug=True)