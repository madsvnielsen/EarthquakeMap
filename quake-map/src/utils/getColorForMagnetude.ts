// Get color from magnitude
export const getColorForMagnitude = (mag: number): string => {
  if (mag < 4) return 'hsl(120, 80%, 55%)'; // green
  if (mag < 5) return 'hsl(97, 90.40%, 55.10%)';  // yellow-green
  if (mag < 6) return 'hsl(44, 100.00%, 59.80%)'; // yellow
  if (mag < 7) return 'hsl(30, 100%, 55%)'; // orange
  return 'hsl(0, 100%, 50%)';               // red
};