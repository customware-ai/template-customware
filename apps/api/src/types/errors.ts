/**
 * Template backend note:
 *
 * These error contracts are sample-only helpers for the example API slice.
 * They show how the service layer maps database and validation failures into a
 * typed transport-friendly shape.
 */

/**
 * Typed database failure contract for the sample backend slice.
 */
export type DatabaseError = {
  type: "DATABASE_ERROR";
  message: string;
  originalError?: Error;
};

/**
 * Typed validation failure contract for the sample backend slice.
 */
export type ValidationError = {
  type: "VALIDATION_ERROR";
  message: string;
  issues: string[];
};

/**
 * App-level error union used by services and route adapters in the example
 * backend slice.
 */
export type AppError = DatabaseError | ValidationError;
