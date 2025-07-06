export type Earthquake = {
  id: string;
  title: string;
  magnitude: number;
  coords: [number, number, number]; // [longitude, latitude, depth]
  url: string;
  time: number; // Unix timestamp in ms
  place: string;

  alert?: string;       // e.g. 'green', 'yellow', 'red'
  tsunami?: number;     // 1 if tsunami triggered
  felt?: number;        // number of reports from people who felt it
  mmi?: number;         // Modified Mercalli Intensity
  cdi?: number;         // Community Internet Intensity
  gap?: number;         // gap in degrees in station coverage
  rms?: number;         // root mean square of amplitude
  dmin?: number;        // minimum distance to nearest station
  magType?: string;     // e.g. 'mb', 'ml', 'mww'
  type?: string;        // type of event, e.g. 'earthquake'
};