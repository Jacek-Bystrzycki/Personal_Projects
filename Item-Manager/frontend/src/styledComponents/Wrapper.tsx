import styled from 'styled-components';
import { setupBorder } from './Utils';

type WrapperProps = {
  $maxWidth?: number;
  $border?: string;
  $padding?: number;
  $marginBlock?: number;
};
export const Wrapper = styled.div<WrapperProps>`
  max-width: ${({ $maxWidth }) => ($maxWidth ? `${$maxWidth}px` : '0px')};
  margin-inline: auto;
  margin-block: ${({ $marginBlock }) => ($marginBlock ? `${$marginBlock}%` : '0%')};
  border: ${({ $border }) => ($border ? $border : setupBorder({}))};
  padding: ${({ $padding }) => ($padding ? `${$padding}px` : '0px')};
`;
