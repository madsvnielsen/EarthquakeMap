import type { ReactNode } from 'react';
import { Box, Stack, Typography } from '@mui/material';
import type { Earthquake } from '../types/earthquake';
import {
  differenceInCalendarDays,
  endOfDay,
  format,
  isValid,
  startOfDay,
} from 'date-fns';

type Props = {
  quakes: Earthquake[];
  startDate: Date | null;
  endDate: Date | null;
};

type HistogramBin = {
  label: string;
  count: number;
  percentage: number;
};

type SeriesPoint = {
  label: string;
  count: number;
};

type TimeSeries = {
  label: string;
  points: SeriesPoint[];
};

const BAR_COLOR = '#ff8a5b';
const ALT_BAR_COLOR = '#6fd6c2';

export const EarthquakeInsights = ({ quakes, startDate, endDate }: Props) => {
  const magnitudeBins = buildMagnitudeHistogram(quakes);
  const depthBins = buildDepthHistogram(quakes);
  const timeSeries = buildAdaptiveTimeSeries(quakes, startDate, endDate);

  return (
    <Stack spacing={1.4}>
      <InsightBlock
        title="Magnitude distribution"
        subtitle="Percentage of earthquakes in each magnitude band."
      >
        <HistogramChart bins={magnitudeBins} color={BAR_COLOR} emptyLabel="No magnitude data yet." />
      </InsightBlock>

      <InsightBlock
        title="Depth distribution"
        subtitle="How the selected earthquakes are spread by depth."
      >
        <HistogramChart bins={depthBins} color={ALT_BAR_COLOR} emptyLabel="No depth data yet." />
      </InsightBlock>

      <InsightBlock
        title="Quakes over time"
        subtitle={`Activity grouped into up to 20 time buckets for the current region and selected period.`}
      >
        <TimeSeriesChart points={timeSeries.points} emptyLabel="Choose a valid date range to see activity." />
      </InsightBlock>
    </Stack>
  );
};

const InsightBlock = ({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) => (
  <Box
    sx={{
      p: 1.4,
      borderRadius: '8px',
      bgcolor: 'rgba(255, 255, 255, 0.03)',
      border: '1px solid rgba(169, 192, 215, 0.08)',
    }}
  >
    <Typography variant="subtitle2">{title}</Typography>
    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.2 }}>
      {subtitle}
    </Typography>
    {children}
  </Box>
);

const HistogramChart = ({
  bins,
  color,
  emptyLabel,
}: {
  bins: HistogramBin[];
  color: string;
  emptyLabel: string;
}) => {
  const maxPercentage = Math.max(...bins.map((bin) => bin.percentage), 0);

  if (!bins.some((bin) => bin.count > 0)) {
    return (
      <Typography variant="caption" color="text.secondary">
        {emptyLabel}
      </Typography>
    );
  }

  return (
    <Stack spacing={1}>
      {bins.map((bin) => {
        const width = maxPercentage === 0 ? 0 : (bin.percentage / maxPercentage) * 100;

        return (
          <Box
            key={bin.label}
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '72px 1fr auto', md: '82px 1fr auto' },
              alignItems: 'center',
              columnGap: 1,
            }}
          >
            <Typography variant="caption" color="text.secondary">
              {bin.label}
            </Typography>
            <Box
              sx={{
                position: 'relative',
                height: 18,
                borderRadius: '5px',
                overflow: 'hidden',
                bgcolor: 'rgba(159, 179, 200, 0.12)',
                border: '1px solid rgba(169, 192, 215, 0.08)',
              }}
            >
              <Box
                sx={{
                  height: '100%',
                  width: `${width}%`,
                  minWidth: bin.count > 0 ? 8 : 0,
                  bgcolor: color,
                  borderRadius: '4px',
                  transition: 'width 180ms ease',
                }}
              />
              <Typography
                variant="caption"
                sx={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 600,
                  color: width > 45 ? '#08131c' : 'text.secondary',
                }}
              >
                {bin.count}
              </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'right', minWidth: 34 }}>
              {bin.percentage.toFixed(0)}%
            </Typography>
          </Box>
        );
      })}
    </Stack>
  );
};

const TimeSeriesChart = ({
  points,
  emptyLabel,
}: {
  points: SeriesPoint[];
  emptyLabel: string;
}) => {
  const maxCount = Math.max(...points.map((point) => point.count), 0);

  if (points.length === 0) {
    return (
      <Typography variant="caption" color="text.secondary">
        {emptyLabel}
      </Typography>
    );
  }

  if (maxCount === 0) {
    return (
      <Typography variant="caption" color="text.secondary">
        No earthquakes landed in the selected period.
      </Typography>
    );
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 0.5, minHeight: 128 }}>
      {points.map((point) => {
        const height = maxCount === 0 ? 0 : (point.count / maxCount) * 100;
        return (
          <Box key={point.label} sx={{ flex: 1, minWidth: 0 }}>
            <Box
              sx={{
                height: 90,
                display: 'flex',
                alignItems: 'flex-end',
              }}
            >
              <Box
                sx={{
                  position: 'relative',
                  width: '100%',
                  height: `${Math.max(height, point.count > 0 ? 6 : 0)}%`,
                  bgcolor: 'secondary.main',
                  borderRadius: '4px 4px 0 0',
                }}
                title={`${point.label}: ${point.count}`}
              >
                <Typography
                  variant="caption"
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    fontSize: '0.62rem',
                    lineHeight: 1,
                    color: '#08131c',
                    fontWeight: 700,
                  }}
                >
                  <Box
                    component="span"
                    sx={{
                      writingMode: 'vertical-rl',
                      textOrientation: 'mixed',
                      transform: 'rotate(180deg)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {point.count}
                  </Box>
                </Typography>
              </Box>
            </Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                mt: 0.75,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'flex-start',
                minHeight: 52,
                fontSize: '0.62rem',
                lineHeight: 1,
              }}
            >
              <Box
                component="span"
                sx={{
                  writingMode: 'vertical-rl',
                  textOrientation: 'mixed',
                  transform: 'rotate(180deg)',
                  whiteSpace: 'nowrap',
                }}
              >
                {point.label}
              </Box>
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
};

const buildMagnitudeHistogram = (quakes: Earthquake[]): HistogramBin[] => {
  const ranges = Array.from({ length: 10 }, (_, index) => ({
    label: `${index}-${index + 1}`,
    min: index,
    max: index + 1,
  }));

  const counts = ranges.map((range) =>
    quakes.filter((quake) => {
      const magnitude = quake.magnitude ?? 0;
      return magnitude >= range.min && (range.max === 10 ? magnitude <= range.max : magnitude < range.max);
    }).length,
  );

  return toHistogramBins(ranges.map((range) => range.label), counts);
};

const buildDepthHistogram = (quakes: Earthquake[]): HistogramBin[] => {
  const ranges = [
    { label: '0-10 km', min: 0, max: 10 },
    { label: '10-30 km', min: 10, max: 30 },
    { label: '30-70 km', min: 30, max: 70 },
    { label: '70-150 km', min: 70, max: 150 },
    { label: '150-300 km', min: 150, max: 300 },
    { label: '300+ km', min: 300, max: Number.POSITIVE_INFINITY },
  ];

  const counts = ranges.map((range) =>
    quakes.filter((quake) => {
      const depth = quake.coords[2] ?? 0;
      return depth >= range.min && depth < range.max;
    }).length,
  );

  return toHistogramBins(ranges.map((range) => range.label), counts);
};

const toHistogramBins = (labels: string[], counts: number[]): HistogramBin[] => {
  const total = counts.reduce((sum, count) => sum + count, 0);

  return labels.map((label, index) => ({
    label,
    count: counts[index],
    percentage: total === 0 ? 0 : (counts[index] / total) * 100,
  }));
};

const buildAdaptiveTimeSeries = (
  quakes: Earthquake[],
  startDate: Date | null,
  endDate: Date | null,
): TimeSeries => {
  if (!startDate || !endDate || !isValid(startDate) || !isValid(endDate)) {
    return { label: 'time', points: [] };
  }

  const from = startOfDay(startDate);
  const to = endOfDay(endDate);

  if (from > to) {
    return { label: 'time', points: [] };
  }

  const daySpan = differenceInCalendarDays(to, from) + 1;
  const bucketCount = Math.min(20, Math.max(1, daySpan));

  return {
    label: 'time',
    points: buildTimeBuckets(quakes, from, to, bucketCount),
  };
};

const buildTimeBuckets = (
  quakes: Earthquake[],
  from: Date,
  to: Date,
  bucketCount: number,
): SeriesPoint[] => {
  const points: SeriesPoint[] = [];
  const totalMs = to.getTime() - from.getTime() + 1;

  for (let index = 0; index < bucketCount; index += 1) {
    const bucketStartMs = from.getTime() + Math.floor((totalMs * index) / bucketCount);
    const nextStartMs =
      index === bucketCount - 1
        ? to.getTime() + 1
        : from.getTime() + Math.floor((totalMs * (index + 1)) / bucketCount);
    const bucketStart = new Date(bucketStartMs);
    const bucketEnd = new Date(Math.min(nextStartMs - 1, to.getTime()));

    const count = quakes.filter((quake) => {
      return quake.time >= bucketStart.getTime() && quake.time <= bucketEnd.getTime();
    }).length;

    points.push({
      label: formatBucketLabel(bucketStart, bucketEnd, bucketCount),
      count,
    });
  }

  return points;
};

const formatBucketLabel = (bucketStart: Date, bucketEnd: Date, bucketCount: number) => {
  const sameDay = startOfDay(bucketStart).getTime() === startOfDay(bucketEnd).getTime();

  if (sameDay) {
    return format(bucketStart, 'MMM d');
  }

  if (bucketCount <= 7) {
    return `${format(bucketStart, 'MMM d')}-${format(bucketEnd, 'MMM d')}`;
  }

  if (bucketStart.getFullYear() !== bucketEnd.getFullYear()) {
    return `${format(bucketStart, 'yy')}-${format(bucketEnd, 'yy')}`;
  }

  return `${format(bucketStart, 'MMM d')}-${format(bucketEnd, 'MMM d')}`;
};
