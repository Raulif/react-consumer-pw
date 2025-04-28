import {test as base} from '@playwright/test'
import {
  interceptNetworkCall as interceptNetworkCallOriginal,
  type InterceptOptions,
} from '../utils/network'

// Shared Types
type InterceptOptionsFixture = Omit<InterceptOptions, 'page'>

// Define the function signature as a type
type InterceptNetworkCallFn = (
  options: InterceptOptionsFixture,
) => ReturnType<typeof interceptNetworkCallOriginal>

// group the types together
type InterceptNetworkMethods = {
  interceptNetworkCall: InterceptNetworkCallFn
}

// Generic Type Extension
export const test = base.extend<InterceptNetworkMethods>({
  interceptNetworkCall: async ({page}, use) => {
    const interceptNetworkCallFn: InterceptNetworkCallFn = ({
      method,
      url,
      fulfillResponse,
      handler,
    }: InterceptOptionsFixture) =>
      interceptNetworkCallOriginal({
        method,
        url,
        fulfillResponse,
        handler,
        page,
      })

    await use(interceptNetworkCallFn)
  },
})
