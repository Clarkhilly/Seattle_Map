import React, { useRef, useState, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';

const audioFileSrc = "/playlists/InRainbows/Radiohead in Rainbows - From the Basement.mp3"; // Your MP3 file

const center = [-122.2015, 47.6101]; // Centered between Seattle and Bellevue
const defaultBounds = [
  [-122.6, 47.3],    // Southwest (includes Tacoma area)
  [-121.8, 47.9]     // Northeast (includes Redmond, Bothell)
];
const seattleStations = {
  // 1 Line Stations (North to South) - Updated with precise coordinates from OSM data
  "lynnwood": { name: "Lynnwood City Center", coords: [ -122.2947,  47.8156], line: "1" },
  "mountlake": { name: "Mountlake Terrace", coords: [-122.3148749, 47.7846309], line: "1" },
  "shoreline-n": { name: "Shoreline North/185th", coords: [-122.3175, 47.7770], line: "1" },
  "shoreline-s": { name: "Shoreline South/148th", coords: [-122.3251802, 47.7361086], line: "1" },
  "northgate": { name: "Northgate", coords: [-122.3283090, 47.7030260], line: "1" },
  "roosevelt": { name: "Roosevelt", coords: [-122.3160, 47.6761], line: "1" }, 
  "u-district": { name: "U District", coords: [-122.3140450, 47.6604924], line: "1" },
  "university": { name: "University of Washington", coords: [-122.3036900, 47.6498555], line: "1" },
  "capitol-hill": { name: "Capitol Hill", coords: [-122.3201293, 47.6190767], line: "both" },
  "westlake": { name: "Westlake", coords: [-122.3368828, 47.6115534], line: "both" },
  "symphony": { name: "Symphony (University Street)", coords: [-122.3326, 47.6062], line: "both" },
  "pioneer-square": { name: "Pioneer Square", coords: [-122.3317016, 47.6031492], line: "both" },
  "intl-district": { name: "Intl. District/Chinatown", coords: [-122.3289, 47.5952], line: "both" },
  "stadium": { name: "Stadium", coords: [-122.3272659, 47.5911093], line: "1" },
  "sodo": { name: "SODO", coords: [-122.3273765, 47.5812606], line: "1" },
  "beacon-hill": { name: "Beacon Hill", coords: [-122.3116391, 47.5790849], line: "1" },
  "mount-baker": { name: "Mount Baker", coords: [-122.2977276, 47.5765538], line: "1" },
  "columbia-city": { name: "Columbia City", coords: [-122.2927376, 47.5597267], line: "1" },
  "othello": { name: "Othello", coords: [-122.2815569, 47.5380005], line: "1" },
  "rainier-beach": { name: "Rainier Beach", coords: [-122.2794530, 47.5224409], line: "1" },
  "tukwila": { name: "Tukwila International Blvd", coords: [-122.2881, 47.4640], line: "1" },
  "seatac": { name: "SeaTac/Airport", coords: [-122.2968266, 47.4453482], line: "1" },
  "angle-lake": { name: "Angle Lake", coords: [-122.2978768, 47.4224108], line: "1" },
  
  // 2 Line Stations (East Link) 
  "bellevue-downtown": { name: "Bellevue Downtown", coords: [-122.1920, 47.6152], line: "2" },
  "east-main": { name: "East Main", coords: [-122.1911, 47.6081], line: "2" },
  "south-bellevue": { name: "South Bellevue", coords: [-122.1906, 47.5868], line: "2" }, 
  "wilburton": { name: "Wilburton", coords: [ -122.1837, 47.6179], line: "2" }, 
  "spring-district": { name: "Spring District", coords: [-122.1785, 47.6237], line: "2" }, 
  "bel-red": { name: "Bel-Red", coords: [-122.1656, 47.6244], line: "2" }, 
  "overlake-village": { name: "Overlake Village", coords: [-122.1389, 47.6363], line: "2" }, 
  "redmond-tech": { name: "Redmond technology", coords: [-122.1336, 47.6448], line: "2" }, 
  "marymoor village": { name: "Marymoor Village", coords: [-122.1097, 47.667], line: "2" }, 
  "downtown-redmond": { name: "Downtown Redmond", coords: [-122.1184, 47.671], line: "2" }
};

mapboxgl.accessToken = process.env.MAPBOX_TOKEN;

function App() {
  // --- Audio Player State and Refs ---
  const audioRef = useRef(null); 
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlayPause = () => {
    if (!audioRef.current) return;
    if (audioRef.current.paused) {
      audioRef.current.play().catch(error => console.error("Error playing audio:", error));
      setIsPlaying(true);
    } else {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };
  
  // --- Mapbox State and Refs ---
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [mapLoading, setMapLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const mapLoaded = useRef(false);

  const addStations = () => {
    console.log('Adding station squares...');
    if (!map.current || !mapLoaded.current) return;

    const stationFeatures = Object.keys(seattleStations).map(stationId => {
      const station = seattleStations[stationId];
      return {
        "type": "Feature",
        "properties": {
          "name": station.name,
          "line": station.line,
          "id": stationId
        },
        "geometry": {
          "type": "Point",
          "coordinates": station.coords
        }
      };
    });

    const stationGeoJson = {
      "type": "FeatureCollection",
      "features": stationFeatures
    };

    if (map.current.getSource("Stations")) {
      if (map.current.getLayer("StationLabels")) map.current.removeLayer("StationLabels");
      if (map.current.getLayer("StationSquares")) map.current.removeLayer("StationSquares");
      map.current.removeSource("Stations");
    }

    map.current.addSource("Stations", {
      "type": "geojson",
      "data": stationGeoJson
    });

    const stationColor = isDarkMode ? "#ffffff" : "#000000";
    const stationStroke = isDarkMode ? "#000000" : "#ffffff";
    const textColor = isDarkMode ? "#ffffff" : "#000000";
    const textHalo = isDarkMode ? "#000000" : "#ffffff";

    map.current.addLayer({
      "id": "StationSquares",
      "type": "circle",
      "source": "Stations",
      "paint": {
        "circle-radius": 8,
        "circle-color": stationColor,
        "circle-stroke-width": 2,
        "circle-stroke-color": stationStroke,
        "circle-opacity": 1
      }
    });

    map.current.addLayer({
      "id": "StationLabels",
      "type": "symbol",
      "source": "Stations",
      "layout": {
        "text-field": ["get", "name"],
        "text-font": ["Open Sans Regular", "Arial Unicode MS Regular"],
        "text-offset": [0, 2],
        "text-anchor": "top",
        "text-size": 12,
        "text-allow-overlap": false
      },
      "paint": {
        "text-color": textColor,
        "text-halo-color": textHalo,
        "text-halo-width": 2
      }
    });

    map.current.on('click', 'StationSquares', (e) => {
      const station = e.features[0];
      new mapboxgl.Popup()
        .setLngLat(e.lngLat)
        .setHTML(`
          <div style="font-weight: bold; margin-bottom: 4px;">
            ${station.properties.name}
          </div>
          <div style="font-size: 12px; color: #666;">
            ${station.properties.line === 'both' ? '1 Line & 2 Line' : 
              station.properties.line === '1' ? '1 Line' : '2 Line'}
          </div>
        `)
        .addTo(map.current);
    });

    map.current.on('mouseenter', 'StationSquares', () => {
      map.current.getCanvas().style.cursor = 'pointer';
    });

    map.current.on('mouseleave', 'StationSquares', () => {
      map.current.getCanvas().style.cursor = '';
    });

    console.log('✅ Added station circles and labels');
  };

  const convertOSMToGeoJSON = (elements) => {
    const ways = elements.filter(el => 
      el.type === 'way' && 
      el.geometry && 
      el.geometry.length > 1 &&
      (el.tags?.railway === 'light_rail' || 
       el.tags?.route === 'light_rail' ||
       el.tags?.name?.toLowerCase().includes('link') ||
       el.tags?.name?.toLowerCase().includes('light rail') ||
       el.tags?.name?.toLowerCase().includes('east link'))
    );
    
    return ways.map(way => {
      const coordinates = way.geometry.map(node => [node.lon, node.lat]);
      
      return {
        "type": "Feature",
        "properties": {
          "name": way.tags?.name || "Link Light Rail",
          "route": "light_rail",
          "operator": way.tags?.operator || "Sound Transit",
          "railway": way.tags?.railway || "light_rail",
          "ref": way.tags?.ref
        },
        "geometry": {
          "type": "LineString",
          "coordinates": coordinates
        }
      };
    }).filter(feature => feature.geometry.coordinates.length > 1);
  };

  const addOpenStreetMapRoute = async () => {
    console.log('Loading detailed routes from OpenStreetMap...');
    if (!map.current || !mapLoaded.current) return;

    try {
      const overpassQuery = `[out:json][timeout:30][bbox:47.4,-122.6,47.9,-121.8];
        (
          relation["route"="light_rail"]["name"~"Link|1 Line|2 Line"]["operator"~"Sound Transit"];
          way(r);
          relation["route"="light_rail"]["ref"~"1|2"]["network"="Sound Transit"];
          way(r);
          relation["route"="light_rail"]["name"~"East Link"];
          way(r);
        );
        out geom;`;
      
      const response = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: overpassQuery
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.elements && data.elements.length > 0) {
        const geoJsonFeatures = convertOSMToGeoJSON(data.elements);
        
        if (geoJsonFeatures.length > 0) {
          if (map.current.getSource("OSMLine1Route")) {
            map.current.removeLayer("OSMLine1Route");
            map.current.removeSource("OSMLine1Route");
          }
          if (map.current.getSource("OSMLine2Route")) {
            map.current.removeLayer("OSMLine2Route");
            map.current.removeSource("OSMLine2Route");
          }

          const line1Features = geoJsonFeatures.filter(feature => 
            feature.properties.name?.includes('1 Line') || 
            feature.properties.ref === '1' ||
            (!feature.properties.name?.includes('2 Line') && !feature.properties.name?.includes('East Link'))
          );
          
          const line2Features = geoJsonFeatures.filter(feature => 
            feature.properties.name?.includes('2 Line') || 
            feature.properties.name?.includes('East Link') ||
            feature.properties.ref === '2'
          );

          if (line1Features.length > 0) {
            map.current.addSource("OSMLine1Route", {
              "type": "geojson",
              "data": {
                "type": "FeatureCollection",
                "features": line1Features
              }
            });

            map.current.addLayer({
              "id": "OSMLine1Route",
              "type": "line",
              "source": "OSMLine1Route",
              "paint": {
                "line-color": "#00B04F",
                "line-width": 5,
                "line-opacity": 0.9
              }
            });
            console.log('✅ Added 1 Line from OpenStreetMap');
          }

          if (line2Features.length > 0) {
            map.current.addSource("OSMLine2Route", {
              "type": "geojson",
              "data": {
                "type": "FeatureCollection",
                "features": line2Features
              }
            });

            map.current.addLayer({
              "id": "OSMLine2Route",
              "type": "line",
              "source": "OSMLine2Route",
              "paint": {
                "line-color": "#0066CC",
                "line-width": 5,
                "line-opacity": 0.9
              }
            });
            console.log('✅ Added 2 Line from OpenStreetMap');
          }
          
          if (line1Features.length > 0 || line2Features.length > 0) {
            return;
          }
        }
      }
      
      console.log('❌ No route data found in OSM response');
      
    } catch (error) {
      console.log('❌ OSM routes unavailable:', error.message);
    }
  };

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    localStorage.setItem('seattleTransitDarkMode', newDarkMode.toString());
    
    if (map.current) {
      const newStyle = newDarkMode ? 'mapbox://styles/mapbox/dark-v10' : 'mapbox://styles/mapbox/light-v10';
      map.current.setStyle(newStyle);
      
      map.current.once('styledata', () => {
        if (mapLoaded.current) {
          addOpenStreetMapRoute();
          addStations();
        }
      });
    }
  };

  // --- Mapbox useEffect for initialization ---
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('seattleTransitDarkMode') !== 'false';
    setIsDarkMode(savedDarkMode);

    if (map.current) return; 

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: savedDarkMode ? 'mapbox://styles/mapbox/dark-v10' : 'mapbox://styles/mapbox/light-v10',
      center: center,
      zoom: 11,
      bearing: 0,
      maxBounds: defaultBounds
    });
    
    map.current.on('load', () => {
      mapLoaded.current = true;
      addOpenStreetMapRoute();
      addStations();
      setMapLoading(false);
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // --- Styles ---
  const toggleButtonStyle = {
    position: 'absolute',
    top: '10px',
    right: '10px',
    zIndex: 1000,
    backgroundColor: isDarkMode ? '#333' : '#fff',
    color: isDarkMode ? '#fff' : '#333',
    border: `2px solid ${isDarkMode ? '#555' : '#ddd'}`,
    borderRadius: '8px',
    padding: '10px 15px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    transition: 'all 0.3s ease'
  };

  const loadingStyle = {
    position: 'absolute',
    top: '10px',
    left: '10px',
    background: isDarkMode ? '#333' : 'white',
    color: isDarkMode ? '#fff' : '#333',
    padding: '10px',
    borderRadius: '5px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
  };

  // Audio player container with label and button
  const musicPlayerContainerStyle = {
    position: 'absolute',
    bottom: '20px',
    right: '20px',
    zIndex: 1001,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '5px'
  };

  const musicLabelStyle = {
    backgroundColor: isDarkMode ? 'rgba(50, 50, 50, 0.9)' : 'rgba(240, 240, 240, 0.9)',
    color: isDarkMode ? '#eee' : '#333',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 'bold',
    boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
  };

  const audioPlayerStyle = {
    backgroundColor: isDarkMode ? 'rgba(50, 50, 50, 0.9)' : 'rgba(240, 240, 240, 0.9)',
    padding: '8px',
    borderRadius: '50%',
    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '50px',
    height: '50px',
  };

  const audioPlayerButtonStyle = {
    background: 'none',
    border: 'none',
    color: isDarkMode ? '#eee' : '#333',
    fontSize: '24px',
    cursor: 'pointer',
    padding: '0',
    lineHeight: '1',
  };

  return (
    <div style={{ backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff', height: '100vh', position: 'relative' }}>
      
      {/* Mapbox Section - Takes full height */}
      <div ref={mapContainer} className='mapbox' style={{width: '100%', height: '100%'}}>
      </div>
      
      {/* Dark Mode Toggle Button */}
      <button 
        onClick={toggleDarkMode}
        style={toggleButtonStyle}
        onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
        onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
      >
        {isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
      </button>
      
      {mapLoading && (
        <div style={loadingStyle}>
          Loading Seattle transit data...
        </div>
      )}

      {/* Music Player with Label */}
      {audioFileSrc && (
        <div style={musicPlayerContainerStyle}>
          <div style={musicLabelStyle}>Music</div>
          <div style={audioPlayerStyle}>
            <audio 
              ref={audioRef} 
              src={audioFileSrc} 
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={() => setIsPlaying(false)}
              style={{ display: 'none' }}
            />
            <button style={audioPlayerButtonStyle} onClick={togglePlayPause} title={isPlaying ? "Pause" : "Play"}>
              {isPlaying ? '⏸️' : '▶️'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;