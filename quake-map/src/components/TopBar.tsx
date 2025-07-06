import {
    AppBar,
    Box,
    IconButton,
    Toolbar,
    Typography,
    Popover,
    useTheme,
    useMediaQuery,
    Link,
} from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { useState } from 'react';
import {Constants } from '../utils/Constants';

type Props = {
    filterSummary: string;
};

export const TopBar = ({ filterSummary }: Props) => {
    const [anchor, setAnchor] = useState<null | HTMLElement>(null);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    return (
        <AppBar
            position="static"
            elevation={0}
            sx={{
                bgcolor: 'background.default',
                boxShadow: theme.shadows[1],
            }}
        >
            <Toolbar
                disableGutters
                sx={{
                    height: 36,
                    minHeight: '36px !important',
                    px: 1,
                    py: 0,
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}
            >
                {/* Left: Logo */}
                <Typography
                    variant="subtitle2"
                    fontWeight={600}
                    noWrap
                    sx={{ ml: 1 }}
                >
                    {Constants.APP_NAME}
                </Typography>

                {/* Center: Filter Summary (hide on very narrow screens) */}
                {!isMobile && (
                    <Typography
                        variant="body2"
                        sx={{
                            flexGrow: 1,
                            textAlign: 'center',
                            color: 'text.secondary',
                            fontSize: '0.8rem',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            px: 2,
                        }}
                    >
                        {filterSummary}
                    </Typography>
                )}

                {/* Right: Help icon */}
                <IconButton
                    onClick={(e) => setAnchor(e.currentTarget)}
                    size="small"
                    sx={{ color: 'text.secondary', mr: 1 }}
                >
                    <HelpOutlineIcon fontSize="small" />
                </IconButton>


<Popover
  open={!!anchor}
  anchorEl={anchor}
  onClose={() => setAnchor(null)}
  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
>
  <Box sx={{ p: 2, maxWidth: 360 }}>
    <Typography variant="subtitle2" gutterBottom>
      About {Constants.APP_NAME}
    </Typography>

    <Typography variant="body2" paragraph>
      <strong>{Constants.APP_NAME}</strong> visualizes global seismic activity using data from the{' '}
      <Link href="https://earthquake.usgs.gov/" target="_blank" rel="noreferrer" underline="hover">
        USGS Earthquake API
      </Link>. You can filter earthquakes by time, location, and magnitude.
    </Typography>

    <Typography variant="body2" paragraph>
      <strong>Disclaimer:</strong> This tool is for educational and exploratory purposes only.
      It is <em>not</em> an early warning system or real-time alert service.
    </Typography>

    <Typography variant="body2" paragraph>
      This map is powered by{' '}
      <Link href="https://leafletjs.com/" target="_blank" rel="noreferrer" underline="hover">
        Leaflet
      </Link>{' '}
      and uses basemaps from{' '}
      <Link href="https://www.openstreetmap.org/" target="_blank" rel="noreferrer" underline="hover">
        OpenStreetMap
      </Link>.
    </Typography>

    <Typography variant="body2" paragraph>
      Fault lines are sourced from:{' '}
      <em>
        Styron, Richard, and Marco Pagani. “The GEM Global Active Faults Database.” Earthquake Spectra,
        vol. 36, no. 1_suppl, Oct. 2020, pp. 160–180.
      </em>{' '}
      DOI:{' '}
      <Link
        href="https://doi.org/10.1177/8755293020944182"
        target="_blank"
        rel="noreferrer"
        underline="hover"
      >
        10.1177/8755293020944182
      </Link>
      .
    </Typography>

    {Constants.APP_CONTACT_MAIL && <Typography variant="body2" paragraph>
      Contact:{' '}
      <Link href={`mailto:${Constants.APP_CONTACT_MAIL}`} underline="hover">
        {Constants.APP_CONTACT_MAIL}
      </Link>
    </Typography>}

    <Typography variant="caption" color="text.secondary">
      Built by Mads © {new Date().getFullYear()}
    </Typography>
  </Box>
</Popover>


            </Toolbar>
        </AppBar>
    );
};
