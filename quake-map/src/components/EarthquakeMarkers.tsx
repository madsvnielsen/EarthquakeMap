import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Earthquake } from '../types/earthquake';
import { Box, Chip, Divider, Link, Stack, Typography } from '@mui/material';
import { EarthquakeDetailIcons } from './EarthquakeDetailIcons';
import { getColorForMagnitude } from '../utils/getColorForMagnetude';

type Props = {
  quakes: Earthquake[];
};

export const EarthquakeMarkers = ({ quakes }: Props) => {
  return (
    <>
      {quakes.map((eq) => {
        const depth = eq.coords[2];
        const magnitude = eq.magnitude ?? 0;
        const color = getColorForMagnitude(magnitude);
        const dateStr = new Date(eq.time).toLocaleString();
        const size = Math.max(14, Math.min(34, 12 + magnitude * 2.2));
        const ringSize = size + 12;
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
