# scripts/train_model.py
import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestRegressor

def preprocess(data):
    data['date'] = pd.to_datetime(data['date'], errors='coerce')
    data = data.sort_values(by=['device', 'date'])
    data['RUL'] = data.groupby('device')['date'].transform(lambda x: (x.max() - x).dt.days)
    data.dropna(inplace=True)
    data['day_of_week'] = data['date'].dt.dayofweek
    data['month'] = data['date'].dt.month
    for m in [f'metric{i}' for i in range(1, 10)]:
        data[f'{m}_rolling_mean'] = data.groupby('device')[m].transform(lambda x: x.rolling(5, min_periods=1).mean())
    data['original_date'] = data['date']
    data.drop(columns=['date'], inplace=True)
    return data

def train(csv_path):
    data = pd.read_csv(csv_path)
    data = preprocess(data)

    features = data.columns.difference(['RUL', 'device', 'original_date'])
    X = data[features]
    y = data['RUL']

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X_scaled, y)

    # Save everything
    joblib.dump(model, '../model/random_forest_model.pkl')
    joblib.dump(scaler, '../model/scaler.pkl')
    joblib.dump(features.tolist(), '../model/feature_names.pkl')

    print("Model, scaler, and features saved.")

if __name__ == "__main__":
    train("../dataset/predictive_maintenance_dataset.csv")
