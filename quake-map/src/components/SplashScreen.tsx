import { CircularProgress, Typography, Box } from '@mui/material';
import { Constants } from '../utils/Constants';
import packageJson from '../../package.json';
export const SplashScreen = () => (
  <Box
    sx={{
      height: '100vh',
      width: '100vw',
      bgcolor: 'background.default',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <Typography variant="h4" gutterBottom>
      {Constants.APP_NAME}
    </Typography>
    <Typography variant="body2" color="text.secondary" gutterBottom>
      Loading seismic data...
    </Typography>
    <CircularProgress />
    <Typography>V {packageJson.version}</Typography>

  </Box>
);
