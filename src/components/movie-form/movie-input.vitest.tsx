// import {describe, expect, it, screen, vi, wrappedRender} from '@vitest-utils/utils'
import {
  describe,
  expect,
  it,
  screen,
  vi,
  wrappedRender,
} from '@vitest-utils/utils'
import { userEvent } from '@vitest/browser/context'
import { generateMovie } from '@cypress/support/factories'
import type { Movie } from 'src/consumer'
import MovieInput from './movie-input'

describe('<MovieInput>', () => {
  const movie: Omit<Movie, 'id'> = generateMovie()

  it('should render a name input', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    wrappedRender(
      <MovieInput
        type="text"
        value={''}
        placeholder="enter name"
        onChange={onChange}
      />,
    )

    const input = screen.getByTestId('movie-input-comp-text')
    expect(input).toBeVisible()
    expect(input).toHaveValue('')
    expect(input).toHaveAttribute('placeholder', 'enter name')

    await user.clear(input)
    await userEvent.fill(input, 'aaaa')
    expect(onChange).toHaveBeenCalledTimes(1)
  })

  it('should render a number input', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    wrappedRender(
      <MovieInput
        type="number"
        value={movie.year}
        placeholder="enter year"
        onChange={onChange}
      />,
    )
    const input = screen.getByTestId('movie-input-comp-number')

    expect(input).toBeVisible()
    expect(input).toHaveValue(movie.year)
    expect(input).toHaveAttribute('placeholder', 'enter year')

    await user.clear(input)
    await user.fill(input, '1993')

    expect(onChange).toHaveBeenCalledTimes(2)
  })
})
