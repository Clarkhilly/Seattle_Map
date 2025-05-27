export const fetchOSMRoutes = async () => {
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
  
  return response.json();
};