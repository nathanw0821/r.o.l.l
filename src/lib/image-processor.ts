import { createWorker, Worker } from 'tesseract.js';
import { validateLegendaryMod } from './legendary-dictionary';

export interface ProcessedResult {
  text: string;
  confidence: number;
}

/**
 * ImageProcessor handles client-side OCR and image filtering for Fallout 76 screenshots.
 * Optimizes images using HTML5 Canvas for better Tesseract.js accuracy.
 */
export class ImageProcessor {
  private worker: Worker | null = null;

  /**
   * Initializes the Tesseract.js worker with English language support.
   */
  async init() {
    if (this.worker) return;
    this.worker = await createWorker('eng');
  }

  /**
   * Processes a canvas element and returns recognized text and confidence level.
   */
  async processImage(canvas: HTMLCanvasElement): Promise<ProcessedResult> {
    if (!this.worker) await this.init();
    
    // Tesseract.js 5.x API
    const { data: { text, confidence } } = await this.worker!.recognize(canvas);
    
    return { 
      text, 
      confidence 
    };
  }

  /**
   * Processes a canvas and attempts to extract and validate legendary mod names.
   */
  async extractLegendaryMods(canvas: HTMLCanvasElement): Promise<string[]> {
    const { text } = await this.processImage(canvas);
    const lines = text.split('\n');
    const matches: string[] = [];

    for (const line of lines) {
      const validated = validateLegendaryMod(line);
      if (validated && !matches.includes(validated)) {
        matches.push(validated);
      }
    }

    return matches;
  }

  /**
   * Applies Grayscale, High Contrast, and Thresholding filters to a canvas.
   * Optimized for Fallout 76 UI (Yellow/White text on dark backgrounds).
   */
  applyFilters(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

      // Boost brightness to help with grayed-out text
      const r = Math.min(255, data[i] * 1.2);
      const g = Math.min(255, data[i + 1] * 1.2);
      const b = Math.min(255, data[i + 2] * 1.2);

      // Standard grayscale conversion
      const gray = 0.299 * r + 0.587 * g + 0.114 * b;
      
      // High Contrast + Thresholding
      // Lowered threshold from 180 to 120 to capture grayed-out "unlocked but missing materials" text
      const threshold = 120; 
      const value = gray > threshold ? 255 : 0;

      data[i] = value;     // Red
      data[i + 1] = value; // Green
      data[i + 2] = value; // Blue
      // Alpha remains unchanged
    }

    ctx.putImageData(imageData, 0, 0);
  }

  /**
   * Terminates the worker to free up memory.
   */
  async terminate() {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
    }
  }

  /**
   * Static helper to intercept clipboard images and draw them to a canvas.
   */
  static async getImageFromClipboard(event: ClipboardEvent): Promise<HTMLCanvasElement | null> {
    const items = event.clipboardData?.items;
    if (!items) return null;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const blob = items[i].getAsFile();
        if (!blob) continue;

        return new Promise((resolve) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0);
              resolve(canvas);
            } else {
              resolve(null);
            }
          };
          img.src = URL.createObjectURL(blob);
        });
      }
    }
    return null;
  }
}
