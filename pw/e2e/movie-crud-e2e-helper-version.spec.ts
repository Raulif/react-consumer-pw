import isCI from 'is-ci'
import {test, expect} from '../support/fixtures'
import {runCommand} from '@pw/support/utils/run-command'
import {addMovie} from '@pw/support/ui-helpers/add-movie'
import {editMovie} from '@pw/support/ui-helpers/edit-movie'
import {generateMovie} from '@cypress/support/factories'
import {interceptNetworkCall} from '@pw/support/utils/network'
import {Movie} from 'src/consumer'
import {number} from '@pact-foundation/pact/src/v3/matchers'

test.describe('movie crud e2e', () => {
  test.beforeAll(() => {
    const responseCode = runCommand(
      `curl -s -o /dev/null -w "%{http_code}" ${process.env.VITE_API_URL}`,
    )
    if (isCI || responseCode !== '200') {
      test.skip()
    }
  })

  test.beforeEach(async ({page}) => {
    const loadGetMovies = interceptNetworkCall({
      method: 'GET',
      url: '/movies',
      page,
    })

    await page.goto('/')

    const {status} = await loadGetMovies
    expect(status).toBeGreaterThanOrEqual(200)
    expect(status).toBeLessThan(400)
  })

  test('should add and delete a movie from movie list', async ({page}) => {
    const {name, year, rating, director} = generateMovie()
    const {
      name: editedName,
      year: editedYear,
      rating: editedRating,
      director: editedDirector,
    } = generateMovie()

    const loadAddMovie = interceptNetworkCall({
      method: 'POST',
      url: '/movies',
      page,
    })
    const loadAllMovies = interceptNetworkCall({
      method: 'GET',
      url: '/movies',
      page,
    })

    // Add movie
    await addMovie(page, name, year, rating, director)
    await page.getByTestId('add-movie-button').click()

    const {status: addMovieStatus, responseJson: addMovieResponseJson} =
      (await loadAddMovie) as {
        status: Number
        responseJson: {status: Number; data: Movie}
      }

    const movieId = addMovieResponseJson.data.id
    expect(addMovieStatus).toBe(200)

    // Movie should be in response
    expect(addMovieResponseJson).toEqual({
      status: 200,
      data: {
        id: expect.any(Number),
        name,
        year,
        rating,
        director,
      },
    })

    // Load all movies
    await page.goto('/')

    const {responseJson: loadAllMoviesBeforeDeletingResponseJson} =
      (await loadAllMovies) as {
        responseJson: {data: Movie[]}
      }

    // Check that added movie is within array of all movies
    expect(loadAllMoviesBeforeDeletingResponseJson.data).toContainEqual(
      expect.objectContaining({id: movieId}),
    )

    // Delete added movie
    const loadDeleteMovie = interceptNetworkCall({
      method: 'DELETE',
      url: `/movies/${movieId}`,
      page,
    })

    const deleteButton = await page.getByTestId(`delete-movie-${name}`)
    deleteButton.click()

    const {status: deleteMovieResponseStatus, responseJson: {message: deleteMovieResponseMessage}} = (await loadDeleteMovie) as {
      status: Number
      responseJson: {status: Number; message: String}
    }
    // Movie ID should be in response message and delete button should not be there anymore
    expect(deleteMovieResponseStatus).toBe(200)
    expect(deleteMovieResponseMessage).toContain(movieId.toString())
    expect(deleteButton).not.toBeVisible()
    
    // Load all movies again after deleting movie
    const loadAllMoviesAfterDelete = interceptNetworkCall({
      method: 'GET',
      url: '/movies',
      page,
    })
    await page.goto('/')

    // Check that deleted movie is not among array of movies
    const {responseJson: loadAllMoviesAfterDeleteResponseJson} =
      (await loadAllMoviesAfterDelete) as {
        responseJson: {data: Movie[]}
      }

    expect(loadAllMoviesAfterDeleteResponseJson.data).not.toContainEqual(
      expect.objectContaining({id: movieId}),
    )
  })
})
