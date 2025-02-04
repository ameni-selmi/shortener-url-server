/**
 * Exception filter that handles rate-limiting errors (HTTP 429 Too Many Requests)
 * and returns a custom response for those errors.
 * For other exceptions, it returns the default response.
 */
// src/filters/throttler-exception.filter.ts
import { Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';

@Catch(HttpException)
export class ThrottlerExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException) {
    const response = exception.getResponse();
    const status = exception.getStatus();

    // Check if it's a rate-limiting error (429 Too Many Requests)
    if (status === HttpStatus.TOO_MANY_REQUESTS) {
      return {
        statusCode: HttpStatus.TOO_MANY_REQUESTS,
        message: 'You have exceeded the rate limit. Please try again later.',
        error: 'Too Many Requests',
      };
    }

    return response;  // Default response for other exceptions
  }
}
