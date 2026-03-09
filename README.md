// BusMap.js
import React, { useEffect, useState } from 'react';
import Map, { Marker, NavigationControl } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = 'your_mapbox_token_here';

const BusMap = () => {
  const [buses, setBuses] = useState([]);

  // Mock function to simulate fetching live bus data
  const fetchBusData = async () => {
    // In a real app: const response = await fetch('/api/buses');
    const mockData = [
      { id: 'Bus-101', lat: 45.523062, lng: -122.676482, route: 'Line 12' },
      { id: 'Bus-202', lat: 45.512230, lng: -122.658722, route: 'Line 4' }
    ];
    setBuses(mockData);
  };

  useEffect(() => {
    const interval = setInterval(fetchBusData, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <Map
      initialViewState={{ longitude: -122.67, latitude: 45.52, zoom: 12 }}
      style={{ width: '100vw', height: '100vh' }}
      mapStyle="mapbox://styles/mapbox/streets-v11"
      mapboxAccessToken={MAPBOX_TOKEN}
    >
      <NavigationControl position="top-right" />
      
      {buses.map(bus => (
        <Marker key={bus.id} longitude={bus.lng} latitude={bus.lat}>
          <div className="bus-marker" title={bus.route}>
            🚌 <span style={{ fontSize: '10px' }}>{bus.id}</span>
          </div>
        </Marker>
      ))}
    </Map>
  );
};

export default BusMap;
