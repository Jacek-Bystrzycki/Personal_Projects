import styled, { css } from 'styled-components';

type BasicButtonProps = {
  background?: string;
  color?: string;
  $padding?: number;
};
type ButtonType = {
  type?: 'button' | 'submit' | 'reset';
};

export const BasicButton = styled.button.attrs<ButtonType>(({ type = 'button' }) => {
  return { type };
})<BasicButtonProps>`
  color: ${({ color }) => (color ? color : css`var(--clr-neutral-900)`)};
  background: ${({ background }) => (background ? background : css`var(--clr-neutral-400)`)};
  padding: ${({ $padding }) => ($padding ? `${$padding}px` : '0px')};
  text-transform: capitalize;
  margin: 0.75rem;
  padding: 0.5rem;
  width: 40%;
  border-radius: 3px;
  &:hover {
    cursor: pointer;
    background: var(--clr-yellow-500);
  }
`;

type BlockButtonProps = {
  width?: number;
};
export const BlockButton = styled(BasicButton)<BlockButtonProps>`
  display: block;
  width: ${({ width }) => (width ? `${width}%` : '100%')};
  margin-inline: auto;
`;
