import React, { useState } from 'react';
import { Upload, FileText, BarChart3, AlertCircle, CheckCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const PredictiveMaintenanceApp = () => {
  const [file, setFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadInfo, setUploadInfo] = useState(null);

  const API_BASE_URL = 'http://localhost:5002';

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
    setUploadStatus('');
    setPredictions([]);
    setUploadInfo(null);
  };

  const handleUpload = async () => {
    if (!file) {
      setUploadStatus('Veuillez sélectionner un fichier CSV');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_BASE_URL}/upload-csv`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setUploadStatus('Fichier uploadé et traité avec succès!');
        setUploadInfo(data);
      } else {
        setUploadStatus(`Erreur: ${data.error}`);
      }
    } catch (error) {
      setUploadStatus(`Erreur de connexion: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePredict = async () => {
    if (!uploadInfo) {
      setUploadStatus('Veuillez d\'abord uploader un fichier CSV');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        setPredictions(data.predictions);
        setUploadStatus('Prédictions générées avec succès!');
      } else {
        setUploadStatus(`Erreur lors de la prédiction: ${data.error}`);
      }
    } catch (error) {
      setUploadStatus(`Erreur de connexion: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Préparer les données pour le graphique
  const chartData = predictions.map(pred => ({
    device: pred.device,
    rul_days: Math.round(pred.predicted_rul_days),
    current_date: pred.current_date,
    failure_date: pred.predicted_failure_date
  }));

  // Préparer les données pour le graphique linéaire (RUL par appareil)
  const lineChartData = predictions.map((pred, index) => ({
    device: pred.device,
    rul_days: Math.round(pred.predicted_rul_days),
    index: index + 1
  }));

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <header className="bg-white shadow-sm rounded-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            Maintenance Prédictive - Prédiction de Pannes
          </h1>
          <p className="text-gray-600 mt-2">
            Uploadez vos données CSV pour prédire les dates de panne des équipements
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Section Upload */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Upload className="mr-2" size={24} />
              Upload de fichier CSV
            </h2>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
                id="csvUpload"
              />
              <label
                htmlFor="csvUpload"
                className="cursor-pointer flex flex-col items-center"
              >
                <FileText size={48} className="text-gray-400 mb-4" />
                <span className="text-lg font-medium text-gray-700">
                  {file ? file.name : 'Cliquez pour sélectionner un fichier CSV'}
                </span>
                <span className="text-sm text-gray-500 mt-2">
                  Format requis: device, date, metric1-metric9
                </span>
              </label>
            </div>

            <button
              onClick={handleUpload}
              disabled={!file || loading}
              className="w-full mt-4 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                'Uploader et traiter'
              )}
            </button>
          </div>

          {/* Section Informations */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Informations du fichier</h2>
            
            {uploadInfo ? (
              <div className="space-y-3">
                <div className="flex items-center text-green-600">
                  <CheckCircle size={20} className="mr-2" />
                  <span>Fichier traité avec succès</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-gray-50 p-3 rounded">
                    <div className="font-semibold">Nombre de lignes</div>
                    <div className="text-lg">{uploadInfo.rows}</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <div className="font-semibold">Nombre d'appareils</div>
                    <div className="text-lg">{uploadInfo.devices}</div>
                  </div>
                </div>

                <button
                  onClick={handlePredict}
                  disabled={loading}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <BarChart3 className="mr-2" size={20} />
                      Générer les prédictions
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="text-gray-500 text-center py-8">
                <FileText size={48} className="mx-auto mb-4 text-gray-300" />
                <p>Aucun fichier traité</p>
              </div>
            )}
          </div>
        </div>

        {/* Section Status */}
        {uploadStatus && (
          <div className={`mb-6 p-4 rounded-lg ${
            uploadStatus.includes('Erreur') 
              ? 'bg-red-100 text-red-700 border border-red-200' 
              : 'bg-green-100 text-green-700 border border-green-200'
          }`}>
            <div className="flex items-center">
              {uploadStatus.includes('Erreur') ? (
                <AlertCircle size={20} className="mr-2" />
              ) : (
                <CheckCircle size={20} className="mr-2" />
              )}
              {uploadStatus}
            </div>
          </div>
        )}

        {/* Section Graphiques */}
        {predictions.length > 0 && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">
                Durée de vie restante par appareil (jours)
              </h2>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="device" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name) => [value, 'Jours restants']}
                      labelFormatter={(label) => `Appareil: ${label}`}
                    />
                    <Bar dataKey="rul_days" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">
                Tendance de la durée de vie restante
              </h2>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={lineChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="device" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name) => [value, 'Jours restants']}
                      labelFormatter={(label) => `Appareil: ${label}`}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="rul_days" 
                      stroke="#10B981" 
                      strokeWidth={3}
                      dot={{ fill: '#10B981', strokeWidth: 2, r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Tableau des résultats */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Détails des prédictions</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Appareil</th>
                      <th className="px-4 py-3 font-semibold">Date actuelle</th>
                      <th className="px-4 py-3 font-semibold">Jours restants</th>
                      <th className="px-4 py-3 font-semibold">Date de panne prédite</th>
                      <th className="px-4 py-3 font-semibold">Statut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {predictions.map((pred, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium">{pred.device}</td>
                        <td className="px-4 py-3">{pred.current_date}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            pred.predicted_rul_days < 30 
                              ? 'bg-red-100 text-red-800' 
                              : pred.predicted_rul_days < 90
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {Math.round(pred.predicted_rul_days)}
                          </span>
                        </td>
                        <td className="px-4 py-3">{pred.predicted_failure_date}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            pred.predicted_rul_days < 30 
                              ? 'bg-red-100 text-red-800' 
                              : pred.predicted_rul_days < 90
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {pred.predicted_rul_days < 30 ? 'Critique' : 
                             pred.predicted_rul_days < 90 ? 'Attention' : 'Normal'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PredictiveMaintenanceApp;