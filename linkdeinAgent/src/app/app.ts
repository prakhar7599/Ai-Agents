import { Component, signal } from '@angular/core';
import * as pdfjsLib from 'pdfjs-dist';
import { extractSkills } from './linkdeinAiAgent/skillExtractAgent';
import { generateLinkedInPost } from './linkdeinAiAgent/linkdeinPostAgent';

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
      this.error.set(err.message || 'Failed to process document. Please try a different PDF.');
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
}
