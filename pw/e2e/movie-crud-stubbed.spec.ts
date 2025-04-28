import {generateMovie} from '@cypress/support/factories'
import type {Movie} from 'src/consumer'
import {expect, test} from '@pw/support/fixtures'
import {editMovie} from '@pw/support/ui-helpers/edit-movie'
import {addMovie} from '@pw/support/ui-helpers/add-movies'

test.describe('Movie CRUD e2e stubbed', () => {
  // Generate initial movie data
  const {name, year, rating, director} = generateMovie()
  const id = 1
  const movie: Movie = {name, year, rating, director, id}

  const {
    name: editedName,
    year: editedYear,
    rating: editedRating,
    director: editedDirector,
  } = generateMovie()

  test('should add a movie', async ({page}) => {
    page.route('**/movies', route =>
      route.fulfill({
        status: 200,
        body: JSON.stringify({data: []}),
        headers: {'Content-Type': 'application/json'},
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

    page.route('**/movies', route => {
      if (route.request().method() === 'POST') {
        route.fulfill({
          status: 200,
          body: JSON.stringify(movie),
          headers: {'Content-Type': 'application/json'},
        })
      } else if (route.request().method() === 'GET') {
        route.fulfill({
          status: 200,
          body: JSON.stringify({data: [movie]}),
          headers: {'Content-Type': 'application/json'},
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

  test('should edit a movie', async ({page}) => {
    page.route('**/movies', route =>
      route.fulfill({
        status: 200,
        body: JSON.stringify({data: [movie]}),
        headers: {'Content-Type': 'application/json'},
      }),
    )
    const loadGetMovies = page.waitForResponse(
      response =>
        response.url().includes('/movies') &&
        response.request().method() === 'GET' &&
        response.status() === 200,
    )

    page.route('**/movies/*', route =>
      route.fulfill({
        status: 200,
        body: JSON.stringify({data: movie}),
        headers: {'Content-Type': 'application/json'},
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
    const {data} = await getMovieByIdResponse.json()
    await expect(data).toEqual(movie)

    const updatedMovie = {
      id: movie.id,
      name: editedName,
      year: editedYear,
      rating: editedRating,
      director: editedDirector,
    }

    page.route(`**/movies/${id}`, route => {
      if (route.request().method() === 'PUT') {
        route.fulfill({
          status: 200,
          body: JSON.stringify(updatedMovie),
          contentType: 'application/json',
        })
      } else {
        route.continue()
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
    const nameInput = await page.getByPlaceholder('Movie name')
    expect(nameInput).toHaveAttribute('value', editedName)
  })

  test('should delete a movie', async ({page}) => {
    page.route('**/movies', route =>
      route.fulfill({
        status: 200,
        body: JSON.stringify({data: [movie]}),
        headers: {'Content-Type': 'application/json'},
      }),
    )
    const loadGetMovies = page.waitForResponse(
      response =>
        response.url().includes('/movies') &&
        response.request().method() === 'GET' &&
        response.status() === 200,
    )
    await page.goto('/')
    await loadGetMovies

    page.route('**/movies/*', route => {
      if (route.request().method() === 'DELETE') {
        route.fulfill({
          status: 200,
          body: JSON.stringify({data: movie}),
          headers: {'Content-Type': 'application/json'},
        })
      } else {
        route.continue()
      }
    })
    const loadDeleteMovieById = page.waitForResponse(
      response =>
        response.url().includes(`/movies/${movie.id}`) &&
        response.request().method() === 'DELETE' &&
        response.status() === 200,
    )
    page.getByTestId(`delete-movie-${movie.name}`).click()
    await loadDeleteMovieById

    page.route('**/movies', route =>
      route.fulfill({
        status: 200,
        body: JSON.stringify({data: []}),
        headers: {'Content-Type': 'application/json'},
      }),
    )
    const loadGetMoviesAfterDelete = page.waitForResponse(
      response =>
        response.url().includes('/movies') &&
        response.request().method() === 'GET' &&
        response.status() === 200,
    )

    const responseGetNoMovies = await loadGetMoviesAfterDelete
    expect(page.getByTestId(`delete-movie-${movie.name}`)).not.toBeVisible()
    const {data} = await responseGetNoMovies.json()
    expect(data).toEqual([])
  })
})
