import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import { EarthquakeMarkers } from './EarthquakeMarkers';
import type { Earthquake } from '../types/earthquake';
import { useEffect } from 'react';
import { AreaSelectionHandler } from './AreaSelectionHandler';

type Props = {
  quakes: Earthquake[];
  selectedCoords: [number, number] | null;
  areaSelectionEnabled: boolean;
  setAreaSelectionEnabled: (v: boolean) => void;
  setSelectedBounds: (bounds: [[number, number], [number, number]] | null) => void;
  selectedBounds: [[number, number], [number, number]] | null;
};

export const EarthquakeMap = ({
  quakes,
  selectedCoords,
  areaSelectionEnabled,
  setAreaSelectionEnabled,
  setSelectedBounds,
  selectedBounds,
}: Props) => {
  return (
    <MapContainer
      className="quake-map-shell"
      center={[18, 10]}
      zoom={2}
      scrollWheelZoom
      zoomControl={false}
      style={{ width: '100%', height: '100%', zIndex: 0 }}
    >
      <AreaSelectionHandler
        areaSelectionEnabled={areaSelectionEnabled}
        setAreaSelectionEnabled={setAreaSelectionEnabled}
        setSelectedBounds={setSelectedBounds}
        selectedBounds={selectedBounds}
      />
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
      />
      {selectedCoords && <FlyToEarthquake coords={selectedCoords} />}
      <EarthquakeMarkers quakes={quakes} />
    </MapContainer>
  );
};

const FlyToEarthquake = ({ coords }: { coords: [number, number] }) => {
  const map = useMap();

  useEffect(() => {
    map.flyTo(coords, 5, {
      animate: true,
      duration: 1.2,
    });
  }, [coords, map]);

  return null;
};
