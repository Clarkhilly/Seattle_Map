import React from 'react';
import mapboxgl from 'mapbox-gl';

const center = [-122.2015, 47.6101]; // Centered between Seattle and Bellevue

const defaultBounds = [
  [-122.6, 47.3],    // Southwest (includes Tacoma area)
  [-121.8, 47.9]     // Northeast (includes Redmond, Bothell)
];

// Updated station coordinates with your exact data
const seattleStations = {
  // 1 Line Stations (North to South) - Updated with precise coordinates
  "lynnwood": { name: "Lynnwood City Center", coords: [-122.2858, 47.8188], line: "1" },
  "mountlake": { name: "Mountlake Terrace", coords: [-122.2782, 47.7836], line: "1" },
  "shoreline-n": { name: "Shoreline North/185th", coords: [-122.3175, 47.7770], line: "1" },
  "shoreline-s": { name: "Shoreline South/148th", coords: [-122.3276, 47.7479], line: "1" },
  "northgate": { name: "Northgate", coords: [-122.3374, 47.7522], line: "1" },
  "roosevelt": { name: "Roosevelt", coords: [-122.3184, 47.6587], line: "1" },
  "u-district": { name: "U District", coords: [-122.3138, 47.6601], line: "1" },
  "university": { name: "University of Washington", coords: [-122.3037, 47.6587], line: "1" },
  "capitol-hill": { name: "Capitol Hill", coords: [-122.3187, 47.6187], line: "1" },
  "westlake": { name: "Westlake", coords: [-122.3302, 47.6087], line: "both" },
  "symphony": { name: "Symphony (University Street)", coords: [-122.3326, 47.6062], line: "both" },
  "pioneer-square": { name: "Pioneer Square", coords: [-122.3340, 47.6021], line: "both" },
  "intl-district": { name: "Intl. District/Chinatown", coords: [-122.3289, 47.5952], line: "both" },
  "stadium": { name: "Stadium", coords: [-122.3138, 47.5911], line: "1" },
  "sodo": { name: "SODO", coords: [-122.3063, 47.5781], line: "1" },
  "beacon-hill": { name: "Beacon Hill", coords: [-122.3063, 47.5609], line: "1" },
  "mount-baker": { name: "Mount Baker", coords: [-122.2965, 47.5583], line: "1" },
  "columbia-city": { name: "Columbia City", coords: [-122.2878, 47.5401], line: "1" },
  "othello": { name: "Othello", coords: [-122.2801, 47.5255], line: "1" },
  "rainier-beach": { name: "Rainier Beach", coords: [-122.2687, 47.5097], line: "1" },
  "tukwila": { name: "Tukwila International Blvd", coords: [-122.2573, 47.4799], line: "1" },
  "seatac": { name: "SeaTac/Airport", coords: [-122.3013, 47.4452], line: "1" },
  "angle-lake": { name: "Angle Lake", coords: [-122.2934, 47.4124], line: "1" },
  
  // 2 Line Stations (East Link) - Keep your existing ones for now
  "judkins-park": { name: "Judkins Park", coords: [-122.2907, 47.6006], line: "2" },
  "mercer-island": { name: "Mercer Island", coords: [-122.2319, 47.5779], line: "2" },
  "bellevue-downtown": { name: "Bellevue Downtown", coords: [-122.1969, 47.6105], line: "2" },
  "east-main": { name: "East Main", coords: [-122.1812, 47.5996], line: "2" },
  "south-bellevue": { name: "South Bellevue", coords: [-122.1643, 47.5784], line: "2" },
  "bel-red": { name: "BelRed / 130th", coords: [-122.1332, 47.6322], line: "2" },
  "spring-district": { name: "Spring District", coords: [-122.1601, 47.6384], line: "2" },
  "overlake-village": { name: "Overlake Village", coords: [-122.1328, 47.6439], line: "2" },
  "redmond-tech": { name: "Redmond Technology", coords: [-122.1221, 47.6385], line: "2" },
  "downtown-redmond": { name: "Downtown Redmond", coords: [-122.1080, 47.6740], line: "2" }
};

mapboxgl.accessToken = process.env.MAPBOX_TOKEN;

class Mapbox extends React.Component {
  constructor(props) {
    super(props);
    
    this.state = {
      loading: true,
      timestamp: null,
    };

    this.mapLoaded = false;
  }
  
  componentDidMount() {
    this.map = new mapboxgl.Map({
      container: this.mapContainer,
      style: 'mapbox://styles/mapbox/light-v10',
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

  addStations() {
    console.log('Adding station squares...');
    
    // DEBUG: Check a few sample coordinates with new data
    console.log('Sample stations:');
    console.log('Westlake:', seattleStations['westlake']);
    console.log('Northgate:', seattleStations['northgate']); 
    console.log('Judkins Park:', seattleStations['judkins-park']);
    
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

    // DEBUG: Log the GeoJSON
    console.log('Station GeoJSON sample:', stationGeoJson.features.slice(0, 3));

    // Add station source
    this.map.addSource("Stations", {
      "type": "geojson",
      "data": stationGeoJson
    });

    // Add black circles as station squares
    this.map.addLayer({
      "id": "StationSquares",
      "type": "circle",
      "source": "Stations",
      "paint": {
        "circle-radius": 8,
        "circle-color": "#000000",
        "circle-stroke-width": 2,
        "circle-stroke-color": "#ffffff",
        "circle-opacity": 1
      }
    });

    // Add station labels as a separate layer
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
        "text-color": "#000000",
        "text-halo-color": "#ffffff",
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

    console.log('✅ Added station circles and labels with updated coordinates');
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
      
      throw new Error('No route data found in OSM response');
      
    } catch (error) {
      console.log('❌ OSM routes unavailable:', error.message);
      console.log('🔄 Falling back to static routes...');
      this.addStaticRouteLines(); // Fallback to static method
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
    const { loading, timestamp } = this.state;
    
    return (
      <div>
        <div ref={el => this.mapContainer = el} className='mapbox' style={{width: '100%', height: '100vh'}}>
        </div>
        {loading && <div style={{position: 'absolute', top: '10px', left: '10px', background: 'white', padding: '10px'}}>Loading Seattle transit data...</div>}
      </div>
    );
  }

  addStaticRouteLines() {
    console.log('Adding backup static route lines...');
    
    // Enhanced static coordinates using the new precise station coordinates
    const linkLightRailCoords = [
      [-122.2858, 47.8188], // Lynnwood City Center
      [-122.2782, 47.7836], // Mountlake Terrace
      [-122.3175, 47.7770], // Shoreline North/185th
      [-122.3276, 47.7479], // Shoreline South/148th
      [-122.3374, 47.7522], // Northgate
      [-122.3184, 47.6587], // Roosevelt
      [-122.3138, 47.6601], // U District
      [-122.3037, 47.6587], // University of Washington
      [-122.3187, 47.6187], // Capitol Hill
      [-122.3302, 47.6087], // Westlake
      [-122.3326, 47.6062], // Symphony
      [-122.3340, 47.6021], // Pioneer Square
      [-122.3289, 47.5952], // International District/Chinatown
      [-122.3138, 47.5911], // Stadium
      [-122.3063, 47.5781], // SODO
      [-122.3063, 47.5609], // Beacon Hill
      [-122.2965, 47.5583], // Mount Baker
      [-122.2878, 47.5401], // Columbia City
      [-122.2801, 47.5255], // Othello
      [-122.2687, 47.5097], // Rainier Beach
      [-122.2573, 47.4799], // Tukwila International Blvd
      [-122.3013, 47.4452], // SeaTac/Airport
      [-122.2934, 47.4124]  // Angle Lake
    ];

    this.map.addSource("BackupLinkRoute", {
      "type": "geojson",
      "data": {
        "type": "Feature",
        "properties": {
          "name": "Link Light Rail - 1 Line (Backup)",
          "type": "backup"
        },
        "geometry": {
          "type": "LineString",
          "coordinates": linkLightRailCoords
        }
      }
    });

    this.map.addLayer({
      "id": "BackupLinkRoute",
      "type": "line",
      "source": "BackupLinkRoute",
      "layout": {
        "line-join": "round",
        "line-cap": "round"
      },
      "paint": {
        "line-color": "#00B04F",
        "line-width": 4,
        "line-opacity": 0.8
      }
    });
    
    console.log('✅ Added backup static route with precise coordinates');
  }
}

export default Mapbox;