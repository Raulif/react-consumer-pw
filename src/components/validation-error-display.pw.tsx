import { test, expect } from '@playwright/experimental-ct-react'
import ValidationErrorDisplay from './validation-error-display'
import { ZodError } from 'zod'

test.describe('<ValidationErrorDisplay', () => {
  test('should not render when there is no validation error', async ({
    mount,
  }) => {
    const component = await mount(
      <ValidationErrorDisplay validationError={null} />,
    )
    await expect(component.getByText('Name is required')).not.toBeVisible()
  })

  test('should render validation errors correctly', async ({ mount }) => {
    const mockErrors = new ZodError([
      {
        path: ['name'],
        message: 'Name is required',
        code: 'invalid_type',
        expected: 'string',
        received: 'undefined',
      },
      {
        path: ['Year'],
        message: 'Year must be a number',
        code: 'invalid_type',
        expected: 'number',
        received: 'string',
      },
    ])
    console.log({ mockErrors: mockErrors.errors })
    const component = await mount(
      <ValidationErrorDisplay validationError={mockErrors} />,
    )

    await expect(component.getByText('Something went wrong')).toBeVisible()
  })
})
