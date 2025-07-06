import { useEffect, useState } from "react";
import type { Earthquake } from "../types/earthquake";
import { format } from "date-fns";

export const useEarthquakeData = (
  minMagnitude: number,
  startDate: Date | null,
  endDate: Date | null,
  offset: number,
  sortOption: 'time-desc' | 'time-asc' | 'magnitude-desc' | 'magnitude-asc',
  bounds?: [[number, number], [number, number]] | null
) => {
  const [quakes, setQuakes] = useState<Earthquake[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!startDate || !endDate) return;

    const startTime = format(startDate, 'yyyy-MM-dd');
    const endTime = format(endDate, 'yyyy-MM-dd');
    const calculatedOffset = (offset - 1) * 100 + 1;

    const orderMap: Record<typeof sortOption, string> = {
      'time-desc': 'time',
      'time-asc': 'time-asc',
      'magnitude-desc': 'magnitude',
      'magnitude-asc': 'magnitude-asc'
    };
    
    let url = `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=${startTime}&endtime=${endTime}&minmagnitude=${minMagnitude}&limit=100&offset=${calculatedOffset}&orderby=${orderMap[sortOption]}`;

    if (bounds) {
      const [[minLat, minLng], [maxLat, maxLng]] = bounds;
      url += `&minlatitude=${minLat}&maxlatitude=${maxLat}&minlongitude=${minLng}&maxlongitude=${maxLng}`;
    }

    setLoading(true);
    fetch(url)
      .then(res => res.json())
      .then(data => {
        const parsed: Earthquake[] = data.features.map((feature: any) => ({
          id: feature.id,
          title: feature.properties.title,
          magnitude: feature.properties.mag,
          coords: [feature.geometry.coordinates[1], feature.geometry.coordinates[0]],
          url: feature.properties.url,
          time: feature.properties.time,
          place: feature.properties.place,
        }));
        console.log(offset)
        setQuakes(prev => (offset === 1 ? parsed : [...prev, ...parsed]));
      })
      .finally(() => setLoading(false));
  }, [minMagnitude, startDate, endDate, offset, sortOption, bounds]);

  return { quakes, loading };
};
