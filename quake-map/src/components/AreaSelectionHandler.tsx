import { useEffect, useState, useRef } from 'react';
import { useMap, Marker, Rectangle } from 'react-leaflet';
import type { LatLngExpression } from 'leaflet';

type Bounds = [[number, number], [number, number]];

type Props = {
  areaSelectionEnabled: boolean;
  setAreaSelectionEnabled: (v: boolean) => void;
  setSelectedBounds: (bounds: Bounds | null) => void;
  selectedBounds: Bounds | null
};

export const AreaSelectionHandler = ({
  areaSelectionEnabled,
  setAreaSelectionEnabled,
  setSelectedBounds,
  selectedBounds
}: Props) => {
  const map = useMap();
  const [startPoint, setStartPoint] = useState<[number, number] | null>(null);
  const [hoverPoint, setHoverPoint] = useState<[number, number] | null>(null);
  const [confirmedBounds, setConfirmedBounds] = useState<Bounds | null>(null);

  // Setup DOM-level listeners when selection is enabled
  useEffect(() => {
    if (!selectedBounds) {
        setConfirmedBounds(null);
      }

    if (!areaSelectionEnabled) return;

    const mapContainer = map.getContainer();

    const handleClick = (e: MouseEvent) => {
      if (!mapContainer.contains(e.target as Node)) return;

      const rect = mapContainer.getBoundingClientRect();
      const point = [e.clientX - rect.left, e.clientY - rect.top] as [number, number];
      const latlng = map.containerPointToLatLng(point);
      const clicked: [number, number] = [latlng.lat, latlng.lng];

      if (!startPoint) {
        setStartPoint(clicked);
        setHoverPoint(null);
        setConfirmedBounds(null);
        setSelectedBounds(null);
      } else {
        const bounds: Bounds = [
          [Math.min(startPoint[0], clicked[0]), Math.min(startPoint[1], clicked[1])],
          [Math.max(startPoint[0], clicked[0]), Math.max(startPoint[1], clicked[1])],
        ];
        setConfirmedBounds(bounds);
        setSelectedBounds(bounds);
        setStartPoint(null);
        setHoverPoint(null);
        setAreaSelectionEnabled(false);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!startPoint) return;
      const rect = mapContainer.getBoundingClientRect();
      const point = [e.clientX - rect.left, e.clientY - rect.top] as [number, number];
      const latlng = map.containerPointToLatLng(point);
      setHoverPoint([latlng.lat, latlng.lng]);
    };

    mapContainer.addEventListener('click', handleClick);
    mapContainer.addEventListener('mousemove', handleMouseMove);

    return () => {
      mapContainer.removeEventListener('click', handleClick);
      mapContainer.removeEventListener('mousemove', handleMouseMove);
    };
  }, [areaSelectionEnabled, startPoint, map, selectedBounds]);

  const previewBounds: Bounds | null =
    startPoint && hoverPoint
      ? [
          [Math.min(startPoint[0], hoverPoint[0]), Math.min(startPoint[1], hoverPoint[1])],
          [Math.max(startPoint[0], hoverPoint[0]), Math.max(startPoint[1], hoverPoint[1])],
        ]
      : null;

      return (
        <>
          {/* 📍 Initial point marker */}
          {startPoint && areaSelectionEnabled && (
            <Marker position={startPoint as LatLngExpression} />
          )}
      
          {/* 🔲 Live preview rectangle (dashed, lighter) */}
          {previewBounds && (
            <Rectangle
              bounds={previewBounds}
              pathOptions={{
                color: '#3399ff',
                weight: 2,
                dashArray: '6',
                fillOpacity: 0.1,
              }}
            />
          )}
      
          {/* ✅ Finalized selection rectangle (solid, semi-transparent fill) */}
          {confirmedBounds && (
            <Rectangle
              bounds={confirmedBounds}
              pathOptions={{
                color: '#3366ff',
                weight: 2,
                fillOpacity: 0.25,
              }}
            />
          )}
        </>
      );
};
