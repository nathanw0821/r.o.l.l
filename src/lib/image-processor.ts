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
  private currentLanguage: string = 'eng';
  private worker: Worker | null = null;

  /**
   * Initializes the Tesseract.js worker with the specified language.
   */
  async init(lang: string = 'eng') {
    if (this.worker && this.currentLanguage === lang) return;
    
    if (this.worker) {
      await this.worker.terminate();
    }
    
    this.currentLanguage = lang;
    this.worker = await createWorker(lang);
  }

  /**
   * Processes a canvas element and returns recognized text and confidence level.
   */
  async processImage(canvas: HTMLCanvasElement, lang: string = 'eng'): Promise<ProcessedResult> {
    await this.init(lang);
    
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
  async extractLegendaryMods(canvas: HTMLCanvasElement, lang: string = 'eng'): Promise<string[]> {
    const { text } = await this.processImage(canvas, lang);
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
   * Applies Otsu's Thresholding to the canvas.
   * Automatically calculates the optimal threshold for bimodal images.
   */
  applyFilters(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const len = data.length;

    // 1. Grayscale + Integral Image for fast local averaging
    const integral = new Float64Array((canvas.width + 1) * (canvas.height + 1));
    const grayData = new Uint8Array(len / 4);

    for (let y = 0; y < canvas.height; y++) {
      let rowSum = 0;
      for (let x = 0; x < canvas.width; x++) {
        const i = (y * canvas.width + x) * 4;
        const gray = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
        grayData[y * canvas.width + x] = gray;
        rowSum += gray;
        integral[(y + 1) * (canvas.width + 1) + (x + 1)] = integral[y * (canvas.width + 1) + (x + 1)] + rowSum;
      }
    }

    // 2. High-Pass Filter (Local Mean Subtraction)
    // This removes the background (dark OR yellow) and makes text stand out.
    const radius = 15; // Local window radius
    const sensitivity = 25; // Minimum difference to consider as text

    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        const x1 = Math.max(0, x - radius);
        const y1 = Math.max(0, y - radius);
        const x2 = Math.min(canvas.width, x + radius);
        const y2 = Math.min(canvas.height, y + radius);
        const count = (x2 - x1) * (y2 - y1);
        
        const sum = integral[y2 * (canvas.width + 1) + x2] 
                  - integral[y1 * (canvas.width + 1) + x2] 
                  - integral[y2 * (canvas.width + 1) + x1] 
                  + integral[y1 * (canvas.width + 1) + x1];
        
        const avg = sum / count;
        const pixel = grayData[y * canvas.width + x];
        
        // Polarity Invariant: |pixel - avg| 
        // Bright text on dark avg -> High Diff
        // Dark text on bright avg -> High Diff
        // Flat background -> Low Diff
        const diff = Math.abs(pixel - avg);
        
        // Output black text (0) on white background (255)
        const val = diff > sensitivity ? 0 : 255;
        
        const idx = (y * canvas.width + x) * 4;
        data[idx] = val;
        data[idx + 1] = val;
        data[idx + 2] = val;
      }
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
