import { useEffect, useState } from 'react';
import { useEarthquakeData } from '../hooks/useEarthquakeData';
import { EarthquakeMap } from './EarthquakeMap';
import EarthquakeSidebar from './EarthquakeSidebar';
import { AreaSelectionAlert } from './AreaSelectionAlert';
import { subDays } from 'date-fns';
import { TopBar } from './TopBar';
import { SplashScreen } from './SplashScreen';
import { Box } from '@mui/material';

const QuakeExplorer = () => {
  const [minMagnitude, setMinMagnitude] = useState(0);
  const [sliderValue, setSliderValue] = useState(0);
  const now = new Date();
  const [startDate, setStartDate] = useState<Date | null>(subDays(now, 1));
  const [endDate, setEndDate] = useState<Date | null>(now);
  const [selectedCoords, setSelectedCoords] = useState<[number, number] | null>(null);
  const [sortOption, setSortOption] = useState<'magnitude-desc' | 'magnitude-asc' | 'time-desc' | 'time-asc'>(
    'magnitude-desc',
  );
  const [areaSelectionEnabled, setAreaSelectionEnabled] = useState(false);
  const [selectedBounds, setSelectedBounds] = useState<[[number, number], [number, number]] | null>(null);
  const [activePanel, setActivePanel] = useState<'filters' | 'list' | null>('list');
  const [offset, setOffset] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 10;
  const { quakes, loading } = useEarthquakeData(
    minMagnitude,
    startDate,
    endDate,
    offset,
    sortOption,
    selectedBounds,
  );
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    if (!loading && quakes.length > 0) {
      setInitialLoading(false);
    }
  }, [loading, quakes]);

  useEffect(() => {
    setOffset(1);
    setCurrentPage(1);
  }, [minMagnitude, startDate, endDate, selectedBounds, sortOption]);

  const totalPages = Math.ceil(quakes.length / itemsPerPage);
  const paginatedQuakes = quakes.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleNextPage = () => {
    if (currentPage >= totalPages) {
      setOffset((prev) => prev + 1);
    } else {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

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
        startDate={startDate ?? now}
        endDate={endDate ?? now}
        minMagnitude={minMagnitude}
        resultCount={quakes.length}
        areaFilter={selectedBounds !== null}
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
          }}
        >
          <EarthquakeMap
            quakes={quakes}
            selectedCoords={selectedCoords}
            areaSelectionEnabled={areaSelectionEnabled}
            setSelectedBounds={setSelectedBounds}
            setAreaSelectionEnabled={setAreaSelectionEnabled}
            selectedBounds={selectedBounds}
          />

          <EarthquakeSidebar
            quakes={paginatedQuakes}
            onSelectQuake={setSelectedCoords}
            currentPage={currentPage}
            totalPages={totalPages}
            onNextPage={handleNextPage}
            onPrevPage={handlePreviousPage}
            loading={loading}
            minMagnitude={minMagnitude}
            sliderValue={sliderValue}
            setSliderValue={setSliderValue}
            setMinMagnitude={setMinMagnitude}
            startDate={startDate}
            endDate={endDate}
            setStartDate={setStartDate}
            setEndDate={setEndDate}
            areaSelectionEnabled={areaSelectionEnabled}
            setAreaSelectionEnabled={(value) => {
              if (typeof value === 'function') {
                setAreaSelectionEnabled((current) => value(current));
                return;
              }
              if (value && selectedBounds !== null) {
                setSelectedBounds(null);
              }
              setAreaSelectionEnabled(value);
            }}
            selectedBounds={selectedBounds}
            setSelectedBounds={setSelectedBounds}
            activePanel={activePanel}
            setActivePanel={setActivePanel}
            sortOption={sortOption}
            setSortOption={setSortOption}
          />
        </Box>
      </Box>

      {areaSelectionEnabled && <AreaSelectionAlert onCancel={() => setAreaSelectionEnabled(false)} />}
    </Box>
  );
};

export default QuakeExplorer;
