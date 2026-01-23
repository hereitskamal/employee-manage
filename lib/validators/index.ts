/**
 * Centralized Zod-based API validation layer
 * 
 * This module exports all validator schemas and a helper function
 * for formatting validation errors in a consistent format.
 */

import { ZodError } from "zod";

// Export all schemas
export * from "./employee";
export * from "./product";
export * from "./sale";
export * from "./attendance";

/**
 * Format Zod validation errors into a user-friendly message
 * Returns a string with all validation errors
 */
export function formatValidationError(error: ZodError): string {
  const errors = error.errors.map((err) => {
    const path = err.path.join(".");
    return path ? `${path}: ${err.message}` : err.message;
  });
  return errors.join("; ");
}

/**
 * Format Zod validation errors into a structured object
 * Returns an object with field names as keys and error messages as values
 */
export function formatValidationErrorObject(error: ZodError): Record<string, string> {
  const errors: Record<string, string> = {};
  error.errors.forEach((err) => {
    const path = err.path.join(".");
    if (path) {
      errors[path] = err.message;
    }
  });
  return errors;
}

