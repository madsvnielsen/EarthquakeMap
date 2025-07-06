import { useEffect, useState } from "react";
import { useEarthquakeData } from "../hooks/useEarthquakeData";
import { FilterToolbar } from "./FilterToolbar";
import { EarthquakeMap } from "./EarthquakeMap";
import EarthquakeSidebar from "./EarthquakeSidebar";
import { AreaSelectionAlert } from "./AreaSelectionAlert";
import { subDays } from "date-fns";
import { TopBar } from "./TopBar";
import { SplashScreen } from "./SplashScreen";

const QuakeExplorer = () => {
  const [minMagnitude, setMinMagnitude] = useState(0);
  const [sliderValue, setSliderValue] = useState(0);
  const now = new Date();
  const [startDate, setStartDate] = useState<Date | null>(subDays(now, 1));
  const [endDate, setEndDate] = useState<Date | null>(now);
  const [selectedCoords, setSelectedCoords] = useState<[number, number] | null>(null);
  const [sortOption, setSortOption] = useState<'magnitude-desc' | 'magnitude-asc' | 'time-desc' | 'time-asc'>('magnitude-desc');
  const [areaSelectionEnabled, setAreaSelectionEnabled] = useState<boolean>(false);
  const [selectedBounds, setSelectedBounds] = useState<[[number, number], [number, number]] | null>(null);



  const [offset, setOffset] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { quakes, loading } = useEarthquakeData(minMagnitude, startDate, endDate, offset, sortOption, selectedBounds);

  const [initialLoading, setInitialLoading] = useState(true);

  // Wait for first query to complete
  useEffect(() => {
    if (!loading && quakes.length > 0) {
      setInitialLoading(false);
    }
  }, [loading, quakes]);

  useEffect(() => {
    setOffset(1);
    setCurrentPage(1);
  }, [minMagnitude, startDate, endDate]);

  const totalPages = Math.ceil(quakes.length / itemsPerPage);
  const paginatedQuakes = quakes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleNextPage = () => {
    if (currentPage >= totalPages) {
      setOffset(prev => prev + 1);
    } else {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };

  if (initialLoading) return <SplashScreen />;

  return (
    <div className="flex w-full h-screen">
      <div className="flex flex-col flex-grow relative w-full">
        <TopBar
          startDate={startDate!}
          endDate={endDate!}
          minMagnitude={minMagnitude}
        />
        <FilterToolbar
          sliderValue={sliderValue}
          setSliderValue={setSliderValue}
          setMinMagnitude={setMinMagnitude}
          startDate={startDate}
          endDate={endDate}
          setStartDate={setStartDate}
          setEndDate={setEndDate}
          setSelectedBounds={setSelectedBounds}
          areaSelectionEnabled={areaSelectionEnabled}
          setAreaSelectionEnabled={(v) => {
            if (v) {
              if (selectedBounds != null) {
                setSelectedBounds(null)
                return
              }
            }
            setAreaSelectionEnabled(v)
          }}
          areaFilter={selectedBounds != null}
          loading={loading}
        />

        <div className="relative w-full h-full">
          <EarthquakeMap quakes={quakes} selectedCoords={selectedCoords} areaSelectionEnabled={areaSelectionEnabled} setSelectedBounds={setSelectedBounds} setAreaSelectionEnabled={setAreaSelectionEnabled} selectedBounds={selectedBounds} />
          <EarthquakeSidebar
            quakes={paginatedQuakes}
            onSelectQuake={setSelectedCoords}
            currentPage={currentPage}
            totalPages={totalPages}
            onNextPage={handleNextPage}
            onPrevPage={handlePreviousPage}
            loading={loading}
            minMagnitude={minMagnitude}
            startDate={startDate}
            endDate={endDate}
            offset={offset}
            sortOption={sortOption}
            setSortOption={setSortOption}
          />
        </div>
        {areaSelectionEnabled && (
          <AreaSelectionAlert onCancel={() => setAreaSelectionEnabled(false)} />
        )}
      </div>
    </div>
  );
};

export default QuakeExplorer;
