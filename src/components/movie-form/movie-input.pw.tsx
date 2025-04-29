import { expect, test } from '@playwright/experimental-ct-react'

import type { Movie } from 'src/consumer'
import MovieInput from './movie-input'
import { generateMovie } from '@cypress/support/factories'
import { interceptNetworkCall } from '@pw/support/utils/network'
import sinon from 'sinon'
import { cp } from 'fs'

test.describe('<MovieInput>', async () => {
  const sandbox = sinon.createSandbox()
  const onChange = sandbox.stub()
  const movie: Omit<Movie, 'id'> = generateMovie()

  test.afterEach(() => sandbox.restore())

  test('should render a name input', async ({ page, mount }) => {
    const component = await mount(
      <MovieInput
        type="text"
        value={movie.name}
        placeholder="enter name"
        onChange={onChange}
      />,
    )
    const input = page.getByPlaceholder('enter name')
    await expect(input).toHaveValue(movie.name)
    await expect(input).toHaveAttribute('placeholder', 'enter name')
    await input.fill('a')

    expect(onChange.calledOnce).toBe(true)
  })

  test('should render a year input', async ({ page, mount }) => {
    const component = await mount(
      <MovieInput
        type="number"
        value={movie.year}
        placeholder="enter year"
        onChange={onChange}
      />,
    )
    const input = page.getByTestId('movie-input-comp-number')
    await expect(input).toHaveValue(movie.year.toString())

    await expect(input).toHaveAttribute('placeholder', 'enter year')
    await input.fill('1995')
    await input.fill('1996')

    expect(onChange.calledTwice).toBe(true)
  })
})
