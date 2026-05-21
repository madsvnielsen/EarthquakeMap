import {
  AppBar,
  Box,
  Chip,
  IconButton,
  Link,
  Popover,
  Stack,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import PublicRoundedIcon from '@mui/icons-material/PublicRounded';
import QueryStatsRoundedIcon from '@mui/icons-material/QueryStatsRounded';
import PlaceRoundedIcon from '@mui/icons-material/PlaceRounded';
import { useState } from 'react';
import { Constants } from '../utils/Constants';
import { format, isValid } from 'date-fns';

type Props = {
  startDate: Date | null;
  endDate: Date | null;
  minMagnitude: number;
  resultCount: number;
  areaFilter: boolean;
  didReachLimit?: boolean;
};

export const TopBar = ({
  startDate,
  endDate,
  minMagnitude,
  resultCount,
  areaFilter,
  didReachLimit,
}: Props) => {
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const resultLabel = didReachLimit ? `${resultCount}+` : `${resultCount}`;
  const hasValidRange = !!startDate && !!endDate && isValid(startDate) && isValid(endDate);
  const dateLabel = hasValidRange
    ? isMobile
      ? `${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d')}`
      : `${format(startDate, 'MMM d')} to ${format(endDate, 'MMM d, yyyy')}`
    : 'Choose a valid date range';

  return (
    <AppBar
      position="absolute"
      elevation={0}
      sx={{
        top: 18,
        left: 18,
        right: 18,
        width: 'auto',
        bgcolor: 'transparent',
        zIndex: 700,
      }}
    >
      <Toolbar
        disableGutters
        className="glass-panel"
        sx={{
          minHeight: { xs: 62, md: 58 },
          px: { xs: 1.5, md: 2 },
          py: { xs: 0.5, md: 0.75 },
          borderRadius: '10px',
          alignItems: { xs: 'stretch', md: 'center' },
          flexDirection: { xs: 'column', md: 'row' },
          gap: { xs: 0.6, md: 0.75 },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: { xs: 0.75, md: 1.25 },
            minWidth: 0,
            width: '100%',
          }}
        >
          <Box
            sx={{
              width: { xs: 28, md: 34 },
              height: { xs: 28, md: 34 },
              borderRadius: '8px',
              display: 'grid',
              placeItems: 'center',
              bgcolor: 'rgba(255, 138, 91, 0.14)',
              color: 'primary.main',
              flexShrink: 0,
            }}
          >
            <PublicRoundedIcon fontSize="small" />
          </Box>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 700, lineHeight: 1.05, fontSize: { xs: '0.95rem', md: '1rem' } }}
            >
              {Constants.APP_NAME}
            </Typography>
            {!isMobile && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.1 }}>
                Global seismic activity explorer
              </Typography>
            )}
          </Box>
          <IconButton
            onClick={(e) => setAnchor(e.currentTarget)}
            size="small"
            sx={{ color: 'text.secondary', p: 0.5 }}
          >
            <HelpOutlineIcon fontSize="small" />
          </IconButton>
        </Box>

        <Stack
          direction="row"
          spacing={1}
          sx={{
            ml: { xs: 0, md: 'auto' },
            flexWrap: { xs: 'nowrap', md: 'wrap' },
            rowGap: 0.75,
            justifyContent: { xs: 'flex-start', md: 'flex-end' },
            width: '100%',
            maxWidth: '100%',
            overflowX: { xs: 'auto', md: 'visible' },
            overflowY: 'hidden',
            pb: { xs: 0.25, md: 0 },
            '&::-webkit-scrollbar': { display: 'none' },
            scrollbarWidth: 'none',
          }}
        >
          <Chip
            icon={<QueryStatsRoundedIcon />}
            label={`${resultLabel} events`}
            size="small"
            sx={{
              bgcolor: 'rgba(111, 214, 194, 0.12)',
              color: 'text.primary',
              height: 24,
              flexShrink: 0,
            }}
          />
          <Chip
            label={`Mag ${minMagnitude.toFixed(1)}+`}
            size="small"
            sx={{
              bgcolor: 'rgba(255, 138, 91, 0.12)',
              color: 'text.primary',
              height: 24,
              display: { xs: 'inline-flex', sm: 'inline-flex' },
              flexShrink: 0,
            }}
          />
          {isMobile ? (
            <Chip
              label={dateLabel}
              size="small"
              sx={{
                bgcolor: 'rgba(159, 179, 200, 0.12)',
                color: 'text.primary',
                height: 24,
                flexShrink: 0,
              }}
            />
          ) : (
            <Chip
              label={dateLabel}
              size="small"
              sx={{ bgcolor: 'rgba(159, 179, 200, 0.12)', color: 'text.primary', height: 24, flexShrink: 0 }}
            />
          )}
          {areaFilter && (
            <Chip
              icon={<PlaceRoundedIcon />}
              label="Area filter active"
              size="small"
              sx={{
                bgcolor: 'rgba(111, 214, 194, 0.12)',
                color: 'text.primary',
                height: 24,
                display: { xs: 'none', md: 'inline-flex' },
              }}
            />
          )}
        </Stack>

        <Popover
          open={!!anchor}
          anchorEl={anchor}
          onClose={() => setAnchor(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          PaperProps={{
            className: 'glass-panel',
            sx: {
              maxWidth: 360,
              p: 2,
              mt: 1,
              borderRadius: '10px',
            },
          }}
        >
          <Typography variant="subtitle1" gutterBottom>
            About {Constants.APP_NAME}
          </Typography>

          <Typography variant="body2" paragraph color="text.secondary">
            {Constants.APP_NAME} visualizes global seismic activity using the{' '}
            <Link href="https://earthquake.usgs.gov/" target="_blank" rel="noreferrer" underline="hover">
              USGS Earthquake API
            </Link>
            . Use the right-side filter panel to refine the time range, minimum intensity, or a hand-picked map area.
          </Typography>

          <Typography variant="body2" paragraph color="text.secondary">
            This tool is for exploration and awareness only. It is not an early warning system or a replacement for official emergency services.
          </Typography>

          <Typography variant="caption" color="text.secondary">
            Built by Mads © {new Date().getFullYear()}
          </Typography>
        </Popover>
      </Toolbar>
    </AppBar>
  );
};
