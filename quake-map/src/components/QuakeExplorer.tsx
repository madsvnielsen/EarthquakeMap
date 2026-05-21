import { useEffect, useMemo, useState } from 'react';
import { useEarthquakeData } from '../hooks/useEarthquakeData';
import { EarthquakeMap } from './EarthquakeMap';
import EarthquakeSidebar from './EarthquakeSidebar';
import { AreaSelectionAlert } from './AreaSelectionAlert';
import { isValid, subDays } from 'date-fns';
import { TopBar } from './TopBar';
import { SplashScreen } from './SplashScreen';
import { Box, Button, CircularProgress, Stack, Typography } from '@mui/material';

type SortOption = 'magnitude-desc' | 'magnitude-asc' | 'time-desc' | 'time-asc';
type ActivePanel = 'filters' | 'list' | 'insights' | null;
type Bounds = [[number, number], [number, number]] | null;

type FilterState = {
  minMagnitude: number;
  sliderValue: number;
  startDate: Date | null;
  endDate: Date | null;
  sortOption: SortOption;
  selectedBounds: Bounds;
};

const createInitialFilters = (): FilterState => {
  const now = new Date();
  return {
    minMagnitude: 0,
    sliderValue: 0,
    startDate: subDays(now, 1),
    endDate: now,
    sortOption: 'magnitude-desc',
    selectedBounds: null,
  };
};

const QuakeExplorer = () => {
  const [selectedCoords, setSelectedCoords] = useState<[number, number] | null>(null);
  const [areaSelectionEnabled, setAreaSelectionEnabled] = useState(false);
  const [activePanel, setActivePanel] = useState<ActivePanel>('list');
  const [currentPage, setCurrentPage] = useState(1);
  const [draftFilters, setDraftFilters] = useState<FilterState>(() => createInitialFilters());
  const [appliedFilters, setAppliedFilters] = useState<FilterState>(() => createInitialFilters());
  const [initialLoading, setInitialLoading] = useState(true);

  const itemsPerPage = 10;
  const { quakes, loading, didReachLimit } = useEarthquakeData(
    appliedFilters.minMagnitude,
    appliedFilters.startDate,
    appliedFilters.endDate,
    appliedFilters.sortOption,
    appliedFilters.selectedBounds,
  );

  useEffect(() => {
    if (!loading) {
      setInitialLoading(false);
    }
  }, [loading]);

  useEffect(() => {
    setCurrentPage(1);
  }, [quakes]);

  const totalPages = Math.max(1, Math.ceil(quakes.length / itemsPerPage));
  const paginatedQuakes = quakes.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const hasValidDraftRange = isValidDateRange(draftFilters.startDate, draftFilters.endDate);
  const hasPendingChanges = !filtersEqual(draftFilters, appliedFilters);

  const overlayState = loading
    ? 'loading'
    : hasPendingChanges
      ? hasValidDraftRange
        ? 'apply'
        : 'invalid'
      : null;

  const handleApplyFilters = () => {
    if (!hasValidDraftRange || loading) {
      return;
    }

    setAppliedFilters(cloneFilters(draftFilters));
    setCurrentPage(1);
  };

  const handleResetDraftFilters = () => {
    const resetFilters = createInitialFilters();
    setDraftFilters(resetFilters);
    setAreaSelectionEnabled(false);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const mapInactive = loading;

  const topBarStartDate = useMemo(() => {
    return isValidDateRange(draftFilters.startDate, draftFilters.endDate)
      ? draftFilters.startDate
      : appliedFilters.startDate;
  }, [draftFilters.startDate, draftFilters.endDate, appliedFilters.startDate]);

  const topBarEndDate = useMemo(() => {
    return isValidDateRange(draftFilters.startDate, draftFilters.endDate)
      ? draftFilters.endDate
      : appliedFilters.endDate;
  }, [draftFilters.startDate, draftFilters.endDate, appliedFilters.endDate]);

  if (initialLoading) {
    return <SplashScreen />;
  }

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: '100vh',
        overflow: 'hidden',
        background:
          'radial-gradient(circle at top left, rgba(255, 138, 91, 0.12), transparent 30%), radial-gradient(circle at bottom right, rgba(111, 214, 194, 0.12), transparent 28%)',
      }}
    >
      <TopBar
        startDate={topBarStartDate}
        endDate={topBarEndDate}
        minMagnitude={appliedFilters.minMagnitude}
        resultCount={quakes.length}
        areaFilter={appliedFilters.selectedBounds !== null}
        didReachLimit={didReachLimit}
      />

      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          p: { xs: 0.75, md: 2 },
          pt: { xs: 8.5, md: 10.5 },
        }}
      >
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            height: '100%',
            overflow: 'hidden',
            borderRadius: { xs: '8px', md: '12px' },
            border: '1px solid rgba(169, 192, 215, 0.1)',
            boxShadow: '0 30px 60px rgba(0, 0, 0, 0.3)',
            opacity: mapInactive ? 0.58 : 1,
            pointerEvents: mapInactive ? 'none' : 'auto',
            transition: 'opacity 180ms ease',
          }}
        >
          <EarthquakeMap
            quakes={quakes}
            selectedCoords={selectedCoords}
            areaSelectionEnabled={areaSelectionEnabled}
            setSelectedBounds={(bounds) =>
              setDraftFilters((current) => ({
                ...current,
                selectedBounds: bounds,
              }))
            }
            setAreaSelectionEnabled={setAreaSelectionEnabled}
            selectedBounds={draftFilters.selectedBounds}
          />

          <EarthquakeSidebar
            quakes={paginatedQuakes}
            allQuakes={quakes}
            onSelectQuake={setSelectedCoords}
            currentPage={currentPage}
            totalPages={totalPages}
            onNextPage={handleNextPage}
            onPrevPage={handlePreviousPage}
            loading={loading}
            minMagnitude={draftFilters.minMagnitude}
            sliderValue={draftFilters.sliderValue}
            setSliderValue={(value) =>
              setDraftFilters((current) => ({
                ...current,
                sliderValue: value,
              }))
            }
            setMinMagnitude={(value) =>
              setDraftFilters((current) => ({
                ...current,
                minMagnitude: value,
              }))
            }
            startDate={draftFilters.startDate}
            endDate={draftFilters.endDate}
            setStartDate={(value) =>
              setDraftFilters((current) => ({
                ...current,
                startDate: value,
              }))
            }
            setEndDate={(value) =>
              setDraftFilters((current) => ({
                ...current,
                endDate: value,
              }))
            }
            areaSelectionEnabled={areaSelectionEnabled}
            setAreaSelectionEnabled={(value) => {
              if (typeof value === 'function') {
                setAreaSelectionEnabled((current) => value(current));
                return;
              }

              if (value && draftFilters.selectedBounds !== null) {
                setDraftFilters((current) => ({
                  ...current,
                  selectedBounds: null,
                }));
              }

              setAreaSelectionEnabled(value);
            }}
            selectedBounds={draftFilters.selectedBounds}
            setSelectedBounds={(bounds) =>
              setDraftFilters((current) => ({
                ...current,
                selectedBounds: bounds,
              }))
            }
            activePanel={activePanel}
            setActivePanel={setActivePanel}
            sortOption={draftFilters.sortOption}
            setSortOption={(option) =>
              setDraftFilters((current) => ({
                ...current,
                sortOption: option,
              }))
            }
            onResetFilters={handleResetDraftFilters}
            hasPendingChanges={hasPendingChanges}
            canApply={hasValidDraftRange && hasPendingChanges && !loading}
          />
        </Box>
      </Box>

      {overlayState && (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            zIndex: 720,
            display: 'grid',
            placeItems: 'center',
            pointerEvents: overlayState === 'loading' ? 'auto' : 'none',
          }}
        >
          <Box
            className="glass-panel"
            sx={{
              px: 2.25,
              py: 1.8,
              minWidth: { xs: 240, md: 280 },
              textAlign: 'center',
              bgcolor:
                overlayState === 'loading'
                  ? 'rgba(9, 21, 31, 0.9)'
                  : overlayState === 'invalid'
                    ? 'rgba(83, 53, 10, 0.88)'
                    : 'rgba(25, 96, 59, 0.9)',
              borderColor:
                overlayState === 'loading'
                  ? 'rgba(169, 192, 215, 0.14)'
                  : overlayState === 'invalid'
                    ? 'rgba(255, 196, 107, 0.25)'
                    : 'rgba(123, 239, 178, 0.22)',
              pointerEvents: 'auto',
            }}
          >
            {overlayState === 'loading' ? (
              <Stack spacing={1.2} alignItems="center">
                <CircularProgress size={26} color="secondary" />
                <Typography variant="subtitle2">Loading earthquake data...</Typography>
              </Stack>
            ) : overlayState === 'invalid' ? (
              <Stack spacing={1}>
                <Typography variant="subtitle2">Enter a valid date range</Typography>
                <Typography variant="caption" color="rgba(255,255,255,0.8)">
                  Finish editing the dates before applying filters.
                </Typography>
              </Stack>
            ) : (
              <Stack spacing={1.2} alignItems="center">
                <Typography variant="subtitle2">Filters changed</Typography>
                <Button variant="contained" color="success" onClick={handleApplyFilters}>
                  Apply filters
                </Button>
              </Stack>
            )}
          </Box>
        </Box>
      )}

      {areaSelectionEnabled && !loading && <AreaSelectionAlert onCancel={() => setAreaSelectionEnabled(false)} />}
    </Box>
  );
};

const cloneFilters = (filters: FilterState): FilterState => ({
  ...filters,
  startDate: filters.startDate ? new Date(filters.startDate) : null,
  endDate: filters.endDate ? new Date(filters.endDate) : null,
  selectedBounds: filters.selectedBounds
    ? [
        [...filters.selectedBounds[0]] as [number, number],
        [...filters.selectedBounds[1]] as [number, number],
      ]
    : null,
});

const isValidDateRange = (startDate: Date | null, endDate: Date | null) => {
  if (!startDate || !endDate || !isValid(startDate) || !isValid(endDate)) {
    return false;
  }

  return endDate >= startDate;
};

const filtersEqual = (a: FilterState, b: FilterState) => {
  return (
    a.minMagnitude === b.minMagnitude &&
    a.sliderValue === b.sliderValue &&
    a.sortOption === b.sortOption &&
    dateValue(a.startDate) === dateValue(b.startDate) &&
    dateValue(a.endDate) === dateValue(b.endDate) &&
    boundsEqual(a.selectedBounds, b.selectedBounds)
  );
};

const dateValue = (date: Date | null) => {
  if (!date || !isValid(date)) {
    return 'invalid';
  }

  return date.getTime();
};

const boundsEqual = (a: Bounds, b: Bounds) => {
  if (a === b) {
    return true;
  }

  if (!a || !b) {
    return false;
  }

  return (
    a[0][0] === b[0][0] &&
    a[0][1] === b[0][1] &&
    a[1][0] === b[1][0] &&
    a[1][1] === b[1][1]
  );
};

export default QuakeExplorer;
