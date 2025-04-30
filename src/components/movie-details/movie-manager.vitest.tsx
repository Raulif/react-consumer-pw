import {
  describe,
  expect,
  it,
  screen,
  vi,
  wrappedRender,
  userEvent,
} from '@vitest-utils/utils'
import MovieManager from './movie-manager'
import { generateMovie } from '@cypress/support/factories'
import type { Movie } from 'src/consumer'

describe('<MovieManager>', () => {
  const movie: Omit<Movie, 'id'> = generateMovie()
  const movieId = 1
  const onDelete = vi.fn()
  const user = userEvent.setup()

  it('should toggle between movie info and movie edit components', async () => {
    wrappedRender(
      <MovieManager
        movie={{
          id: movieId,
          ...movie,
        }}
        onDelete={onDelete}
      />,
    )

    const deleteButton = screen.getByTestId('delete-movie')
    await user.click(deleteButton)
    expect(onDelete).toBeCalledWith(movieId)

    expect(screen.getByTestId('movie-info-comp')).toBeVisible()
    expect(screen.queryByTestId('movie-edit-form-comp')).not.toBeInTheDocument()

    await user.click(screen.getByTestId('edit-movie'))
    expect(screen.getByTestId('movie-edit-form-comp')).toBeVisible()
    expect(screen.queryByTestId('movie-info-comp')).not.toBeInTheDocument()
  })
})
