import { NextResponse } from "next/server";

/**
 * Centralized API Response Helper
 * 
 * Provides consistent JSON structure across all API routes:
 * { success: boolean, data?: any, error?: string, code?: string }
 */

interface SuccessResponse<T = any> {
  success: true;
  data?: T;
}

interface FailureResponse {
  success: false;
  error: string;
  code?: string;
}

type ApiResponse<T = any> = SuccessResponse<T> | FailureResponse;

/**
 * Create a successful API response
 * 
 * @param data - The data to return (optional)
 * @param status - HTTP status code (default: 200)
 * @returns NextResponse with success structure
 */
export function success<T = any>(
  data?: T,
  status: number = 200
): NextResponse<ApiResponse<T>> {
  const response: SuccessResponse<T> = {
    success: true,
    ...(data !== undefined && { data }),
  };

  return NextResponse.json(response, { status });
}

/**
 * Create a failure/error API response
 * 
 * @param error - Error message
 * @param status - HTTP status code (default: 500)
 * @param code - Optional error code for client-side handling
 * @returns NextResponse with error structure
 */
export function failure(
  error: string,
  status: number = 500,
  code?: string
): NextResponse<ApiResponse> {
  const response: FailureResponse = {
    success: false,
    error,
    ...(code && { code }),
  };

  return NextResponse.json(response, { status });
}




