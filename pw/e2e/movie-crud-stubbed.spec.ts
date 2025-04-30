import { generateMovie } from '@cypress/support/factories'
import type { Movie } from 'src/consumer'
import { expect, test } from '@pw/support/fixtures'
import { editMovie } from '@pw/support/ui-helpers/edit-movie'
import { addMovie } from '@pw/support/ui-helpers/add-movie'
import type { Route, Request } from '@playwright/test'

test.describe('Movie CRUD e2e stubbed', () => {
  // Generate initial movie data
  const { name, year, rating, director } = generateMovie()
  const id = 1
  const movie: Movie = { name, year, rating, director, id }
  type RouteHandler = (route: Route, request: Request) => Promise<void>

  const {
    name: editedName,
    year: editedYear,
    rating: editedRating,
    director: editedDirector,
  } = generateMovie()

  test('should add a movie', async ({ page }) => {
    await page.route('**/movies', route =>
      route.fulfill({
        status: 200,
        body: JSON.stringify({ data: [] }),
        headers: { 'Content-Type': 'application/json' },
      }),
    )
    const loadNoMovies = page.waitForResponse(
      response =>
        response.url().includes('/movies') &&
        response.request().method() === 'GET' &&
        response.status() === 200,
    )

    await page.goto('/')
    await loadNoMovies

    await addMovie(page, name, year, rating, director)

    await page.route('**/movies', async route => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 200,
          body: JSON.stringify(movie),
          headers: { 'Content-Type': 'application/json' },
        })
      } else if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          body: JSON.stringify({ data: [movie] }),
          headers: { 'Content-Type': 'application/json' },
        })
      } else {
        return route.continue()
      }
    })

    const loadAddMovie = page.waitForResponse(
      response =>
        response.url().includes('/movies') &&
        response.request().method() === 'POST' &&
        response.status() === 200,
    )
    const loadGetMovies = page.waitForResponse(
      response =>
        response.url().includes('/movies') &&
        response.request().method() === 'GET' &&
        response.status() === 200,
    )

    await page.getByTestId('add-movie-button').click()
    await loadAddMovie
    await loadGetMovies
  })

  test('should edit a movie', async ({ page }) => {
    await page.route('**/movies', route =>
      route.fulfill({
        status: 200,
        body: JSON.stringify({ data: [movie] }),
        headers: { 'Content-Type': 'application/json' },
      }),
    )
    const loadGetMovies = page.waitForResponse(
      response =>
        response.url().includes('/movies') &&
        response.request().method() === 'GET' &&
        response.status() === 200,
    )

    await page.route('**/movies/*', route =>
      route.fulfill({
        status: 200,
        body: JSON.stringify({ data: movie }),
        headers: { 'Content-Type': 'application/json' },
      }),
    )
    await page.goto('/')
    await loadGetMovies

    const loadGetMovieById = page.waitForResponse(
      response =>
        response.url().includes(`/movies/${movie.id}`) &&
        response.request().method() === 'GET' &&
        response.status() === 200,
    )

    await page.getByTestId(`link-${movie.id}`).click()
    await expect(page).toHaveURL(`/movies/${movie.id}`)

    const getMovieByIdResponse = await loadGetMovieById
    const { data } = await getMovieByIdResponse.json()
    expect(data).toEqual(movie)

    const updatedMovie = {
      id: movie.id,
      name: editedName,
      year: editedYear,
      rating: editedRating,
      director: editedDirector,
    }

    await page.route(`**/movies/${id}`, async route => {
      if (route.request().method() === 'PUT') {
        await route.fulfill({
          status: 200,
          body: JSON.stringify(updatedMovie),
          contentType: 'application/json',
        })
      } else {
        await route.continue()
      }
    })

    const loadUpdateMovieById = page.waitForResponse(
      response =>
        response.url().includes(`/movies/${movie.id}`) &&
        response.request().method() === 'PUT' &&
        response.status() === 200,
    )

    await editMovie(page, editedName, editedYear, editedDirector, editedRating)
    const updateMovieByIdResponse = await loadUpdateMovieById
    const updatedMovieData = await updateMovieByIdResponse.json()
    expect(updatedMovieData).toEqual(updatedMovie)
    const nameInput = page.getByPlaceholder('Movie name')
    await expect(nameInput).toHaveAttribute('value', editedName)
  })

  test('should delete a movie', async ({ page }) => {
    let getMoviesHandler: RouteHandler

    getMoviesHandler = async route => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ data: [movie] }),
        headers: { 'Content-Type': 'application/json' },
      })
    }

    await page.route('**/movies', getMoviesHandler)

    const loadGetMovies = page.waitForResponse(
      response =>
        response.url().includes('/movies') &&
        response.request().method() === 'GET' &&
        response.status() === 200,
    )
    await page.goto('/')
    await loadGetMovies

    await page.unroute('**/movies', getMoviesHandler)

    const getMovieByIdHandler: RouteHandler = async route => {
      if (route.request().method() === 'DELETE') {
        await route.fulfill({
          status: 200,
          body: JSON.stringify({ data: movie }),
          headers: { 'Content-Type': 'application/json' },
        })
      } else {
        await route.continue()
      }
    }
    await page.route('**/movies/*', getMovieByIdHandler)

    getMoviesHandler = async route => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ data: [] }),
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const loadGetMoviesAfterDelete = page.waitForResponse(
      response =>
        response.url().includes('/movies') &&
        response.request().method() === 'GET' &&
        response.status() === 200,
    )

    const loadDeleteMovieById = page.waitForResponse(
      response =>
        response.url().includes(`/movies/${movie.id}`) &&
        response.request().method() === 'DELETE' &&
        response.status() === 200,
    )

    await page.route('**/movies', getMoviesHandler)

    await page.getByTestId(`delete-movie-${movie.name}`).click()

    await loadDeleteMovieById

    const moviesAfterDeletee = await loadGetMoviesAfterDelete
    const responseJson = await moviesAfterDeletee.json()
    expect(responseJson).toMatchObject({ data: [] })

    await expect(
      page.getByTestId(`delete-movie-${movie.name}`),
    ).not.toBeVisible()
  })
})
