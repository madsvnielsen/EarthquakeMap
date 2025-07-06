import { Box } from '@mui/material';
import { useEffect, useState } from 'react';

type Props = {
  anchorRef: React.RefObject<HTMLElement | null>;
};

export const ToolbarTooltip =({ anchorRef }: Props) => {
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    const updatePosition = () => {
      const rect = anchorRef.current?.getBoundingClientRect();
      if (rect) {
        setCoords({
          top: rect.top,
          left: rect.left + rect.width / 2,
        });
      }
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    return () => window.removeEventListener('resize', updatePosition);
  }, [anchorRef]);

  if (!coords) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        top: coords.top - 36,
        left: coords.left,
        transform: 'translateX(-50%)',
        bgcolor: 'orange',
        color: 'white',
        px: 1.5,
        py: 0.5,
        borderRadius: 1,
        fontSize: 12,
        zIndex: 1500,
        boxShadow: 3,
        pointerEvents: 'none',
        whiteSpace: 'nowrap',
      }}
    >
      Area selected. Click to remove.
    </Box>
  );
};
