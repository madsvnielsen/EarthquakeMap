import { useState, type ReactNode } from 'react';
import type { Earthquake } from '../types/earthquake';
import {
  CalendarMonthRounded,
  CompareArrowsRounded,
  ClearRounded,
  FilterAltRounded,
  GridViewRounded,
  InsightsRounded,
  LayersRounded,
  MyLocationRounded,
  PlaceRounded,
  ScheduleRounded,
  SortRounded,
  ViewListRounded,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Slider,
  Stack,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { subDays, subYears } from 'date-fns';
import { EarthquakeDetailIcons } from './EarthquakeDetailIcons';
import { EarthquakeComparison } from './EarthquakeComparison';
import { EarthquakeInsights } from './EarthquakeInsights';
import { getColorForMagnitude } from '../utils/getColorForMagnetude';

type SortOption = 'time-desc' | 'time-asc' | 'magnitude-desc' | 'magnitude-asc' | null;
type ActivePanel = 'filters' | 'list' | 'insights' | 'compare' | null;
type MapMode = 'points' | 'heatmap';

type Props = {
  quakes: Earthquake[];
  allQuakes: Earthquake[];
  comparisonCurrentQuakes: Earthquake[];
  activeMinMagnitude: number;
  onSelectQuake: (coords: [number, number]) => void;
  currentPage: number;
  totalPages: number;
  onNextPage: () => void;
  onPrevPage: () => void;
  loading?: boolean;
  minMagnitude: number;
  sliderValue: number;
  setSliderValue: (value: number) => void;
  setMinMagnitude: (value: number) => void;
  startDate: Date | null;
  endDate: Date | null;
  setStartDate: (value: Date | null) => void;
  setEndDate: (value: Date | null) => void;
  areaSelectionEnabled: boolean;
  setAreaSelectionEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  selectedBounds: [[number, number], [number, number]] | null;
  setSelectedBounds: (bounds: [[number, number], [number, number]] | null) => void;
  activePanel: ActivePanel;
  setActivePanel: (panel: ActivePanel) => void;
  sortOption: SortOption;
  setSortOption: (option: SortOption) => void;
  mapMode: MapMode;
  setMapMode: (mode: MapMode) => void;
  onResetFilters: () => void;
  hasPendingChanges: boolean;
  canApply: boolean;
  comparisonQuakes: Earthquake[];
  comparisonLoading: boolean;
  hasComparison: boolean;
  comparisonStale: boolean;
  comparisonStartDate: Date | null;
  comparisonEndDate: Date | null;
  previousComparisonStartDate: Date | null;
  previousComparisonEndDate: Date | null;
  onRunComparison: () => void;
};

const EarthquakeSidebar = ({
  quakes,
  allQuakes,
  comparisonCurrentQuakes,
  activeMinMagnitude,
  onSelectQuake,
  currentPage,
  totalPages,
  onNextPage,
  onPrevPage,
  loading,
  minMagnitude,
  sliderValue,
  setSliderValue,
  setMinMagnitude,
  startDate,
  endDate,
  setStartDate,
  setEndDate,
  areaSelectionEnabled,
  setAreaSelectionEnabled,
  selectedBounds,
  setSelectedBounds,
  activePanel,
  setActivePanel,
  sortOption,
  setSortOption,
  mapMode,
  setMapMode,
  onResetFilters,
  hasPendingChanges,
  canApply,
  comparisonQuakes,
  comparisonLoading,
  hasComparison,
  comparisonStale,
  comparisonStartDate,
  comparisonEndDate,
  previousComparisonStartDate,
  previousComparisonEndDate,
  onRunComparison,
}: Props) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const areaFilter = selectedBounds !== null;
  const [mapModeAnchorEl, setMapModeAnchorEl] = useState<null | HTMLElement>(null);

  const togglePanel = (panel: Exclude<ActivePanel, null>) => {
    setActivePanel(activePanel === panel ? null : panel);
  };

  const sortLabel =
    sortOption === null
      ? 'Default'
      : {
          'time-desc': 'Newest first',
          'time-asc': 'Oldest first',
          'magnitude-desc': 'Strongest first',
          'magnitude-asc': 'Weakest first',
        }[sortOption];

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box
        sx={{
          position: 'absolute',
          left: { xs: 12, md: 'auto' },
          right: { xs: 12, md: 20 },
          top: { xs: 'auto', md: 112 },
          bottom: { xs: 'calc(env(safe-area-inset-bottom, 0px) + 52px)', md: 20 },
          zIndex: 650,
          display: 'flex',
          alignItems: { xs: 'stretch', md: 'flex-start' },
          flexDirection: { xs: 'column-reverse', md: 'row' },
          gap: { xs: 1, md: 1.25 },
          pointerEvents: 'none',
        }}
      >
        <Stack
          direction={{ xs: 'row', md: 'column' }}
          spacing={{ xs: 0.75, md: 1.25 }}
          sx={{
            pointerEvents: 'auto',
            justifyContent: { xs: 'flex-end', md: 'flex-start' },
            alignSelf: { xs: 'flex-end', md: 'auto' },
            flexShrink: 0,
            pr: { xs: 2, md: 0 },
          }}
        >
          <Tooltip title="Filters" placement="left" arrow>
            <IconButton
              onClick={() => togglePanel('filters')}
              className="glass-panel"
              sx={{
                width: { xs: 40, md: 46 },
                height: { xs: 40, md: 46 },
                color: activePanel === 'filters' ? 'primary.main' : 'text.primary',
                bgcolor:
                  activePanel === 'filters' ? 'rgba(255, 138, 91, 0.14)' : 'rgba(9, 21, 31, 0.78)',
              }}
            >
              <FilterAltRounded sx={{ fontSize: { xs: 18, md: 20 } }} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Earthquake list" placement="left" arrow>
            <IconButton
              onClick={() => togglePanel('list')}
              className="glass-panel"
              sx={{
                width: { xs: 40, md: 46 },
                height: { xs: 40, md: 46 },
                color: activePanel === 'list' ? 'secondary.main' : 'text.primary',
                bgcolor:
                  activePanel === 'list' ? 'rgba(111, 214, 194, 0.14)' : 'rgba(9, 21, 31, 0.78)',
              }}
            >
              <ViewListRounded sx={{ fontSize: { xs: 18, md: 20 } }} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Insights" placement="left" arrow>
            <IconButton
              onClick={() => togglePanel('insights')}
              className="glass-panel"
              sx={{
                width: { xs: 40, md: 46 },
                height: { xs: 40, md: 46 },
                color: activePanel === 'insights' ? 'primary.light' : 'text.primary',
                bgcolor:
                  activePanel === 'insights' ? 'rgba(255, 138, 91, 0.12)' : 'rgba(9, 21, 31, 0.78)',
              }}
            >
              <InsightsRounded sx={{ fontSize: { xs: 18, md: 20 } }} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Compare periods" placement="left" arrow>
            <IconButton
              onClick={() => togglePanel('compare')}
              className="glass-panel"
              sx={{
                width: { xs: 40, md: 46 },
                height: { xs: 40, md: 46 },
                color: activePanel === 'compare' ? 'secondary.main' : 'text.primary',
                bgcolor:
                  activePanel === 'compare' ? 'rgba(111, 214, 194, 0.14)' : 'rgba(9, 21, 31, 0.78)',
              }}
            >
              <CompareArrowsRounded sx={{ fontSize: { xs: 18, md: 20 } }} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Map mode" placement="left" arrow>
            <IconButton
              onClick={(event) => setMapModeAnchorEl(event.currentTarget)}
              className="glass-panel"
              sx={{
                width: { xs: 40, md: 46 },
                height: { xs: 40, md: 46 },
                color: mapMode === 'heatmap' ? 'primary.main' : 'text.primary',
                bgcolor:
                  mapMode === 'heatmap' ? 'rgba(255, 138, 91, 0.14)' : 'rgba(9, 21, 31, 0.78)',
              }}
            >
              <LayersRounded sx={{ fontSize: { xs: 18, md: 20 } }} />
            </IconButton>
          </Tooltip>

          <Menu
            anchorEl={mapModeAnchorEl}
            open={Boolean(mapModeAnchorEl)}
            onClose={() => setMapModeAnchorEl(null)}
            anchorOrigin={{
              vertical: isMobile ? 'top' : 'center',
              horizontal: isMobile ? 'right' : 'left',
            }}
            transformOrigin={{
              vertical: isMobile ? 'bottom' : 'center',
              horizontal: isMobile ? 'right' : 'right',
            }}
            PaperProps={{
              className: 'glass-panel',
              sx: { borderRadius: '14px', minWidth: 156 },
            }}
          >
            <MenuItem
              selected={mapMode === 'points'}
              onClick={() => {
                setMapMode('points');
                setMapModeAnchorEl(null);
              }}
            >
              Points
            </MenuItem>
            <MenuItem
              selected={mapMode === 'heatmap'}
              onClick={() => {
                setMapMode('heatmap');
                setMapModeAnchorEl(null);
              }}
            >
              Heatmap
            </MenuItem>
          </Menu>
        </Stack>

        <Box
          className="glass-panel"
          sx={{
            pointerEvents: 'auto',
            width: activePanel ? { xs: 'calc(100vw - 24px)', md: 360 } : 0,
            maxWidth: { xs: 'calc(100vw - 24px)', md: 360 },
            opacity: activePanel ? 1 : 0,
            overflow: 'hidden',
            borderRadius: '10px',
            transition: 'width 220ms ease, opacity 180ms ease, height 220ms ease',
            display: activePanel ? 'flex' : 'none',
            flexDirection: 'column',
            height: activePanel ? { xs: 'min(58vh, 520px)', md: '100%' } : 0,
          }}
        >
          <Box
            sx={{
              px: 1.75,
              py: 1.2,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid rgba(169, 192, 215, 0.12)',
            }}
          >
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                {activePanel === 'filters'
                  ? 'Filters'
                  : activePanel === 'compare'
                    ? 'Compare'
                  : activePanel === 'insights'
                    ? 'Insights'
                    : 'Earthquake list'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {activePanel === 'filters'
                  ? hasPendingChanges
                    ? canApply
                      ? 'Changes are ready to apply on the map.'
                      : 'Finish the date range before applying.'
                    : 'Refine intensity, date range, sort, and map area.'
                  : activePanel === 'compare'
                    ? hasComparison
                      ? comparisonStale
                        ? 'Last comparison is preserved. Run a fresh one for the current data.'
                        : 'Current period compared with the previous equal-length period.'
                      : 'Fetch the previous period only when you want to compare.'
                  : activePanel === 'insights'
                    ? 'Quick patterns from the current filtered dataset.'
                    : isMobile
                      ? `${quakes.length} events in view`
                      : `${quakes.length} events on this page`}
              </Typography>
            </Box>
            <IconButton size="small" onClick={() => setActivePanel(null)} sx={{ color: 'text.secondary' }}>
              <ClearRounded fontSize="small" />
            </IconButton>
          </Box>

          {activePanel === 'filters' ? (
            <Box sx={{ px: 1.75, py: 1.5, overflowY: 'auto' }}>
              <Stack spacing={1.4}>
                <FilterCard>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <LayersRounded fontSize="small" color="primary" />
                      <Typography variant="subtitle2">Minimum magnitude</Typography>
                    </Stack>
                    <Chip
                      label={sliderValue.toFixed(1)}
                      sx={{
                        bgcolor: getColorForMagnitude(sliderValue),
                        color: '#07141d',
                        fontWeight: 700,
                      }}
                    />
                  </Stack>
                  <Typography variant="caption" color="text.secondary">
                    Draft filter is set to magnitude {minMagnitude.toFixed(1)} and above.
                  </Typography>
                  <Slider
                    value={sliderValue}
                    onChange={(_, value) => {
                      setSliderValue(value as number);
                      setMinMagnitude(value as number);
                    }}
                    min={0}
                    max={10}
                    step={0.1}
                    valueLabelDisplay="auto"
                    sx={{ color: 'primary.main' }}
                  />
                </FilterCard>

                <FilterCard>
                  <Stack direction="row" spacing={1} alignItems="center" mb={1.5}>
                    <CalendarMonthRounded fontSize="small" color="secondary" />
                    <Typography variant="subtitle2">Date range</Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap mb={1.5}>
                    {[
                      { label: 'Past day', from: () => subDays(new Date(), 1) },
                      { label: 'Past week', from: () => subDays(new Date(), 7) },
                      { label: 'Past year', from: () => subYears(new Date(), 1) },
                    ].map(({ label, from }) => (
                      <Button
                        key={label}
                        variant="outlined"
                        color="secondary"
                        size="small"
                        onClick={() => {
                          const now = new Date();
                          setStartDate(from());
                          setEndDate(now);
                        }}
                      >
                        {label}
                      </Button>
                    ))}
                  </Stack>
                  <Stack spacing={1.5}>
                    <DatePicker
                      label="After"
                      value={startDate}
                      onChange={setStartDate}
                      slotProps={{
                        textField: { size: 'small', fullWidth: true },
                      }}
                    />
                    <DatePicker
                      label="Before"
                      value={endDate}
                      onChange={setEndDate}
                      slotProps={{
                        textField: { size: 'small', fullWidth: true },
                      }}
                    />
                  </Stack>
                </FilterCard>

                <FilterCard>
                  <Stack direction="row" spacing={1} alignItems="center" mb={1.25}>
                    <SortRounded fontSize="small" color="secondary" />
                    <Typography variant="subtitle2">Sorting</Typography>
                  </Stack>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.25 }}>
                    Current draft: {sortLabel}
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    <Button
                      size="small"
                      variant={sortOption === null ? 'contained' : 'outlined'}
                      onClick={() => setSortOption(null)}
                    >
                      Default
                    </Button>
                    <Button
                      size="small"
                      variant={sortOption === 'time-desc' ? 'contained' : 'outlined'}
                      onClick={() => setSortOption('time-desc')}
                      startIcon={<ScheduleRounded />}
                    >
                      Newest
                    </Button>
                    <Button
                      size="small"
                      variant={sortOption === 'time-asc' ? 'contained' : 'outlined'}
                      onClick={() => setSortOption('time-asc')}
                      startIcon={<ScheduleRounded />}
                    >
                      Oldest
                    </Button>
                    <Button
                      size="small"
                      variant={sortOption === 'magnitude-desc' ? 'contained' : 'outlined'}
                      onClick={() => setSortOption('magnitude-desc')}
                    >
                      Strongest
                    </Button>
                    <Button
                      size="small"
                      variant={sortOption === 'magnitude-asc' ? 'contained' : 'outlined'}
                      onClick={() => setSortOption('magnitude-asc')}
                    >
                      Weakest
                    </Button>
                  </Stack>
                </FilterCard>

                <FilterCard>
                  <Stack direction="row" spacing={1} alignItems="center" mb={1.25}>
                    <PlaceRounded fontSize="small" color="secondary" />
                    <Typography variant="subtitle2">Map area</Typography>
                  </Stack>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                    Draw a box on the map to focus on one region, or clear the area filter to return to the full globe.
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    <Button
                      variant={areaSelectionEnabled ? 'contained' : 'outlined'}
                      color="secondary"
                      startIcon={<GridViewRounded />}
                      onClick={() => {
                        setAreaSelectionEnabled((value) => !value);
                        if (isMobile) {
                          setActivePanel(null);
                        }
                      }}
                    >
                      {areaSelectionEnabled ? 'Drawing on map' : 'Draw area'}
                    </Button>
                    {areaFilter && (
                      <Button
                        variant="text"
                        color="inherit"
                        startIcon={<ClearRounded />}
                        onClick={() => {
                          setSelectedBounds(null);
                          setAreaSelectionEnabled(false);
                        }}
                      >
                        Clear area
                      </Button>
                    )}
                  </Stack>
                </FilterCard>

                <Button
                  variant="outlined"
                  color="inherit"
                  onClick={onResetFilters}
                  sx={{ alignSelf: 'flex-start' }}
                >
                  Reset draft filters
                </Button>
              </Stack>
            </Box>
          ) : activePanel === 'compare' ? (
            <Box sx={{ px: 1.75, py: 1.5, overflowY: 'auto' }}>
              <EarthquakeComparison
                currentQuakes={comparisonCurrentQuakes}
                previousQuakes={comparisonQuakes}
                currentStartDate={comparisonStartDate}
                currentEndDate={comparisonEndDate}
                previousStartDate={previousComparisonStartDate}
                previousEndDate={previousComparisonEndDate}
                loading={comparisonLoading}
                hasComparison={hasComparison}
                isStale={comparisonStale}
                onRunComparison={onRunComparison}
              />
            </Box>
          ) : activePanel === 'insights' ? (
            <Box sx={{ px: 1.75, py: 1.5, overflowY: 'auto' }}>
              <EarthquakeInsights
                quakes={allQuakes}
                startDate={startDate}
                endDate={endDate}
                minMagnitude={activeMinMagnitude}
              />
            </Box>
          ) : (
            <>
              <Box
                sx={{
                  px: 1.75,
                  py: 0.9,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: '1px solid rgba(169, 192, 215, 0.12)',
                }}
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip
                    size="small"
                    label={`${quakes.length} on this page`}
                    sx={{ bgcolor: 'rgba(255, 255, 255, 0.05)', color: 'text.primary' }}
                  />
                  {loading && (
                    <Typography variant="caption" color="secondary.main">
                      Loading earthquake data...
                    </Typography>
                  )}
                </Stack>
              </Box>

              <Box sx={{ px: 1.1, py: 0.9, overflowY: 'auto', flex: 1 }}>
                <Stack spacing={0.85}>
                  {quakes.map((eq) => {
                    const color = getColorForMagnitude(eq.magnitude);
                    const date = new Date(eq.time).toLocaleString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    });

                    return (
                      <Box
                        key={eq.id}
                        sx={{
                          p: 1.1,
                          borderRadius: '8px',
                          bgcolor: 'rgba(255, 255, 255, 0.035)',
                          border: '1px solid rgba(169, 192, 215, 0.08)',
                        }}
                      >
                        <Stack direction="row" spacing={1.25} alignItems="flex-start">
                          <Box
                            sx={{
                              width: 42,
                              height: 42,
                              borderRadius: '8px',
                              display: 'grid',
                              placeItems: 'center',
                              color: '#07141d',
                              fontWeight: 700,
                              bgcolor: color,
                              flexShrink: 0,
                              boxShadow: `0 10px 28px ${color}33`,
                            }}
                          >
                            {eq.magnitude.toFixed(1)}
                          </Box>

                          <Box sx={{ minWidth: 0, flex: 1 }}>
                            <Stack direction="row" justifyContent="space-between" spacing={1} alignItems="flex-start">
                              <Box sx={{ minWidth: 0 }}>
                                <Typography variant="body2" sx={{ lineHeight: 1.25, fontWeight: 600 }}>
                                  {eq.title}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {date}
                                </Typography>
                              </Box>
                              <Tooltip title="Fly to on map" arrow>
                                <IconButton
                                  size="small"
                                  onClick={() => onSelectQuake([eq.coords[0], eq.coords[1]])}
                                  sx={{
                                    color: 'secondary.main',
                                    bgcolor: 'rgba(111, 214, 194, 0.12)',
                                    '&:hover': { bgcolor: 'rgba(111, 214, 194, 0.2)' },
                                  }}
                                >
                                  <MyLocationRounded fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Stack>

                            <Divider sx={{ my: 1.1, borderColor: 'rgba(169, 192, 215, 0.08)' }} />
                            {EarthquakeDetailIcons(
                              eq.magnitude,
                              eq.magType,
                              eq.coords[2],
                              eq.alert,
                              eq.felt,
                              eq.mmi,
                              eq.cdi,
                            )}
                          </Box>
                        </Stack>
                      </Box>
                    );
                  })}
                </Stack>
              </Box>

              <Box
                sx={{
                  px: 1.75,
                  py: 1.1,
                  borderTop: '1px solid rgba(169, 192, 215, 0.12)',
                  display: 'flex',
                  justifyContent: { xs: 'center', md: 'space-between' },
                  alignItems: 'center',
                  gap: 1,
                  flexWrap: { xs: 'wrap', md: 'nowrap' },
                }}
              >
                <Button
                  onClick={onPrevPage}
                  disabled={currentPage === 1}
                  variant="outlined"
                  color="inherit"
                  size={isMobile ? 'small' : 'medium'}
                >
                  Previous
                </Button>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ order: { xs: 3, md: 0 }, width: { xs: '100%', md: 'auto' }, textAlign: 'center' }}
                >
                  Page {currentPage} of {Math.max(totalPages, 1)}
                </Typography>
                <Button
                  onClick={onNextPage}
                  variant="contained"
                  color="primary"
                  size={isMobile ? 'small' : 'medium'}
                  disabled={currentPage >= totalPages}
                >
                  Next
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Box>
    </LocalizationProvider>
  );
};

const FilterCard = ({ children }: { children: ReactNode }) => (
  <Box
    sx={{
      p: 1.4,
      borderRadius: '8px',
      bgcolor: 'rgba(255, 255, 255, 0.03)',
      border: '1px solid rgba(169, 192, 215, 0.08)',
    }}
  >
    {children}
  </Box>
);

export default EarthquakeSidebar;
