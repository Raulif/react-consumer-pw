import { generateMovie } from '@cypress/support/factories'
import type { Movie } from 'src/consumer'
import { expect, test } from '@pw/support/fixtures'
import { editMovie } from '@pw/support/ui-helpers/edit-movie'
import { addMovie } from '@pw/support/ui-helpers/add-movie'

test.describe('Movie CRUD e2e stubbed with helper', () => {
  // Generate inital movie data
  const { name, year, rating, director } = generateMovie()
  const id = 1
  const movie: Movie = { name, year, rating, director, id }

  const {
    name: editedName,
    year: editedYear,
    rating: editedRating,
    director: editedDirector,
  } = generateMovie()

  test('should add a movie', async ({ page, interceptNetworkCall }) => {
    const loadNoMovies = interceptNetworkCall({
      method: 'GET',
      url: '/movies',
      fulfillResponse: {
        status: 200,
        body: { data: [] },
      },
    })

    await page.goto('/')
    await loadNoMovies

    await addMovie(page, name, year, rating, director)

    const loadOrGetMovies = interceptNetworkCall({
      url: '/movies',
      handler: async (route, request) => {
        if (request.method() === 'POST') {
          await route.fulfill({
            status: 200,
            body: JSON.stringify(movie),
            headers: { 'Content-Type': 'application/json' },
          })
        } else if (request.method() === 'GET') {
          await route.fulfill({
            status: 200,
            body: JSON.stringify({ data: [movie] }),
            headers: { 'Content-Type': 'application/json' },
          })
        } else {
          return route.continue()
        }
      },
    })

    await page.getByTestId('add-movie-button').click()

    await loadOrGetMovies
    await loadOrGetMovies
  })

  test('should edit a movie', async ({ page, interceptNetworkCall }) => {
    const loadGetMovies = interceptNetworkCall({
      method: 'GET',
      url: '/movies',
      fulfillResponse: {
        status: 200,
        body: { data: [movie] },
      },
    })
    await page.goto('/')
    await loadGetMovies

    const loadGetMovieById = interceptNetworkCall({
      method: 'GET',
      url: `/movies/${movie.id}`,
      fulfillResponse: {
        status: 200,
        body: { data: movie },
      },
    })
    await page.getByTestId(`link-${movie.id}`).click()
    await expect(page).toHaveURL(`/movies/${movie.id}`)

    const getMovieByIdResponse = await loadGetMovieById
    const {
      responseJson: { data },
    } = getMovieByIdResponse as { responseJson: { data: Movie } }
    expect(data).toEqual(movie)

    const updatedMovie = {
      id: movie.id,
      name: editedName,
      year: editedYear,
      rating: editedRating,
      director: editedDirector,
    }

    const loadUpdateMovieById = interceptNetworkCall({
      method: 'PUT',
      url: `/movies/${movie.id}`,
      fulfillResponse: {
        status: 200,
        body: updatedMovie,
      },
    })

    await editMovie(page, editedName, editedYear, editedDirector, editedRating)
    const { responseJson } = await loadUpdateMovieById
    expect(responseJson).toEqual(updatedMovie)
    const nameInput = page.getByPlaceholder('Movie name')
    await expect(nameInput).toHaveAttribute('value', editedName)
  })

  test('should delete a movie', async ({ page, interceptNetworkCall }) => {
    const loadGetMovies = interceptNetworkCall({
      method: 'GET',
      url: '/movies',
      fulfillResponse: {
        status: 200,
        body: { data: [movie] },
      },
    })
    await page.goto('/')
    await loadGetMovies

    const loadDeleteMovieById = interceptNetworkCall({
      method: 'DELETE',
      url: '/movies/*',
      fulfillResponse: {
        status: 200,
      },
    })

    const loadGetMoviesAfterDelete = interceptNetworkCall({
      method: 'GET',
      url: '/movies',
      fulfillResponse: {
        status: 200,
        body: { data: [] },
      },
    })

    await page.getByTestId(`delete-movie-${movie.name}`).click()

    await loadDeleteMovieById
    const { responseJson } = await loadGetMoviesAfterDelete

    expect(responseJson).toEqual({ data: [] })

    await expect(
      page.getByTestId(`delete-movie-${movie.name}`),
    ).not.toBeVisible()
  })
})
