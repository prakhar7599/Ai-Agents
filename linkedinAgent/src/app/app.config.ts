import { ApplicationConfig, provideBrowserGlobalErrorListeners, ErrorHandler } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { ApiKeyService } from './linkedinAiAgent/apiKeyService';

class CustomErrorHandler implements ErrorHandler {
  handleError(error: any): void {
    console.error('Global error handler:', error);
    
    // Check if it's a rate limit error and try to show modal
    if (ApiKeyService.isRateLimitError(error)) {
      // Try to dispatch a custom event that the app component can listen to
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('rateLimitError', { detail: error }));
      }
    }
  }
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    { provide: ErrorHandler, useClass: CustomErrorHandler }
  ]
};
