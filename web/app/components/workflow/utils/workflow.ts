export const getEdgeStrokeColor = (selected: boolean) => {
  return selected ? 'var(--color-workflow-edge-line)' : 'var(--color-workflow-edge-line-normal)';
}

export const capitalizeFirstLetter = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const toTimestamp = (
  date: string | null | undefined,
): number => {
  if (!date)
    return 0;

  return new Date(date.replace(' ', 'T')).getTime()
}
