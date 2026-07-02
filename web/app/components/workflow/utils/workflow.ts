export const getEdgeStrokeColor = (selected: boolean) => {
  return selected ? 'var(--color-workflow-edge-line)' : 'var(--color-workflow-edge-line-normal)';
}

export const capitalizeFirstLetter = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};
