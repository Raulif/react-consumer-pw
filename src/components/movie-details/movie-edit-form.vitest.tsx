import {
  describe,
  expect,
  it,
  screen,
  vi,
  wrappedRender,
  userEvent,
  worker,
  http,
  waitFor,
} from '@vitest-utils/utils'
import MovieEditForm from './movie-edit-form'
import { generateMovie } from '@cypress/support/factories'
import type { Movie } from 'src/consumer'

describe('<MovieEditForm>', () => {
  const movie: Omit<Movie, 'id'> = generateMovie()
  const movieId = 1
  const onCancel = vi.fn()
  const user = userEvent.setup()

  it('should cancel and submit a movie update', async () => {
    wrappedRender(
      <MovieEditForm movie={{ id: movieId, ...movie }} onCancel={onCancel} />,
    )

    await user.click(screen.getByTestId('cancel'))
    expect(onCancel).toHaveBeenCalledOnce()

    let putRequest: Record<string, unknown> | unknown
    worker.use(
      http.put(
        `http://localhost:3001/movies/${movieId}`,
        async ({ request }) => {
          putRequest = await request.json()
          return new Response(undefined, { status: 200 })
        },
      ),
    )

    await user.click(screen.getByTestId('update-movie'))
    await waitFor(() => {
      expect(putRequest).toMatchObject(movie)
    })
  })
})
