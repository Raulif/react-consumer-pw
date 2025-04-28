import {generateMovie} from '@cypress/support/factories'
import type {Movie} from 'src/consumer'
import {expect, test} from '@pw/support/fixtures'
import {editMovie} from '@pw/support/ui-helpers/edit-movie'
import {addMovie} from '@pw/support/ui-helpers/add-movie'
import {interceptNetworkCall} from '@pw/support/utils/network'

test.describe('Movie CRUD e2e stubbed with helper', () => {
  // Generate inital movie data
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
    const loadNoMovies = interceptNetworkCall({
      method: 'GET',
      url: '/movies',
      page,
      fulfillResponse: {
        status: 200,
        body: {data: []},
      },
    })

    await page.goto('/')
    await loadNoMovies

    await addMovie(page, name, year, rating, director)

    const loadOrGetMovies = interceptNetworkCall({
      page,
      url: '/movies',
      handler: async (route, request) => {
        if (request.method() === 'POST') {
          route.fulfill({
            status: 200,
            body: JSON.stringify(movie),
            headers: {'Content-Type': 'application/json'},
          })
        } else if (request.method() === 'GET') {
          route.fulfill({
            status: 200,
            body: JSON.stringify({data: [movie]}),
            headers: {'Content-Type': 'application/json'},
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

  test('should edit a movie', async ({page}) => {
    const loadGetMovies = interceptNetworkCall({
      method: 'GET',
      url: '/movies',
      page,
      fulfillResponse: {
        status: 200,
        body: {data: [movie]},
      },
    })
    await page.goto('/')
    await loadGetMovies

    const loadGetMovieById = interceptNetworkCall({
      method: 'GET',
      url: `/movies/${movie.id}`,
      page,
      fulfillResponse: {
        status: 200,
        body: {data: movie},
      },
    })
    await page.getByTestId(`link-${movie.id}`).click()
    await expect(page).toHaveURL(`/movies/${movie.id}`)

    const getMovieByIdResponse = await loadGetMovieById
    const {
      responseJson: {data},
    } = (await getMovieByIdResponse) as {responseJson: {data: Movie}}
    await expect(data).toEqual(movie)

    const updatedMovie = {
      id: movie.id,
      name: editedName,
      year: editedYear,
      rating: editedRating,
      director: editedDirector,
    }

    const loadUpdateMovieById = interceptNetworkCall({
      method: 'PUT',
      page,
      url: `/movies/${movie.id}`,
      fulfillResponse: {
        status: 200,
        body: updatedMovie,
      },
    })

    await editMovie(page, editedName, editedYear, editedDirector, editedRating)
    const {responseJson} = await loadUpdateMovieById
    expect(responseJson).toEqual(updatedMovie)
    const nameInput = await page.getByPlaceholder('Movie name')
    expect(nameInput).toHaveAttribute('value', editedName)
  })

  test('should delete a movie', async ({page}) => {
    const loadGetMovies = interceptNetworkCall({
      method: 'GET',
      url: '/movies',
      page,
      fulfillResponse: {
        status: 200,
        body: {data: [movie]},
      },
    })
    await page.goto('/')
    await loadGetMovies

    const loadDeleteMovieById = interceptNetworkCall({
      method: 'DELETE',
      url: `/movies/${movie.id}`,
      page,
      fulfillResponse: {
        status: 200,
      },
    })

    page.getByTestId(`delete-movie-${movie.name}`).click()
    await loadDeleteMovieById

    const loadGetMoviesAfterDelete = interceptNetworkCall({
      method: 'GET',
      url: '/movies',
      page,
      fulfillResponse: {
        status: 200,
        body: {data: []},
      },
    })

    const {responseJson} = await loadGetMoviesAfterDelete
    expect(responseJson).toEqual({data: []})
    expect(page.getByTestId(`delete-movie-${movie.name}`)).not.toBeVisible()
  })
})
