export const convertOSMToGeoJSON = (elements) => {
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

export const createStationGeoJSON = (stations) => {
  const stationFeatures = Object.keys(stations).map(stationId => {
    const station = stations[stationId];
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

  return {
    "type": "FeatureCollection",
    "features": stationFeatures
  };
};