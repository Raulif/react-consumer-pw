import { test, expect } from '@playwright/experimental-ct-react'
import MovieDetails from './movie-details'
import { generateMovie } from '@cypress/support/factories'
import type { Movie } from 'src/consumer'
import { interceptNetworkCall } from '@pw/support/utils/network'

test.describe('<MovieDetails>', () => {
  const movie: Omit<Movie, 'id'> = generateMovie()
  const movieId = 1

  test('should display the default error with delay', async ({
    mount,
    page,
  }) => {
    const error = 'Unexpected error occurred'
    const loadNetworkError = interceptNetworkCall({
      page,
      method: 'GET',
      url: `/movies/${movieId}`,
      fulfillResponse: {
        status: 400,
        body: { error },
      },
    })

    const component = await mount(<MovieDetails />, {
      hooksConfig: { path: '/:id', route: `/${movieId}` },
    })

    const { responseJson } = await loadNetworkError
    expect(responseJson).toMatchObject({ error: error })
    await expect(component.getByText(error)).toBeVisible()
  })

  test('should display a specific error', async ({ page, mount }) => {
    const error = 'Movie not found'
    const component = await mount(<MovieDetails />, {
      hooksConfig: { path: '/:id', route: `/${movieId}` },
    })
    const loadNetworkError = interceptNetworkCall({
      method: 'GET',
      url: '/movies/*',
      page,
      fulfillResponse: {
        status: 400,
        body: { error: { error } },
      },
    })

    const { responseJson } = await loadNetworkError
    expect(responseJson).toMatchObject({ error: { error } })
    await expect(component.getByText(error)).toBeVisible()
  })

  test('should make a unique network call when the route takes an id', async ({
    page,
    mount,
  }) => {
    const loadGetMovieByName = interceptNetworkCall({
      method: 'GET',
      url: `/movies/${movieId}`,
      page,
      fulfillResponse: {
        status: 200,
        body: { data: movie },
      },
    })

    await mount(<MovieDetails />, {
      hooksConfig: { path: '/:id', route: `/${movieId}` },
    })

    const { responseJson } = await loadGetMovieByName
    expect(responseJson).toMatchObject({ data: movie })
  })

  test('should make a unique network call when the route takes a query parameter', async ({
    page,
    mount,
  }) => {
    const url = `/movies?name=${encodeURIComponent(movie.name)}`

    await mount(<MovieDetails />, {
      hooksConfig: { path: '/movies', route: url },
    })

    const loadGetMovieByName = interceptNetworkCall({
      method: 'GET',
      url,
      page,
      fulfillResponse: {
        status: 200,
        body: { data: movie },
      },
    })

    const { responseJson } = await loadGetMovieByName
    expect(responseJson).toMatchObject({ data: movie })
  })
})
