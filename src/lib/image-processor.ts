import { createWorker, Worker } from 'tesseract.js';
import { validateLegendaryMod } from './legendary-dictionary';
import { 
  normalizeArmorName, 
  ARMOR_TYPE_MAP, 
  SPECIAL_KEYWORDS, 
  LEGENDARY_PERK_MAP 
} from './scan-dictionary';

export interface ProcessedResult {
  text: string;
  confidence: number;
}

export interface BuildScanResult {
  armorType: string | null;
  special: Record<string, number>;
  legendaryMods: string[];
  legendaryPerks: string[];
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
    if (!this.worker) {
      await this.init(lang);
    }

    const passes = [
      { mode: 'dark', threshold: 25 },   // Standard dark list
      { mode: 'dark', threshold: 12 },   // Extra sensitive for faint gray text
      { mode: 'yellow', threshold: 100 }, // Standard selection bar
      { mode: 'yellow', threshold: 150 }  // Extra sensitive for thin fonts on yellow
    ] as const;

    const matches = new Set<string>();

    const analyze = async (mode: 'dark' | 'yellow', threshold: number) => {
      if (!this.worker) return;
      
      const c = document.createElement('canvas');
      c.width = canvas.width;
      c.height = canvas.height;
      const ctx = c.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(canvas, 0, 0);
      this.applyFilterPass(c, ctx, mode, threshold);
      
      const { data: { text } } = await this.worker.recognize(c);
      const lines = text.split('\n');

      for (const line of lines) {
        const validated = validateLegendaryMod(line);
        if (validated && !matches.has(validated)) {
          matches.add(validated);
        }
      }
    };

    // Run passes sequentially to avoid memory pressure, but collect all results
    for (const pass of passes) {
      await analyze(pass.mode, pass.threshold);
    }

    return Array.from(matches);
  }

  /**
   * Broader scan for builder elements: armor type, SPECIAL, legendary perks, etc.
   */
  async extractBuildData(canvas: HTMLCanvasElement, lang: string = 'eng'): Promise<BuildScanResult> {
    if (!this.worker) {
      await this.init(lang);
    }

    const result: BuildScanResult = {
      armorType: null,
      special: {},
      legendaryMods: [],
      legendaryPerks: []
    };

    const { data: { text } } = await this.worker.recognize(canvas);
    const lines = text.split('\n');

    for (const line of lines) {
      const cleanLine = line.trim();
      if (!cleanLine) continue;

      // 1. Armor Type Detection
      if (!result.armorType) {
        const armorName = normalizeArmorName(cleanLine);
        if (armorName) {
          result.armorType = ARMOR_TYPE_MAP[armorName] || null;
        }
      }

      // 2. SPECIAL Detection (e.g. "STRENGTH 15")
      for (const keyword of SPECIAL_KEYWORDS) {
        if (cleanLine.toUpperCase().includes(keyword)) {
          const match = cleanLine.match(/(\d+)/);
          if (match) {
            const val = parseInt(match[1]);
            if (!isNaN(val)) {
              const key = keyword.substring(0, 3).toLowerCase();
              result.special[key] = val;
            }
          }
        }
      }

      // 3. Legendary Perk Detection
      for (const [name, id] of Object.entries(LEGENDARY_PERK_MAP)) {
        if (cleanLine.toLowerCase().includes(name.toLowerCase())) {
          if (!result.legendaryPerks.includes(id)) {
            result.legendaryPerks.push(id);
          }
        }
      }

      // 4. Legendary Mod fallback (standard check)
      const validatedMod = validateLegendaryMod(cleanLine);
      if (validatedMod && !result.legendaryMods.includes(validatedMod)) {
        result.legendaryMods.push(validatedMod);
      }
    }

    return result;
  }

  private applyFilterPass(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, mode: 'dark' | 'yellow', customThreshold: number) {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const len = data.length;
    const width = canvas.width;
    const height = canvas.height;

    const integral = new Float64Array((width + 1) * (height + 1));
    const grayData = new Uint8Array(len / 4);

    for (let y = 0; y < height; y++) {
      let rowSum = 0;
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        const gray = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
        grayData[y * width + x] = gray;
        rowSum += gray;
        integral[(y + 1) * (width + 1) + (x + 1)] = integral[y * (width + 1) + (x + 1)] + rowSum;
      }
    }

    const radius = 15; 
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const x1 = Math.max(0, x - radius);
        const y1 = Math.max(0, y - radius);
        const x2 = Math.min(width, x + radius);
        const y2 = Math.min(height, y + radius);
        const count = (x2 - x1) * (y2 - y1);
        
        const sum = integral[y2 * (width + 1) + x2] 
                  - integral[y1 * (width + 1) + x2] 
                  - integral[y2 * (width + 1) + x1] 
                  + integral[y1 * (width + 1) + x1];
        
        const avg = sum / count;
        const pixel = grayData[y * width + x];
        let val;

        if (mode === 'dark') {
          // Pass 1: Target the dark list & faint gray text.
          // customThreshold here represents the "minimum brightness jump" above average
          if (avg < 120 && pixel > avg + customThreshold) {
            val = 0;
          } else {
            val = 255;
          }
        } else {
          // Pass 2: Target the yellow selection bar.
          // customThreshold here represents the "maximum brightness allowed" for text
          if (avg > 120 && pixel < customThreshold) {
            val = 0;
          } else {
            val = 255;
          }
        }

        const idx = (y * width + x) * 4;
        data[idx] = val;
        data[idx + 1] = val;
        data[idx + 2] = val;
        data[idx + 3] = 255;
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

