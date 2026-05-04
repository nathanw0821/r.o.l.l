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

    // 1. Grayscale + Histogram
    const histogram = new Int32Array(256);
    const grayData = new Uint8Array(len / 4);

    for (let i = 0, j = 0; i < len; i += 4, j++) {
      // Standard grayscale weights
      const gray = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
      grayData[j] = gray;
      histogram[gray]++;
    }

    // 2. Triangle Thresholding (Better for skewed histograms with large background peaks)
    // Find the min and max gray levels
    let min = 255, max = 0;
    for (let t = 0; t < 256; t++) {
      if (histogram[t] > 0) {
        if (t < min) min = t;
        if (t > max) max = t;
      }
    }

    // Find the peak of the histogram
    let peak = 0;
    let peakCount = 0;
    for (let t = min; t <= max; t++) {
      if (histogram[t] > peakCount) {
        peakCount = histogram[t];
        peak = t;
      }
    }

    let threshold = 0;
    // Triangle method calculation
    if (peak - min > max - peak) {
      // Peak is closer to max
      let dMax = 0;
      for (let t = min; t < peak; t++) {
        const d = Math.abs((peak - min) * (histogram[t] - histogram[min]) - (t - min) * (peakCount - histogram[min]));
        if (d > dMax) {
          dMax = d;
          threshold = t;
        }
      }
    } else {
      // Peak is closer to min (typical for dark FO76 UI)
      let dMax = 0;
      for (let t = peak + 1; t <= max; t++) {
        const d = Math.abs((max - peak) * (histogram[t] - histogram[max]) - (t - peak) * (peakCount - histogram[max]));
        if (d > dMax) {
          dMax = d;
          threshold = t;
        }
      }
    }

    // 3. Apply threshold and invert (Tesseract prefers black text on white)
    // For the yellow bar (high gray), we want it to be white (255) and its black text to be black (0).
    // For standard text (high gray), we want it to be black (0) and background white (255).
    // This is the "Mixed Polarity" problem. 
    // SOLUTION: Use a very sensitive threshold and then a Sharpening effect.
    const finalThreshold = Math.max(30, threshold - 5); 

    for (let i = 0, j = 0; i < len; i += 4, j++) {
      // Standard items (High Gray > Threshold) -> Black (0)
      // Background (Low Gray < Threshold) -> White (255)
      // Selected Bar (High Gray > Threshold) -> Black (0)
      // Selected Text (Low Gray < Threshold) -> White (255)
      // This results in mixed polarity. Tesseract 5.x handles this via its internal adaptive thresholder.
      // So we will provide a CLEAN grayscale contrast-stretched image instead of a binary one.
      const val = grayData[j];
      const stretched = Math.min(255, Math.max(0, (val - min) * (255 / (max - min))));
      
      // Binary fallback for now, but with better sensitivity
      const binary = stretched > finalThreshold ? 0 : 255;
      data[i] = binary;
      data[i + 1] = binary;
      data[i + 2] = binary;
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
