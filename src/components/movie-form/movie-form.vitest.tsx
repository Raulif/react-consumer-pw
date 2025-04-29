import {
  describe,
  expect,
  http,
  it,
  screen,
  userEvent,
  worker,
  wrappedRender,
} from '@vitest-utils/utils'
import MovieForm from './movie-form'
import {generateMovie} from '@cypress/support/factories'
import {Movie} from 'src/consumer'

describe('<MovieForm />', () => {
  const movie: Omit<Movie, 'id'> = generateMovie()
  const user = userEvent.setup()
  const fillYear = async (year: number) => {
    const yearInput = screen.getByPlaceholderText('Movie year')
    await user.clear(yearInput)
    await user.type(yearInput, year.toString())
  }
  const fillName = async (name: string) => {
    const nameInput = screen.getByPlaceholderText('Movie name')
    await user.type(nameInput, name)
  }
  const fillRating = async (rating: number) => {
    const ratingInput = screen.getByPlaceholderText('Movie rating')
    await user.clear(ratingInput)
    await user.type(ratingInput, rating.toString())
  }
  const fillDirector = async (director: string) => {
    const directorInput = screen.getByPlaceholderText('Movie director')
    await user.type(directorInput, director)
  }

  it('should fill the form and add the movie', async () => {
    wrappedRender(<MovieForm />)

    await fillName(movie.name)
    await fillYear(movie.year)
    await fillRating(movie.rating)
    await fillDirector(movie.director)

    let postRequest
    worker.use(
      http.post('http://localhost:3001/movies', async ({request}) => {
        const data = await request.json()
        postRequest = data

        return new Response(JSON.stringify(data), {
          status: 200,
        })
      }),
    )
    console.log('postRequest', postRequest)
    await user.click(screen.getByText('Add Movie'))

    expect(screen.getByPlaceholderText('Movie name')).toHaveValue('')
    expect(screen.getByPlaceholderText('Movie year')).toHaveValue(2023)
    expect(screen.getByPlaceholderText('Movie rating')).toHaveValue(0)
    expect(postRequest).toEqual(movie)
  })
  it('should excercise validation errors', async () => {
    wrappedRender(<MovieForm />)
    const clickButton = () => user.click(screen.getByText('Add Movie'))

    await fillYear(2026)
    await clickButton()
    expect(screen.getAllByTestId('validation-error')).toHaveLength(3)

    await fillYear(1700)
    await clickButton()
    expect(screen.getAllByTestId('validation-error')).toHaveLength(3)
    expect(
      screen.getByText('Number must be greater than or equal to 1900'),
    ).toBeVisible()

    await fillYear(2000)
    await fillName('me')
    await clickButton()
    expect(screen.getAllByTestId('validation-error')).toHaveLength(1)

    await fillDirector('Chris Nolan')
    await clickButton()
    expect(screen.queryByTestId('validation-error')).not.toBeInTheDocument()
  })
})
