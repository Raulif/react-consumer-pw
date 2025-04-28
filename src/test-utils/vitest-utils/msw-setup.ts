import {setupWorker} from 'msw/browser'
import {http} from 'msw'

// Create worker with no default handlers
export const worker = setupWorker()

// Initialize MSW
async function initializeMSW() {
  await worker.start({
    onUnhandledRequest: 'bypass',
  })
}

initializeMSW().catch(console.error)

export {http}
