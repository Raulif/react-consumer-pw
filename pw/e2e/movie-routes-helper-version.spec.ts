import {test, expect} from '../support/fixtures'
import {generateMovie} from '@cypress/support/factories'
import type {Movie} from '../../src/consumer'
import type {InterceptNetworkCall} from '../support/utils/network'

test.describe('App routes', () => {
  const movies = [
    {id: 1, ...generateMovie()},
    {id: 2, ...generateMovie()},
    {id: 3, ...generateMovie()},
  ]
  const movie = movies[0] as Movie
  let loadGetMovies: InterceptNetworkCall

  test.beforeEach(({interceptNetworkCall}) => {
    loadGetMovies = interceptNetworkCall({
      method: 'GET',
      url: '/movies',
      fulfillResponse: {
        status: 200,
        body: {data: movies},
      },
    })
  })
  test('should redirect to movies', async ({page}) => {
    await page.goto('/')

    await expect(page).toHaveURL('/movies')
    const {
      responseJson: {data: responseData},
    } = (await loadGetMovies) as {responseJson: {data: typeof movies}}

    expect(responseData).toEqual(movies)

    await expect(page.getByTestId('movie-list-comp')).toBeVisible()
    await expect(page.getByTestId('movie-form-comp')).toBeVisible()
    await expect(page.getByTestId('movie-item-comp')).toHaveCount(movies.length)
    const movieItemComps = page.getByTestId('movie-item-com').all()
    const items = await movieItemComps
    for (const item of items) {
      await expect(item).toBeVisible()
    }
  })

  test('should direct nav to by query param', async ({
    page,
    interceptNetworkCall,
  }) => {
    const movieName = encodeURIComponent(movie.name)

    const loadGetMovieByQueryParam = interceptNetworkCall({
      method: 'GET',
      url: `/movies?name=${movieName}`,
      fulfillResponse: {
        status: 200,
        body: movie,
      },
    })
    await page.goto(`/movies?name=${movieName}`)

    const {responseJson} = await loadGetMovieByQueryParam
    expect(responseJson).toEqual(movie)

    await expect(page).toHaveURL(`/movies?name=${movieName}`)
  })
})
