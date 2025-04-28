import isCI from 'is-ci'
import {test, expect} from '../support/fixtures'
import {runCommand} from '@pw/support/utils/run-command'
import {addMovie} from '@pw/support/ui-helpers/add-movie'
import {editMovie} from '@pw/support/ui-helpers/edit-movie'
import {generateMovie} from '@cypress/support/factories'
import {InterceptNetworkCall} from '@pw/support/utils/network'
import { OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi'

test.describe('movie crud e2e', () => {
  test.beforeAll(() => {
    const responseCode = runCommand(
      `curl -s -o /dev/null -w "%{http_code}" ${process.env.VITE_API_URL}`,
    )
    console.log({responseCode})
    if (isCI || responseCode !== '200') {
      test.skip()
    }
  })

  test.beforeEach(async ({page}) => {
    const loadGetMovies = page.waitForResponse(
      response =>
        response.url().includes('/movies') &&
        response.request().method() === 'GET',
    )

    await page.goto('/')

    const response = await loadGetMovies
    const responseStatus = await response.status()
    expect(responseStatus).toBeGreaterThanOrEqual(200)
    expect(responseStatus).toBeLessThan(400)
  })

  test('should add and delete a movie from movie list', async ({page}) => {
    const {name, year, rating, director} = generateMovie()
    const {
      name: editedName,
      year: editedYear,
      rating: editedRating,
      director: editedDirector,
    } = generateMovie()

    const loadAddMovie = page.waitForResponse(
      response =>
        response.url().includes('/movies') &&
        response.request().method() === 'POST' &&
        response.status() === 200,
    )

    await addMovie(page, name, year, rating, director)
    await page.getByTestId('add-movie-button').click()
    const addMovieResponse = await loadAddMovie
    const addMovieResponseBody = await addMovieResponse.json()
    expect(addMovieResponseBody).toEqual({
      status: 200,
      data: {
        id: expect.any(Number),
        name,
        year,
        rating,
        director,
      },
    })

    const loadDeleteMovie = page.waitForResponse(
      response =>
        response.url().includes(`/movies/`) &&
        response.request().method() === 'DELETE',
    )

    const deleteButton = await page
      .getByTestId(`delete-movie-${name}`)

      deleteButton.click()

    const deleteMovieResponse = await loadDeleteMovie
    const deleteMovieBody = await deleteMovieResponse.json()
    expect(deleteMovieBody).toEqual({
      status: 200,
      message: expect.any(String),
    })
    expect(deleteButton).not.toBeVisible()
  })
})
