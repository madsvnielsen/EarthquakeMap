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
      const intensity = Math.max(0.15, Math.min(1, magnitude / 8));
      return [quake.coords[0], quake.coords[1], intensity] as [number, number, number];
    });

    const heatLayer = (L as any).heatLayer(heatPoints, {
      radius: 26,
      blur: 18,
      maxZoom: 9,
      minOpacity: 0.24,
      gradient: {
        0.1: '#102440',
        0.22: '#274a7b',
        0.36: '#5a4d89',
        0.5: '#b53a55',
        0.66: '#e3343f',
        0.82: '#ff2a2a',
        1.0: '#b40018',
      },
    });

    heatLayer.addTo(map);

    return () => {
      map.removeLayer(heatLayer);
    };
  }, [map, quakes]);

  return null;
};
