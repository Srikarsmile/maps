import React, { useEffect, useRef, useImperativeHandle, forwardRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Set Mapbox access token from environment variable
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';

interface MapPanelProps {
  className?: string;
}

export interface MapPanelRef {
  updateHexes: (hexGeoJson: any) => void;
  getCurrentLocation: () => void;
  searchLocation: (coordinates: [number, number], name: string) => void;
}

const MapPanel = forwardRef<MapPanelRef, MapPanelProps>(({ className = '' }, ref) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const userLocationMarker = useRef<mapboxgl.Marker | null>(null);
  const searchMarker = useRef<mapboxgl.Marker | null>(null);
  const hexesSourceId = 'hexes';
  const hexesLayerId = 'hexes-layer';
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [-74.5, 40], // Default center (you can adjust)
      zoom: 9
    });

    map.current.on('load', () => {
      if (!map.current) return;

      // Add hexes source
      map.current.addSource(hexesSourceId, {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: []
        }
      });

      // Add hexes layer
      map.current.addLayer({
        id: hexesLayerId,
        type: 'fill',
        source: hexesSourceId,
        paint: {
          'fill-color': [
            'case',
            ['has', 'density'],
            [
              'interpolate',
              ['linear'],
              ['get', 'density'],
              0, '#313695',
              50, '#4575b4',
              100, '#74add1',
              150, '#abd9e9',
              200, '#e0f3f8',
              250, '#ffffcc',
              300, '#fee090',
              350, '#fdae61',
              400, '#f46d43',
              450, '#d73027',
              500, '#a50026'
            ],
            '#313695'
          ],
          'fill-opacity': 0.7
        }
      });

      // Add hexes border layer
      map.current.addLayer({
        id: `${hexesLayerId}-border`,
        type: 'line',
        source: hexesSourceId,
        paint: {
          'line-color': '#ffffff',
          'line-width': 1,
          'line-opacity': 0.5
        }
      });
    });

    return () => {
      if (userLocationMarker.current) {
        userLocationMarker.current.remove();
      }
      if (searchMarker.current) {
        searchMarker.current.remove();
      }
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  const updateHexes = (hexGeoJson: any) => {
    if (map.current && map.current.isStyleLoaded()) {
      const source = map.current.getSource(hexesSourceId) as mapboxgl.GeoJSONSource;
      if (source) {
        source.setData(hexGeoJson);
      }
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser.');
      return;
    }

    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        
        if (map.current) {
          // Remove existing marker if it exists
          if (userLocationMarker.current) {
            userLocationMarker.current.remove();
          }

          // Create a custom marker element
          const markerElement = document.createElement('div');
          markerElement.className = 'user-location-marker';
          markerElement.style.cssText = `
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background-color: #007cbf;
            border: 3px solid #ffffff;
            box-shadow: 0 0 10px rgba(0, 124, 191, 0.5);
            cursor: pointer;
          `;

          // Add the marker to the map
          userLocationMarker.current = new mapboxgl.Marker(markerElement)
            .setLngLat([longitude, latitude])
            .addTo(map.current);

          // Fly to the user's location
          map.current.flyTo({
            center: [longitude, latitude],
            zoom: 15,
            duration: 2000
          });

          // Add a popup with location info
          const popup = new mapboxgl.Popup({ 
            offset: 25,
            className: 'liquid-glass-popup'
          })
            .setHTML(`
              <div style="
                padding: 12px; 
                background: linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%);
                backdrop-filter: blur(20px);
                border: 1px solid rgba(255,255,255,0.2);
                border-radius: 12px;
                box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
                color: white;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
              ">
                <strong style="color: #fff; font-size: 14px;">Your Location</strong><br/>
                <small style="color: rgba(255,255,255,0.8); font-size: 12px;">
                  Lat: ${latitude.toFixed(6)}<br/>
                  Lng: ${longitude.toFixed(6)}
                </small>
              </div>
            `);

          userLocationMarker.current.setPopup(popup);
        }
      },
      (error) => {
        let errorMessage = 'Unable to get your location.';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied by user.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.';
            break;
        }
        setLocationError(errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  const searchLocation = (coordinates: [number, number], name: string) => {
    const performSearch = () => {
      if (!map.current) {
        return;
      }
      
      // Remove existing search marker if it exists
      if (searchMarker.current) {
        searchMarker.current.remove();
      }

      // Create a custom marker element for search results
      const markerElement = document.createElement('div');
      markerElement.className = 'search-location-marker';
      markerElement.style.cssText = `
        width: 30px;
        height: 30px;
        border-radius: 15px 15px 15px 0;
        background-color: #ef4444;
        border: 3px solid #ffffff;
        box-shadow: 0 0 10px rgba(239, 68, 68, 0.5);
        cursor: pointer;
        transform: rotate(-45deg);
        position: relative;
      `;

      // Add inner circle
      const innerCircle = document.createElement('div');
      innerCircle.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        width: 12px;
        height: 12px;
        background-color: #ffffff;
        border-radius: 50%;
        transform: translate(-50%, -50%) rotate(45deg);
      `;
      markerElement.appendChild(innerCircle);

      // Add the marker to the map
      searchMarker.current = new mapboxgl.Marker(markerElement)
        .setLngLat(coordinates)
        .addTo(map.current);

      // Fly to the search location
      map.current.flyTo({
        center: coordinates,
        zoom: 14,
        duration: 2000
      });

      // Add a popup with location info
      const popup = new mapboxgl.Popup({ 
        offset: 25,
        className: 'liquid-glass-popup'
      })
        .setHTML(`
          <div style="
            padding: 12px; 
            max-width: 250px;
            background: linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255,255,255,0.2);
            border-radius: 12px;
            box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
            color: white;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
          ">
            <strong style="color: #fff; font-size: 14px;">${name}</strong><br/>
            <small style="color: rgba(255,255,255,0.8); font-size: 12px;">
              Lat: ${coordinates[1].toFixed(6)}<br/>
              Lng: ${coordinates[0].toFixed(6)}
            </small>
          </div>
        `);

      searchMarker.current.setPopup(popup);
      
      // Auto-open the popup
      setTimeout(() => {
        if (searchMarker.current) {
          searchMarker.current.togglePopup();
        }
      }, 2500);
    };

    // Try to perform search immediately or with delay
    if (map.current) {
      if (map.current.loaded() && map.current.isStyleLoaded()) {
        performSearch();
      } else {
        setTimeout(() => {
          performSearch();
        }, 1000);
      }
    }
  };

  useImperativeHandle(ref, () => ({
    updateHexes,
    getCurrentLocation,
    searchLocation
  }));

  return (
    <div className={`relative w-full h-full ${className}`}>
      <div 
        ref={mapContainer} 
        className="w-full h-full"
      />
      {locationError && (
        <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-2 rounded-lg shadow-lg text-sm z-10">
          {locationError}
        </div>
      )}
    </div>
  );
});

MapPanel.displayName = 'MapPanel';

export default MapPanel; 