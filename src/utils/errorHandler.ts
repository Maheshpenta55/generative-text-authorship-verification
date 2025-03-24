export class ApiError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly status?: number
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function isQuotaError(error: unknown): boolean {
  return error instanceof Error && 
    error.message.toLowerCase().includes('exceeded your current quota');
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (isQuotaError(error)) {
      return 'API quota exceeded. Please try again later or contact support.';
    }
    return error.message;
  }
  return 'An unexpected error occurred. Please try again.';
}