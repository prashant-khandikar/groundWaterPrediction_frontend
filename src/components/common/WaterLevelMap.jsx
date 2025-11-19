// import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
// import 'leaflet/dist/leaflet.css';
// import L from 'leaflet';

// // Fix for default markers in react-leaflet
// delete L.Icon.Default.prototype._getIconUrl;
// L.Icon.Default.mergeOptions({
//   iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
//   iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
//   shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
// });

// const WaterLevelMap = ({ locations, selectedLocation, onLocationSelect }) => {
//   // Default center (India)
//   const defaultCenter = [20.5937, 78.9629];

//   // Custom icons based on water status
//   const createCustomIcon = (status) => {
//     const iconColor = {
//       Excellent: 'green',
//       Good: 'blue',
//       Moderate: 'orange',
//       Critical: 'red'
//     }[status];

//     return L.divIcon({
//       className: 'custom-marker',
//       html: `<div style="background-color: ${iconColor}; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>`,
//       iconSize: [20, 20],
//       iconAnchor: [10, 10],
//     });
//   };

//   return (
//     <div className="h-96 w-full rounded-lg overflow-hidden">
//       <MapContainer
//         center={defaultCenter}
//         zoom={5}
//         style={{ height: '100%', width: '100%' }}
//         scrollWheelZoom={false}
//       >
//         <TileLayer
//           attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
//           url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//         />
        
//         {locations.map((location, index) => (
//           <Marker
//             key={index}
//             position={[location.lat, location.lng]}
//             icon={createCustomIcon(location.status)}
//             eventHandlers={{
//               click: () => onLocationSelect && onLocationSelect(location),
//             }}
//           >
//             <Popup>
//               <div className="p-2">
//                 <h3 className="font-semibold text-lg">{location.village}</h3>
//                 <p className="text-sm text-gray-600">{location.tehsil}, {location.district}</p>
//                 <p className={`text-sm font-medium ${
//                   location.status === 'Excellent' ? 'text-green-600' :
//                   location.status === 'Good' ? 'text-blue-600' :
//                   location.status === 'Moderate' ? 'text-yellow-600' : 'text-red-600'
//                 }`}>
//                   Status: {location.status}
//                 </p>
//                 <p className="text-sm">Water Level: {location.waterLevel}m</p>
//                 <p className="text-sm">Trend: {location.trend}</p>
//               </div>
//             </Popup>
//           </Marker>
//         ))}
//       </MapContainer>
//     </div>
//   );
// };

// export default WaterLevelMap;



import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect, useState } from 'react';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const WaterLevelMap = ({ locations, selectedLocation, onLocationSelect }) => {
  const [isClient, setIsClient] = useState(false);
  
  // Default center (India)
  const defaultCenter = [20.5937, 78.9629];
  const defaultZoom = 5;

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Custom icons based on water status
  const createCustomIcon = (status) => {
    const iconColor = {
      Excellent: '#22c55e', // green-500
      Good: '#3b82f6',     // blue-500
      Moderate: '#f59e0b', // yellow-500
      Critical: '#ef4444'  // red-500
    }[status] || '#6b7280'; // gray-500

    return L.divIcon({
      className: 'custom-marker',
      html: `
        <div style="
          background-color: ${iconColor}; 
          width: 24px; 
          height: 24px; 
          border-radius: 50%; 
          border: 3px solid white; 
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          cursor: pointer;
        "></div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });
  };

  // Find center based on selected location or use default
  const getMapCenter = () => {
    if (selectedLocation && locations.length > 0) {
      const selected = locations.find(loc => 
        loc.village === selectedLocation.village &&
        loc.tehsil === selectedLocation.tehsil
      );
      if (selected) return [selected.lat, selected.lng];
    }
    if (locations.length > 0) return [locations[0].lat, locations[0].lng];
    return defaultCenter;
  };

  const getMapZoom = () => {
    if (locations.length === 1) return 10;
    if (locations.length > 1) return 8;
    return defaultZoom;
  };

  if (!isClient) {
    return (
      <div className="h-96 w-full rounded-lg overflow-hidden border-2 border-gray-200 bg-gray-100 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-96 w-full rounded-lg overflow-hidden border-2 border-gray-200 bg-white">
      <MapContainer
        center={getMapCenter()}
        zoom={getMapZoom()}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {locations.map((location, index) => (
          <Marker
            key={index}
            position={[location.lat, location.lng]}
            icon={createCustomIcon(location.status)}
            eventHandlers={{
              click: () => onLocationSelect && onLocationSelect(location),
            }}
          >
            <Popup>
              <div className="p-3 min-w-[220px]">
                <h3 className="font-semibold text-lg mb-2 text-gray-800">{location.village}</h3>
                <div className="space-y-2 text-sm">
                  <p className="text-gray-600">{location.tehsil}, {location.district}</p>
                  <p className={`font-medium ${
                    location.status === 'Excellent' ? 'text-green-600' :
                    location.status === 'Good' ? 'text-blue-600' :
                    location.status === 'Moderate' ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    Status: {location.status}
                  </p>
                  <p className="text-gray-700">
                    Water Level: <strong>{location.waterLevel}m</strong>
                  </p>
                  <p className="text-gray-700">
                    Trend: 
                    <span className={`ml-1 font-medium ${
                      location.trend === 'Increasing' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {location.trend}
                    </span>
                  </p>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default WaterLevelMap;