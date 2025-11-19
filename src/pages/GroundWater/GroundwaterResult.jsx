// import { useLocation, useNavigate } from "react-router-dom";
// import { useState, useEffect, useRef } from "react";
// import { Line, Bar, Pie } from 'react-chartjs-2';
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   BarElement,
//   ArcElement,
//   Title,
//   Tooltip,
//   Legend,
//   Filler
// } from 'chart.js';
// import WaterLevelMap from '../../components/common/WaterLevelMap';
// import Aquifer3DVisualization from '../../components/common/Aquifer3DVisualization';

// // Register ChartJS components
// ChartJS.register(
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   BarElement,
//   ArcElement,
//   Title,
//   Tooltip,
//   Legend,
//   Filler
// );

// const GroundwaterResult = () => {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const predictions = location.state?.predictions || {};
//   const formData = location.state?.formData || {};
//   const [showMap, setShowMap] = useState(false);
//   const [show3D, setShow3D] = useState(false);
//   const [mapData, setMapData] = useState([]);
//   const [isLoadingMap, setIsLoadingMap] = useState(false);
//   const [aiRecommendations, setAiRecommendations] = useState(null);
//   const [isLoadingAi, setIsLoadingAi] = useState(false);
//   const [aiError, setAiError] = useState(null);

//   // API Keys
//   const OPENCAGE_API_KEY = "5a17bc7048804adbbed863b635877371";
//   const GEMINI_API_KEY = "AIzaSyBZcT9uIY00RC3nd3J-n9I66Let8B23Pxs"; // Replace with your actual Gemini API key

//   useEffect(() => {
//     if (showMap && mapData.length === 0) {
//       fetchMapData();
//     }
//   }, [showMap]);

//   useEffect(() => {
//     // Load AI recommendations when component mounts
//     fetchAIRecommendations();
//   }, []);

//   const fetchMapData = async () => {
//     setIsLoadingMap(true);
//     try {
//       const data = await getMapData();
//       setMapData(data);
//     } catch (error) {
//       console.error("Error fetching map data:", error);
//       const sampleData = generateSampleMapData();
//       setMapData(sampleData);
//     }
//     setIsLoadingMap(false);
//   };

//   const fetchAIRecommendations = async () => {
//     if (!GEMINI_API_KEY || GEMINI_API_KEY === "AIzaSyBZcT9uIY00RC3nd3J-n9I66Let8B23Pxs") {
//       setAiError("Gemini API key not configured");
//       return;
//     }

//     setIsLoadingAi(true);
//     setAiError(null);
    
//     try {
//       const { state, district, tehsil, village, year } = formData;
//       const waterLevel = predictions[year]?.predicted_gwl;
//       const status = getWaterLevelStatus(waterLevel).status;
      
//       // Calculate trend
//       const years = Object.keys(predictions).map(y => parseInt(y)).sort((a, b) => a - b);
//       const levels = years.map(y => predictions[y].predicted_gwl);
//       const trends = calculateTrends(levels);
//       const currentYearIndex = years.indexOf(parseInt(year));
//       const trend = trends[currentYearIndex];
      
//       const prompt = `
//         Provide specific, actionable water conservation recommendations for ${village}, ${tehsil}, ${district}, ${state}.
        
//         Context:
//         - Current water level: ${waterLevel} meters depth
//         - Status: ${status}
//         - Trend: ${trend}
//         - Target year: ${year}
        
//         Please provide recommendations in the following JSON format:
//         {
//           "shortTerm": ["recommendation1", "recommendation2", ...],
//           "longTerm": ["recommendation1", "recommendation2", ...],
//           "communityActions": ["action1", "action2", ...],
//           "technicalSolutions": ["solution1", "solution2", ...]
//         }
        
//         Make the recommendations specific to the region and current conditions.
//         Focus on practical, implementable advice.
//       `;

//       const response = await fetch(
//         `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${AIzaSyBZcT9uIY00RC3nd3J-n9I66Let8B23Pxs}`,
//         {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//           },
//           body: JSON.stringify({
//             contents: [{
//               parts: [{
//                 text: prompt
//               }]
//             }]
//           })
//         }
//       );

//       if (!response.ok) {
//         throw new Error(`API request failed with status ${response.status}`);
//       }

//       const data = await response.json();
      
//       // Extract the text from the response
//       const responseText = data.candidates[0].content.parts[0].text;
      
//       // Try to parse JSON from the response
//       try {
//         // Sometimes the response might include markdown formatting, so we try to extract JSON
//         const jsonMatch = responseText.match(/\{[\s\S]*\}/);
//         if (jsonMatch) {
//           const recommendations = JSON.parse(jsonMatch[0]);
//           setAiRecommendations(recommendations);
//         } else {
//           // Fallback: create structured data from text response
//           setAiRecommendations({
//             shortTerm: ["Implement immediate water conservation measures", "Fix leaks and reduce wastage"],
//             longTerm: ["Develop comprehensive water management plan", "Invest in water-efficient infrastructure"],
//             communityActions: ["Organize community awareness programs", "Promote water conservation practices"],
//             technicalSolutions: ["Install smart water monitoring systems", "Implement rainwater harvesting"]
//           });
//         }
//       } catch (parseError) {
//         console.error("Error parsing AI response:", parseError);
//         // Fallback recommendations
//         setAiRecommendations({
//           shortTerm: ["Implement immediate water conservation measures", "Fix leaks and reduce wastage"],
//           longTerm: ["Develop comprehensive water management plan", "Invest in water-efficient infrastructure"],
//           communityActions: ["Organize community awareness programs", "Promote water conservation practices"],
//           technicalSolutions: ["Install smart water monitoring systems", "Implement rainwater harvesting"]
//         });
//       }
//     } catch (error) {
//       console.error("Error fetching AI recommendations:", error);
//       setAiError("Failed to load AI recommendations. Using standard conservation tips.");
//       // Set fallback recommendations
//       setAiRecommendations({
//         shortTerm: getConservationTips(getWaterLevelStatus(predictions[year]?.predicted_gwl).status, trend).baseTips.slice(0, 3),
//         longTerm: ["Develop a comprehensive water management strategy", "Invest in water recycling infrastructure", "Promote drought-resistant agriculture"],
//         communityActions: ["Establish community water monitoring program", "Organize water conservation workshops", "Create water-saving incentive programs"],
//         technicalSolutions: ["Implement smart irrigation systems", "Install groundwater recharge structures", "Develop water quality monitoring network"]
//       });
//     } finally {
//       setIsLoadingAi(false);
//     }
//   };

//   if (Object.keys(predictions).length === 0) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="text-center">
//           <h2 className="text-2xl font-bold text-red-600 mb-4">No Prediction Data Found</h2>
//           <button 
//             onClick={() => navigate('/groundwater/level_predict')}
//             className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
//           >
//             Go Back to Predictor
//           </button>
//         </div>
//       </div>
//     );
//   }

//   const { state, district, tehsil, village, year } = formData;
//   const targetYear = parseInt(year);

//   // Filter out null predictions and prepare data for chart
//   const validPredictions = Object.entries(predictions).filter(([_, value]) => value && value.predicted_gwl !== null);
  
//   if (validPredictions.length === 0) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="text-center">
//           <h2 className="text-2xl font-bold text-red-600 mb-4">Location Not Found in Database</h2>
//           <p className="text-gray-600 mb-4">The selected location ({village}, {tehsil}, {district}, {state}) was not found in our database.</p>
//           <button 
//             onClick={() => navigate('/groundwater/level_predict')}
//             className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
//           >
//             Try Another Location
//           </button>
//         </div>
//       </div>
//     );
//   }

//   const years = validPredictions.map(([year]) => parseInt(year)).sort((a, b) => a - b);
//   const levels = validPredictions.map(([_, prediction]) => prediction.predicted_gwl);
  
//   // Calculate correct trend based on water level changes
//   const calculateTrends = (waterLevels) => {
//     const trends = [];
    
//     for (let i = 0; i < waterLevels.length; i++) {
//       if (i === 0) {
//         trends.push('Improving');
//       } else {
//         const currentLevel = waterLevels[i];
//         const previousLevel = waterLevels[i - 1];
        
//         // Decreasing water level (shallower) = IMPROVING
//         // Increasing water level (deeper) = WORSENING
//         if (currentLevel < previousLevel) {
//           trends.push('Improving');
//         } else if (currentLevel > previousLevel) {
//           trends.push('Worsening');
//         } else {
//           trends.push('Stable');
//         }
//       }
//     }
    
//     return trends;
//   };
  
//   const trends = calculateTrends(levels);

//   // Get current year prediction with safety check
//   const currentPrediction = predictions[targetYear];
//   if (!currentPrediction || currentPrediction.predicted_gwl === null || currentPrediction.predicted_gwl === undefined) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="text-center">
//           <h2 className="text-2xl font-bold text-red-600 mb-4">Prediction Data Error</h2>
//           <p className="text-gray-600 mb-4">Unable to get prediction data for the selected year ({targetYear}).</p>
//           <button 
//             onClick={() => navigate('/groundwater/level_predict')}
//             className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
//           >
//             Try Again
//           </button>
//         </div>
//       </div>
//     );
//   }

//   // Determine water level status and color (LOWER values are BETTER)
//   const getWaterLevelStatus = (level) => {
//     if (level < 5) return { status: "Excellent", color: "green", description: "Very good groundwater level. Sustainable for usage." };
//     if (level < 10) return { status: "Good", color: "blue", description: "Good groundwater level. Sustainable usage possible." };
//     if (level < 15) return { status: "Moderate", color: "yellow", description: "Moderate groundwater level. Conservation recommended." };
//     return { status: "Critical", color: "red", description: "Very low groundwater level. Immediate conservation needed." };
//   };

//   // Get trend meaning
//   const getTrendMeaning = (trend) => {
//     return trend;
//   };

//   // Water conservation tips based on water status
//   const getConservationTips = (status, trend) => {
//     const baseTips = {
//       Excellent: [
//         "💧 Maintain current conservation practices",
//         "🌱 Continue sustainable water usage patterns",
//         "📊 Regular monitoring to maintain excellent levels",
//         "🌳 Promote watershed protection initiatives"
//       ],
//       Good: [
//         "💧 Fix leaky faucets and pipes promptly",
//         "🚿 Install water-efficient showerheads",
//         "🌱 Use native plants in landscaping",
//         "🕒 Water plants during cooler hours to reduce evaporation"
//       ],
//       Moderate: [
//         "💧 Implement rainwater harvesting systems",
//         "🚰 Use drip irrigation for gardens and farms",
//         "🔄 Reuse greywater for non-potable purposes",
//         "📉 Reduce outdoor water usage by 25%"
//       ],
//       Critical: [
//         "🚨 Implement emergency water conservation measures",
//         "💧 Strictly limit non-essential water usage",
//         "🌾 Shift to drought-resistant crops",
//         "🏭 Coordinate with local industries for water rationing",
//         "🚰 Prioritize drinking water over other uses"
//       ]
//     };

//     const trendTips = {
//       Improving: [
//         "✅ Current conservation efforts are working",
//         "📈 Continue current practices to maintain improvement",
//         "🌧️ Recent rainfall may be helping recovery"
//       ],
//       Worsening: [
//         "⚠️ Intensify conservation efforts immediately",
//         "🔍 Investigate potential sources of water loss",
//         "📢 Community awareness campaigns needed"
//       ],
//       Stable: [
//         "🔄 Maintain current conservation practices",
//         "📊 Continue monitoring water levels regularly",
//         "🌱 Consider additional conservation measures to improve further"
//       ]
//     };

//     return {
//       baseTips: baseTips[status] || [],
//       trendTips: trendTips[trend] || []
//     };
//   };

//   // Function to geocode location using OpenCage API
//   const geocodeLocation = async (query) => {
//     try {
//       const response = await fetch(
//         `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(query)}&key=${OPENCAGE_API_KEY}&limit=1`
//       );
//       const data = await response.json();
      
//       if (data.results && data.results.length > 0) {
//         return data.results[0].geometry;
//       }
//       return null;
//     } catch (error) {
//       console.error("Geocoding error:", error);
//       return null;
//     }
//   };

//   // Function to generate map data using OpenCage API
//   const getMapData = async () => {
//     try {
//       // Geocode the main location
//       const mainQuery = `${village}, ${tehsil}, ${district}, ${state}, India`;
//       const mainCoords = await geocodeLocation(mainQuery);
      
//       if (!mainCoords) {
//         throw new Error("Could not geocode main location");
//       }

//       // Get current trend
//       const currentYearIndex = years.indexOf(targetYear);
//       const currentTrend = trends[currentYearIndex];

//       // Generate nearby locations
//       const nearbyLocations = [
//         {
//           village: `${village} North`,
//           tehsil: tehsil,
//           district: district,
//           state: state,
//           waterLevel: (currentPrediction.predicted_gwl + 2).toFixed(1),
//           status: getWaterLevelStatus(currentPrediction.predicted_gwl + 2).status,
//           trend: Math.random() > 0.5 ? 'Improving' : 'Worsening',
//           lat: mainCoords.lat + 0.05,
//           lng: mainCoords.lng
//         },
//         {
//           village: `${village} South`,
//           tehsil: tehsil,
//           district: district,
//           state: state,
//           waterLevel: (currentPrediction.predicted_gwl - 1.5).toFixed(1),
//           status: getWaterLevelStatus(currentPrediction.predicted_gwl - 1.5).status,
//           trend: Math.random() > 0.5 ? 'Improving' : 'Worsening',
//           lat: mainCoords.lat - 0.05,
//           lng: mainCoords.lng
//         },
//         {
//           village: `${tehsil} West`,
//           tehsil: tehsil,
//           district: district,
//           state: state,
//           waterLevel: (currentPrediction.predicted_gwl + 3).toFixed(1),
//           status: getWaterLevelStatus(currentPrediction.predicted_gwl + 3).status,
//           trend: Math.random() > 0.5 ? 'Improving' : 'Worsening',
//           lat: mainCoords.lat,
//           lng: mainCoords.lng - 0.05
//         },
//         {
//           village: `${tehsil} East`,
//           tehsil: tehsil,
//           district: district,
//           state: state,
//           waterLevel: (currentPrediction.predicted_gwl - 2.5).toFixed(1),
//           status: getWaterLevelStatus(currentPrediction.predicted_gwl - 2.5).status,
//           trend: Math.random() > 0.5 ? 'Improving' : 'Worsening',
//           lat: mainCoords.lat,
//           lng: mainCoords.lng + 0.05
//         }
//       ];

//       return [
//         {
//           village: village,
//           tehsil: tehsil,
//           district: district,
//           state: state,
//           waterLevel: currentPrediction.predicted_gwl,
//           status: waterStatus.status,
//           trend: currentTrend,
//           lat: mainCoords.lat,
//           lng: mainCoords.lng
//         },
//         ...nearbyLocations
//       ];
//     } catch (error) {
//       console.error("Error generating map data:", error);
//       throw error;
//     }
//   };

//   // Fallback function to generate sample map data if API fails
//   const generateSampleMapData = () => {
//     // Generate dynamic coordinates based on village name
//     const generateCoordsFromName = (name, baseLat, baseLng, spread = 0.2) => {
//       let hash = 0;
//       for (let i = 0; i < name.length; i++) {
//         hash = name.charCodeAt(i) + ((hash << 5) - hash);
//       }
      
//       const latVariation = ((hash % 100) / 1000) * spread;
//       const lngVariation = (((hash >> 8) % 100) / 1000) * spread;
      
//       return {
//         lat: baseLat + latVariation,
//         lng: baseLng + lngVariation
//       };
//     };

//     // Get base coordinates based on state (approximate centers)
//     const getStateCenter = (stateName) => {
//       const stateCenters = {
//         'assam': { lat: 26.2006, lng: 92.9376 },
//         'maharashtra': { lat: 19.7515, lng: 75.7139 },
//         'uttar pradesh': { lat: 26.8467, lng: 80.9462 },
//         'bihar': { lat: 25.0961, lng: 85.3131 },
//         'west b Bengal': { lat: 22.9868, lng: 87.8550 },
//         'tamil nadu': { lat: 11.1271, lng: 78.6569 },
//         'kerala': { lat: 10.8505, lng: 76.2711 },
//         'karnataka': { lat: 15.3173, lng: 75.7139 },
//         'rajasthan': { lat: 27.0238, lng: 74.2179 },
//         'gujarat': { lat: 22.2587, lng: 71.1924 },
//         'punjab': { lat: 31.1471, lng: 75.3412 },
//         'haryana': { lat: 29.0588, lng: 76.0856 },
//       };
      
//       const normalizedState = stateName.toLowerCase().trim();
//       return stateCenters[normalizedState] || { lat: 20.5937, lng: 78.9629 };
//     };

//     const stateCenter = getStateCenter(state);
//     const mainCoords = generateCoordsFromName(village, stateCenter.lat, stateCenter.lng, 1);

//     // Get current trend
//     const currentYearIndex = years.indexOf(targetYear);
//     const currentTrend = trends[currentYearIndex];

//     return [
//       {
//         village: village,
//         tehsil: tehsil,
//         district: district,
//         state: state,
//         waterLevel: currentPrediction.predicted_gwl,
//         status: waterStatus.status,
//         trend: currentTrend,
//         lat: mainCoords.lat,
//         lng: mainCoords.lng
//       },
//       {
//         village: `${village} North`,
//         tehsil: tehsil,
//         district: district,
//         state: state,
//         waterLevel: (currentPrediction.predicted_gwl + 2).toFixed(1),
//         status: getWaterLevelStatus(currentPrediction.predicted_gwl + 2).status,
//         trend: Math.random() > 0.5 ? 'Improving' : 'Worsening',
//         lat: mainCoords.lat + 0.2,
//         lng: mainCoords.lng
//       },
//       {
//         village: `${village} South`,
//         tehsil: tehsil,
//         district: district,
//         state: state,
//         waterLevel: (currentPrediction.predicted_gwl - 1.5).toFixed(1),
//         status: getWaterLevelStatus(currentPrediction.predicted_gwl - 1.5).status,
//         trend: Math.random() > 0.5 ? 'Improving' : 'Worsening',
//         lat: mainCoords.lat - 0.2,
//         lng: mainCoords.lng
//       },
//       {
//         village: `${tehsil} West`,
//         tehsil: tehsil,
//         district: district,
//         state: state,
//         waterLevel: (currentPrediction.predicted_gwl + 3).toFixed(1),
//         status: getWaterLevelStatus(currentPrediction.predicted_gwl + 3).status,
//         trend: Math.random() > 0.5 ? 'Improving' : 'Worsening',
//         lat: mainCoords.lat,
//         lng: mainCoords.lng - 0.2
//       },
//       {
//         village: `${tehsil} East`,
//         tehsil: tehsil,
//         district: district,
//         state: state,
//         waterLevel: (currentPrediction.predicted_gwl - 2.5).toFixed(1),
//         status: getWaterLevelStatus(currentPrediction.predicted_gwl - 2.5).status,
//         trend: Math.random() > 0.5 ? 'Improving' : 'Worsening',
//         lat: mainCoords.lat,
//         lng: mainCoords.lng + 0.2
//       }
//     ];
//   };

//   const waterStatus = getWaterLevelStatus(currentPrediction.predicted_gwl);

//   // Calculate water status distribution for pie chart
//   const statusCounts = {
//     Excellent: 0,
//     Good: 0,
//     Moderate: 0,
//     Critical: 0
//   };

//   validPredictions.forEach(([_, prediction]) => {
//     const status = getWaterLevelStatus(prediction.predicted_gwl).status;
//     statusCounts[status]++;
//   });

//   // Get current trend
//   const currentYearIndex = years.indexOf(targetYear);
//   const currentTrend = trends[currentYearIndex];

//   // Line Chart Data
//   const lineChartData = {
//     labels: years.map(y => y.toString()),
//     datasets: [
//       {
//         label: 'Depth to Water Table (meters)',
//         data: levels,
//         borderColor: 'rgb(59, 130, 246)',
//         backgroundColor: 'rgba(59, 130, 246, 0.1)',
//         borderWidth: 3,
//         pointBackgroundColor: levels.map(level => {
//           if (level < 5) return 'rgb(34, 197, 94)';
//           if (level < 10) return 'rgb(59, 130, 246)';
//           if (level < 15) return 'rgb(234, 179, 8)';
//           return 'rgb(239, 68, 68)';
//         }),
//         pointBorderColor: levels.map(level => {
//           if (level < 5) return 'rgb(34, 197, 94)';
//           if (level < 10) return 'rgb(59, 130, 246)';
//           if (level < 15) return 'rgb(234, 179, 8)';
//           return 'rgb(239, 68, 68)';
//         }),
//         pointRadius: years.map(y => y === targetYear ? 6 : 4),
//         pointHoverRadius: 8,
//         fill: true,
//         tension: 0.3,
//       },
//     ],
//   };

//   const lineChartOptions = {
//     responsive: true,
//     plugins: {
//       legend: {
//         position: 'top',
//       },
//       title: {
//         display: true,
//         text: `Groundwater Level Trend (${years[0]} - ${years[years.length - 1]})`,
//         font: {
//           size: 16,
//           weight: 'bold'
//         }
//       },
//     },
//     scales: {
//       y: {
//         beginAtZero: true,
//         title: {
//           display: true,
//           text: 'Depth to Water Table (meters)'
//         },
//         suggestedMax: Math.max(...levels) * 1.2
//       },
//       x: {
//         title: {
//           display: true,
//           text: 'Year'
//         }
//       }
//     },
//   };

//   // Bar Chart Data - Yearly Comparison
//   const barChartData = {
//     labels: years.map(y => y.toString()),
//     datasets: [
//       {
//         label: 'Water Depth (meters)',
//         data: levels,
//         backgroundColor: levels.map(level => {
//           if (level < 5) return 'rgba(34, 197, 94, 0.7)';
//           if (level < 10) return 'rgba(59, 130, 246, 0.7)';
//           if (level < 15) return 'rgba(234, 179, 8, 0.7)';
//           return 'rgba(239, 68, 68, 0.7)';
//         }),
//         borderColor: levels.map(level => {
//           if (level < 5) return 'rgb(34, 197, 94)';
//           if (level < 10) return 'rgb(59, 130, 246)';
//           if (level < 15) return 'rgb(234, 179, 8)';
//           return 'rgb(239, 68, 68)';
//         }),
//         borderWidth: 2,
//       },
//     ],
//   };

//   const barChartOptions = {
//     responsive: true,
//     plugins: {
//       legend: {
//         position: 'top',
//       },
//       title: {
//         display: true,
//         text: 'Yearly Groundwater Level Comparison',
//         font: {
//           size: 16,
//           weight: 'bold'
//         }
//       },
//     },
//     scales: {
//       y: {
//         beginAtZero: true,
//         title: {
//           display: true,
//           text: 'Depth to Water Table (meters)'
//         }
//       },
//     },
//   };

//   // Pie Chart Data - Status Distribution
//   const pieChartData = {
//     labels: ['Excellent (<5m)', 'Good (5-10m)', 'Moderate (10-15m)', 'Critical (>15m)'],
//     datasets: [
//       {
//         data: [statusCounts.Excellent, statusCounts.Good, statusCounts.Moderate, statusCounts.Critical],
//         backgroundColor: [
//           'rgba(34, 197, 94, 0.7)',
//           'rgba(59, 130, 246, 0.7)',
//           'rgba(234, 179, 8, 0.7)',
//           'rgba(239, 68, 68, 0.7)'
//         ],
//         borderColor: [
//           'rgb(34, 197, 94)',
//           'rgb(59, 130, 246)',
//           'rgb(234, 179, 8)',
//           'rgb(239, 68, 68)'
//         ],
//         borderWidth: 2,
//       },
//     ],
//   };

//   const pieChartOptions = {
//     responsive: true,
//     plugins: {
//       legend: {
//         position: 'top',
//       },
//       title: {
//         display: true,
//         text: 'Water Status Distribution (7 Years)',
//         font: {
//           size: 16,
//           weight: 'bold'
//         }
//       },
//     },
//   };

//   // Prepare data for 3D visualization
//   const aquiferData = {
//     currentLevel: currentPrediction.predicted_gwl,
//     historicalLevels: levels,
//     years: years,
//     status: waterStatus.status,
//     location: { village, tehsil, district, state }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-7xl mx-auto">
//         {/* Header */}
//         <div className="text-center mb-8">
//           <h1 className="text-3xl font-bold text-gray-800 mb-2">Groundwater Trend Analysis</h1>
//           <p className="text-gray-600">Historical and Projected Groundwater Levels for {village}, {tehsil}</p>
//         </div>

//         {/* Location Details */}
//         <div className="bg-white rounded-lg shadow-md p-6 mb-6">
//           <h2 className="text-xl font-semibold text-gray-800 mb-4">Location Details</h2>
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//             <div><strong>State:</strong> {state}</div>
//             <div><strong>District:</strong> {district}</div>
//             <div><strong>Tehsil:</strong> {tehsil}</div>
//             <div><strong>Village:</strong> {village}</div>
//             <div><strong>Target Year:</strong> {year}</div>
//             <div><strong>Analysis Period:</strong> {years[0]} - {years[years.length - 1]}</div>
//           </div>
//         </div>

//         {/* Current Year Summary */}
//         <div className="bg-white rounded-lg shadow-md p-6 mb-6">
//           <h2 className="text-xl font-semibold text-gray-800 mb-4">{year} Prediction Summary</h2>
          
//           {/* Status Card */}
//           <div className={`border-l-4 border-${waterStatus.color}-500 bg-${waterStatus.color}-50 p-4 rounded mb-4`}>
//             <h3 className={`text-${waterStatus.color}-800 font-semibold mb-2`}>
//               Water Level Status: {waterStatus.status}
//             </h3>
//             <p className={`text-${waterStatus.color}-700`}>{waterStatus.description}</p>
//           </div>

//           {/* Trend Indicator */}
//           <div className="flex items-center justify-center mb-4">
//             <span className="text-lg font-semibold mr-2">Trend:</span>
//             <span className={`text-${currentTrend === 'Improving' ? 'green' : currentTrend === 'Worsening' ? 'red' : 'gray'}-600 font-bold flex items-center`}>
//               {currentTrend === 'Improving' ? (
//                 <>
//                   <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
//                     <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
//                   </svg>
//                   Improving (Water table rising)
//                 </>
//               ) : currentTrend === 'Worsening' ? (
//                 <>
//                   <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
//                     <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
//                   </svg>
//                   Worsening (Water table falling)
//                 </>
//               ) : (
//                 <>
//                   <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
//                     <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V7z" clipRule="evenodd" />
//                   </svg>
//                   Stable (No significant change)
//                 </>
//               )}
//             </span>
//           </div>

//           <div className="text-center">
//             <p className="text-2xl font-bold text-gray-800">
//               Predicted Depth: <span className="text-blue-600">{currentPrediction.predicted_gwl} meters</span>
//             </p>
//           </div>
//         </div>

//         {/* Chart Grid - 3 Visualizations */}
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
//           {/* Line Chart */}
//           <div className="bg-white rounded-lg shadow-md p-6">
//             <h2 className="text-xl font-semibold text-gray-800 mb-4">Groundwater Level Trend</h2>
//             <div className="h-80">
//               <Line data={lineChartData} options={lineChartOptions} />
//             </div>
//           </div>

//           {/* Bar Chart */}
//           <div className="bg-white rounded-lg shadow-md p-6">
//             <h2 className="text-xl font-semibold text-gray-800 mb-4">Yearly Comparison</h2>
//             <div className="h-80">
//               <Bar data={barChartData} options={barChartOptions} />
//             </div>
//           </div>

//           {/* Pie Chart - Full width on mobile, then takes 2 columns on larger screens */}
//           <div className="bg-white rounded-lg shadow-md p-6 lg:col-span-2">
//             <h2 className="text-xl font-semibold text-gray-800 mb-4">Water Status Distribution</h2>
//             <div className="h-80 mx-auto" style={{ maxWidth: '500px' }}>
//               <Pie data={pieChartData} options={pieChartOptions} />
//             </div>
//             <div className="mt-4 text-center text-sm text-gray-600">
//               <p>Distribution of water status categories across all {validPredictions.length} years analyzed</p>
//             </div>
//           </div>
//         </div>

//         {/* 3D Aquifer Visualization */}
//         <div className="bg-white rounded-lg shadow-md p-6 mb-6">
//           <h2 className="text-xl font-semibold text-gray-800 mb-4">3D Aquifer Visualization</h2>
//           <p className="text-gray-600 mb-4">
//             Explore the groundwater aquifer structure in 3D. This visualization shows the water table depth
//             and how it changes over time.
//           </p>
          
//           <div className="h-96 rounded-lg overflow-hidden border border-gray-200">
//             <Aquifer3DVisualization data={aquiferData} />
//           </div>
          
//           <div className="mt-4 flex justify-center">
//             <button 
//               onClick={() => setShow3D(!show3D)}
//               className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
//             >
//               {show3D ? 'Hide Controls' : 'Show 3D Controls'}
//             </button>
//           </div>
//         </div>

//         {/* AI-Powered Recommendations */}
//         <div className="bg-white rounded-lg shadow-md p-6 mb-6">
//           <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
//             <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-800 rounded-full mr-2">
//               🤖
//             </span>
//             AI-Powered Recommendations
//           </h2>
          
//           {isLoadingAi ? (
//             <div className="text-center py-8">
//               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
//               <p className="mt-4 text-gray-600">AI is analyzing your groundwater data...</p>
//             </div>
//           ) : aiError ? (
//             <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
//               <p className="text-yellow-700">{aiError}</p>
//             </div>
//           ) : null}
          
//           {aiRecommendations && (
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               {/* Short Term Recommendations */}
//               <div className="bg-blue-50 p-4 rounded-lg">
//                 <h3 className="font-semibold text-blue-800 mb-3 flex items-center">
//                   <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-800 rounded-full text-sm mr-2">
//                     ⚡
//                   </span>
//                   Short-Term Actions
//                 </h3>
//                 <ul className="space-y-2">
//                   {aiRecommendations.shortTerm.map((recommendation, index) => (
//                     <li key={index} className="flex items-start">
//                       <span className="text-blue-600 mr-2">•</span>
//                       <span className="text-blue-700 text-sm">{recommendation}</span>
//                     </li>
//                   ))}
//                 </ul>
//               </div>

//               {/* Long Term Recommendations */}
//               <div className="bg-green-50 p-4 rounded-lg">
//                 <h3 className="font-semibold text-green-800 mb-3 flex items-center">
//                   <span className="inline-flex items-center justify-center w-6 h-6 bg-green-100 text-green-800 rounded-full text-sm mr-2">
//                     📈
//                   </span>
//                   Long-Term Strategies
//                 </h3>
//                 <ul className="space-y-2">
//                   {aiRecommendations.longTerm.map((recommendation, index) => (
//                     <li key={index} className="flex items-start">
//                       <span className="text-green-600 mr-2">•</span>
//                       <span className="text-green-700 text-sm">{recommendation}</span>
//                     </li>
//                   ))}
//                 </ul>
//               </div>

//               {/* Community Actions */}
//               <div className="bg-purple-50 p-4 rounded-lg">
//                 <h3 className="font-semibold text-purple-800 mb-3 flex items-center">
//                   <span className="inline-flex items-center justify-center w-6 h-6 bg-purple-100 text-purple-800 rounded-full text-sm mr-2">
//                     👥
//                   </span>
//                   Community Actions
//                 </h3>
//                 <ul className="space-y-2">
//                   {aiRecommendations.communityActions.map((recommendation, index) => (
//                     <li key={index} className="flex items-start">
//                       <span className="text-purple-600 mr-2">•</span>
//                       <span className="text-purple-700 text-sm">{recommendation}</span>
//                     </li>
//                   ))}
//                 </ul>
//               </div>

//               {/* Technical Solutions */}
//               <div className="bg-orange-50 p-4 rounded-lg">
//                 <h3 className="font-semibold text-orange-800 mb-3 flex items-center">
//                   <span className="inline-flex items-center justify-center w-6 h-6 bg-orange-100 text-orange-800 rounded-full text-sm mr-2">
//                     🔧
//                   </span>
//                   Technical Solutions
//                 </h3>
//                 <ul className="space-y-2">
//                   {aiRecommendations.technicalSolutions.map((recommendation, index) => (
//                     <li key={index} className="flex items-start">
//                       <span className="text-orange-600 mr-2">•</span>
//                       <span className="text-orange-700 text-sm">{recommendation}</span>
//                     </li>
//                   ))}
//                 </ul>
//               </div>
//             </div>
//           )}
          
//           <div className="mt-6 text-center">
//             <button 
//               onClick={fetchAIRecommendations}
//               className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center mx-auto"
//             >
//               <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
//               </svg>
//               Regenerate Recommendations
//             </button>
//           </div>
//         </div>

//         {/* Detailed Predictions Table */}
//         <div className="bg-white rounded-lg shadow-md p-6 mb-6">
//           <h2 className="text-xl font-semibold text-gray-800 mb-4">Detailed Predictions</h2>
//           <div className="overflow-x-auto">
//             <table className="min-w-full table-auto">
//               <thead>
//                 <tr className="bg-gray-100">
//                   <th className="px-4 py-2 text-left">Year</th>
//                   <th className="px-4 py-2 text-left">Depth to Water (m)</th>
//                   <th className="px-4 py-2 text-left">Trend</th>
//                   <th className="px-4 py-2 text-left">Status</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {validPredictions.map(([year, prediction], index) => {
//                   const status = getWaterLevelStatus(prediction.predicted_gwl);
//                   const trend = trends[index];
                  
//                   return (
//                     <tr key={year} className={parseInt(year) === targetYear ? "bg-blue-50 font-semibold" : "even:bg-gray-50"}>
//                       <td className="border px-4 py-2">{year}{parseInt(year) === targetYear ? " (Selected)" : ""}</td>
//                       <td className="border px-4 py-2">{prediction.predicted_gwl}m</td>
//                       <td className="border px-4 py-2">
//                         <span className={`flex items-center ${
//                           trend === 'Improving' ? 'text-green-600' : 
//                           trend === 'Worsening' ? 'text-red-600' : 'text-gray-600'
//                         }`}>
//                           {trend === 'Improving' ? '↗ Improving' : 
//                            trend === 'Worsening' ? '↘ Worsening' : '→ Stable'}
//                         </span>
//                       </td>
//                       <td className="border px-4 py-2">
//                         <span className={`px-2 py-1 rounded-full text-xs font-medium bg-${status.color}-100 text-${status.color}-800`}>
//                           {status.status}
//                         </span>
//                       </td>
//                     </tr>
//                   );
//                 })}
//               </tbody>
//             </table>
//           </div>
//         </div>

//         {/* Action Buttons */}
//         <div className="flex justify-center gap-4 flex-wrap">
//           <button 
//             onClick={() => navigate('/groundwater/level_predict')}
//             className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
//           >
//             Make Another Prediction
//           </button>
//           <button 
//             onClick={() => window.print()}
//             className="bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700 transition-colors"
//           >
//             Print Report
//           </button>
//           <button 
//             onClick={() => setShowMap(!showMap)}
//             className="bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700 transition-colors"
//           >
//             {showMap ? 'Hide Map' : 'View on Map'}
//           </button>
//         </div>

//         {/* Interactive Map */}
//         {showMap && (
//           <div className="bg-white rounded-lg shadow-md p-6 mt-6">
//             <h2 className="text-xl font-semibold text-gray-800 mb-4">
//               🗺️ Location Map - Groundwater Status
//             </h2>
//             <p className="text-gray-600 mb-4">
//               Interactive map showing groundwater status in {village} and surrounding areas. 
//               Click on markers for details.
//             </p>
            
//             {isLoadingMap ? (
//               <div className="h-96 flex items-center justify-center">
//                 <div className="text-center">
//                   <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
//                   <p className="mt-4 text-gray-600">Loading map data...</p>
//                 </div>
//               </div>
//             ) : (
//               <>
//                 <WaterLevelMap 
//                   locations={mapData}
//                   selectedLocation={{
//                     village: village,
//                     tehsil: tehsil,
//                     district: district,
//                     state: state
//                   }}
//                   onLocationSelect={(location) => {
//                     console.log('Selected location:', location);
//                   }}
//                 />
                
//                 <div className="mt-4 flex items-center justify-center space-x-4 text-sm flex-wrap">
//                   <div className="flex items-center">
//                     <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
//                     <span>Excellent</span>
//                   </div>
//                   <div className="flex items-center">
//                     <div className="w-4 h-4 bg-blue-500 rounded-full mr-2"></div>
//                     <span>Good</span>
//                   </div>
//                   <div className="flex items-center">
//                     <div className="w-4 h-4 bg-yellow-500 rounded-full mr-2"></div>
//                     <span>Moderate</span>
//                   </div>
//                   <div className="flex items-center">
//                     <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
//                     <span>Critical</span>
//                   </div>
//                 </div>
//               </>
//             )}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default GroundwaterResult;















import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { Line, Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import WaterLevelMap from '../../components/common/WaterLevelMap';
import Aquifer3DVisualization from '../../components/common/Aquifer3DVisualization';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const GroundwaterResult = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const predictions = location.state?.predictions || {};
  const formData = location.state?.formData || {};
  const [showMap, setShowMap] = useState(false);
  const [show3D, setShow3D] = useState(false);
  const [mapData, setMapData] = useState([]);
  const [isLoadingMap, setIsLoadingMap] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [aiError, setAiError] = useState(null);

  // API Keys
  const OPENCAGE_API_KEY = "5a17bc7048804adbbed863b635877371";
  const GEMINI_API_KEY = "AIzaSyBZcT9uIY00RC3nd3J-n9I66Let8B23Pxs";
    useEffect(() => {
    if (showMap && mapData.length === 0) {
      fetchMapData();
    }
  }, [showMap]);

  useEffect(() => {
    // Load AI recommendations when component mounts
    fetchAIRecommendations();
  }, []);

  const fetchMapData = async () => {
    setIsLoadingMap(true);
    try {
      const data = await getMapData();
      setMapData(data);
    } catch (error) {
      console.error("Error fetching map data:", error);
      const sampleData = generateSampleMapData();
      setMapData(sampleData);
    }
    setIsLoadingMap(false);
  };

  // Helper function for fallback recommendations
  const generateFallbackRecommendations = (status, trend) => {
    const waterStatus = status || getWaterLevelStatus(currentPrediction.predicted_gwl).status;
    const currentYearIndex = years.indexOf(targetYear);
    const currentTrend = trend || trends[currentYearIndex];
    
    const baseTips = getConservationTips(waterStatus, currentTrend).baseTips;
    
    return {
      shortTerm: baseTips.slice(0, 3),
      longTerm: [
        "Develop a comprehensive water management strategy",
        "Invest in water recycling infrastructure", 
        "Promote drought-resistant agriculture"
      ],
      communityActions: [
        "Establish community water monitoring program",
        "Organize water conservation workshops",
        "Create water-saving incentive programs"
      ],
      technicalSolutions: [
        "Implement smart irrigation systems",
        "Install groundwater recharge structures", 
        "Develop water quality monitoring network"
      ]
    };
  };
  //   const fetchAIRecommendations = async () => {
  //   // CORRECTED: Check against placeholder, not actual key
  //   if (!GEMINI_API_KEY || GEMINI_API_KEY === "YOUR_GEMINI_API_KEY") {
  //     setAiError("Gemini API key not configured");
  //     setAiRecommendations(generateFallbackRecommendations());
  //     return;
  //   }

  //   setIsLoadingAi(true);
  //   setAiError(null);
    
  //   try {
  //     const { state, district, tehsil, village, year } = formData;
  //     const waterLevel = predictions[year]?.predicted_gwl;
  //     const status = getWaterLevelStatus(waterLevel).status;
      
  //     // Calculate trend
  //     const years = Object.keys(predictions).map(y => parseInt(y)).sort((a, b) => a - b);
  //     const levels = years.map(y => predictions[y].predicted_gwl);
  //     const trends = calculateTrends(levels);
  //     const currentYearIndex = years.indexOf(parseInt(year));
  //     const trend = trends[currentYearIndex];
      
  //     const prompt = `
  //       Provide specific, actionable water conservation recommendations for ${village}, ${tehsil}, ${district}, ${state}.
        
  //       Context:
  //       - Current water level: ${waterLevel} meters depth
  //       - Status: ${status}
  //       - Trend: ${trend}
  //       - Target year: ${year}
        
  //       Please provide recommendations in the following JSON format:
  //       {
  //         "shortTerm": ["recommendation1", "recommendation2", ...],
  //         "longTerm": ["recommendation1", "recommendation2", ...],
  //         "communityActions": ["action1", "action2", ...],
  //         "technicalSolutions": ["solution1", "solution2", ...]
  //       }
        
  //       Make the recommendations specific to the region and current conditions.
  //       Focus on practical, implementable advice.
  //     `;

  //     // CORRECTED: Use the variable, not the raw key
  //     const response = await fetch(
  //       `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
  //       {
  //         method: 'POST',
  //         headers: {
  //           'Content-Type': 'application/json',
  //         },
  //         body: JSON.stringify({
  //           contents: [{
  //             parts: [{
  //               text: prompt
  //             }]
  //           }]
  //         })
  //       }
  //     );

  //     if (!response.ok) {
  //       throw new Error(`API request failed with status ${response.status}`);
  //     }

  //     const data = await response.json();
      
  //     // Extract the text from the response
  //     let responseText = "";
  //     if (data.candidates && data.candidates[0] && data.candidates[0].content) {
  //       responseText = data.candidates[0].content.parts[0].text;
  //     } else {
  //       throw new Error("Invalid response format from Gemini API");
  //     }
      
  //     // Try to parse JSON from the response
  //     try {
  //       // Extract JSON from the response (might be wrapped in markdown)
  //       const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  //       if (jsonMatch) {
  //         const recommendations = JSON.parse(jsonMatch[0]);
  //         setAiRecommendations(recommendations);
  //       } else {
  //         // If no JSON found, use fallback
  //         setAiRecommendations(generateFallbackRecommendations(status, trend));
  //       }
  //     } catch (parseError) {
  //       console.error("Error parsing AI response:", parseError);
  //       setAiRecommendations(generateFallbackRecommendations(status, trend));
  //     }
  //   } catch (error) {
  //     console.error("Error fetching AI recommendations:", error);
  //     setAiError("Failed to load AI recommendations. Using standard conservation tips.");
  //     setAiRecommendations(generateFallbackRecommendations());
  //   } finally {
  //     setIsLoadingAi(false);
  //   }
  // };

  const fetchAIRecommendations = async () => {
  setIsLoadingAi(true);
  setAiError(null);
  
  try {
    const { state, district, tehsil, village, year } = formData;
    const waterLevel = predictions[year]?.predicted_gwl;
    const status = getWaterLevelStatus(waterLevel).status;
    
    // Calculate trend
    const years = Object.keys(predictions).map(y => parseInt(y)).sort((a, b) => a - b);
    const levels = years.map(y => predictions[y].predicted_gwl);
    const trends = calculateTrends(levels);
    const currentYearIndex = years.indexOf(parseInt(year));
    const trend = trends[currentYearIndex];
    
    // Use fallback recommendations directly (bypass Gemini API)
    setAiRecommendations(generateFallbackRecommendations(status, trend));
    
  } catch (error) {
    console.error("Error:", error);
    setAiError("AI service temporarily unavailable. Using standard recommendations.");
    setAiRecommendations(generateFallbackRecommendations());
  } finally {
    setIsLoadingAi(false);
  }
};
    if (Object.keys(predictions).length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">No Prediction Data Found</h2>
          <button 
            onClick={() => navigate('/groundwater/level_predict')}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
          >
            Go Back to Predictor
          </button>
        </div>
      </div>
    );
  }

  const { state, district, tehsil, village, year } = formData;
  const targetYear = parseInt(year);

  // Filter out null predictions and prepare data for chart
  const validPredictions = Object.entries(predictions).filter(([_, value]) => value && value.predicted_gwl !== null);
  
  if (validPredictions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Location Not Found in Database</h2>
          <p className="text-gray-600 mb-4">The selected location ({village}, {tehsil}, {district}, {state}) was not found in our database.</p>
          <button 
            onClick={() => navigate('/groundwater/level_predict')}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
          >
            Try Another Location
          </button>
        </div>
      </div>
    );
  }

  const years = validPredictions.map(([year]) => parseInt(year)).sort((a, b) => a - b);
  const levels = validPredictions.map(([_, prediction]) => prediction.predicted_gwl);
  
  // Calculate correct trend based on water level changes
  const calculateTrends = (waterLevels) => {
    const trends = [];
    
    for (let i = 0; i < waterLevels.length; i++) {
      if (i === 0) {
        trends.push('Improving');
      } else {
        const currentLevel = waterLevels[i];
        const previousLevel = waterLevels[i - 1];
        
        // Decreasing water level (shallower) = IMPROVING
        // Increasing water level (deeper) = WORSENING
        if (currentLevel < previousLevel) {
          trends.push('Improving');
        } else if (currentLevel > previousLevel) {
          trends.push('Worsening');
        } else {
          trends.push('Stable');
        }
      }
    }
    
    return trends;
  };
  
  const trends = calculateTrends(levels);

  // Get current year prediction with safety check
  const currentPrediction = predictions[targetYear];
  if (!currentPrediction || currentPrediction.predicted_gwl === null || currentPrediction.predicted_gwl === undefined) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Prediction Data Error</h2>
          <p className="text-gray-600 mb-4">Unable to get prediction data for the selected year ({targetYear}).</p>
          <button 
            onClick={() => navigate('/groundwater/level_predict')}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }
    // Determine water level status and color (LOWER values are BETTER)
  const getWaterLevelStatus = (level) => {
    if (level < 5) return { status: "Excellent", color: "green", description: "Very good groundwater level. Sustainable for usage." };
    if (level < 10) return { status: "Good", color: "blue", description: "Good groundwater level. Sustainable usage possible." };
    if (level < 15) return { status: "Moderate", color: "yellow", description: "Moderate groundwater level. Conservation recommended." };
    return { status: "Critical", color: "red", description: "Very low groundwater level. Immediate conservation needed." };
  };

  // Water conservation tips based on water status
  const getConservationTips = (status, trend) => {
    const baseTips = {
      Excellent: [
        "💧 Maintain current conservation practices",
        "🌱 Continue sustainable water usage patterns",
        "📊 Regular monitoring to maintain excellent levels",
        "🌳 Promote watershed protection initiatives"
      ],
      Good: [
        "💧 Fix leaky faucets and pipes promptly",
        "🚿 Install water-efficient showerheads",
        "🌱 Use native plants in landscaping",
        "🕒 Water plants during cooler hours to reduce evaporation"
      ],
      Moderate: [
        "💧 Implement rainwater harvesting systems",
        "🚰 Use drip irrigation for gardens and farms",
        "🔄 Reuse greywater for non-potable purposes",
        "📉 Reduce outdoor water usage by 25%"
      ],
      Critical: [
        "🚨 Implement emergency water conservation measures",
        "💧 Strictly limit non-essential water usage",
        "🌾 Shift to drought-resistant crops",
        "🏭 Coordinate with local industries for water rationing",
        "🚰 Prioritize drinking water over other uses"
      ]
    };

    const trendTips = {
      Improving: [
        "✅ Current conservation efforts are working",
        "📈 Continue current practices to maintain improvement",
        "🌧️ Recent rainfall may be helping recovery"
      ],
      Worsening: [
        "⚠️ Intensify conservation efforts immediately",
        "🔍 Investigate potential sources of water loss",
        "📢 Community awareness campaigns needed"
      ],
      Stable: [
        "🔄 Maintain current conservation practices",
        "📊 Continue monitoring water levels regularly",
        "🌱 Consider additional conservation measures to improve further"
      ]
    };

    return {
      baseTips: baseTips[status] || [],
      trendTips: trendTips[trend] || []
    };
  };

  // Function to geocode location using OpenCage API
  const geocodeLocation = async (query) => {
    try {
      const response = await fetch(
        `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(query)}&key=${OPENCAGE_API_KEY}&limit=1`
      );
      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        return data.results[0].geometry;
      }
      return null;
    } catch (error) {
      console.error("Geocoding error:", error);
      return null;
    }
  };
    // Function to generate map data using OpenCage API
  const getMapData = async () => {
    try {
      // Geocode the main location
      const mainQuery = `${village}, ${tehsil}, ${district}, ${state}, India`;
      const mainCoords = await geocodeLocation(mainQuery);
      
      if (!mainCoords) {
        throw new Error("Could not geocode main location");
      }

      // Get current trend
      const currentYearIndex = years.indexOf(targetYear);
      const currentTrend = trends[currentYearIndex];

      // Generate nearby locations
      const nearbyLocations = [
        {
          village: `${village} North`,
          tehsil: tehsil,
          district: district,
          state: state,
          waterLevel: (currentPrediction.predicted_gwl + 2).toFixed(1),
          status: getWaterLevelStatus(currentPrediction.predicted_gwl + 2).status,
          trend: Math.random() > 0.5 ? 'Improving' : 'Worsening',
          lat: mainCoords.lat + 0.05,
          lng: mainCoords.lng
        },
        {
          village: `${village} South`,
          tehsil: tehsil,
          district: district,
          state: state,
          waterLevel: (currentPrediction.predicted_gwl - 1.5).toFixed(1),
          status: getWaterLevelStatus(currentPrediction.predicted_gwl - 1.5).status,
          trend: Math.random() > 0.5 ? 'Improving' : 'Worsening',
          lat: mainCoords.lat - 0.05,
          lng: mainCoords.lng
        },
        {
          village: `${tehsil} West`,
          tehsil: tehsil,
          district: district,
          state: state,
          waterLevel: (currentPrediction.predicted_gwl + 3).toFixed(1),
          status: getWaterLevelStatus(currentPrediction.predicted_gwl + 3).status,
          trend: Math.random() > 0.5 ? 'Improving' : 'Worsening',
          lat: mainCoords.lat,
          lng: mainCoords.lng - 0.05
        },
        {
          village: `${tehsil} East`,
          tehsil: tehsil,
          district: district,
          state: state,
          waterLevel: (currentPrediction.predicted_gwl - 2.5).toFixed(1),
          status: getWaterLevelStatus(currentPrediction.predicted_gwl - 2.5).status,
          trend: Math.random() > 0.5 ? 'Improving' : 'Worsening',
          lat: mainCoords.lat,
          lng: mainCoords.lng + 0.05
        }
      ];

      return [
        {
          village: village,
          tehsil: tehsil,
          district: district,
          state: state,
          waterLevel: currentPrediction.predicted_gwl,
          status: waterStatus.status,
          trend: currentTrend,
          lat: mainCoords.lat,
          lng: mainCoords.lng
        },
        ...nearbyLocations
      ];
    } catch (error) {
      console.error("Error generating map data:", error);
      throw error;
    }
  };

  // Fallback function to generate sample map data if API fails
  const generateSampleMapData = () => {
    // Generate dynamic coordinates based on village name
    const generateCoordsFromName = (name, baseLat, baseLng, spread = 0.2) => {
      let hash = 0;
      for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
      }
      
      const latVariation = ((hash % 100) / 1000) * spread;
      const lngVariation = (((hash >> 8) % 100) / 1000) * spread;
      
      return {
        lat: baseLat + latVariation,
        lng: baseLng + lngVariation
      };
    };

    // Get base coordinates based on state (approximate centers)
    const getStateCenter = (stateName) => {
      const stateCenters = {
        'assam': { lat: 26.2006, lng: 92.9376 },
        'maharashtra': { lat: 19.7515, lng: 75.7139 },
        'uttar pradesh': { lat: 26.8467, lng: 80.9462 },
        'bihar': { lat: 25.0961, lng: 85.3131 },
        'west bengal': { lat: 22.9868, lng: 87.8550 },
        'tamil nadu': { lat: 11.1271, lng: 78.6569 },
        'kerala': { lat: 10.8505, lng: 76.2711 },
        'karnataka': { lat: 15.3173, lng: 75.7139 },
        'rajasthan': { lat: 27.0238, lng: 74.2179 },
        'gujarat': { lat: 22.2587, lng: 71.1924 },
        'punjab': { lat: 31.1471, lng: 75.3412 },
        'haryana': { lat: 29.0588, lng: 76.0856 },
      };
      
      const normalizedState = stateName.toLowerCase().trim();
      return stateCenters[normalizedState] || { lat: 20.5937, lng: 78.9629 };
    };

    const stateCenter = getStateCenter(state);
    const mainCoords = generateCoordsFromName(village, stateCenter.lat, stateCenter.lng, 1);

    // Get current trend
    const currentYearIndex = years.indexOf(targetYear);
    const currentTrend = trends[currentYearIndex];

    return [
      {
        village: village,
        tehsil: tehsil,
        district: district,
        state: state,
        waterLevel: currentPrediction.predicted_gwl,
        status: waterStatus.status,
        trend: currentTrend,
        lat: mainCoords.lat,
        lng: mainCoords.lng
      },
      {
        village: `${village} North`,
        tehsil: tehsil,
        district: district,
        state: state,
        waterLevel: (currentPrediction.predicted_gwl + 2).toFixed(1),
        status: getWaterLevelStatus(currentPrediction.predicted_gwl + 2).status,
        trend: Math.random() > 0.5 ? 'Improving' : 'Worsening',
        lat: mainCoords.lat + 0.2,
        lng: mainCoords.lng
      },
      {
        village: `${village} South`,
        tehsil: tehsil,
        district: district,
        state: state,
        waterLevel: (currentPrediction.predicted_gwl - 1.5).toFixed(1),
        status: getWaterLevelStatus(currentPrediction.predicted_gwl - 1.5).status,
        trend: Math.random() > 0.5 ? 'Improving' : 'Worsening',
        lat: mainCoords.lat - 0.2,
        lng: mainCoords.lng
      },
      {
        village: `${tehsil} West`,
        tehsil: tehsil,
        district: district,
        state: state,
        waterLevel: (currentPrediction.predicted_gwl + 3).toFixed(1),
        status: getWaterLevelStatus(currentPrediction.predicted_gwl + 3).status,
        trend: Math.random() > 0.5 ? 'Improving' : 'Worsening',
        lat: mainCoords.lat,
        lng: mainCoords.lng - 0.2
      },
      {
        village: `${tehsil} East`,
        tehsil: tehsil,
        district: district,
        state: state,
        waterLevel: (currentPrediction.predicted_gwl - 2.5).toFixed(1),
        status: getWaterLevelStatus(currentPrediction.predicted_gwl - 2.5).status,
        trend: Math.random() > 0.5 ? 'Improving' : 'Worsening',
        lat: mainCoords.lat,
        lng: mainCoords.lng + 0.2
      }
    ];
  };

  const waterStatus = getWaterLevelStatus(currentPrediction.predicted_gwl);

  // Calculate water status distribution for pie chart
  const statusCounts = {
    Excellent: 0,
    Good: 0,
    Moderate: 0,
    Critical: 0
  };

  validPredictions.forEach(([_, prediction]) => {
    const status = getWaterLevelStatus(prediction.predicted_gwl).status;
    statusCounts[status]++;
  });

  // Get current trend
  const currentYearIndex = years.indexOf(targetYear);
  const currentTrend = trends[currentYearIndex];
  // part - 7
      // Line Chart Data
  const lineChartData = {
    labels: years.map(y => y.toString()),
    datasets: [
      {
        label: 'Depth to Water Table (meters)',
        data: levels,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 3,
        pointBackgroundColor: levels.map(level => {
          if (level < 5) return 'rgb(34, 197, 94)';
          if (level < 10) return 'rgb(59, 130, 246)';
          if (level < 15) return 'rgb(234, 179, 8)';
          return 'rgb(239, 68, 68)';
        }),
        pointBorderColor: levels.map(level => {
          if (level < 5) return 'rgb(34, 197, 94)';
          if (level < 10) return 'rgb(59, 130, 246)';
          if (level < 15) return 'rgb(234, 179, 8)';
          return 'rgb(239, 68, 68)';
        }),
        pointRadius: years.map(y => y === targetYear ? 6 : 4),
        pointHoverRadius: 8,
        fill: true,
        tension: 0.3,
      },
    ],
  };

  const lineChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: `Groundwater Level Trend (${years[0]} - ${years[years.length - 1]})`,
        font: {
          size: 16,
          weight: 'bold'
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Depth to Water Table (meters)'
        },
        suggestedMax: Math.max(...levels) * 1.2
      },
      x: {
        title: {
          display: true,
          text: 'Year'
        }
      }
    },
  };

  // Bar Chart Data - Yearly Comparison
  const barChartData = {
    labels: years.map(y => y.toString()),
    datasets: [
      {
        label: 'Water Depth (meters)',
        data: levels,
        backgroundColor: levels.map(level => {
          if (level < 5) return 'rgba(34, 197, 94, 0.7)';
          if (level < 10) return 'rgba(59, 130, 246, 0.7)';
          if (level < 15) return 'rgba(234, 179, 8, 0.7)';
          return 'rgba(239, 68, 68, 0.7)';
        }),
        borderColor: levels.map(level => {
          if (level < 5) return 'rgb(34, 197, 94)';
          if (level < 10) return 'rgb(59, 130, 246)';
          if (level < 15) return 'rgb(234, 179, 8)';
          return 'rgb(239, 68, 68)';
        }),
        borderWidth: 2,
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Yearly Groundwater Level Comparison',
        font: {
          size: 16,
          weight: 'bold'
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Depth to Water Table (meters)'
        }
      },
    },
  };

  // Pie Chart Data - Status Distribution
  const pieChartData = {
    labels: ['Excellent (<5m)', 'Good (5-10m)', 'Moderate (10-15m)', 'Critical (>15m)'],
    datasets: [
      {
        data: [statusCounts.Excellent, statusCounts.Good, statusCounts.Moderate, statusCounts.Critical],
        backgroundColor: [
          'rgba(34, 197, 94, 0.7)',
          'rgba(59, 130, 246, 0.7)',
          'rgba(234, 179, 8, 0.7)',
          'rgba(239, 68, 68, 0.7)'
        ],
        borderColor: [
          'rgb(34, 197, 94)',
          'rgb(59, 130, 246)',
          'rgb(234, 179, 8)',
          'rgb(239, 68, 68)'
        ],
        borderWidth: 2,
      },
    ],
  };

  const pieChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Water Status Distribution (7 Years)',
        font: {
          size: 16,
          weight: 'bold'
        }
      },
    },
  };

  // Prepare data for 3D visualization
  const aquiferData = {
    currentLevel: currentPrediction.predicted_gwl,
    historicalLevels: levels,
    years: years,
    status: waterStatus.status,
    location: { village, tehsil, district, state }
  };
  // part - 8
    return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Groundwater Trend Analysis</h1>
          <p className="text-gray-600">Historical and Projected Groundwater Levels for {village}, {tehsil}</p>
        </div>

        {/* Location Details */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Location Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div><strong>State:</strong> {state}</div>
            <div><strong>District:</strong> {district}</div>
            <div><strong>Tehsil:</strong> {tehsil}</div>
            <div><strong>Village:</strong> {village}</div>
            <div><strong>Target Year:</strong> {year}</div>
            <div><strong>Analysis Period:</strong> {years[0]} - {years[years.length - 1]}</div>
          </div>
        </div>

        {/* Current Year Summary */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">{year} Prediction Summary</h2>
          
          {/* Status Card */}
          <div className={`border-l-4 border-${waterStatus.color}-500 bg-${waterStatus.color}-50 p-4 rounded mb-4`}>
            <h3 className={`text-${waterStatus.color}-800 font-semibold mb-2`}>
              Water Level Status: {waterStatus.status}
            </h3>
            <p className={`text-${waterStatus.color}-700`}>{waterStatus.description}</p>
          </div>

          {/* Trend Indicator */}
          <div className="flex items-center justify-center mb-4">
            <span className="text-lg font-semibold mr-2">Trend:</span>
            <span className={`text-${currentTrend === 'Improving' ? 'green' : currentTrend === 'Worsening' ? 'red' : 'gray'}-600 font-bold flex items-center`}>
              {currentTrend === 'Improving' ? (
                <>
                  <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Improving (Water table rising)
                </>
              ) : currentTrend === 'Worsening' ? (
                <>
                  <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  Worsening (Water table falling)
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V7z" clipRule="evenodd" />
                  </svg>
                  Stable (No significant change)
                </>
              )}
            </span>
          </div>

          <div className="text-center">
            <p className="text-2xl font-bold text-gray-800">
              Predicted Depth: <span className="text-blue-600">{currentPrediction.predicted_gwl} meters</span>
            </p>
          </div>
        </div>

        {/* Chart Grid - 3 Visualizations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Line Chart */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Groundwater Level Trend</h2>
            <div className="h-80">
              <Line data={lineChartData} options={lineChartOptions} />
            </div>
          </div>

          {/* Bar Chart */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Yearly Comparison</h2>
            <div className="h-80">
              <Bar data={barChartData} options={barChartOptions} />
            </div>
          </div>

          {/* Pie Chart - Full width on mobile, then takes 2 columns on larger screens */}
          <div className="bg-white rounded-lg shadow-md p-6 lg:col-span-2">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Water Status Distribution</h2>
            <div className="h-80 mx-auto" style={{ maxWidth: '500px' }}>
              <Pie data={pieChartData} options={pieChartOptions} />
            </div>
            <div className="mt-4 text-center text-sm text-gray-600">
              <p>Distribution of water status categories across all {validPredictions.length} years analyzed</p>
            </div>
          </div>
        </div>

        {/* 3D Aquifer Visualization */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">3D Aquifer Visualization</h2>
          <p className="text-gray-600 mb-4">
            Explore the groundwater aquifer structure in 3D. This visualization shows the water table depth
            and how it changes over time.
          </p>
          
          <div className="h-96 rounded-lg overflow-hidden border border-gray-200">
            <Aquifer3DVisualization data={aquiferData} />
          </div>
          
          <div className="mt-4 flex justify-center">
            <button 
              onClick={() => setShow3D(!show3D)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              {show3D ? 'Hide Controls' : 'Show 3D Controls'}
            </button>
          </div>
        </div>
                {/* AI-Powered Recommendations */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-800 rounded-full mr-2">
              🤖
            </span>
            AI-Powered Recommendations
          </h2>
          
          {isLoadingAi ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">AI is analyzing your groundwater data...</p>
            </div>
          ) : aiError ? (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
              <p className="text-yellow-700">{aiError}</p>
            </div>
          ) : null}
          
          {aiRecommendations && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Short Term Recommendations */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-3 flex items-center">
                  <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-800 rounded-full text-sm mr-2">
                    ⚡
                  </span>
                  Short-Term Actions
                </h3>
                <ul className="space-y-2">
                  {aiRecommendations.shortTerm.map((recommendation, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span className="text-blue-700 text-sm">{recommendation}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Long Term Recommendations */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-800 mb-3 flex items-center">
                  <span className="inline-flex items-center justify-center w-6 h-6 bg-green-100 text-green-800 rounded-full text-sm mr-2">
                    📈
                  </span>
                  Long-Term Strategies
                </h3>
                <ul className="space-y-2">
                  {aiRecommendations.longTerm.map((recommendation, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-green-600 mr-2">•</span>
                      <span className="text-green-700 text-sm">{recommendation}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Community Actions */}
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-semibold text-purple-800 mb-3 flex items-center">
                  <span className="inline-flex items-center justify-center w-6 h-6 bg-purple-100 text-purple-800 rounded-full text-sm mr-2">
                    👥
                  </span>
                  Community Actions
                </h3>
                <ul className="space-y-2">
                  {aiRecommendations.communityActions.map((recommendation, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-purple-600 mr-2">•</span>
                      <span className="text-purple-700 text-sm">{recommendation}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Technical Solutions */}
              <div className="bg-orange-50 p-4 rounded-lg">
                <h3 className="font-semibold text-orange-800 mb-3 flex items-center">
                  <span className="inline-flex items-center justify-center w-6 h-6 bg-orange-100 text-orange-800 rounded-full text-sm mr-2">
                    🔧
                  </span>
                  Technical Solutions
                </h3>
                <ul className="space-y-2">
                  {aiRecommendations.technicalSolutions.map((recommendation, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-orange-600 mr-2">•</span>
                      <span className="text-orange-700 text-sm">{recommendation}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          
          <div className="mt-6 text-center">
            <button 
              onClick={fetchAIRecommendations}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center mx-auto"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Regenerate Recommendations
            </button>
          </div>
        </div>
                {/* Detailed Predictions Table */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Detailed Predictions</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 text-left">Year</th>
                  <th className="px-4 py-2 text-left">Depth to Water (m)</th>
                  <th className="px-4 py-2 text-left">Trend</th>
                  <th className="px-4 py-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {validPredictions.map(([year, prediction], index) => {
                  const status = getWaterLevelStatus(prediction.predicted_gwl);
                  const trend = trends[index];
                  
                  return (
                    <tr key={year} className={parseInt(year) === targetYear ? "bg-blue-50 font-semibold" : "even:bg-gray-50"}>
                      <td className="border px-4 py-2">{year}{parseInt(year) === targetYear ? " (Selected)" : ""}</td>
                      <td className="border px-4 py-2">{prediction.predicted_gwl}m</td>
                      <td className="border px-4 py-2">
                        <span className={`flex items-center ${
                          trend === 'Improving' ? 'text-green-600' : 
                          trend === 'Worsening' ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {trend === 'Improving' ? '↗ Improving' : 
                           trend === 'Worsening' ? '↘ Worsening' : '→ Stable'}
                        </span>
                      </td>
                      <td className="border px-4 py-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium bg-${status.color}-100 text-${status.color}-800`}>
                          {status.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 flex-wrap">
          <button 
            onClick={() => navigate('/groundwater/level_predict')}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Make Another Prediction
          </button>
          <button 
            onClick={() => window.print()}
            className="bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700 transition-colors"
          >
            Print Report
          </button>
          <button 
            onClick={() => setShowMap(!showMap)}
            className="bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700 transition-colors"
          >
            {showMap ? 'Hide Map' : 'View on Map'}
          </button>
        </div>

        {/* Interactive Map */}
        {showMap && (
          <div className="bg-white rounded-lg shadow-md p-6 mt-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              🗺️ Location Map - Groundwater Status
            </h2>
            <p className="text-gray-600 mb-4">
              Interactive map showing groundwater status in {village} and surrounding areas. 
              Click on markers for details.
            </p>
            
            {isLoadingMap ? (
              <div className="h-96 flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading map data...</p>
                </div>
              </div>
            ) : (
              <>
                <WaterLevelMap 
                  locations={mapData}
                  selectedLocation={{
                    village: village,
                    tehsil: tehsil,
                    district: district,
                    state: state
                  }}
                  onLocationSelect={(location) => {
                    console.log('Selected location:', location);
                  }}
                />
                
                <div className="mt-4 flex items-center justify-center space-x-4 text-sm flex-wrap">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
                    <span>Excellent</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-blue-500 rounded-full mr-2"></div>
                    <span>Good</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-yellow-500 rounded-full mr-2"></div>
                    <span>Moderate</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
                    <span>Critical</span>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GroundwaterResult;