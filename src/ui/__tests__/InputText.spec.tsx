import { render, screen } from '@testing-library/react'
import React from 'react'
import { InputText } from '../components/InputText'

it('should render', () => {
  render(<InputText />)
})

it('should display adornments', () => {
  const { rerender } = render(
    <InputText adornmentStart={{ content: 'test start' }} />
  )
  screen.getByText('test start')
  expect(screen.queryByText('test end')).toBeNull()

  rerender(
    <InputText
      adornmentStart={{ content: 'test start' }}
      adornmentEnd={{ content: 'test end' }}
    />
  )
  screen.getByText('test start')
  screen.getByText('test end')
})

it('should display labels', () => {
  const { rerender } = render(<InputText />)
  expect(screen.queryByText('test label')).toBeNull()

  rerender(<InputText label="test label 2" id="inputTest" />)
  screen.getByLabelText('test label 2')
})
