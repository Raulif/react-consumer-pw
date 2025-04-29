import type {MountResult} from '@playwright/experimental-ct-react'

export const getByPlaceholder = (comp: MountResult, placeholder: string) =>
  comp.getByPlaceholder(placeholder)
export const getByText = (comp: MountResult, text: string) =>
  comp.getByText(text)
export const getByTestId = (comp: MountResult, testId: string) =>
  comp.getByTestId(testId)
