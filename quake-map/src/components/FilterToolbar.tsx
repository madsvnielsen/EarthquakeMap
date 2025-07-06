import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  Popover,
  Slider,
  Typography,
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import TuneIcon from '@mui/icons-material/Tune';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CropFreeIcon from '@mui/icons-material/CropFree';
import { useRef, useState } from 'react';
import { ToolbarTooltip } from './ToolbarTooltip';
import { subDays, subYears } from 'date-fns';
import { getColorForMagnitude } from '../utils/getColorForMagnetude';

type Props = {
  sliderValue: number;
  setSliderValue: (v: number) => void;
  setMinMagnitude: (v: number) => void;
  startDate: Date | null;
  endDate: Date | null;
  setStartDate: (v: Date | null) => void;
  setEndDate: (v: Date | null) => void;
  setSelectedBounds: (bounds: [[number, number], [number, number]] | null) => void;
  areaSelectionEnabled: boolean;
  setAreaSelectionEnabled: React.Dispatch<React.SetStateAction<boolean>>
  areaFilter: boolean,
  loading: boolean
};

export const FilterToolbar = ({
  sliderValue,
  setSliderValue,
  setMinMagnitude,
  startDate,
  endDate,
  setStartDate,
  setEndDate,
  setAreaSelectionEnabled,
  areaFilter,
  loading,
}: Props) => {
  const [anchorMag, setAnchorMag] = useState<null | HTMLElement>(null);
  const [anchorDate, setAnchorDate] = useState<null | HTMLElement>(null);
  const cropButtonRef = useRef<HTMLButtonElement>(null);

  const openMag = Boolean(anchorMag);
  const openDate = Boolean(anchorDate);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      {/* Wrapper that contains the toolbar + loader */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 45,
          left: 16,
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
        }}
      >
        {/* Toolbar box itself */}
        <Box
          sx={{
            bgcolor: 'background.paper',
            p: 1,
            borderRadius: 2,
            boxShadow: 4,
            display: 'flex',
            gap: 1,
          }}
        >
          {/* Magnitude toggle button */}
          <IconButton
            onClick={(e) => setAnchorMag(anchorMag ? null : e.currentTarget)}
            color={openMag ? 'primary' : 'default'}
          >
            <TuneIcon />
          </IconButton>

          {/* Magnitude popover */}
          <Popover
            open={openMag}
            anchorEl={anchorMag}
            onClose={() => setAnchorMag(null)}
            anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
            transformOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          >
            <Box sx={{ p: 2, minWidth: 240 }}>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>
                Filter by Min. Magnitude
              </Typography>
              <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: '1.25rem',
                    color: '#fff',
                    backgroundColor: getColorForMagnitude(sliderValue),
                  }}
                >
                  {sliderValue.toFixed(1)}
                </Box>
              </Box>
              <Slider
                value={sliderValue}
                onChange={(_, val) => setSliderValue(val as number)}
                onChangeCommitted={(_, val) => setMinMagnitude(val as number)}
                min={0}
                max={10}
                step={0.1}
                valueLabelDisplay="auto"
              />
            </Box>
          </Popover>

          {/* Date toggle button */}
          <IconButton
            onClick={(e) => setAnchorDate(anchorDate ? null : e.currentTarget)}
            color={openDate ? 'primary' : 'default'}
          >
            <CalendarTodayIcon />
          </IconButton>

          {/* Date popover */}
          <Popover
            open={openDate}
            anchorEl={anchorDate}
            onClose={() => setAnchorDate(null)}
            anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
            transformOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          >
            <Box sx={{ p: 2, maxWidth: 300 }}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                Filter earthquakes by dates
              </Typography>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                {[
                  { label: 'Past Day', range: () => subDays(new Date(), 1) },
                  { label: 'Past Week', range: () => subDays(new Date(), 7) },
                  { label: 'Past Year', range: () => subYears(new Date(), 1) },
                ].map(({ label, range }) => (
                  <Button
                    key={label}
                    variant="outlined"
                    size="small"
                    onClick={() => {
                      const now = new Date();
                      const from = range();
                      setStartDate(from);
                      setEndDate(now);
                    }}
                  >
                    {label}
                  </Button>
                ))}
              </Box>

              <DatePicker
                label="After"
                value={startDate}
                onChange={(newDate) => setStartDate(newDate)}
                slotProps={{
                  textField: { size: 'small', sx: { mb: 2 }, fullWidth: true },
                }}
              />
              <DatePicker
                label="Before"
                value={endDate}
                onChange={(newDate) => setEndDate(newDate)}
                slotProps={{
                  textField: { size: 'small', fullWidth: true },
                }}
              />
            </Box>
          </Popover>

          {/* Area selection button */}
          <IconButton
            ref={cropButtonRef}
            onClick={() => setAreaSelectionEnabled((v) => !v)}
            sx={{
              backgroundColor: areaFilter
                ? 'background.default'
                : 'background.paper',
            }}
          >
            <CropFreeIcon />
          </IconButton>

          {areaFilter && <ToolbarTooltip anchorRef={cropButtonRef} />}
        </Box>

        {/* 🔄 Spinner outside the box */}
        {loading && (
          <CircularProgress
            size={24}
            thickness={5}
            sx={{ ml: 1 }}
          />
        )}
      </Box>
    </LocalizationProvider>
  );
};
