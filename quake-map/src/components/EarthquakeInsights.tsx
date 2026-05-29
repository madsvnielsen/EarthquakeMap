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
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
  type ChartData,
  type ChartOptions,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

type Props = {
  quakes: Earthquake[];
  startDate: Date | null;
  endDate: Date | null;
  minMagnitude: number;
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

const BAR_COLOR = '#ff8a5b';
const ALT_BAR_COLOR = '#6fd6c2';
const GRID_COLOR = 'rgba(169, 192, 215, 0.12)';
const TICK_COLOR = '#9fb3c8';

export const EarthquakeInsights = ({ quakes, startDate, endDate, minMagnitude }: Props) => {
  const magnitudeBins = buildMagnitudeHistogram(quakes, minMagnitude);
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
        subtitle="Activity grouped into up to 20 time buckets for the current region and selected period."
      >
        <TimeSeriesChart points={timeSeries} emptyLabel="Choose a valid date range to see activity." />
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
  if (!bins.some((bin) => bin.count > 0)) {
    return (
      <Typography variant="caption" color="text.secondary">
        {emptyLabel}
      </Typography>
    );
  }

  const data: ChartData<'bar'> = {
    labels: bins.map((bin) => bin.label),
    datasets: [
      {
        label: 'Percent',
        data: bins.map((bin) => Number(bin.percentage.toFixed(2))),
        backgroundColor: color,
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  };

  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => {
            const bin = bins[context.dataIndex];
            return `${bin.count} quakes (${bin.percentage.toFixed(1)}%)`;
          },
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        grid: { color: GRID_COLOR },
        ticks: {
          color: TICK_COLOR,
          callback: (value) => `${value}%`,
        },
      },
      y: {
        grid: { display: false },
        ticks: { color: TICK_COLOR },
      },
    },
  };

  return (
    <Box sx={{ height: Math.max(180, bins.length * 28) }}>
      <Bar data={data} options={options} />
    </Box>
  );
};

const TimeSeriesChart = ({
  points,
  emptyLabel,
}: {
  points: SeriesPoint[];
  emptyLabel: string;
}) => {
  if (points.length === 0) {
    return (
      <Typography variant="caption" color="text.secondary">
        {emptyLabel}
      </Typography>
    );
  }

  const hasData = points.some((point) => point.count > 0);

  if (!hasData) {
    return (
      <Typography variant="caption" color="text.secondary">
        No earthquakes landed in the selected period.
      </Typography>
    );
  }

  const data: ChartData<'bar'> = {
    labels: points.map((point) => point.label),
    datasets: [
      {
        label: 'Quakes',
        data: points.map((point) => point.count),
        backgroundColor: ALT_BAR_COLOR,
        borderRadius: 4,
        borderSkipped: false,
        maxBarThickness: 28,
      },
    ],
  };

  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => `${context.raw} quakes`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: TICK_COLOR,
          autoSkip: true,
          maxRotation: 0,
          minRotation: 0,
          font: { size: 10 },
        },
      },
      y: {
        beginAtZero: true,
        grid: { color: GRID_COLOR },
        ticks: {
          color: TICK_COLOR,
          precision: 0,
        },
      },
    },
  };

  return (
    <Box sx={{ height: 240 }}>
      <Bar data={data} options={options} />
    </Box>
  );
};

const buildMagnitudeHistogram = (quakes: Earthquake[], minMagnitude: number): HistogramBin[] => {
  const ranges = Array.from({ length: 10 }, (_, index) => ({
    label: `${index}-${index + 1}`,
    min: index,
    max: index + 1,
  })).filter((range) => range.max > minMagnitude);

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
): SeriesPoint[] => {
  if (!startDate || !endDate || !isValid(startDate) || !isValid(endDate)) {
    return [];
  }

  const from = startOfDay(startDate);
  const to = endOfDay(endDate);

  if (from > to) {
    return [];
  }

  const daySpan = differenceInCalendarDays(to, from) + 1;
  const bucketCount = Math.min(20, Math.max(1, daySpan));

  return buildTimeBuckets(quakes, from, to, bucketCount);
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
    return format(bucketStart, 'yy/MM/dd');
  }

  if (bucketCount <= 7) {
    return `${format(bucketStart, 'yy/MM/dd')}-${format(bucketEnd, 'yy/MM/dd')}`;
  }

  return `${format(bucketStart, 'yy/MM/dd')}`;
};
