import type {MountResult} from '@playwright/experimental-ct-react'
import {test, expect} from '@playwright/experimental-ct-react'
import {generateMovie} from '@cypress/support/factories'
import MovieForm from './movie-form'
import type {Movie} from 'src/consumer'
import {interceptNetworkCall} from '@pw/support/utils/network'

test.describe('<MovieForm>', () => {
  const fillName = async (comp: MountResult, name: string) =>
    comp.getByPlaceholder('Movie name').fill(name)
  const fillYear = async (comp: MountResult, year: number) =>
    comp.getByPlaceholder('Movie year').fill(`${year}`)
  const fillRating = async (comp: MountResult, rating: number) =>
    comp.getByPlaceholder('Movie rating').fill(`${rating}`)
  const fillDirector = async (comp: MountResult, director: string) =>
    comp.getByPlaceholder('Movie director').fill(director)

  // const click

  const movie: Omit<Movie, 'id'> = generateMovie()

  test('should fill the form and add the movie', async ({mount, page}) => {
    const component = await mount(<MovieForm />)
    await fillYear(component, movie.year)
    await fillName(component, movie.name)
    await fillRating(component, movie.rating)
    await fillDirector(component, movie.director)

    const loadPostMovie = interceptNetworkCall({
      method: 'POST',
      url: '/movies',
      page,
      fulfillResponse: {
        status: 200,
        body: movie,
      },
    })

    await component.getByText('Add Movie').click()
    const {requestJson} = await loadPostMovie
    expect(requestJson).toEqual({
      name: movie.name,
      year: movie.year,
      rating: movie.rating,
      director: movie.director,
    })

    expect(component.getByPlaceholder('Movie name')).toHaveValue('')
    expect(component.getByPlaceholder('Movie year')).toHaveValue('2023')
    expect(component.getByPlaceholder('Movie rating')).toHaveValue('0')
  })

  test('should excercise validation errors', async ({mount}) => {
    const component = await mount(<MovieForm />)

    await fillYear(component, 2026)
    await component.getByText('Add Movie').click()

    let validationError = component.getByTestId('validation-error')
    expect(validationError).toHaveCount(3)

    await fillYear(component, 1899)
    await component.getByText('Add Movie').click()
    validationError = component.getByTestId('validation-error')
    expect(validationError).toHaveCount(3)
    await expect(
      component.getByText('Number must be greater than or equal to 1900'),
    ).toBeVisible()

    await fillYear(component, 2000)
    await fillName(component, 'me')
    await component.getByText('Add Movie').click()
    validationError = component.getByTestId('validation-error')
    expect(validationError).toHaveCount(1)

    await fillDirector(component, 'Christopher Nolan')
    await component.getByText('Add Movie').click()
    validationError = component.getByTestId('validation-error')
    expect(validationError).toHaveCount(0)
  })
})
