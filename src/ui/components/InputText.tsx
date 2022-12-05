import React, { FC, ReactNode } from 'react'
import styled, { css } from 'styled-components'

const StyledInputContainer = styled.div<any>`
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px solid #e9eaed;
  border-radius: 10px;
  height: 40px;
  margin: 10px 0;
  background-color: #fdfcff;

  ${(props: any) =>
    props.disabled &&
    css`
      background-color: #e9eaed;
    `}
`

const StyledInput = styled.input`
  /* Chrome, Safari, Edge, Opera */
  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  /* Firefox */
  input[type='number'] {
    -moz-appearance: textfield;
  }

  width: 100%;
  height: 100%;
  border: none;
  outline: none;
  background-color: transparent;
  box-sizing: border-box;

  line-height: 16px;
  padding: 0.5rem;

  &:focus {
    outline: none;
  }

  &::placeholder {
    color: #c4c4c4;
  }

  &:disabled {
    color: #444c5e;
  }
`

const StyledLabel = styled.label`
  font-family: 'Work Sans';
  font-style: normal;
  font-weight: 600;
  font-size: 16px;
  line-height: 22px;

  color: #252e47;
`

interface IAdornmentProps {
  hideBorder?: boolean
  disabled?: boolean
}

const AdornmentBase = styled.div`
  line-height: 16px;
  display: flex;
  justify-content: center;
  align-self: center;

  padding: 0 16px;
  font-family: 'Work Sans';
  font-style: normal;
  line-height: 16px;

  color: #444c5e;
`

const AdornmentStart = styled(AdornmentBase)<IAdornmentProps>`
  border-right: ${props => (props.hideBorder ? 'none' : '1px solid #E9EAED')};
  ${(props: IAdornmentProps) =>
    !props.hideBorder &&
    props.disabled &&
    css`
      border-right: 1px solid #6f7584;
    `}
`
const AdornmentEnd = styled(AdornmentBase)<IAdornmentProps>`
  border-left: ${props => (props.hideBorder ? 'none' : '1px solid #E9EAED')};
  ${(props: IAdornmentProps) =>
    !props.hideBorder &&
    props.disabled &&
    css`
      border-left: 1px solid #6f7584;
    `}
`

const InputWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0 10px;
`

interface IAdornment {
  content: string | ReactNode
  options?: { hideBorder?: boolean }
}

export interface IInputTextProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  adornmentStart?: IAdornment
  adornmentEnd?: IAdornment
}

export const InputText: FC<IInputTextProps> = ({
  id,
  label,
  adornmentStart,
  adornmentEnd,
  disabled,
  ...rest
}: IInputTextProps) => {
  return (
    <div
      style={{
        fontSize: 12
      }}
    >
      {label ? <StyledLabel htmlFor={id}>{label}</StyledLabel> : null}
      <StyledInputContainer disabled={disabled}>
        {adornmentStart ? (
          <AdornmentStart
            hideBorder={adornmentStart.options?.hideBorder}
            disabled={disabled}
          >
            {adornmentStart.content}
          </AdornmentStart>
        ) : null}
        <InputWrapper>
          <StyledInput disabled={disabled} id={id} {...rest} />
          {adornmentEnd ? (
            <AdornmentEnd
              hideBorder={adornmentEnd.options?.hideBorder}
              disabled={disabled}
            >
              {adornmentEnd.content}
            </AdornmentEnd>
          ) : null}
        </InputWrapper>
      </StyledInputContainer>
    </div>
  )
}

export const AdornmentContent = styled.span`
  font-weight: bold;
`
