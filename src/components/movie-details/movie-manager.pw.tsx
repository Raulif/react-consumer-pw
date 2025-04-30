import { test, expect } from '@playwright/experimental-ct-react'
import MovieManager from './movie-manager'
import { generateMovie } from '@cypress/support/factories'
import type { Movie } from 'src/consumer'
import sinon from 'sinon'

test.describe('<MovieManager>', () => {
  const movie: Omit<Movie, 'id'> = generateMovie()
  const movieId = 1
  const sandbox = sinon.createSandbox()
  const onDelete = sandbox.stub()

  test('should toggle between movie infor and movie edit components', async ({
    mount,
  }) => {
    const component = await mount(
      <MovieManager
        movie={{
          id: movieId,
          ...movie,
        }}
        onDelete={onDelete}
      />,
    )

    const deleteButton = component.getByTestId('delete-movie')
    await deleteButton.click()
    expect(onDelete.calledOnceWith(movieId)).toBe(true)

    const editForm = component.getByTestId('movie-edit-form-comp')
    const infoComp = component.getByTestId('movie-info-comp')

    await expect(infoComp).toBeVisible()
    await expect(editForm).not.toBeVisible()

    await component.getByTestId('edit-movie').click()
    await expect(infoComp).not.toBeVisible()
    await expect(editForm).toBeVisible()
  })
})
