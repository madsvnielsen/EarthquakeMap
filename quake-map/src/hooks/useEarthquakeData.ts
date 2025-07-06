import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import type { Earthquake } from '../types/earthquake';

type SortOption = 'time-desc' | 'time-asc' | 'magnitude-desc' | 'magnitude-asc';
type Bounds = [[number, number], [number, number]];

export const useEarthquakeData = (
  minMagnitude: number,
  startDate: Date | null,
  endDate: Date | null,
  offset: number,
  sortOption: SortOption,
  bounds?: Bounds | null
) => {
  const [quakes, setQuakes] = useState<Earthquake[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!startDate || !endDate || isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        console.warn('Invalid or missing start/end date');
        return;
      }
      if (endDate < startDate) {
        console.warn('End date is earlier than start date');
        return;
      }

      setLoading(true);

      // 📆 Format dates
      const startTime = format(startDate, 'yyyy-MM-dd');
      const endTime = format(endDate, 'yyyy-MM-dd');
      const calculatedOffset = (offset - 1) * 100 + 1;

      const orderMap: Record<SortOption, string> = {
        'time-desc': 'time',
        'time-asc': 'time-asc',
        'magnitude-desc': 'magnitude',
        'magnitude-asc': 'magnitude-asc',
      };

      // 🌐 Build API URL
      let url = `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=${startTime}&endtime=${endTime}&minmagnitude=${minMagnitude}&limit=100&offset=${calculatedOffset}&orderby=${orderMap[sortOption]}`;

      if (bounds) {
        const [[minLat, minLng], [maxLat, maxLng]] = bounds;
        url += `&minlatitude=${minLat}&maxlatitude=${maxLat}&minlongitude=${minLng}&maxlongitude=${maxLng}`;
      }

      try {
        const res = await fetch(url);
        const data = await res.json();

        if (!data?.features?.length) {
          console.info('No data returned for this query.');
          setQuakes([]);
          return;
        }

        const parsed: Earthquake[] = data.features.map((feature: any) => {
          const { id, properties, geometry } = feature;
          const [lng, lat, depth = 0] = geometry.coordinates;

          return {
            id,
            title: properties.title,
            magnitude: properties.mag,
            coords: [lat, lng, depth],
            url: properties.url,
            time: properties.time,
            place: properties.place,

            alert: properties.alert ?? undefined,
            tsunami: properties.tsunami ?? undefined,
            felt: properties.felt ?? undefined,
            mmi: properties.mmi ?? undefined,
            cdi: properties.cdi ?? undefined,
            gap: properties.gap ?? undefined,
            rms: properties.rms ?? undefined,
            dmin: properties.dmin ?? undefined,
            magType: properties.magType ?? undefined,
            type: properties.type ?? undefined,
          };
        });

        setQuakes(prev => (offset === 1 ? parsed : [...prev, ...parsed]));
      } catch (error) {
        console.error('Error fetching earthquake data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [minMagnitude, startDate, endDate, offset, sortOption, bounds]);

  return { quakes, loading };
};
