import { MapContainer, TileLayer, useMap, GeoJSON } from 'react-leaflet';
import { EarthquakeMarkers } from './EarthquakeMarkers';
import type { Earthquake } from '../types/earthquake';
import { theme } from '../theme';
import { useEffect} from 'react';
//import faultData from '../data/faults.geojson?raw'
import * as turf from '@turf/turf';
import { AreaSelectionHandler } from './AreaSelectionHandler';

type Props = {
  quakes: Earthquake[];
  selectedCoords:  [number, number] | null
  areaSelectionEnabled: boolean;
  setAreaSelectionEnabled: (v: boolean) => void
  setSelectedBounds: (bounds: [[number, number], [number, number]] | null) => void;
  selectedBounds: [[number, number], [number, number]] | null
};

export const EarthquakeMap = ({ quakes, selectedCoords,   areaSelectionEnabled, setAreaSelectionEnabled, setSelectedBounds, selectedBounds }: Props) => {
  
  return (

    <MapContainer
      center={[0, 0]}
      zoom={3}
      scrollWheelZoom={true}
      style={{backgroundColor: theme.palette.background.default, width: "100%", height: "100%", zIndex: 0}}
    > <AreaSelectionHandler
    areaSelectionEnabled={areaSelectionEnabled}
    setAreaSelectionEnabled={setAreaSelectionEnabled}
    setSelectedBounds={setSelectedBounds}
    selectedBounds={selectedBounds}
    />
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
        
      />
       {selectedCoords && <FlyToEarthquake coords={selectedCoords} />}
       <EarthquakeMarkers quakes={quakes} />
       {/* <FaultLinesLayer /> */}
      
    </MapContainer>

  );
};



const FlyToEarthquake = ({ coords }: { coords: [number, number] }) => {
  const map = useMap();

  useEffect(() => {
    if (coords) {
      map.flyTo(coords, 6); 
    }
  }, [coords]);

  return null;
};

/*
const FaultLinesLayer = () => {
  let parsed;
  try {
    parsed = JSON.parse(faultData);
    parsed = turf.simplify(parsed, { tolerance: 0.05, highQuality: false });
  } catch (e) {
    console.error("Failed to parse or simplify GeoJSON", e);
    return null;
  }

  const simplified = {
    ...parsed,
    features: parsed.features.filter((feature: any) => {
      const length = turf.length(feature, { units: 'kilometers' });
      return length > 2; // Only keep features longer than 2 km
    }),
  };

  return (
    <GeoJSON
      data={simplified}
      style={{
        color: '#a12837',
        weight: 0.5,
        opacity: 0.5,
      }}
    />
  );
};

*/