import { useState, type MouseEvent, type ReactElement } from 'react';
import { Tooltip, Popover, Typography, ClickAwayListener } from '@mui/material';

type Props = {
  title: string;
  children: ReactElement;
};

export const ClickableTooltip = ({ title, children }: Props) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  const handleClick = (e: MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    setAnchorEl(anchorEl ? null : e.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <ClickAwayListener onClickAway={handleClose}>
      <span style={{ display: 'inline-flex' }}>
        {/* Hover tooltip and clickable content */}
        <Tooltip title={title}>
          <span onClick={handleClick} style={{ display: 'inline-flex' }}>
            {children}
          </span>
        </Tooltip>

        {/* Click Popover */}
        <Popover
          open={open}
          anchorEl={anchorEl}
          onClose={handleClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          transformOrigin={{ vertical: 'top', horizontal: 'center' }}
          disableRestoreFocus
          PaperProps={{
            sx: {
              px: 1.5,
              py: 0.5,
              overflow: 'visible',      // ✅ No scrollbars
              maxHeight: 'unset',       // ✅ Remove max height
            },
          }}
        >
          <Typography variant="caption">{title}</Typography>
        </Popover>
      </span>
    </ClickAwayListener>
  );
};
