import React from 'react';
import mapboxgl from 'mapbox-gl';

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

class Mapbox extends React.Component {
  constructor(props) {
    super(props);
    
    this.state = {
      loading: true,
      timestamp: null,
      isDarkMode: true,
    };

    this.mapLoaded = false;
  }
  
  componentDidMount() {
    // Load saved dark mode preference
    const savedDarkMode = localStorage.getItem('seattleTransitDarkMode') !== 'false';
    this.setState({ isDarkMode: savedDarkMode });

    this.map = new mapboxgl.Map({
      container: this.mapContainer,
      style: savedDarkMode ? 'mapbox://styles/mapbox/dark-v10' : 'mapbox://styles/mapbox/light-v10',
      center: center,
      zoom: 11,
      bearing: 0,
      maxBounds: defaultBounds
    });
    
    this.map.on('load', () => {
      this.mapLoaded = true;
      this.addOpenStreetMapRoute();
      this.addStations();
      this.setState({loading: false});
    });
  }

  // Add toggle function
  toggleDarkMode = () => {
    const newDarkMode = !this.state.isDarkMode;
    this.setState({ isDarkMode: newDarkMode });
    
    // Save preference
    localStorage.setItem('seattleTransitDarkMode', newDarkMode.toString());
    
    // Change map style
    const newStyle = newDarkMode ? 'mapbox://styles/mapbox/dark-v10' : 'mapbox://styles/mapbox/light-v10';
    this.map.setStyle(newStyle);
    
    // Re-add layers after style change
    this.map.once('styledata', () => {
      if (this.mapLoaded) {
        this.addOpenStreetMapRoute();
        this.addStations();
      }
    });
  };

  addStations() {
    console.log('Adding station squares...');
    
    // Create GeoJSON features for stations
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

    // Add station source
    this.map.addSource("Stations", {
      "type": "geojson",
      "data": stationGeoJson
    });

    // Adjust colors based on dark mode
    const stationColor = this.state.isDarkMode ? "#ffffff" : "#000000";
    const stationStroke = this.state.isDarkMode ? "#000000" : "#ffffff";
    const textColor = this.state.isDarkMode ? "#ffffff" : "#000000";
    const textHalo = this.state.isDarkMode ? "#000000" : "#ffffff";

    // Add station circles with theme-aware colors
    this.map.addLayer({
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

    // Add station labels with theme-aware colors
    this.map.addLayer({
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

    // Add click interaction for stations
    this.map.on('click', 'StationSquares', (e) => {
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
        .addTo(this.map);
    });

    // Change cursor on hover
    this.map.on('mouseenter', 'StationSquares', () => {
      this.map.getCanvas().style.cursor = 'pointer';
    });

    this.map.on('mouseleave', 'StationSquares', () => {
      this.map.getCanvas().style.cursor = '';
    });

    console.log('✅ Added station circles and labels');
  }

  async addOpenStreetMapRoute() {
    console.log('Loading detailed routes from OpenStreetMap...');
    
    try {
      // Enhanced query to get both 1 Line and 2 Line
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
      console.log('OSM Query Response:', data);
      
      if (data.elements && data.elements.length > 0) {
        // Convert OSM data to GeoJSON and separate by line
        const geoJsonFeatures = this.convertOSMToGeoJSON(data.elements);
        
        if (geoJsonFeatures.length > 0) {
          // Separate features by line
          const line1Features = geoJsonFeatures.filter(feature => 
            feature.properties.name?.includes('1 Line') || 
            feature.properties.ref === '1' ||
            !feature.properties.name?.includes('2 Line')
          );
          
          const line2Features = geoJsonFeatures.filter(feature => 
            feature.properties.name?.includes('2 Line') || 
            feature.properties.name?.includes('East Link') ||
            feature.properties.ref === '2'
          );

          // Add 1 Line (Green)
          if (line1Features.length > 0) {
            this.map.addSource("OSMLine1Route", {
              "type": "geojson",
              "data": {
                "type": "FeatureCollection",
                "features": line1Features
              }
            });

            this.map.addLayer({
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

          // Add 2 Line (Blue)
          if (line2Features.length > 0) {
            this.map.addSource("OSMLine2Route", {
              "type": "geojson",
              "data": {
                "type": "FeatureCollection",
                "features": line2Features
              }
            });

            this.map.addLayer({
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
            console.log('✅ Loaded detailed routes from OpenStreetMap');
            return; // Success - exit here
          }
        }
      }
      
      console.log('❌ No route data found in OSM response');
      
    } catch (error) {
      console.log('❌ OSM routes unavailable:', error.message);
    }
  }

  convertOSMToGeoJSON(elements) {
    // Filter for ways that have geometry and are likely transit routes
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
    
    console.log(`Converting ${ways.length} OSM ways to GeoJSON...`);
    console.log('Sample way tags:', ways[0]?.tags);
    
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
    }).filter(feature => feature.geometry.coordinates.length > 1); // Only include valid lines
  }

  render() {
    const { loading, isDarkMode } = this.state;
    
    // Toggle button styles
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
    
    return (
      <div style={{ backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff', height: '100vh' }}>
        <div ref={el => this.mapContainer = el} className='mapbox' style={{width: '100%', height: '100vh'}}>
        </div>
        
        {/* Dark Mode Toggle Button */}
        <button 
          onClick={this.toggleDarkMode}
          style={toggleButtonStyle}
          onMouseEnter={(e) => {
            e.target.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'scale(1)';
          }}
        >
          {isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
        </button>
        
        {loading && (
          <div style={loadingStyle}>
            Loading Seattle transit data...
          </div>
        )}
      </div>
    );
  }
}

export default Mapbox;