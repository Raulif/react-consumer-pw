import {
  describe,
  expect,
  it,
  screen,
  vi,
  wrappedRender,
} from '@vitest-utils/utils'
import MovieList from './movie-list'
import { generateMovie } from '@cypress/support/factories'

describe('<MovieList>', () => {
  const onDelete = vi.fn()
  const movie1 = { id: 1, ...generateMovie() }
  const movie2 = { id: 2, ...generateMovie() }
  it('should show nothing with no movies', () => {
    wrappedRender(<MovieList movies={[]} onDelete={onDelete} />)
    expect(screen.queryByTestId('movie-list-comp')).not.toBeInTheDocument()
  })

  it('should show error with error', () => {
    wrappedRender(<MovieList movies={{ error: 'error' }} onDelete={onDelete} />)
    expect(screen.queryByTestId('movie-list-comp')).not.toBeInTheDocument()
    expect(screen.getByTestId('error')).toBeInTheDocument()
  })

  it('should verify the movie and delete', () => {
    wrappedRender(<MovieList movies={[movie1, movie2]} onDelete={onDelete} />)
    expect(screen.getByTestId('movie-list-comp')).toBeVisible()
    const movieItems = screen.getAllByTestId('movie-item-comp')
    expect(movieItems).toHaveLength(2)
    movieItems.forEach(mi => expect(mi).toBeVisible())
    screen.getAllByText('Delete')[0]?.click()
    expect(onDelete).toHaveBeenCalledOnce()
  })
})
