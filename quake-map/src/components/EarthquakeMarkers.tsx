import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Earthquake } from '../types/earthquake';

// Get color from magnitude
const getColorForMagnitude = (mag: number): string => {
    // Clamp magnitude between 0 and 10
    const clamped = Math.max(0, Math.min(10, mag));
  
    // Map magnitude to hue: 120 (green) → 0 (red)
    const hue = 120 - (clamped / 10) * 120;
  
    // Use full saturation and medium lightness
    return `hsl(${hue}, 80%, 50%)`;
  };

type Props = {
  quakes: Earthquake[];
};


export const EarthquakeMarkers = ({ quakes }: Props) => {
  return (
    <>
      {quakes.map((eq) => {
        const color = getColorForMagnitude(eq.magnitude);
        const icon = createXDivIcon(color);

        return (
          <Marker key={eq.id} position={eq.coords} icon={icon}>
            <Popup>
              <strong>{eq.title}</strong>
              <br />
              Magnitude: {eq.magnitude}
              <br />
              <a href={eq.url} target="_blank" rel="noreferrer">
                More info
              </a>
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
        <div style="
          color: ${color};
          font-size: 60px;
          text-shadow: 0 0 2px gray;
        ">×</div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 40],
    });