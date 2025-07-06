import { useState } from 'react';
import type { Earthquake } from '../types/earthquake';
import { AccessTime, ChevronLeft, ChevronRight, MyLocation, Sort, TrendingDown, TrendingUp } from '@mui/icons-material';
import { Divider, IconButton, ListItemIcon, ListItemText, Menu, MenuItem, Tooltip, Typography } from '@mui/material';
import { EarthquakeDetailIcons } from './EarthquakeDetailIcons';
import { getColorForMagnitude } from '../utils/getColorForMagnetude';

type Props = {
    quakes: Earthquake[];
    onSelectQuake: (coords: [number, number]) => void;
    currentPage: number;
    totalPages: number;
    onNextPage: () => void;
    onPrevPage: () => void;
    loading?: boolean;
    minMagnitude: number;
    startDate: Date | null;
    endDate: Date | null;
    offset: number;
    sortOption: 'time-desc' | 'time-asc' | 'magnitude-desc' | 'magnitude-asc';
    setSortOption: (option: 'time-desc' | 'time-asc' | 'magnitude-desc' | 'magnitude-asc') => void;
};


const EarthquakeSidebar = ({ quakes, onSelectQuake, currentPage, totalPages, onNextPage, onPrevPage, sortOption, setSortOption }: Props) => {
    const [collapsed, setCollapsed] = useState(true);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const handleSort = (option: typeof sortOption) => {
        setSortOption(option);
        setAnchorEl(null);
    };
    const sortOptionLabel = {
        'time-desc': 'Newest First',
        'time-asc': 'Oldest First',
        'magnitude-desc': 'Strongest First',
        'magnitude-asc': 'Weakest First'
    }[sortOption];

    return (
        <div
            className={`absolute top-0 right-0 transition-all duration-300 ease-in-out text-white z-[500]  h-full ${collapsed ? 'w-12 bg-transparent ' : 'w-80 bg-primary shadow-lg shadow-black/30 max-h-full'
                }`}
        >
            
            {collapsed && <Typography className="absolute right-[68px] top-6 z-10 text-primary w-28" fontSize={15} fontWeight={500}>Earthquake List</Typography>}
            {/* Toggle Button */}
            <button
                onClick={() => setCollapsed(!collapsed)}
                className={`absolute -left-${collapsed ? "4" : "10"} top-4 z-10 bg-primary border border-slate-700 rounded-r-md p-1 hover:bg-slate-700"`}
            >
                {collapsed ?  <ChevronLeft /> : <ChevronRight />}
            </button>

            {/* Content */}
            {!collapsed && (
                <div className="h-full border-l border-slate-700 flex flex-col">
                    <div className="flex justify-between items-center px-4 pt-4 border-b">
                        <h2 className="text-lg font-semibold">Earthquake List</h2>

                        <div>
                            <span className='text-[12px]'>{sortOptionLabel}</span>
                            <IconButton
                                onClick={(e) => setAnchorEl(e.currentTarget)}
                                className="text-white"
                                size="small"
                            >
                                <Sort />
                            </IconButton>
                            <Menu
                                anchorEl={anchorEl}
                                open={Boolean(anchorEl)}
                                onClose={() => setAnchorEl(null)}
                            >
                                <MenuItem onClick={() => handleSort('time-desc')}>
                                    <ListItemIcon><AccessTime /></ListItemIcon>
                                    <ListItemText>Newest First</ListItemText>
                                </MenuItem>
                                <MenuItem onClick={() => handleSort('time-asc')}>
                                    <ListItemIcon><AccessTime /></ListItemIcon>
                                    <ListItemText>Oldest First</ListItemText>
                                </MenuItem>
                                <MenuItem onClick={() => handleSort('magnitude-desc')}>
                                    <ListItemIcon><TrendingDown /></ListItemIcon>
                                    <ListItemText>Strongest First</ListItemText>
                                </MenuItem>
                                <MenuItem onClick={() => handleSort('magnitude-asc')}>
                                    <ListItemIcon><TrendingUp /></ListItemIcon>
                                    <ListItemText>Weakest First</ListItemText>
                                </MenuItem>
                            </Menu>
                        </div>
                    </div>
                    <ul className="overflow-y-auto flex-1 px-2">
                        {quakes.map((eq) => {
                            const date = new Date(eq.time).toLocaleString(undefined, {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                            });

                            return (
                                <li
                                    key={eq.id}
                                    className="flex items-start flex-col colgap-4 border-b border-white-700 p-3"
                                >
                                    {/* Magnitude Badge */}
                                    <div className='flex flex-row items-center justify-between w-full'>
                                        <div
                                            className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                                            style={{
                                                backgroundColor:
                                                    getColorForMagnitude(eq.magnitude)
                                            }}
                                        >
                                            {eq.magnitude.toFixed(1)}
                                        </div>
                                        <div>
                                            <Typography className='font-medium !text-sm px-1 text-white line-clamp-2'>{eq.title}</Typography>
                                        </div>
                                        <div >
                                            <Tooltip title="Fly to on map" arrow>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => onSelectQuake([eq.coords[0], eq.coords[1]])}
                                                    className="bg-slate-700 hover:bg-slate-600 text-white"
                                                >
                                                    <MyLocation fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </div>

                                    </div>


                                    {/* Info Block */}
                                    <div className="flex flex-col flex-grow text-sm overflow-hidden">
                                        <Typography fontSize={"small"} color='white'>{date}</Typography>
                                        <Divider/>
                                        {EarthquakeDetailIcons(eq.magnitude, eq.magType, eq.coords[2], eq.alert, eq.felt, eq.mmi, eq.cdi)}
                                        <a
                                            href={eq.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-blue-300 underline text-xs mt-1"
                                        >
                                            More info on USGS
                                        </a>
                                    </div>

                                </li>
                            );
                        })}
                    </ul>
                    {/* Pagination Controls */}
                    <div className="p-2 border-t border-slate-700 flex justify-between items-center text-xs">
                        <button
                            onClick={onPrevPage}
                            disabled={currentPage === 1}
                            className="px-2 py-1 rounded bg-slate-600 hover:bg-slate-500 disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <span>
                            Page {currentPage} of {totalPages}
                        </span>
                        {currentPage < totalPages ? (
                            <button
                                onClick={onNextPage}
                                className="px-2 py-1 rounded bg-slate-600 hover:bg-slate-500"
                            >
                                Next
                            </button>
                        ) : quakes.length === 10 ? (
                            <button
                                onClick={onNextPage}
                                className="px-2 py-1 rounded bg-slate-600 hover:bg-slate-500"
                            >
                                Load More
                            </button>
                        ) : (
                            <span className="text-slate-400">End of results</span>
                        )}
                    </div>
                </div>

            )}

        </div>

    );
};

export default EarthquakeSidebar;
