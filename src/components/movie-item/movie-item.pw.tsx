import { test, expect } from '@playwright/experimental-ct-react'
import MovieItem from './movie-item'
import { generateMovie } from '@cypress/support/factories'
import type { Movie } from 'src/consumer'
import sinon from 'sinon'

test.describe('<MovieItem>', () => {
  const movie: Omit<Movie, 'id'> = generateMovie()
  const movieId = 1
  const sandbox = sinon.createSandbox()
  const onDelete = sandbox.stub()

  test.afterEach(() => {
    sandbox.restore()
  })

  test('verify component', async ({ mount }) => {
    const component = await mount(
      <MovieItem id={movieId} {...movie} onDelete={onDelete} />,
    )
    const link = component.getByTestId(`link-${movieId}`)
    await expect(link).toBeVisible()
    await expect(link).toHaveAttribute('href', `/movies/${movieId}`)

    const button = component.getByRole('button')
    await button.click()
    expect(onDelete.calledOnce).toBe(true)
    expect(onDelete.calledWith(movieId)).toBe(true)
  })
})
