/**
 * Template backend note:
 *
 * TEMPLATE EXAMPLE ONLY. These error contracts support the Notes and Todos
 * example API slice. Replace them with the real product's error contracts.
 * They show how the service layer maps database failures into a
 * typed transport-friendly shape.
 */

/**
 * Typed database failure contract for the example backend slice.
 */
export type DatabaseError = {
  type: "DATABASE_ERROR";
  message: string;
  originalError?: Error;
};

/**
 * Converts an unknown database failure into the example database contract.
 */
export function databaseError(message: string, cause: unknown): DatabaseError {
  return {
    type: "DATABASE_ERROR",
    message,
    originalError: cause instanceof Error ? cause : undefined,
  };
}
