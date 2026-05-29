import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';
import type { Earthquake } from '../types/earthquake';

type Props = {
  quakes: Earthquake[];
};

export const EarthquakeHeatmap = ({ quakes }: Props) => {
  const map = useMap();

  useEffect(() => {
    const heatPoints = quakes.map((quake) => {
      const magnitude = quake.magnitude ?? 0;
      const normalizedMagnitude = Math.max(0, Math.min(1, magnitude / 8));
      const intensity = 0.05 + Math.pow(normalizedMagnitude, 0.9) * 0.38;
      return [quake.coords[0], quake.coords[1], intensity] as [number, number, number];
    });

    const heatLayer = (L as any).heatLayer(heatPoints, {
      radius: 22,
      blur: 16,
      maxZoom: 9,
      max: 1.9,
      minOpacity: 0.18,
      gradient: {
        0.08: '#0f2137',
        0.2: '#21466f',
        0.34: '#3c6da2',
        0.5: '#6b63a8',
        0.66: '#a84f7f',
        0.8: '#d84a48',
        0.92: '#ef3b2d',
        1.0: 'rgba(176, 0, 24, 0.54)',
      },
    });

    heatLayer.addTo(map);

    return () => {
      map.removeLayer(heatLayer);
    };
  }, [map, quakes]);

  return null;
};
