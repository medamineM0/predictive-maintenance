import pandas as pd
import joblib
import os

# Calculer le chemin absolu du dossier `model`
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_DIR = os.path.join(BASE_DIR, 'model')

model = joblib.load(os.path.join(MODEL_DIR, 'random_forest_model.pkl'))
scaler = joblib.load(os.path.join(MODEL_DIR, 'scaler.pkl'))
feature_names = joblib.load(os.path.join(MODEL_DIR, 'feature_names.pkl'))

def preprocess_new_data(df):
    df['date'] = pd.to_datetime(df['date'], errors='coerce')
    df = df.sort_values(by=['device', 'date'])
    df['day_of_week'] = df['date'].dt.dayofweek
    df['month'] = df['date'].dt.month
    for m in [f'metric{i}' for i in range(1, 10)]:
        df[f'{m}_rolling_mean'] = df.groupby('device')[m].transform(lambda x: x.rolling(5, min_periods=1).mean())
    df['original_date'] = df['date']
    df.drop(columns=['date'], inplace=True)
    return df

def predict_failure_dates_df(df):
    df = preprocess_new_data(df)

    latest = df.sort_values('original_date').groupby('device').tail(1)
    X_latest = latest[feature_names]
    X_scaled = scaler.transform(X_latest)
    
    latest['predicted_RUL_days'] = model.predict(X_scaled)
    latest['predicted_failure_date'] = latest['original_date'] + pd.to_timedelta(latest['predicted_RUL_days'].round().astype(int), unit='D')
    
    result = latest[['device', 'original_date', 'predicted_RUL_days', 'predicted_failure_date']]
    return result

# if __name__ == "__main__":
#     # Exemple d'utilisation
#     predictions = predict_failure_dates('../dataset/predictive_maintenance_dataset.csv')
#     print(predictions)
