import { Box, Typography } from "@mui/material";
import { ClickableTooltip } from "./ClickableTooltip";
import { FlashOn, People, South, Visibility, Warning, Whatshot } from "@mui/icons-material";

export function EarthquakeDetailIcons(magnitude: number, magType: string | undefined, depth: number, alert: string | undefined, felt: number | undefined, mmi: number | undefined, cdi: number | undefined) {
    const alertColorMap: Record<string, string> = {
        green: '#4caf50',
        yellow: '#ffeb3b',
        orange: '#ff9800',
        red: '#f44336',
    };
    return <Box
        sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 1,
            mt: 1,
        }}
    >
        {/* Magnitude */}
        <ClickableTooltip title="Magnitude and type">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Whatshot fontSize="small" />
                <Typography variant="caption">
                    {magnitude} {magType}
                </Typography>
            </Box>
        </ClickableTooltip>

        {/* Depth */}
        {depth != null && (
            <ClickableTooltip title="Depth below surface">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <South fontSize="small" />
                    <Typography variant="caption">{depth.toFixed(1)} km</Typography>
                </Box>
            </ClickableTooltip>
        )}

        {/* Alert level */}
        {alert && (
            <ClickableTooltip title="USGS alert level">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Warning
                        fontSize="small"
                        sx={{ color: alertColorMap[alert.toLowerCase()] || 'inherit' }}
                    />
                    <Typography variant="caption">{alert}</Typography>
                </Box>
            </ClickableTooltip>
        )}

        {/* Felt reports */}
        {felt != null && (
            <ClickableTooltip title="Number of people who reported feeling it">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Visibility fontSize="small" />
                    <Typography variant="caption">{felt}</Typography>
                </Box>
            </ClickableTooltip>
        )}

        {/* Max MMI */}
        {mmi != null && (
            <ClickableTooltip title="Peak ground shaking (Modified Mercalli Intensity)">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <FlashOn fontSize="small" />
                    <Typography variant="caption">MMI: {mmi}</Typography>
                </Box>
            </ClickableTooltip>
        )}

        {/* Community Intensity */}
        {cdi != null && (
            <ClickableTooltip title="Community-reported shaking intensity (CDI)">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <People fontSize="small" />
                    <Typography variant="caption">CDI: {cdi}</Typography>
                </Box>
            </ClickableTooltip>
        )}

    </Box>;
}
