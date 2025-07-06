import {
  Box,
  IconButton,
  Popover,
  Slider,
  Tooltip,
  Typography,
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import TuneIcon from '@mui/icons-material/Tune';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CropFreeIcon from '@mui/icons-material/CropFree';
import { useRef, useState } from 'react';
import { ToolbarTooltip } from './ToolbarTooltip';

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
  areaFilter: boolean
};

export const FilterToolbar = ({
  sliderValue,
  setSliderValue,
  setMinMagnitude,
  startDate,
  endDate,
  setStartDate,
  setEndDate,
  setSelectedBounds,
  areaSelectionEnabled,
  setAreaSelectionEnabled,
  areaFilter
}: Props) => {
  const [anchorMag, setAnchorMag] = useState<null | HTMLElement>(null);
  const [anchorDate, setAnchorDate] = useState<null | HTMLElement>(null);

  const openMag = Boolean(anchorMag);
  const openDate = Boolean(anchorDate);
  const cropButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box
        sx={{
          position: 'absolute',
          bottom: 32,
          left: 32,
          bgcolor: 'background.paper',
          p: 1,
          borderRadius: 2,
          boxShadow: 4,
          zIndex: 1000,
          display: 'flex',
          gap: 1,
        }}
      >
        {/* Magnitude Toggle */}
        <IconButton
          onClick={(e) => setAnchorMag(anchorMag ? null : e.currentTarget)}
          color={openMag ? 'primary' : 'default'}
        >
          <TuneIcon />
        </IconButton>

        <Popover
          open={openMag}
          anchorEl={anchorMag}
          onClose={() => setAnchorMag(null)}
          anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
          transformOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Box sx={{ p: 2, minWidth: 200 }}>
            <Typography gutterBottom>Min. Magnitude</Typography>
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

        {/* Date Range Toggle */}
        <IconButton
          onClick={(e) => setAnchorDate(anchorDate ? null : e.currentTarget)}
          color={openDate ? 'primary' : 'default'}
        >
          <CalendarTodayIcon />
        </IconButton>

        <Popover
          open={openDate}
          anchorEl={anchorDate}
          onClose={() => setAnchorDate(null)}
          anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
          transformOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Box sx={{ p: 2 }}>
            <DatePicker
              label="After"
              value={startDate}
              onChange={(newDate) => setStartDate(newDate)}
              slotProps={{ textField: { size: 'small', sx: { mb: 2 } } }}
            />
            <DatePicker
              label="Before"
              value={endDate}
              onChange={(newDate) => setEndDate(newDate)}
              slotProps={{ textField: { size: 'small' } }}
            />
          </Box>
        </Popover>



          <IconButton
            ref={cropButtonRef}
            onClick={() => setAreaSelectionEnabled((v) => !v)}
            sx={{
              backgroundColor: areaFilter ? 'background.default' : 'background.paper',
             
            }}

          >
          <CropFreeIcon />
        </IconButton>

        {areaFilter && <ToolbarTooltip anchorRef={cropButtonRef} />}
      </Box>
    </LocalizationProvider>
  );
};
