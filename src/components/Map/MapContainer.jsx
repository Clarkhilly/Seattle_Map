import React, { useRef, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import { center, defaultBounds, mapStyles } from '../../data/config';
import { fetchOSMRoutes } from '../../services/openStreetMapService';
import { convertOSMToGeoJSON, createStationGeoJSON } from '../../utils/geoJsonUtils';
import { seattleStations } from '../../data/stations';

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN;

const MapContainer = ({ isDarkMode, onLoadingChange }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const mapLoaded = useRef(false);

  // Initialize map
  useEffect(() => {
    if (map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: isDarkMode ? mapStyles.dark : mapStyles.light,
      center: center,
      zoom: 11,
      bearing: 0,
      maxBounds: defaultBounds
    });
    
    map.current.on('load', () => {
      mapLoaded.current = true;
      addOpenStreetMapRoute();
      addStations();
      onLoadingChange(false);
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Handle dark mode changes
  useEffect(() => {
    if (map.current) {
      const newStyle = isDarkMode ? mapStyles.dark : mapStyles.light;
      map.current.setStyle(newStyle);
      
      map.current.once('styledata', () => {
        if (mapLoaded.current) {
          addOpenStreetMapRoute();
          addStations();
        }
      });
    }
  }, [isDarkMode]);

  const addStations = () => {
    if (!map.current || !mapLoaded.current) return;

    const stationGeoJson = createStationGeoJSON(seattleStations);

    // Remove existing layers
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

    // Add station circles
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

    // Add station labels
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

    // Add click interactions
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
  };

  const addOpenStreetMapRoute = async () => {
    if (!map.current || !mapLoaded.current) return;

    try {
      const data = await fetchOSMRoutes();
      
      if (data.elements && data.elements.length > 0) {
        const geoJsonFeatures = convertOSMToGeoJSON(data.elements);
        
        if (geoJsonFeatures.length > 0) {
          // Remove existing route layers
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

          // Add Line 1
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
          }

          // Add Line 2
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
          }
        }
      }
    } catch (error) {
      console.log('❌ OSM routes unavailable:', error.message);
    }
  };

  return (
    <div ref={mapContainer} className='mapbox' style={{width: '100%', height: '100%'}}>
    </div>
  );
};

export default MapContainer;