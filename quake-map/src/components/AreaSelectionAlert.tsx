import { Box, Button, Typography } from '@mui/material';

type Props = {
  onCancel: () => void;
};

export const AreaSelectionAlert = ({ onCancel }: Props) => {
  return (
    <Box
      sx={{
        position: 'absolute',
        top: 16,
        left: '50%',
        transform: 'translateX(-50%)',
        bgcolor: 'background.paper',
        boxShadow: 3,
        borderRadius: 2,
        px: 3,
        py: 1.5,
        zIndex: 1500,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
      }}
    >
      <Typography variant="body1">Area selection active</Typography>
      <Button variant="outlined" size="small" onClick={onCancel}>
        Cancel
      </Button>
    </Box>
  );
};
