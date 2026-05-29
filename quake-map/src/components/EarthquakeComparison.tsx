import { Box, Button, CircularProgress, Stack, Typography } from '@mui/material';
import { differenceInCalendarDays, endOfDay, format, isValid, startOfDay } from 'date-fns';
import { DatePicker } from '@mui/x-date-pickers';
import type { Earthquake } from '../types/earthquake';

type Props = {
  currentQuakes: Earthquake[];
  previousQuakes: Earthquake[];
  currentStartDate: Date | null;
  currentEndDate: Date | null;
  previousStartDate: Date | null;
  previousEndDate: Date | null;
  draftPreviousStartDate: Date | null;
  draftPreviousEndDate: Date | null;
  setDraftPreviousEndDate: (value: Date | null) => void;
  loading: boolean;
  hasComparison: boolean;
  isStale: boolean;
  onRunComparison: () => void;
};

type ComparisonMetric = {
  label: string;
  currentValue: string;
  previousValue: string;
  delta: string;
};

export const EarthquakeComparison = ({
  currentQuakes,
  previousQuakes,
  currentStartDate,
  currentEndDate,
  previousStartDate,
  previousEndDate,
  draftPreviousStartDate,
  draftPreviousEndDate,
  setDraftPreviousEndDate,
  loading,
  hasComparison,
  isStale,
  onRunComparison,
}: Props) => {
  const hasValidCurrentRange = Boolean(
    currentStartDate &&
      currentEndDate &&
      isValid(currentStartDate) &&
      isValid(currentEndDate) &&
      currentStartDate <= currentEndDate,
  );

  const buttonLabel = hasComparison
    ? isStale
      ? 'Compare with new data'
      : 'Refresh comparison'
    : 'Compare to previous period';

  const comparison = hasComparison
    ? buildComparisonData(
        currentQuakes,
        previousQuakes,
        currentStartDate,
        currentEndDate,
        previousStartDate,
        previousEndDate,
      )
    : null;

  return (
    <Stack spacing={1.2}>
      <Box
        sx={{
          p: 1.1,
          borderRadius: '8px',
          bgcolor: 'rgba(255, 255, 255, 0.035)',
          border: '1px solid rgba(169, 192, 215, 0.08)',
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center" gap={1} flexWrap="wrap">
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {hasComparison ? 'Comparison workspace' : 'Comparison not loaded yet'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {hasComparison
                ? isStale
                  ? 'Showing the last comparison result. Run again to compare the newly loaded data.'
                  : 'Current window is compared against the immediately preceding equal-length period.'
                : 'Fetch the previous equal-length period only when you want this analysis.'}
            </Typography>
          </Box>

          <Button
            variant="contained"
            color="primary"
            onClick={onRunComparison}
            disabled={!hasValidCurrentRange || loading || !draftPreviousEndDate || !isValid(draftPreviousEndDate)}
            startIcon={loading ? <CircularProgress size={14} color="inherit" /> : undefined}
          >
            {buttonLabel}
          </Button>
        </Stack>
      </Box>

      {hasValidCurrentRange && (
        <Box
          sx={{
            p: 1.1,
            borderRadius: '8px',
            bgcolor: 'rgba(255, 255, 255, 0.035)',
            border: '1px solid rgba(169, 192, 215, 0.08)',
          }}
        >
          <Stack spacing={1}>
            <DatePicker
              label="Comparison period ends"
              value={draftPreviousEndDate}
              onChange={setDraftPreviousEndDate}
              slotProps={{
                textField: { size: 'small', fullWidth: true },
              }}
            />
            <Typography variant="caption" color="text.secondary">
              Comparison range: {formatDraftRangeLabel(draftPreviousStartDate, draftPreviousEndDate)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              It will automatically use the same length as the current period.
            </Typography>
          </Stack>
        </Box>
      )}

      {!hasComparison ? (
        <Typography variant="caption" color="text.secondary">
          Run the comparison to fetch the previous period and populate this card.
        </Typography>
      ) : loading && previousQuakes.length === 0 ? (
        <Stack spacing={1} alignItems="center" sx={{ py: 2 }}>
          <CircularProgress size={24} color="secondary" />
          <Typography variant="caption" color="text.secondary">
            Loading previous period earthquake data...
          </Typography>
        </Stack>
      ) : comparison ? (
        <>
          <Typography variant="caption" color="text.secondary">
            {formatRangeLabel(currentStartDate, currentEndDate)} vs {formatRangeLabel(previousStartDate, previousEndDate)}
          </Typography>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
              gap: 1,
            }}
          >
            {comparison.metrics.map((metric) => (
              <Box
                key={metric.label}
                sx={{
                  p: 1.05,
                  borderRadius: '8px',
                  bgcolor: 'rgba(255, 255, 255, 0.035)',
                  border: '1px solid rgba(169, 192, 215, 0.08)',
                }}
              >
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.35 }}>
                  {metric.label}
                </Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.1 }}>
                  {metric.currentValue}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>
                  Prev: {metric.previousValue}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: metric.delta.startsWith('+')
                      ? 'primary.main'
                      : metric.delta.startsWith('-')
                        ? '#ff8f8f'
                        : 'secondary.main',
                  }}
                >
                  {metric.delta}
                </Typography>
              </Box>
            ))}
          </Box>

          <Box
            sx={{
              p: 1.1,
              borderRadius: '8px',
              bgcolor: 'rgba(111, 214, 194, 0.08)',
              border: '1px solid rgba(111, 214, 194, 0.16)',
            }}
          >
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.55 }}>
              Takeaways
            </Typography>
            <Stack spacing={0.45}>
              {comparison.takeaways.map((takeaway) => (
                <Typography key={takeaway} variant="body2" sx={{ lineHeight: 1.35 }}>
                  {takeaway}
                </Typography>
              ))}
            </Stack>
          </Box>
        </>
      ) : (
        <Typography variant="caption" color="text.secondary">
          Choose a valid date range to compare periods.
        </Typography>
      )}
    </Stack>
  );
};

const buildComparisonData = (
  currentQuakes: Earthquake[],
  previousQuakes: Earthquake[],
  currentStartDate: Date | null,
  currentEndDate: Date | null,
  previousStartDate: Date | null,
  previousEndDate: Date | null,
) => {
  if (
    !currentStartDate ||
    !currentEndDate ||
    !previousStartDate ||
    !previousEndDate ||
    !isValid(currentStartDate) ||
    !isValid(currentEndDate) ||
    !isValid(previousStartDate) ||
    !isValid(previousEndDate)
  ) {
    return null;
  }

  const currentDays =
    Math.max(1, differenceInCalendarDays(endOfDay(currentEndDate), startOfDay(currentStartDate)) + 1);
  const previousDays =
    Math.max(1, differenceInCalendarDays(endOfDay(previousEndDate), startOfDay(previousStartDate)) + 1);

  const currentTotal = currentQuakes.length;
  const previousTotal = previousQuakes.length;
  const currentPerDay = currentTotal / currentDays;
  const previousPerDay = previousTotal / previousDays;
  const currentStrong = currentQuakes.filter((quake) => (quake.magnitude ?? 0) >= 4).length;
  const previousStrong = previousQuakes.filter((quake) => (quake.magnitude ?? 0) >= 4).length;
  const currentPeak = currentQuakes.reduce((max, quake) => Math.max(max, quake.magnitude ?? 0), 0);
  const previousPeak = previousQuakes.reduce((max, quake) => Math.max(max, quake.magnitude ?? 0), 0);
  const currentEnergy = currentQuakes.reduce((sum, quake) => sum + estimateSeismicEnergy(quake.magnitude ?? 0), 0);
  const previousEnergy = previousQuakes.reduce((sum, quake) => sum + estimateSeismicEnergy(quake.magnitude ?? 0), 0);
  const currentShallowShare = currentTotal === 0 ? 0 : (currentQuakes.filter((quake) => (quake.coords[2] ?? 0) < 70).length / currentTotal) * 100;
  const previousShallowShare = previousTotal === 0 ? 0 : (previousQuakes.filter((quake) => (quake.coords[2] ?? 0) < 70).length / previousTotal) * 100;

  const metrics: ComparisonMetric[] = [
    {
      label: 'Total quakes',
      currentValue: currentTotal.toLocaleString(),
      previousValue: previousTotal.toLocaleString(),
      delta: formatPercentDelta(currentTotal, previousTotal),
    },
    {
      label: 'Quakes / day',
      currentValue: currentPerDay.toFixed(currentPerDay >= 10 ? 1 : 2),
      previousValue: previousPerDay.toFixed(previousPerDay >= 10 ? 1 : 2),
      delta: formatNumericDelta(currentPerDay, previousPerDay, '/day'),
    },
    {
      label: 'M4+ events',
      currentValue: currentStrong.toLocaleString(),
      previousValue: previousStrong.toLocaleString(),
      delta: formatIntegerDelta(currentStrong, previousStrong),
    },
    {
      label: 'Peak magnitude',
      currentValue: currentPeak > 0 ? currentPeak.toFixed(1) : 'None',
      previousValue: previousPeak > 0 ? previousPeak.toFixed(1) : 'None',
      delta: formatNumericDelta(currentPeak, previousPeak, ' mag'),
    },
    {
      label: 'Estimated energy',
      currentValue: formatEnergy(currentEnergy),
      previousValue: formatEnergy(previousEnergy),
      delta: formatRatio(currentEnergy, previousEnergy),
    },
    {
      label: 'Depth profile',
      currentValue: `${Math.round(currentShallowShare)}% shallow`,
      previousValue: `${Math.round(previousShallowShare)}% shallow`,
      delta: formatNumericDelta(currentShallowShare, previousShallowShare, ' pts'),
    },
  ];

  const takeaways = buildTakeaways(
    currentTotal,
    previousTotal,
    currentPerDay,
    previousPerDay,
    currentStrong,
    previousStrong,
    currentShallowShare,
    previousShallowShare,
  );

  return { metrics, takeaways };
};

const buildTakeaways = (
  currentTotal: number,
  previousTotal: number,
  currentPerDay: number,
  previousPerDay: number,
  currentStrong: number,
  previousStrong: number,
  currentShallowShare: number,
  previousShallowShare: number,
) => {
  const activityLine =
    currentPerDay > previousPerDay * 1.2
      ? 'Activity is clearly higher than in the previous equal-length period.'
      : currentPerDay < previousPerDay * 0.8
        ? 'Activity is noticeably lower than in the previous equal-length period.'
        : 'Overall activity is broadly similar to the previous equal-length period.';

  const compositionLine =
    currentStrong > previousStrong
      ? 'The current window contains more strong earthquakes, not just more total events.'
      : currentStrong < previousStrong
        ? 'The current window has fewer strong earthquakes even if total counts are similar.'
        : Math.abs(currentShallowShare - previousShallowShare) >= 8
          ? currentShallowShare > previousShallowShare
            ? 'The current window is skewing shallower than the previous one.'
            : 'The current window is skewing deeper than the previous one.'
          : currentTotal === 0 && previousTotal === 0
            ? 'Neither period contains loaded earthquakes yet.'
            : 'The event mix is similar, so the comparison is mostly about overall rate.';

  return [activityLine, compositionLine];
};

const formatRangeLabel = (startDate: Date | null, endDate: Date | null) => {
  if (!startDate || !endDate || !isValid(startDate) || !isValid(endDate)) {
    return 'Invalid range';
  }

  return `${format(startDate, 'yy/MM/dd')} - ${format(endDate, 'yy/MM/dd')}`;
};

const formatDraftRangeLabel = (startDate: Date | null, endDate: Date | null) => {
  if (!startDate || !endDate || !isValid(startDate) || !isValid(endDate)) {
    return 'Choose a valid end date';
  }

  return `${format(startDate, 'yy/MM/dd')} - ${format(endDate, 'yy/MM/dd')}`;
};

const formatPercentDelta = (current: number, previous: number) => {
  if (previous === 0) {
    return current === 0 ? 'No change' : 'New activity in current period';
  }

  const delta = ((current - previous) / previous) * 100;
  return `${delta >= 0 ? '+' : ''}${delta.toFixed(1)}% vs previous`;
};

const formatNumericDelta = (current: number, previous: number, suffix: string) => {
  const delta = current - previous;

  if (Math.abs(delta) < 0.005) {
    return 'No meaningful change';
  }

  return `${delta >= 0 ? '+' : ''}${delta.toFixed(Math.abs(delta) >= 10 ? 1 : 2)}${suffix}`;
};

const formatIntegerDelta = (current: number, previous: number) => {
  const delta = current - previous;

  if (delta === 0) {
    return 'No change';
  }

  return `${delta >= 0 ? '+' : ''}${delta} vs previous`;
};

const estimateSeismicEnergy = (magnitude: number) => 10 ** (1.5 * magnitude + 4.8);

const formatEnergy = (value: number) => {
  if (!Number.isFinite(value) || value <= 0) {
    return 'None';
  }

  if (value >= 1e15) {
    return `${(value / 1e15).toFixed(1)} PJ`;
  }

  if (value >= 1e12) {
    return `${(value / 1e12).toFixed(1)} TJ`;
  }

  if (value >= 1e9) {
    return `${(value / 1e9).toFixed(1)} GJ`;
  }

  return `${(value / 1e6).toFixed(1)} MJ`;
};

const formatRatio = (current: number, previous: number) => {
  if (previous <= 0) {
    return current <= 0 ? 'No change' : 'Higher than previous';
  }

  const ratio = current / previous;
  return `${ratio.toFixed(2)}x previous`;
};
