// in the real world, this file which is from the server side
// would be published in a package and installed here

import type { z } from 'zod'
import type {
  CreateMovieResponseSchema,
  CreateMovieSchema,
  GetMovieResponseUnionSchema,
  MovieNotFoundResponseSchema,
  DeleteMovieResponseSchema,
  ConflictMovieResponseSchema,
  UpdateMovieSchema,
  UpdateMovieResponseSchema,
} from './schema'

export type CreateMovieRequest = z.infer<typeof CreateMovieSchema>

export type CreateMovieResponse = z.infer<typeof CreateMovieResponseSchema>

export type ConflictMovieResponse = z.infer<typeof ConflictMovieResponseSchema>

export type GetMovieResponse = z.infer<typeof GetMovieResponseUnionSchema>

export type MovieNotFoundResponse = z.infer<typeof MovieNotFoundResponseSchema>

export type DeleteMovieResponse = z.infer<typeof DeleteMovieResponseSchema>

export type UpdateMovieRequest = z.infer<typeof UpdateMovieSchema>

export type UpdateMovieResponse = z.infer<typeof UpdateMovieResponseSchema>
