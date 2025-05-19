import React, { useState } from 'react';
import { Upload, FileText, BarChart3, AlertCircle, CheckCircle, TrendingUp, Activity, Wrench } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, ScatterChart, Scatter, PieChart, Pie, Cell } from 'recharts';

const PredictiveMaintenanceApp = () => {
  const [file, setFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [analysisData, setAnalysisData] = useState(null);

  const API_BASE_URL = 'http://localhost:5002';

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
    setUploadStatus('');
    setPredictions([]);
    setAnalysisData(null);
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
        
        // Simulation de données d'analyse basées sur le format réel du dataset
        const mockAnalysisData = {
          deviceCount: data.devices || 100,
          dataPoints: data.rows || 10000,
          failureRate: calculateFailureRate(),
          dateRange: { start: '2015-01-01', end: '2015-12-31' },
          failureDistribution: generateFailureDistribution(),
          deviceHealthStatus: generateDeviceHealthStatus(data.devices || 100),
        };
        
        setAnalysisData(mockAnalysisData);
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
    if (!analysisData) {
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

  // Fonctions pour générer des données d'analyse basées sur le dataset réel
  const calculateFailureRate = () => {
    return (Math.random() * 5 + 2).toFixed(2); // Simule un taux de panne entre 2-7%
  };

  const generateFailureDistribution = () => {
    return [
      { status: 'Sain', count: 85, color: '#10B981' },
      { status: 'En panne', count: 15, color: '#EF4444' }
    ];
  };
  

  const generateDeviceHealthStatus = (deviceCount) => {
    const statuses = ['Excellent', 'Bon', 'Attention', 'Critique'];
    const colors = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444'];
    
    return statuses.map((status, index) => ({
      status,
      count: Math.floor(Math.random() * deviceCount / 4) + 10,
      color: colors[index]
    }));
  };

  
  // Préparer les données pour les graphiques de prédiction
  const chartData = predictions.map(pred => ({
    device: pred.device,
    rul_days: Math.round(pred.predicted_rul_days),
    current_date: pred.current_date,
    failure_date: pred.predicted_failure_date
  }));

  const lineChartData = predictions.map((pred, index) => ({
    device: pred.device,
    rul_days: Math.round(pred.predicted_rul_days),
    index: index + 1
  }));

  const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444'];

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <header className="bg-white shadow-sm rounded-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            Maintenance Prédictive - Analyse des Équipements Industriels
          </h1>
          <p className="text-gray-600 mt-2">
            Analysez vos données d'équipements (device, failure, metric1-9) pour prédire les pannes
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
                  Format: date, device, failure, metric1-metric9
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
                <>
                  <BarChart3 className="mr-2" size={20} />
                  Analyser les données
                </>
              )}
            </button>
          </div>

          {/* Section Résumé */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Résumé de l'analyse</h2>
            
            {analysisData ? (
              <div className="space-y-4">
                <div className="flex items-center text-green-600 mb-4">
                  <CheckCircle size={20} className="mr-2" />
                  <span>Données analysées avec succès</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Équipements</p>
                        <p className="text-2xl font-bold text-blue-600">{analysisData.deviceCount}</p>
                      </div>
                      <Wrench className="text-blue-500" size={24} />
                    </div>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Mesures totales</p>
                        <p className="text-2xl font-bold text-green-600">{analysisData.dataPoints.toLocaleString()}</p>
                      </div>
                      <TrendingUp className="text-green-500" size={24} />
                    </div>
                  </div>
                </div>

                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Taux de panne</p>
                      <p className="text-2xl font-bold text-red-600">{analysisData.failureRate}%</p>
                    </div>
                    <AlertCircle className="text-red-500" size={24} />
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Période d'analyse</p>
                  <p className="font-semibold">{analysisData.dateRange.start} - {analysisData.dateRange.end}</p>
                </div>

                <button
                  onClick={handlePredict}
                  disabled={loading}
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center font-semibold"
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
                <p>Uploadez un fichier pour voir l'analyse</p>
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

        {/* Section Analyse Préliminaire */}
        {analysisData && predictions.length === 0 && (
          <div className="space-y-6">
            {/* Graphique 1: Distribution des États de Santé */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">1. Distribution des États de Santé des Équipements</h2>
              <div className="h-80 flex">
                <div className="w-1/2">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analysisData.deviceHealthStatus}
                        cx="50%"
                        cy="50%"
                        outerRadius={120}
                        dataKey="count"
                        label={({ status, percent }) => `${status}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {analysisData.deviceHealthStatus.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-1/2 pl-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-3">Signification:</h3>
                    <ul className="text-sm space-y-2">
                      <li>• <span className="text-green-600 font-medium">Excellent</span>: Équipements en parfait état</li>
                      <li>• <span className="text-blue-600 font-medium">Bon</span>: Fonctionnement normal</li>
                      <li>• <span className="text-yellow-600 font-medium">Attention</span>: Surveillance recommandée</li>
                      <li>• <span className="text-red-600 font-medium">Critique</span>: Maintenance urgente requise</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

           

          

            {/* Graphique 4: Répartition Panne/Sain */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">4. Répartition Global: Équipements Sains vs En Panne</h2>
              <div className="h-80 flex">
                <div className="w-1/2">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analysisData.failureDistribution}
                        cx="50%"
                        cy="50%"
                        outerRadius={120}
                        dataKey="count"
                        label={({ status, count }) => `${status}: ${count}%`}
                      >
                        {analysisData.failureDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-1/2 pl-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-3">Vue d'ensemble:</h3>
                    <ul className="text-sm space-y-2">
                      <li>• <span className="text-green-600 font-medium">Équipements Sains</span>: Fonctionnement normal</li>
                      <li>• <span className="text-red-600 font-medium">Équipements en Panne</span>: Nécessitent une intervention</li>
                    </ul>
                    <div className="mt-4 p-3 bg-blue-50 rounded">
                      <p className="text-xs text-blue-800">
                        <strong>Objectif:</strong> Prédire quand les équipements sains risquent de tomber en panne 
                        pour planifier la maintenance préventive.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Section Résultats de Prédiction */}
        {predictions.length > 0 && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">
                Durée de vie restante par équipement (jours)
              </h2>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="device" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name) => [value, 'Jours restants']}
                      labelFormatter={(label) => `Équipement: ${label}`}
                    />
                    <Bar dataKey="rul_days" fill="#3B82F6" />
                  </BarChart>
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
                      <th className="px-4 py-3 font-semibold">Équipement</th>
                      <th className="px-4 py-3 font-semibold">Date actuelle</th>
                      <th className="px-4 py-3 font-semibold">Jours restants</th>
                      <th className="px-4 py-3 font-semibold">Date de panne prédite</th>
                      <th className="px-4 py-3 font-semibold">Priorité</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {predictions.map((pred, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium">{pred.device}</td>
                        <td className="px-4 py-3">{pred.current_date}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
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