import React, { useEffect, useRef, useState } from 'react';
import MapPanel, { MapPanelRef } from '../components/MapPanel';
import GlassContainer from '../components/GlassContainer';
import OfferCard from '../components/OfferCard';
import HexTooltip from '../components/HexTooltip';
import SearchBar from '../components/SearchBar';

// Fake pings data - in-memory array
const fakePings = [
  { lat: 40.7128, lng: -74.0060, density: 150, hexId: 'hex_001' },
  { lat: 40.7589, lng: -73.9851, density: 200, hexId: 'hex_002' },
  { lat: 40.7505, lng: -73.9934, density: 300, hexId: 'hex_003' },
  { lat: 40.7829, lng: -73.9654, density: 100, hexId: 'hex_004' },
  { lat: 40.7549, lng: -73.9840, density: 250, hexId: 'hex_005' },
  { lat: 40.7614, lng: -73.9776, density: 180, hexId: 'hex_006' },
  { lat: 40.7484, lng: -73.9857, density: 220, hexId: 'hex_007' },
  { lat: 40.7505, lng: -73.9934, density: 175, hexId: 'hex_008' },
  { lat: 40.7589, lng: -73.9851, density: 190, hexId: 'hex_009' },
  { lat: 40.7128, lng: -74.0060, density: 140, hexId: 'hex_010' },
];

// Function to generate hexagon GeoJSON from coordinates
const generateHexGeoJson = (pings: typeof fakePings) => {
  const features = pings.map((ping, index) => {
    // Simple hexagon generation (you might want to use a proper hexagon library)
    const hexSize = 0.01; // Adjust based on your needs
    const center = [ping.lng, ping.lat];
    
    // Generate hexagon coordinates
    const hexCoords = [];
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      const x = center[0] + hexSize * Math.cos(angle);
      const y = center[1] + hexSize * Math.sin(angle);
      hexCoords.push([x, y]);
    }
    hexCoords.push(hexCoords[0]); // Close the polygon

    return {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [hexCoords]
      },
      properties: {
        density: ping.density,
        hexId: ping.hexId,
        coordinates: [ping.lng, ping.lat]
      }
    };
  });

  return {
    type: 'FeatureCollection',
    features
  };
};

const IndexPage: React.FC = () => {
  const mapPanelRef = useRef<MapPanelRef>(null);
  const [currentPings, setCurrentPings] = useState(fakePings);
  const [tooltipData, setTooltipData] = useState<{
    isVisible: boolean;
    x: number;
    y: number;
    hexData?: any;
  }>({
    isVisible: false,
    x: 0,
    y: 0
  });

  // Handle location search
  const handleLocationSelect = (location: { name: string; coordinates: [number, number] }) => {
    if (mapPanelRef.current) {
      mapPanelRef.current.searchLocation(location.coordinates, location.name);
    }
  };

  useEffect(() => {
    // Update hexes every 3 seconds
    const interval = setInterval(() => {
      // Simulate some variation in the data
      const updatedPings = currentPings.map(ping => ({
        ...ping,
        density: Math.max(0, ping.density + (Math.random() - 0.5) * 50)
      }));
      
      setCurrentPings(updatedPings);
      
      // Generate and update hex GeoJSON
      const hexGeoJson = generateHexGeoJson(updatedPings);
      if (mapPanelRef.current) {
        mapPanelRef.current.updateHexes(hexGeoJson);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [currentPings]);

  // Initial hex update
  useEffect(() => {
    const hexGeoJson = generateHexGeoJson(currentPings);
    if (mapPanelRef.current) {
      mapPanelRef.current.updateHexes(hexGeoJson);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />
      </div>

      <div className="relative z-10 p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Maps Dashboard</h1>
              <p className="text-white/70">Real-time hexagon density visualization</p>
            </div>
            <div className="lg:w-96">
              <SearchBar 
                onLocationSelect={handleLocationSelect}
                className="w-full"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Map Panel - takes up most of the space */}
          <div className="lg:col-span-3">
            <GlassContainer className="h-[600px] p-4 relative glass-float">
              <MapPanel 
                ref={mapPanelRef}
                className="w-full h-full rounded-xl"
              />
              {/* Location Button */}
              <button
                onClick={() => mapPanelRef.current?.getCurrentLocation()}
                className="absolute bottom-6 right-6 bg-white/20 backdrop-blur-md hover:bg-white/30 text-white p-3 rounded-full shadow-2xl border border-white/30 transition-all duration-200 z-10 group hover:scale-105"
                title="Get my location"
              >
                <svg 
                  className="w-6 h-6" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" 
                  />
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" 
                  />
                </svg>
                <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-black/40 backdrop-blur-md text-white text-xs rounded-lg border border-white/20 opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap shadow-xl">
                  Find my location
                </div>
              </button>
            </GlassContainer>
          </div>

          {/* Sidebar with offers */}
          <div className="space-y-4">
            <GlassContainer className="p-4 glass-shimmer relative overflow-hidden">
              <h2 className="text-xl font-semibold text-white mb-4">Active Offers</h2>
              <div className="space-y-3">
                <OfferCard 
                  title="Premium Plan"
                  description="Enhanced analytics and real-time updates"
                />
                <OfferCard 
                  title="Basic Plan"
                  description="Standard mapping features"
                />
                <OfferCard 
                  title="Enterprise"
                  description="Custom solutions for large organizations"
                />
              </div>
            </GlassContainer>

            {/* Stats Panel */}
            <GlassContainer className="p-4 glass-float">
              <h3 className="text-lg font-semibold text-white mb-3">Statistics</h3>
              <div className="space-y-2 text-white/80">
                <div className="flex justify-between">
                  <span>Total Hexes:</span>
                  <span className="font-semibold">{currentPings.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Avg Density:</span>
                  <span className="font-semibold">
                    {Math.round(currentPings.reduce((sum, ping) => sum + ping.density, 0) / currentPings.length)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Max Density:</span>
                  <span className="font-semibold">
                    {Math.max(...currentPings.map(ping => ping.density))}
                  </span>
                </div>
              </div>
            </GlassContainer>
          </div>
        </div>
      </div>

      {/* Tooltip */}
      <HexTooltip 
        isVisible={tooltipData.isVisible}
        x={tooltipData.x}
        y={tooltipData.y}
        hexData={tooltipData.hexData}
      />
    </div>
  );
};

export default IndexPage; 