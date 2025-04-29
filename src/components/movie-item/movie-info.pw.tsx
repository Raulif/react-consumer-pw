import { test, expect } from '@playwright/experimental-ct-react'
import MovieInfo from './movie-info'
import { generateMovie } from '@cypress/support/factories'
import type { Movie } from 'src/consumer'

test.describe('<MovieInfo>', () => {
  const movie: Omit<Movie, 'id'> = generateMovie()
  const movieId = 1

  test('should verify the movie', async ({ mount }) => {
    const component = await mount(
      <MovieInfo movie={{ id: movieId, ...movie }} />,
    )
    const h2 = component.getByRole('heading')
    await expect(h2).toHaveText(movie.name)
    await expect(component.getByText(`ID: ${movieId}`)).toBeVisible()
    await expect(
      component.getByText(`Year: ${movie.year.toString()}`),
    ).toBeVisible()
    await expect(component.getByText(`Rating: ${movie.rating}`)).toBeVisible()
  })
})
