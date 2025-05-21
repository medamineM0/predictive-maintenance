"use client"
import { useState, useEffect } from "react"
import {
  Upload,
  FileText,
  BarChart3,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Wrench,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"

function PredictiveMaintenanceApp() {
  const [file, setFile] = useState(null)
  const [uploadStatus, setUploadStatus] = useState("")
  const [predictions, setPredictions] = useState([])
  const [loading, setLoading] = useState(false)
  const [analysisData, setAnalysisData] = useState(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [itemsPerPage] = useState(50)
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "ascending" })
  const [sortedData, setSortedData] = useState([])
  const [paginatedData, setPaginatedData] = useState([])
  const [riskDistribution, setRiskDistribution] = useState([])
  const [deviceHealthStatus, setDeviceHealthStatus] = useState([])
  const [failureDistribution, setFailureDistribution] = useState([])
  const [selectedDevice, setSelectedDevice] = useState(null)
  const [timeSeriesData, setTimeSeriesData] = useState([])
  const [metricsCorrelation, setMetricsCorrelation] = useState([])

  const API_BASE_URL = "http://localhost:5002"

  const handleFileChange = (event) => {
    setFile(event.target.files[0])
    setUploadStatus("")
    setPredictions([])
    setAnalysisData(null)
    setDeviceHealthStatus([])
    setFailureDistribution([])
  }

  const handleUpload = async () => {
    if (!file) {
      setUploadStatus("Veuillez sélectionner un fichier CSV")
      return
    }

    setLoading(true)
    const formData = new FormData()
    formData.append("file", file)

    try {
      const response = await fetch(`${API_BASE_URL}/upload-csv`, {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        setUploadStatus("Fichier uploadé et traité avec succès!")

        // Simulation de données d'analyse basées sur le format réel du dataset
        const mockAnalysisData = {
          deviceCount: data.devices || 100,
          dataPoints: data.rows || 10000,
          failureRate: calculateFailureRate(),
          dateRange: { start: "2015-01-01", end: "2015-12-31" },
        }

        // Générer les données pour les graphiques circulaires
        const healthStatus = generateDeviceHealthStatus(mockAnalysisData.deviceCount)
        const failureDist = generateFailureDistribution()

        // setDeviceHealthStatus(healthStatus)
        // setFailureDistribution(failureDist)
        setAnalysisData(mockAnalysisData)
      } else {
        setUploadStatus(`Erreur: ${data.error}`)
      }
    } catch (error) {
      setUploadStatus(`Erreur de connexion: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handlePredict = async () => {
    if (!analysisData) {
      setUploadStatus("Veuillez d'abord uploader un fichier CSV")
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (response.ok) {
        setPredictions(data.predictions)
        setUploadStatus("Prédictions générées avec succès!")

        // Générer des données simulées pour les graphiques supplémentaires
        generateAdditionalChartData(data.predictions)

        // Mettre à jour les graphiques circulaires avec des données basées sur les prédictions
        updateCircularCharts(data.predictions)
      } else {
        setUploadStatus(`Erreur lors de la prédiction: ${data.error}`)
      }
    } catch (error) {
      setUploadStatus(`Erreur de connexion: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  // Fonctions pour générer des données d'analyse basées sur le dataset réel
  const calculateFailureRate = () => {
    return (Math.random() * 5 + 2).toFixed(2) // Simule un taux de panne entre 2-7%
  }

  const generateFailureDistribution = () => {
    return [
      { status: "Sain", count: 85, color: "#10B981" },
      { status: "En panne", count: 15, color: "#EF4444" },
    ]
  }

  const generateDeviceHealthStatus = (deviceCount) => {
    const statuses = ["Excellent", "Bon", "Attention", "Critique"]
    const colors = ["#10B981", "#3B82F6", "#F59E0B", "#EF4444"]

    return statuses.map((status, index) => ({
      status,
      count: Math.floor((Math.random() * deviceCount) / 4) + 10,
      color: colors[index],
    }))
  }

  // Mettre à jour les graphiques circulaires avec des données basées sur les prédictions
  const updateCircularCharts = (predictions) => {
    if (predictions.length === 0) return

    // Mettre à jour la distribution des états de santé
    const healthCounts = {
      Excellent: 0,
      Bon: 0,
      Attention: 0,
      Critique: 0,
    }

    predictions.forEach((pred) => {
      const days = pred.predicted_rul_days
      if (days > 180) healthCounts.Excellent++
      else if (days > 90) healthCounts.Bon++
      else if (days > 30) healthCounts.Attention++
      else healthCounts.Critique++
    })

    const updatedHealthStatus = [
      { status: "Excellent", count: healthCounts.Excellent, color: "#10B981" },
      { status: "Bon", count: healthCounts.Bon, color: "#3B82F6" },
      { status: "Attention", count: healthCounts.Attention, color: "#F59E0B" },
      { status: "Critique", count: healthCounts.Critique, color: "#EF4444" },
    ]

    // Mettre à jour la répartition panne/sain
    const criticalCount = healthCounts.Critique
    const healthyCount = predictions.length - criticalCount
    const criticalPercentage = Math.round((criticalCount / predictions.length) * 100)
    const healthyPercentage = 100 - criticalPercentage

    const updatedFailureDistribution = [
      { status: "Sain", count: healthyPercentage, color: "#10B981" },
      { status: "À risque", count: criticalPercentage, color: "#EF4444" },
    ]

    setDeviceHealthStatus(updatedHealthStatus)
    setFailureDistribution(updatedFailureDistribution)
  }

  const generateAdditionalChartData = (predictions) => {
    // Générer des données de séries temporelles pour un équipement
    if (predictions.length > 0) {
      const firstDevice = predictions[0].device
      setSelectedDevice(firstDevice)

      // Simuler des données de métriques sur 30 jours
      const timeData = Array.from({ length: 30 }, (_, i) => {
        const date = new Date()
        date.setDate(date.getDate() - (30 - i))
        return {
          date: date.toISOString().split("T")[0],
          metric1: Math.random() * 100 + 50,
          metric2: Math.random() * 80 + 40,
          metric3: Math.random() * 60 + 30,
          threshold: 85,
        }
      })
      setTimeSeriesData(timeData)

      // Générer des données de corrélation entre métriques
      const correlationData = []
      for (let i = 0; i < 50; i++) {
        const metric1 = Math.random() * 100
        const metric2 = Math.random() * 100
        const isFailure = Math.random() > 0.7
        correlationData.push({
          metric1,
          metric2,
          status: isFailure ? "Panne" : "Normal",
          size: isFailure ? 100 : 60,
        })
      }
      setMetricsCorrelation(correlationData)

      // Générer la distribution des risques
      const riskData = [
        { range: "0-30 jours", count: 0, color: "#EF4444" },
        { range: "31-90 jours", count: 0, color: "#F59E0B" },
        { range: "91-180 jours", count: 0, color: "#3B82F6" },
        { range: "> 180 jours", count: 0, color: "#10B981" },
      ]

      predictions.forEach((pred) => {
        const days = pred.predicted_rul_days
        if (days <= 30) riskData[0].count++
        else if (days <= 90) riskData[1].count++
        else if (days <= 180) riskData[2].count++
        else riskData[3].count++
      })

      setRiskDistribution(riskData)
    }
  }

  // Préparer les données pour les graphiques de prédiction
  const chartData = predictions.map((pred) => ({
    device: pred.device,
    rul_days: Math.round(pred.predicted_rul_days),
    current_date: pred.current_date,
    failure_date: pred.predicted_failure_date,
  }))

  // Sort data when predictions or sortConfig changes
  useEffect(() => {
    const sortableItems = [...predictions]
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        // Handle different data types
        if (sortConfig.key === "predicted_rul_days") {
          if (a[sortConfig.key] < b[sortConfig.key]) {
            return sortConfig.direction === "ascending" ? -1 : 1
          }
          if (a[sortConfig.key] > b[sortConfig.key]) {
            return sortConfig.direction === "ascending" ? 1 : -1
          }
          return 0
        } else if (sortConfig.key === "priority") {
          // Sort by the actual days remaining for priority
          if (a.predicted_rul_days < b.predicted_rul_days) {
            return sortConfig.direction === "ascending" ? -1 : 1
          }
          if (a.predicted_rul_days > b.predicted_rul_days) {
            return sortConfig.direction === "ascending" ? 1 : -1
          }
          return 0
        } else {
          // String comparison for other fields
          if (a[sortConfig.key] < b[sortConfig.key]) {
            return sortConfig.direction === "ascending" ? -1 : 1
          }
          if (a[sortConfig.key] > b[sortConfig.key]) {
            return sortConfig.direction === "ascending" ? 1 : -1
          }
          return 0
        }
      })
    }
    setSortedData(sortableItems)
    // Reset to first page when sort changes
    setCurrentPage(0)
  }, [predictions, sortConfig])

  // Update paginated data when page or sorted data changes
  useEffect(() => {
    const start = currentPage * itemsPerPage
    const end = start + itemsPerPage
    setPaginatedData(sortedData.slice(start, end))
  }, [currentPage, sortedData, itemsPerPage])

  // Add this new useEffect to scroll to the beginning of the table when page changes
  useEffect(() => {
    const tableElement = document.getElementById("predictions-table")
    if (tableElement) {
      tableElement.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
    }
  }, [currentPage])

  const handleSort = (key) => {
    let direction = "ascending"
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending"
    }
    setSortConfig({ key, direction })
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <header className="bg-white shadow-sm rounded-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-blue-950">
            Maintenance Prédictive - Analyse des Équipements Industriels
          </h1>
          <p className="text-gray-700 mt-2">
            Analysez vos données d'équipements (device, failure, metric1-9) pour prédire les pannes.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Section Upload */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center text-blue-950">
              <Upload className="mr-2" size={24} />
              Upload du fichier CSV
            </h2>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input type="file" accept=".csv" onChange={handleFileChange} className="hidden" id="csvUpload" />
              <label htmlFor="csvUpload" className="cursor-pointer flex flex-col items-center">
                <FileText size={48} className="text-gray-400 mb-4" />
                <span className="text-lg font-medium text-gray-800">
                  {file ? file.name : "Cliquez pour sélectionner un fichier CSV"}
                </span>
                <span className="text-sm text-gray-500 mt-2">Format : date, device, failure, metric1-metric9</span>
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
            <h2 className="text-xl font-semibold mb-4 text-blue-950">Résumé de l'analyse</h2>

            {analysisData ? (
              <div className="space-y-4">
                <div className="flex items-center text-green-700 mb-4">
                  <CheckCircle size={20} className="mr-2" />
                  <span>Données analysées avec succès</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Équipements</p>
                        <p className="text-2xl font-bold text-blue-700">{analysisData.deviceCount}</p>
                      </div>
                      <Wrench className="text-blue-500" size={24} />
                    </div>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Mesures totales</p>
                        <p className="text-2xl font-bold text-green-700">{analysisData.dataPoints.toLocaleString()}</p>
                      </div>
                      <TrendingUp className="text-green-500" size={24} />
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Période d'analyse</p>
                  <p className="font-semibold text-slate-800">
                    {analysisData.dateRange.start} - {analysisData.dateRange.end}
                  </p>
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
                <p>Importez un fichier pour voir l'analyse</p>
              </div>
            )}
          </div>
        </div>

        {/* Section Status */}
        {uploadStatus && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              uploadStatus.includes("Erreur")
                ? "bg-red-100 text-red-700 border border-red-200"
                : "bg-green-100 text-green-700 border border-green-200"
            }`}
          >
            <div className="flex items-center">
              {uploadStatus.includes("Erreur") ? (
                <AlertCircle size={20} className="mr-2" />
              ) : (
                <CheckCircle size={20} className="mr-2" />
              )}
              {uploadStatus}
            </div>
          </div>
        )}

        {/* Graphiques circulaires - Toujours affichés si analysisData existe */}
        {analysisData && deviceHealthStatus.length > 0 && failureDistribution.length > 0 && (
          <div className="space-y-6">
            {/* Graphique 1: Distribution des États de Santé */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4 text-blue-950">
                1. Distribution des états de santé des équipements
              </h2>
              <div className="h-80 flex">
                <div className="w-1/2">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={deviceHealthStatus}
                        cx="50%"
                        cy="50%"
                        outerRadius={120}
                        dataKey="count"
                        label={({ status, percent }) => {
                          if (!percent) return null // Éviter les NaN
                          return `${status}: ${(percent * 100).toFixed(0)}%`
                        }}
                      >
                        {deviceHealthStatus.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [value, "Équipements"]} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-1/2 pl-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-3 text-blue-950">Signification :</h3>
                    <ul className="text-sm space-y-2">
                      <li>
                        • <span className="text-green-700 font-medium">Excellent</span>
                        <span className="text-neutral-700"> : Équipements en parfait état &gt;180 jours)</span>{" "}
                      </li>
                      <li>
                        • <span className="text-blue-700 font-medium">Bon</span>
                        <span className="text-neutral-700"> : Fonctionnement normal (91-180 jours)</span>
                      </li>
                      <li>
                        • <span className="text-yellow-700 font-medium">Attention</span>
                        <span className="text-neutral-700"> : Surveillance recommandée (31-90 jours)</span>{" "}
                      </li>
                      <li>
                        • <span className="text-red-700 font-medium">Critique</span>
                        <span className="text-neutral-700"> : Maintenance urgente requise (0-30 jours)</span>{" "}
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Graphique 2: Répartition Panne/Sain */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4 text-blue-950">
                2. Répartition globale : équipements sains vs à risque
              </h2>
              <div className="h-80 flex">
                <div className="w-1/2">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={failureDistribution}
                        cx="50%"
                        cy="50%"
                        outerRadius={120}
                        dataKey="count"
                        label={({ status, count }) => `${status}: ${count}%`}
                      >
                        {failureDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value}%`, "Pourcentage"]} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-1/2 pl-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-3 text-blue-950">Vue d'ensemble :</h3>
                    <ul className="text-sm space-y-2">
                      <li>
                        • <span className="text-green-700 font-medium">Équipements sains</span>
                        <span className="text-neutral-700"> : Fonctionnement normal (&gt;30 jours)</span>
                      </li>
                      <li>
                        • <span className="text-red-700 font-medium">Équipements à risque</span>
                        <span className="text-neutral-700"> : Risque élevé de panne (≤30 jours)</span>
                      </li>
                    </ul>
                    <div className="mt-4 p-3 bg-blue-50 rounded">
                      <p className="text-xs text-blue-800">
                        <strong>Objectif :</strong> Prédire quand les équipements sains risquent de tomber en panne pour
                        planifier la maintenance préventive.
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
              <h2 className="text-xl font-semibold mb-4 text-blue-950">Durée de vie restante par équipement (jours)</h2>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="device" angle={-45} textAnchor="end" height={80} />

                    <YAxis />
                    <Tooltip
                      formatter={(value, name) => [value, "Jours restants"]}
                      labelFormatter={(label) => `Équipement : ${label}`}
                    />
                    <Bar dataKey="rul_days" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Distribution des risques */}
            <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
              <h2 className="text-xl font-semibold mb-4 text-blue-950">
                Distribution des équipements par niveau de risque
              </h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={riskDistribution} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="range" type="category" width={100} />
                    <Tooltip
                      formatter={(value, name) => [value, "Équipements"]}
                      labelFormatter={(label) => `Risque : ${label}`}
                    />
                    <Legend />
                    <Bar dataKey="count" name="Nombre d'équipements">
                      {riskDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 p-3 bg-blue-50 rounded">
                <p className="text-sm text-blue-800">
                  <strong>Analyse :</strong> Ce graphique montre la répartition des équipements selon leur niveau de
                  risque de panne. Les équipements avec moins de 30 jours de durée de vie restante sont considérés comme
                  critiques.
                </p>
              </div>
            </div>

            {/* Tableau des résultats */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4 text-blue-950">Détails des prédictions</h2>
              <div className="overflow-x-auto">
                <table id="predictions-table" className="w-full text-sm text-left">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        className="px-4 py-3 font-semibold text-blue-950 cursor-pointer"
                        onClick={() => handleSort("device")}
                      >
                        Équipement
                        {sortConfig.key === "device" && (
                          <span className="ml-1 inline-block">
                            {sortConfig.direction === "ascending" ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </span>
                        )}
                      </th>
                      <th
                        className="px-4 py-3 font-semibold text-blue-950 cursor-pointer"
                        onClick={() => handleSort("current_date")}
                      >
                        Date actuelle
                        {sortConfig.key === "current_date" && (
                          <span className="ml-1 inline-block">
                            {sortConfig.direction === "ascending" ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </span>
                        )}
                      </th>
                      <th
                        className="px-4 py-3 font-semibold text-blue-950 cursor-pointer"
                        onClick={() => handleSort("predicted_rul_days")}
                      >
                        Jours restants
                        {sortConfig.key === "predicted_rul_days" && (
                          <span className="ml-1 inline-block">
                            {sortConfig.direction === "ascending" ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </span>
                        )}
                      </th>
                      <th
                        className="px-4 py-3 font-semibold text-blue-950 cursor-pointer"
                        onClick={() => handleSort("predicted_failure_date")}
                      >
                        Date de panne prédite
                        {sortConfig.key === "predicted_failure_date" && (
                          <span className="ml-1 inline-block">
                            {sortConfig.direction === "ascending" ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </span>
                        )}
                      </th>
                      <th
                        className="px-4 py-3 font-semibold text-blue-950 cursor-pointer"
                        onClick={() => handleSort("priority")}
                      >
                        Priorité
                        {sortConfig.key === "priority" && (
                          <span className="ml-1 inline-block">
                            {sortConfig.direction === "ascending" ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </span>
                        )}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {paginatedData.map((pred, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-stone-500">{pred.device}</td>
                        <td className="px-4 py-3 text-stone-500">{pred.current_date}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              pred.predicted_rul_days < 30
                                ? "bg-red-100 text-red-800"
                                : pred.predicted_rul_days < 90
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-green-100 text-green-800"
                            }`}
                          >
                            {Math.round(pred.predicted_rul_days)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-stone-500">{pred.predicted_failure_date}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              pred.predicted_rul_days < 30
                                ? "bg-red-100 text-red-800"
                                : pred.predicted_rul_days < 90
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-green-100 text-green-800"
                            }`}
                          >
                            {pred.predicted_rul_days < 30
                              ? "Critique"
                              : pred.predicted_rul_days < 90
                                ? "Attention"
                                : "Normal"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-gray-600">
                  Affichage de {currentPage * itemsPerPage + 1} à{" "}
                  {Math.min((currentPage + 1) * itemsPerPage, sortedData.length)} sur {sortedData.length} résultats
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
                    disabled={currentPage === 0}
                    className="p-2 rounded-md border disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  {Array.from({ length: Math.ceil(sortedData.length / itemsPerPage) }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i)}
                      className={`w-8 h-8 rounded-md ${
                        currentPage === i ? "bg-blue-600 text-white" : "border hover:bg-gray-50 cursor-pointer"
                      }`}
                    >
                      {i + 1}
                    </button>
                  )).slice(
                    Math.max(0, currentPage - 2),
                    Math.min(currentPage + 3, Math.ceil(sortedData.length / itemsPerPage)),
                  )}
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(Math.ceil(sortedData.length / itemsPerPage) - 1, prev + 1))
                    }
                    disabled={currentPage >= Math.ceil(sortedData.length / itemsPerPage) - 1}
                    className="p-2 rounded-md border disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default PredictiveMaintenanceApp
