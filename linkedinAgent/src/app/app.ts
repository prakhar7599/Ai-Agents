import { Component, signal } from '@angular/core';
import * as pdfjsLib from 'pdfjs-dist';
import { extractSkills } from './linkedinAiAgent/skillExtractAgent';
import { generateLinkedInPost, RateLimitError } from './linkedinAiAgent/linkedinPostAgent';
import { ApiKeyService } from './linkedinAiAgent/apiKeyService';

pdfjsLib.GlobalWorkerOptions.workerSrc =
  'https://cdn.jsdelivr.net/npm/pdfjs-dist@5.4.530/build/pdf.worker.min.mjs';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  extractedText = signal('');
  skills = signal<any>(null);
  linkedinPost = signal<string | null>(null);
  loading = signal(false);
  generatingPost = signal(false);
  error = signal<string | null>(null);
  showApiKeyModal = signal(false);
  apiKeyInput = signal('');
  isRateLimitError = signal(false);

  constructor() {
    // Listen for rate limit errors from global error handler
    if (typeof window !== 'undefined') {
      window.addEventListener('rateLimitError', (event: any) => {
        console.log('Rate limit error event received:', event);
        this.handleRateLimitError();
      });

      // Also intercept fetch errors to catch 429 responses
      this.setupFetchInterceptor();
    }
  }

  setupFetchInterceptor() {
    // Store original fetch
    const originalFetch = window.fetch;
    const self = this;

    // Override fetch to intercept 429 errors
    window.fetch = async function(...args) {
      try {
        const response = await originalFetch(...args);
        
        // Check if response is 429
        if (response.status === 429) {
          console.log('429 error detected in fetch interceptor');
          // Check if it's a Google API request
          const url = args[0]?.toString() || '';
          if (url.includes('generativelanguage.googleapis.com')) {
            console.log('Google API 429 error detected, showing modal');
            // Use setTimeout to avoid blocking
            setTimeout(() => {
              self.handleRateLimitError();
            }, 100);
          }
        }
        
        return response;
      } catch (error: any) {
        // Check error for 429
        if (ApiKeyService.isRateLimitError(error)) {
          console.log('Rate limit error in fetch catch block');
          setTimeout(() => {
            self.handleRateLimitError();
          }, 100);
        }
        throw error;
      }
    };
  }

  handleRateLimitError() {
    console.log('Handling rate limit error, showing modal');
    this.isRateLimitError.set(true);
    this.showApiKeyModal.set(true);
    this.error.set('Daily API limit reached. Please enter your own Google API key to continue.');
  }

  async onFileChange(event: Event) {
    this.error.set(null);
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      this.error.set('Only PDF files are currently supported.');
      return;
    }

    this.loading.set(true);
    this.skills.set(null);
    this.linkedinPost.set(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;

      let text = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();

        // Use a safer way to join strings from items, filter only TextItem objects
        const pageText = content.items
          .map((item: any) => (item.str !== undefined ? item.str : ''))
          .join(' ');

        text += pageText + '\n';
      }

      if (!text.trim()) {
        throw new Error('No text could be extracted from this PDF. It might be a scanned image.');
      }

      this.extractedText.set(text);

      const extractedSkills = await extractSkills(text);
      if (extractedSkills?.error) {
        throw new Error(extractedSkills.error);
      }
      this.skills.set(extractedSkills);

      if (extractedSkills && extractedSkills.technical_skills) {
        this.generatingPost.set(true);
        const post = await generateLinkedInPost(extractedSkills.technical_skills);
        this.linkedinPost.set(post);
        this.generatingPost.set(false);
      }
    } catch (err: any) {
      console.error("Error processing document:", err);
      console.error("Full error object:", JSON.stringify(err, null, 2));
      console.error("Error type:", err?.constructor?.name);
      console.error("Error message:", err?.message);
      console.error("Error status:", err?.status, err?.statusCode);
      console.error("Error response:", err?.response);
      console.error("Is RateLimitError instance?", err instanceof RateLimitError);
      console.error("Is rate limit error?", ApiKeyService.isRateLimitError(err));
      
      // More aggressive check - check error message, status, and any nested properties
      const errorString = JSON.stringify(err).toLowerCase();
      const errorMsg = (err?.message || err?.toString() || '').toLowerCase();
      const has429 = errorString.includes('429') || errorMsg.includes('429') || 
                     err?.status === 429 || err?.statusCode === 429 ||
                     err?.response?.status === 429 || err?.response?.statusCode === 429;
      
      const hasRateLimit = errorString.includes('rate limit') || errorMsg.includes('rate limit') ||
                          errorString.includes('quota exceeded') || errorMsg.includes('quota exceeded') ||
                          errorString.includes('resource_exhausted') || errorMsg.includes('resource_exhausted');
      
      const isRateLimit = err instanceof RateLimitError || ApiKeyService.isRateLimitError(err) || has429 || hasRateLimit;
      
      if (isRateLimit) {
        console.log("Rate limit detected! Showing API key modal");
        this.isRateLimitError.set(true);
        this.showApiKeyModal.set(true);
        this.error.set('Daily API limit reached. Please enter your own Google API key to continue.');
      } else {
        this.error.set(err.message || 'Failed to process document. Please try a different PDF.');
      }
    } finally {
      this.loading.set(false);
      this.generatingPost.set(false);
    }
  }

  clear() {
    this.extractedText.set('');
    this.skills.set(null);
    this.linkedinPost.set(null);
    this.loading.set(false);
    this.generatingPost.set(false);
    this.error.set(null);
  }

  copyToClipboard(text: string) {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      alert('Copied to clipboard!');
    }).catch(err => {
      console.error('Could not copy text: ', err);
    });
  }

  getFormattedSkills(): string {
    const s = this.skills();
    if (!s) return '';

    let text = 'Extracted Skills:\n\n';
    if (s.technical_skills?.length) {
      text += `Technical Skills: ${s.technical_skills.join(', ')}\n`;
    }
    if (s.soft_skills?.length) {
      text += `Soft Skills: ${s.soft_skills.join(', ')}\n`;
    }
    if (s.tools_and_platforms?.length) {
      text += `Tools & Platforms: ${s.tools_and_platforms.join(', ')}\n`;
    }
    if (s.languages?.length) {
      text += `Languages: ${s.languages.join(', ')}\n`;
    }
    return text;
  }

  saveApiKey() {
    const apiKey = this.apiKeyInput().trim();
    if (!apiKey) {
      this.error.set('Please enter a valid API key');
      return;
    }

    ApiKeyService.setUserApiKey(apiKey);
    this.showApiKeyModal.set(false);
    this.isRateLimitError.set(false);
    this.error.set(null);
    this.apiKeyInput.set('');

    // Retry the last operation if there was a rate limit error
    if (this.extractedText()) {
      this.retryWithNewApiKey();
    }
  }

  async retryWithNewApiKey() {
    try {
      if (this.skills() && this.skills().technical_skills) {
        this.generatingPost.set(true);
        const post = await generateLinkedInPost(this.skills().technical_skills);
        this.linkedinPost.set(post);
        this.generatingPost.set(false);
      } else if (this.extractedText()) {
        this.loading.set(true);
        const extractedSkills = await extractSkills(this.extractedText());
        if (extractedSkills?.error) {
          throw new Error(extractedSkills.error);
        }
        this.skills.set(extractedSkills);

        if (extractedSkills && extractedSkills.technical_skills) {
          this.generatingPost.set(true);
          const post = await generateLinkedInPost(extractedSkills.technical_skills);
          this.linkedinPost.set(post);
          this.generatingPost.set(false);
        }
        this.loading.set(false);
      }
    } catch (err: any) {
      console.error("Error retrying with new API key:", err);
      if (err instanceof RateLimitError || ApiKeyService.isRateLimitError(err)) {
        this.showApiKeyModal.set(true);
        this.error.set('The API key you entered also has reached its limit. Please try another key.');
      } else {
        this.error.set(err.message || 'Failed to process with new API key.');
      }
      this.loading.set(false);
      this.generatingPost.set(false);
    }
  }

  closeApiKeyModal() {
    this.showApiKeyModal.set(false);
    this.apiKeyInput.set('');
  }

  clearApiKey() {
    ApiKeyService.clearUserApiKey();
    this.apiKeyInput.set('');
  }

  // Debug method to test modal (remove in production)
  testModal() {
    console.log('Testing modal display');
    this.showApiKeyModal.set(true);
    this.isRateLimitError.set(true);
  }
}
