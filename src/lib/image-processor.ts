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

    // 1. Grayscale conversion
    const grayData = new Uint8Array(len / 4);
    for (let i = 0, j = 0; i < len; i += 4, j++) {
      grayData[j] = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
    }

    // 2. Block-Based Adaptive Contrast Normalization with Dynamic Polarity
    const width = canvas.width;
    const height = canvas.height;
    const blockSize = 24; // Large enough to include background, small enough for local contrast
    const normalizedData = new Uint8Array(width * height);

    for (let by = 0; by < height; by += blockSize) {
      for (let bx = 0; bx < width; bx += blockSize) {
        // Find min, max, and avg in this block
        let min = 255, max = 0, sum = 0, count = 0;
        for (let y = by; y < Math.min(by + blockSize, height); y++) {
          for (let x = bx; x < Math.min(bx + blockSize, width); x++) {
            const val = grayData[y * width + x];
            if (val < min) min = val;
            if (val > max) max = val;
            sum += val;
            count++;
          }
        }

        const avg = sum / count;
        // If average is bright, this block is part of the yellow selection bar.
        // If average is dark, this block is part of the standard list.
        const isBrightBackground = avg > 128; 

        // Normalize pixels in this block
        const range = max - min;
        for (let y = by; y < Math.min(by + blockSize, height); y++) {
          for (let x = bx; x < Math.min(bx + blockSize, width); x++) {
            const idx = y * width + x;
            if (range < 15) {
              // Flat area (pure background), output as pure white to keep Tesseract clean
              normalizedData[idx] = 255; 
            } else {
              // Scale to full 0-255 range
              let scaled = ((grayData[idx] - min) / range) * 255;
              
              // Standard list (Dark Bg): scaled text is 255. We want it 0 (Black). -> INVERT
              // Yellow bar (Bright Bg): scaled text is 0. We want it 0 (Black). -> DO NOT INVERT
              if (!isBrightBackground) {
                scaled = 255 - scaled;
              }
              
              // Apply hard threshold for crisp edges (Text is now 0, background is 255)
              normalizedData[idx] = scaled < 128 ? 0 : 255;
            }
          }
        }
      }
    }

    // 3. Write final binary image to canvas
    for (let i = 0; i < len; i += 4) {
      const idx = i / 4;
      const val = normalizedData[idx];
      data[i] = val;
      data[i + 1] = val;
      data[i + 2] = val;
      data[i + 3] = 255;
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
