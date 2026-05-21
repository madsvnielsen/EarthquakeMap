import { useEffect, useMemo, useState } from 'react';
import { Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Earthquake } from '../types/earthquake';
import { Box, Chip, Divider, Link, Stack, Typography } from '@mui/material';
import { EarthquakeDetailIcons } from './EarthquakeDetailIcons';
import { getColorForMagnitude } from '../utils/getColorForMagnetude';

type Props = {
  quakes: Earthquake[];
};

type ClusterBucket = {
  key: string;
  quakes: Earthquake[];
  count: number;
  sumLat: number;
  sumLng: number;
  maxMagnitude: number;
  bounds: L.LatLngBounds;
};

type MarkerItem =
  | { type: 'single'; quake: Earthquake }
  | {
      type: 'cluster';
      key: string;
      coords: [number, number];
      count: number;
      maxMagnitude: number;
      bounds: L.LatLngBounds;
    };

export const EarthquakeMarkers = ({ quakes }: Props) => {
  const map = useMapEvents({
    zoomend: () => {
      setViewportVersion((version) => version + 1);
    },
    moveend: () => {
      setViewportVersion((version) => version + 1);
    },
  });

  const [viewportVersion, setViewportVersion] = useState(0);

  useEffect(() => {
    setViewportVersion((version) => version + 1);
  }, [map]);

  const markerItems = useMemo(() => {
    const zoom = map.getZoom();
    const visibleBounds = map.getBounds().pad(0.35);
    const gridSize = getGridSize(zoom);
    const buckets = new Map<string, ClusterBucket>();

    for (const quake of quakes) {
      const position = L.latLng(quake.coords[0], quake.coords[1]);

      if (!visibleBounds.contains(position)) {
        continue;
      }

      const point = map.project(position, zoom);
      const cellX = Math.floor(point.x / gridSize);
      const cellY = Math.floor(point.y / gridSize);
      const key = `${zoom}:${cellX}:${cellY}`;
      const existing = buckets.get(key);

      if (existing) {
        existing.quakes.push(quake);
        existing.count += 1;
        existing.sumLat += quake.coords[0];
        existing.sumLng += quake.coords[1];
        existing.maxMagnitude = Math.max(existing.maxMagnitude, quake.magnitude ?? 0);
        existing.bounds.extend(position);
      } else {
        buckets.set(key, {
          key,
          quakes: [quake],
          count: 1,
          sumLat: quake.coords[0],
          sumLng: quake.coords[1],
          maxMagnitude: quake.magnitude ?? 0,
          bounds: L.latLngBounds(position, position),
        });
      }
    }

    const items: MarkerItem[] = [];

    buckets.forEach((bucket) => {
      if (bucket.count === 1) {
        items.push({
          type: 'single',
          quake: bucket.quakes[0],
        });
      } else {
        items.push({
          type: 'cluster',
          key: bucket.key,
          coords: [bucket.sumLat / bucket.count, bucket.sumLng / bucket.count],
          count: bucket.count,
          maxMagnitude: bucket.maxMagnitude,
          bounds: bucket.bounds,
        });
      }
    });

    return items;
  }, [map, quakes, viewportVersion]);

  return (
    <>
      {markerItems.map((item) => {
        if (item.type === 'cluster') {
          const color = getColorForMagnitude(item.maxMagnitude);
          const icon = createClusterIcon(color, item.count);

          return (
            <Marker
              key={item.key}
              position={item.coords}
              icon={icon}
              eventHandlers={{
                click: () => {
                  map.fitBounds(item.bounds.pad(0.55), {
                    maxZoom: Math.min(map.getZoom() + 3, 9),
                    animate: true,
                  });
                },
              }}
            />
          );
        }

        const eq = item.quake;
        const depth = eq.coords[2];
        const magnitude = eq.magnitude ?? 0;
        const color = getColorForMagnitude(magnitude);
        const dateStr = new Date(eq.time).toLocaleString();
        const size = Math.max(12, Math.min(26, 10 + magnitude * 1.8));
        const ringSize = size + 10;
        const alertLabel = eq.alert ? `Alert ${eq.alert.toUpperCase()}` : null;
        const icon = createPulseIcon(color, size, ringSize);

        return (
          <Marker key={eq.id} position={[eq.coords[0], eq.coords[1]]} icon={icon}>
            <Popup>
              <Stack spacing={1.2}>
                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                  <Chip
                    label={`M ${magnitude.toFixed(1)}`}
                    sx={{
                      bgcolor: color,
                      color: '#07141d',
                      fontWeight: 700,
                    }}
                  />
                  {alertLabel && (
                    <Chip
                      label={alertLabel}
                      size="small"
                      sx={{
                        bgcolor: 'rgba(255, 138, 91, 0.15)',
                        color: '#ffd3bf',
                      }}
                    />
                  )}
                </Stack>

                <Box>
                  <Typography variant="h6">{eq.place}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {dateStr}
                  </Typography>
                </Box>

                <Divider />
                {EarthquakeDetailIcons(
                  magnitude,
                  eq.magType,
                  depth,
                  eq.alert,
                  eq.felt,
                  eq.mmi,
                  eq.cdi,
                )}
                <Divider />

                <Typography variant="caption" color="text.secondary">
                  {eq.gap !== undefined ? `Gap ${eq.gap} deg  ` : ''}
                  {eq.rms !== undefined ? `RMS ${eq.rms}  ` : ''}
                  {eq.dmin !== undefined ? `dMin ${eq.dmin.toFixed(2)} km` : ''}
                </Typography>

                <Link href={eq.url} target="_blank" rel="noopener" underline="hover">
                  More info on USGS
                </Link>
              </Stack>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
};

const getGridSize = (zoom: number) => {
  if (zoom >= 8) {
    return 26;
  }

  if (zoom >= 6) {
    return 34;
  }

  if (zoom >= 4) {
    return 46;
  }

  return 64;
};

const createPulseIcon = (color: string, size: number, ringSize: number) =>
  new L.DivIcon({
    className: 'custom-quake-marker',
    html: `
      <div class="quake-marker" style="--marker-color:${color};--marker-size:${size}px;--ring-size:${ringSize}px;--marker-delay:${(Math.random() * 1.6).toFixed(2)}s;">
        <span class="quake-marker__pulse"></span>
        <span class="quake-marker__ring"></span>
        <span class="quake-marker__core"></span>
      </div>
    `,
    iconSize: [ringSize, ringSize],
    iconAnchor: [ringSize / 2, ringSize / 2],
  });

const createClusterIcon = (color: string, count: number) => {
  const size = Math.max(28, Math.min(54, 24 + Math.log10(count + 1) * 12));

  return new L.DivIcon({
    className: 'custom-quake-marker',
    html: `
      <div class="quake-cluster" style="--cluster-color:${color};--cluster-size:${size}px;">
        <span class="quake-cluster__ring"></span>
        <span class="quake-cluster__core">${count}</span>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};
