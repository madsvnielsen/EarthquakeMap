import { useMemo, useState } from 'react';
import type { Earthquake } from '../types/earthquake';
import {
  AccessTime,
  CalendarMonthRounded,
  ClearRounded,
  FilterAltRounded,
  GridViewRounded,
  LayersRounded,
  MyLocationRounded,
  PlaceRounded,
  SortRounded,
  TrendingDown,
  TrendingUp,
  ViewListRounded,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
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
import { getColorForMagnitude } from '../utils/getColorForMagnetude';

type SortOption = 'time-desc' | 'time-asc' | 'magnitude-desc' | 'magnitude-asc';
type ActivePanel = 'filters' | 'list' | null;

type Props = {
  quakes: Earthquake[];
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
};

const EarthquakeSidebar = ({
  quakes,
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
}: Props) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const sortOptionLabel = useMemo(
    () =>
      ({
        'time-desc': 'Newest first',
        'time-asc': 'Oldest first',
        'magnitude-desc': 'Strongest first',
        'magnitude-asc': 'Weakest first',
      })[sortOption],
    [sortOption],
  );

  const togglePanel = (panel: Exclude<ActivePanel, null>) => {
    setActivePanel(activePanel === panel ? null : panel);
  };

  const clearFilters = () => {
    setSliderValue(0);
    setMinMagnitude(0);
    setStartDate(subDays(new Date(), 1));
    setEndDate(new Date());
    setSelectedBounds(null);
    setAreaSelectionEnabled(false);
  };

  const areaFilter = selectedBounds !== null;

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box
        sx={{
          position: 'absolute',
          left: { xs: 12, md: 'auto' },
          right: { xs: 12, md: 20 },
          top: { xs: 'auto', md: 112 },
          bottom: { xs: 12, md: 20 },
          zIndex: 650,
          display: 'flex',
          alignItems: { xs: 'stretch', md: 'flex-start' },
          flexDirection: { xs: 'column-reverse', md: 'row' },
          gap: 1.25,
          pointerEvents: 'none',
        }}
      >
        <Stack
          direction={{ xs: 'row', md: 'column' }}
          spacing={1.25}
          sx={{
            pointerEvents: 'auto',
            justifyContent: { xs: 'flex-end', md: 'flex-start' },
            alignSelf: { xs: 'flex-end', md: 'auto' },
            flexShrink: 0,
          }}
        >
          <Tooltip title="Filters" placement="left" arrow>
            <IconButton
              onClick={() => togglePanel('filters')}
              className="glass-panel"
              sx={{
                width: 46,
                height: 46,
                color: activePanel === 'filters' ? 'primary.main' : 'text.primary',
                bgcolor:
                  activePanel === 'filters' ? 'rgba(255, 138, 91, 0.14)' : 'rgba(9, 21, 31, 0.78)',
              }}
            >
              <FilterAltRounded fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Earthquake list" placement="left" arrow>
            <IconButton
              onClick={() => togglePanel('list')}
              className="glass-panel"
              sx={{
                width: 46,
                height: 46,
                color: activePanel === 'list' ? 'secondary.main' : 'text.primary',
                bgcolor:
                  activePanel === 'list' ? 'rgba(111, 214, 194, 0.14)' : 'rgba(9, 21, 31, 0.78)',
              }}
            >
              <ViewListRounded fontSize="small" />
            </IconButton>
          </Tooltip>
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
                  {activePanel === 'filters' ? 'Filters' : 'Earthquake list'}
                </Typography>
              <Typography variant="caption" color="text.secondary">
                {activePanel === 'filters'
                  ? 'Refine intensity, date range, and map area.'
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
                <Box
                  sx={{
                    p: 1.4,
                    borderRadius: '8px',
                    bgcolor: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(169, 192, 215, 0.08)',
                  }}
                >
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
                    Currently showing earthquakes at magnitude {minMagnitude.toFixed(1)} and above.
                  </Typography>
                  <Slider
                    value={sliderValue}
                    onChange={(_, value) => setSliderValue(value as number)}
                    onChangeCommitted={(_, value) => setMinMagnitude(value as number)}
                    min={0}
                    max={10}
                    step={0.1}
                    valueLabelDisplay="auto"
                    sx={{ color: 'primary.main' }}
                  />
                </Box>

                <Box
                  sx={{
                    p: 1.4,
                    borderRadius: '8px',
                    bgcolor: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(169, 192, 215, 0.08)',
                  }}
                >
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
                </Box>

                <Box
                  sx={{
                    p: 1.4,
                    borderRadius: '8px',
                    bgcolor: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(169, 192, 215, 0.08)',
                  }}
                >
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
                      onClick={() => setAreaSelectionEnabled((value) => !value)}
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
                </Box>

                <Button
                  variant="outlined"
                  color="inherit"
                  onClick={clearFilters}
                  sx={{ alignSelf: 'flex-start' }}
                >
                  Reset all filters
                </Button>
              </Stack>
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
                    label={sortOptionLabel}
                    sx={{ bgcolor: 'rgba(255, 255, 255, 0.05)', color: 'text.primary' }}
                  />
                  {loading && <Typography variant="caption" color="secondary.main">Updating...</Typography>}
                </Stack>
                <IconButton size="small" onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ color: 'text.secondary' }}>
                  <SortRounded fontSize="small" />
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={() => setAnchorEl(null)}
                  PaperProps={{
                    className: 'glass-panel',
                    sx: { borderRadius: '18px' },
                  }}
                >
                  <MenuItem onClick={() => { setSortOption('time-desc'); setAnchorEl(null); }}>
                    <ListItemIcon><AccessTime fontSize="small" /></ListItemIcon>
                    <ListItemText>Newest first</ListItemText>
                  </MenuItem>
                  <MenuItem onClick={() => { setSortOption('time-asc'); setAnchorEl(null); }}>
                    <ListItemIcon><AccessTime fontSize="small" /></ListItemIcon>
                    <ListItemText>Oldest first</ListItemText>
                  </MenuItem>
                  <MenuItem onClick={() => { setSortOption('magnitude-desc'); setAnchorEl(null); }}>
                    <ListItemIcon><TrendingDown fontSize="small" /></ListItemIcon>
                    <ListItemText>Strongest first</ListItemText>
                  </MenuItem>
                  <MenuItem onClick={() => { setSortOption('magnitude-asc'); setAnchorEl(null); }}>
                    <ListItemIcon><TrendingUp fontSize="small" /></ListItemIcon>
                    <ListItemText>Weakest first</ListItemText>
                  </MenuItem>
                </Menu>
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
                <Button onClick={onNextPage} variant="contained" color="primary" size={isMobile ? 'small' : 'medium'}>
                  {currentPage < totalPages ? 'Next' : 'More'}
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Box>
    </LocalizationProvider>
  );
};

export default EarthquakeSidebar;
