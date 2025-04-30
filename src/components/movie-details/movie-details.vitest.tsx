import { generateMovie } from '@cypress/support/factories'
import {
  describe,
  expect,
  http,
  it,
  screen,
  waitFor,
  worker,
  wrappedRender,
} from '@vitest-utils/utils'
import type { Movie } from 'src/consumer'
import MovieDetails from './movie-details'

describe('<MovieDetails>', () => {
  const movie: Omit<Movie, 'id'> = generateMovie()
  const movieId = 1
  const baseUrl = 'http://localhost:3001'

  it('should display the default error with delay', async () => {
    const error = 'Unexpected error occurred'

    let responseData: object

    worker.use(
      http.get(`${baseUrl}/movies/${movieId}`, () => {
        responseData = { error }
        return new Response(JSON.stringify(responseData), { status: 400 })
      }),
    )

    wrappedRender(<MovieDetails />, { path: '/:id', route: `/${movieId}` })

    await waitFor(() => {
      expect(responseData).toMatchObject({ error })
    })
  })

  it('should display a specific error', async () => {
    const error = 'Movie not found'
    let responseData: object

    worker.use(
      http.get(`${baseUrl}/movies/${movieId}`, () => {
        responseData = { error: { error } }
        return new Response(JSON.stringify(responseData), { status: 400 })
      }),
    )

    wrappedRender(<MovieDetails />, { path: '/:id', route: `/${movieId}` })

    await waitFor(() => {
      expect(responseData).toMatchObject({ error: { error } })

      expect(screen.getByText(error)).toBeVisible()
    })
  })

  it('should make a unique network call when the route takes an id', async () => {
    let responseData: object
    worker.use(
      http.get(`${baseUrl}/movies/${movieId}`, () => {
        responseData = { data: movie }
        return new Response(JSON.stringify({ data: movie }), { status: 200 })
      }),
    )
    wrappedRender(<MovieDetails />, { path: '/:id', route: `/${movieId}` })

    await waitFor(() => {
      expect(responseData).toMatchObject({ data: movie })
    })
  })

  it('should make a unique network call when the route takes a query parameter', async () => {
    const route = `/movies?name=${encodeURIComponent(movie.name)}`
    let responseData: object
    worker.use(
      http.get(`${baseUrl}${route}`, ({ request }) => {
        const url = new URL(request.url)
        const name = url.searchParams.get('name')
        if (name === movie.name) {
          responseData = { data: movie }
        } else {
          responseData = { data: {} }
        }

        return new Response(JSON.stringify(responseData), { status: 200 })
      }),
    )

    wrappedRender(<MovieDetails />, { path: '/movies', route })

    await waitFor(() => {
      expect(responseData).toMatchObject({ data: movie })
    })
  })
})
