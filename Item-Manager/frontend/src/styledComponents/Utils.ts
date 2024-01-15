type SetupBorderType = {
  width?: number;
  style?: string;
  color?: string;
};

export const setupBorder = ({ width = 0, style = 'solid', color = 'red' }: SetupBorderType): string => {
  return `${width}px ${style} ${color}`;
};
