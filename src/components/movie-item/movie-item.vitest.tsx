import {
  describe,
  expect,
  it,
  screen,
  vi,
  wrappedRender,
  userEvent,
} from '@vitest-utils/utils'
import MovieItem from './movie-item'
import { generateMovie } from '@cypress/support/factories'
import type { Movie } from 'src/consumer'
// import { userEvent } from '@vitest/browser/context'

describe('<MovieItem>', () => {
  const movie: Omit<Movie, 'id'> = generateMovie()
  const movieId = 1
  const onDelete = vi.fn()
  const user = userEvent.setup()

  it('should verify the movie and delete', async () => {
    wrappedRender(<MovieItem id={movieId} {...movie} onDelete={onDelete} />)

    const link = screen.getByTestId(`link-${movieId}`)
    expect(link).toBeVisible()
    expect(link).toHaveAttribute('href', `/movies/${movieId}`)

    const button = screen.getByRole('button')
    await user.click(button)
    expect(onDelete).toHaveBeenCalledOnce()
    expect(onDelete).toHaveBeenCalledWith(movieId)
  })
})
