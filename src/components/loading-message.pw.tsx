import { test, expect } from '@playwright/experimental-ct-react'
import LoadingMessage from './loading-message'

test.describe('<LoadingMessage>', () => {
  test('should render a loading message', async ({ mount }) => {
    const component = await mount(<LoadingMessage />)
    await expect(component).toHaveText('Loading movies...')
  })
})
