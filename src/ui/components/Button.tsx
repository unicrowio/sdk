import styled, { css } from 'styled-components'

interface IButtonProps {
  fullWidth?: boolean
  variant?: 'primary' | 'secondary' | 'tertiary'
}

export const StyledButton = styled.button<IButtonProps>`
  border: 0;
  cursor: pointer;
  font-family: 'Work Sans';
  height: 48px;
  outline: none;
  font-size: 16px;
  font-weight: bold;
  line-height: 22px;
  border-radius: 12px;

  &:hover:enabled {
    transition: 0.3s;
    filter: brightness(90%);
  }

  ${({ variant }) => {
    if (variant === 'secondary') {
      return css`
        background: rgba(98, 89, 255, 0.1);
        color: #6259ff;
        border: 1x solid rgba(98, 89, 255, 0.1);
      `
    }

    if (variant === 'tertiary') {
      return css`
        background-color: #ffffff;
        color: #6259ff;
        border: 1px solid #6259ff;
      `
    }

    return css`
      background-color: #6259ff;
      color: #ffffff;
    `
  }}

  ${props =>
    props.fullWidth &&
    css`
      width: 100%;
    `}

  &:disabled {
    cursor: none;
    background-color: #a8abb5;
    cursor: not-allowed;
  }
`
