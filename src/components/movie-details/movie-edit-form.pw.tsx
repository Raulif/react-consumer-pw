import { test, expect } from '@playwright/experimental-ct-react'
import MovieEditForm from './movie-edit-form'
import { generateMovie } from '@cypress/support/factories'
import type { Movie } from 'src/consumer'
import sinon from 'sinon'
import { interceptNetworkCall } from '@pw/support/utils/network'

test.describe('<MovieEditForm>', () => {
  const movie: Omit<Movie, 'id'> = generateMovie()
  const movieId = 1
  const sandbox = sinon.createSandbox()

  test.afterEach(() => sandbox.restore())

  test('should cancel and submit a movie update', async ({ mount, page }) => {
    const onCancel = sandbox.stub()

    const component = await mount(
      <MovieEditForm movie={{ id: movieId, ...movie }} onCancel={onCancel} />,
    )

    await component.getByTestId('cancel').click()
    expect(onCancel.calledOnce).toBe(true)

    const loadUpdateMovie = interceptNetworkCall({
      method: 'PUT',
      url: `/movies/${movieId}`,
      page,
      fulfillResponse: {
        status: 200,
      },
    })
    await component.getByTestId('update-movie').click()

    const { requestJson } = await loadUpdateMovie
    expect(requestJson).toEqual(movie)
  })
})
