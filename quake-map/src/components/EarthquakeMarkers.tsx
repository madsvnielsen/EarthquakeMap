import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Earthquake } from '../types/earthquake';
import { Box, Divider, Link,  Typography } from '@mui/material';
import { EarthquakeDetailIcons } from './EarthquakeDetailIcons';
import { getColorForMagnitude } from '../utils/getColorForMagnetude';



type Props = {
  quakes: Earthquake[];
};


export const EarthquakeMarkers = ({ quakes }: Props) => {
  return (
    <>
      {quakes.map((eq) => {
        const {
          magnitude,
          place,
          time,
          url,
          alert,
          felt,
          mmi,
          cdi,
          gap,
          rms,
          dmin,
          magType,
        } = eq;

        const depth = eq.coords[2];
        const dateStr = new Date(time).toLocaleString();

        const color = getColorForMagnitude(magnitude);
        const icon = createXDivIcon(color);

        return (
          <Marker key={eq.id} position={[eq.coords[0], eq.coords[1]]} icon={icon}>
            <Popup>
              <Typography variant="h6">{place}</Typography>
              <Typography variant="subtitle2">{dateStr}</Typography>

              <Divider sx={{ my: 1 }} />
              {EarthquakeDetailIcons(magnitude, magType, depth, alert, felt, mmi, cdi)}

              <Divider sx={{ my: 1 }} />

              <Typography variant="caption">
                {gap !== undefined && (
                  <>
                    <strong>Gap:</strong> {gap}°{' '}
                  </>
                )}

                {rms !== undefined && (
                  <>
                    <strong>RMS:</strong> {rms}{' '}
                  </>
                )}

                {dmin !== undefined && (
                  <>
                    <strong>dMin:</strong> {dmin.toFixed(2)} km
                  </>
                )}
              </Typography>

              <Box sx={{ mt: 1 }}>
                <Link href={url} target="_blank" rel="noopener">
                  More info on USGS
                </Link>
              </Box>
            </Popup>
          </Marker>
        );
      })}

    </>
  );
};



const createXDivIcon = (color: string) =>
  new L.DivIcon({
    className: 'custom-icon',
    html: `
      <div
        class="leaflet-marker-circle"
        style="background-color: ${color};animation-delay: ${ Math.random().toFixed(2) + 's'};"

      ></div>
    `,
    iconSize: [20, 20],
    iconAnchor: [5, 5],
  });

