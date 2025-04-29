import type {Page} from '@playwright/test'

export const editMovie = async (
  page: Page,
  editedName: string,
  editedYear: number,
  editedDirector: string,
  editedRating: number,
) => {
  await page.getByTestId('edit-movie').click()

  const editForm = await page.getByTestId('movie-edit-form-comp')
  await editForm.getByPlaceholder('Movie name').fill(editedName)
  await editForm.getByPlaceholder('Movie year').fill(editedYear.toString())
  await editForm.getByPlaceholder('Movie rating').fill(editedRating.toString())
  await editForm.getByPlaceholder('movie director').fill(editedDirector)

  await editForm.getByTestId('update-movie').click()
}
