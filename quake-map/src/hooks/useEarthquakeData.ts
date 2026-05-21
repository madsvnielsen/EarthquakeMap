import { useEffect, useState } from 'react';
import { addDays, format } from 'date-fns';
import type { Earthquake } from '../types/earthquake';

type SortOption = 'time-desc' | 'time-asc' | 'magnitude-desc' | 'magnitude-asc' | null;
type Bounds = [[number, number], [number, number]];

const MAX_RESULTS = 10000;

export const useEarthquakeData = (
  minMagnitude: number,
  startDate: Date | null,
  endDate: Date | null,
  sortOption: SortOption,
  bounds?: Bounds | null,
) => {
  const [quakes, setQuakes] = useState<Earthquake[]>([]);
  const [loading, setLoading] = useState(false);
  const [didReachLimit, setDidReachLimit] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      if (!startDate || !endDate || Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
        return;
      }

      if (endDate < startDate) {
        return;
      }

      setLoading(true);
      setDidReachLimit(false);

      const startTime = format(startDate, 'yyyy-MM-dd');
      const endTime = format(addDays(endDate, 1), 'yyyy-MM-dd');

      const orderMap: Record<Exclude<SortOption, null>, string> = {
        'time-desc': 'time',
        'time-asc': 'time-asc',
        'magnitude-desc': 'magnitude',
        'magnitude-asc': 'magnitude-asc',
      };

      const baseUrl = new URL('https://earthquake.usgs.gov/fdsnws/event/1/query');
      baseUrl.searchParams.set('format', 'geojson');
      baseUrl.searchParams.set('starttime', startTime);
      baseUrl.searchParams.set('endtime', endTime);
      baseUrl.searchParams.set('minmagnitude', String(minMagnitude));
      if (sortOption) {
        baseUrl.searchParams.set('orderby', orderMap[sortOption]);
      }
      baseUrl.searchParams.set('limit', String(MAX_RESULTS));

      if (bounds) {
        const [[minLat, minLng], [maxLat, maxLng]] = bounds;
        baseUrl.searchParams.set('minlatitude', String(minLat));
        baseUrl.searchParams.set('maxlatitude', String(maxLat));
        baseUrl.searchParams.set('minlongitude', String(minLng));
        baseUrl.searchParams.set('maxlongitude', String(maxLng));
      }

      try {
        const res = await fetch(baseUrl.toString());
        const data = await res.json();
        const allFeatures = data?.features ?? [];

        if (cancelled) {
          return;
        }

        const slicedFeatures = allFeatures.slice(0, MAX_RESULTS);
        const parsed: Earthquake[] = slicedFeatures.map((feature: any) => {
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

        setQuakes(parsed);
        setDidReachLimit(allFeatures.length >= MAX_RESULTS);
      } catch (error) {
        if (!cancelled) {
          console.error('Error fetching earthquake data:', error);
          setQuakes([]);
          setDidReachLimit(false);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [minMagnitude, startDate, endDate, sortOption, bounds]);

  return { quakes, loading, didReachLimit };
};
