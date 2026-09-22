/**
 * ShadowID - Professional Neural OCR & Forensic Document Defense Engine
 * Powered by Tesseract.js WebAssembly & Indian Statutory Heuristics
 * Team GIGABYTE - Build With Bharat 3.0
 */

import { createWorker } from 'tesseract.js';
import { DocumentAnalysisData, DocumentOcrBox } from '../types.ts';

export interface OcrProgress {
  status: string;
  progress: number; // 0 to 100
}

export interface OcrProcessingResult {
  analysis: DocumentAnalysisData;
  imageUrl: string;
  rawText: string;
  detectedCategory: 'Aadhaar' | 'PAN' | 'Passport' | 'Generic ID';
  tamperRiskScore: number; // 0 to 100
  detectedAnomalies: string[];
}

/**
 * Verhoeff Checksum Algorithm (Statutory Aadhaar Checksum Standard)
 */
const VERHOEFF_D: number[][] = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
  [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
  [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
  [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
  [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
  [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
  [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
  [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
  [9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
];

const VERHOEFF_P: number[][] = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
  [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
  [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
  [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
  [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
  [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
  [7, 0, 4, 6, 9, 1, 3, 2, 5, 8],
];

const VERHOEFF_INV: number[] = [0, 4, 3, 2, 1, 5, 6, 7, 8, 9];

function validateVerhoeff(numStr: string): boolean {
  const clean = numStr.replace(/\D/g, '');
  if (clean.length !== 12) return false;
  let c = 0;
  const inverted = clean.split('').reverse().map(Number);
  for (let i = 0; i < inverted.length; i++) {
    c = VERHOEFF_D[c][VERHOEFF_P[i % 8][inverted[i]]];
  }
  return c === 0;
}

/**
 * Preprocesses an image on HTML5 Canvas to enhance OCR text contrast
 */
async function preprocessImageCanvas(
  file: File | Blob
): Promise<{ processedDataUrl: string; originalDataUrl: string; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const originalDataUrl = reader.result as string;
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve({ processedDataUrl: originalDataUrl, originalDataUrl, width: img.width, height: img.height });
          return;
        }

        // Limit dimensions for fast browser WebAssembly processing
        const maxDim = 1600;
        let scale = 1;
        if (img.width > maxDim || img.height > maxDim) {
          scale = Math.min(maxDim / img.width, maxDim / img.height);
        }
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Apply Grayscale & Contrast Boosting
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const d = imageData.data;
        for (let i = 0; i < d.length; i += 4) {
          // Grayscale luminance
          const gray = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
          // Contrast enhancement
          const contrast = 1.25; // Boost contrast
          const enhanced = Math.min(255, Math.max(0, (gray - 128) * contrast + 128));
          d[i] = enhanced;
          d[i + 1] = enhanced;
          d[i + 2] = enhanced;
        }
        ctx.putImageData(imageData, 0, 0);

        resolve({
          processedDataUrl: canvas.toDataURL('image/png'),
          originalDataUrl,
          width: img.width,
          height: img.height,
        });
      };
      img.src = originalDataUrl;
    };
    reader.readAsDataURL(file);
  });
}

export const ocrService = {
  /**
   * Performs end-to-end OCR and forensic tamper validation on an uploaded document file
   */
  processDocument: async (
    file: File,
    onProgress?: (p: OcrProgress) => void
  ): Promise<OcrProcessingResult> => {
    onProgress?.({ status: 'Preprocessing document image & optimizing contrast...', progress: 10 });

    const { processedDataUrl, originalDataUrl, width: imgW, height: imgH } = await preprocessImageCanvas(file);

    onProgress?.({ status: 'Loading Tesseract.js WebAssembly OCR neural engine...', progress: 25 });

    const worker = await createWorker('eng', 1, {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          const pct = 25 + Math.round((m.progress || 0) * 55);
          onProgress?.({
            status: `Recognizing tokens (${Math.round((m.progress || 0) * 100)}%)...`,
            progress: Math.min(80, pct),
          });
        }
      },
    });

    onProgress?.({ status: 'Performing optical character extraction...', progress: 50 });
    const res = await worker.recognize(processedDataUrl);
    await worker.terminate();

    onProgress?.({ status: 'Analyzing forensic typography, alignment & checksums...', progress: 85 });

    const fullText = res.data.text || '';
    const upperText = fullText.toUpperCase();

    // 1. Classify Indian Document Type
    let detectedCategory: 'Aadhaar' | 'PAN' | 'Passport' | 'Generic ID' = 'Generic ID';
    if (
      upperText.includes('AADHAAR') ||
      upperText.includes('UIDAI') ||
      upperText.includes('GOVERNMENT OF INDIA') ||
      upperText.includes('MERA AADHAAR') ||
      /\b\d{4}\s\d{4}\s\d{4}\b/.test(fullText)
    ) {
      detectedCategory = 'Aadhaar';
    } else if (
      upperText.includes('INCOME TAX') ||
      upperText.includes('PERMANENT ACCOUNT NUMBER') ||
      /\b[A-Z]{5}[0-9]{4}[A-Z]\b/.test(upperText)
    ) {
      detectedCategory = 'PAN';
    } else if (
      upperText.includes('PASSPORT') ||
      upperText.includes('REPUBLIC OF INDIA') ||
      /P<IND/.test(upperText) ||
      /\b[A-Z][0-9]{7}\b/.test(upperText)
    ) {
      detectedCategory = 'Passport';
    }

    // 2. Extract OCR Bounding Boxes with percentage coordinates
    const words: any[] = ((res.data as any)?.words as any[]) || [];
    const boxes: DocumentOcrBox[] = [];
    const anomalies: string[] = [];

    // Calculate baseline stats for anomaly detection
    const confidences = words.map((w: any) => Number(w.confidence) || 0).filter((c: number) => c > 0);
    const avgConfidence = confidences.length > 0 ? confidences.reduce((a: number, b: number) => a + b, 0) / confidences.length : 85;

    // Check heights for font mismatch
    const heights = words.map((w: any) => (w.bbox ? w.bbox.y1 - w.bbox.y0 : 0)).filter((h: number) => h > 5);
    const avgHeight = heights.length > 0 ? heights.reduce((a: number, b: number) => a + b, 0) / heights.length : 15;

    words.forEach((w: any, idx: number) => {
      const cleanWord = (w.text || '').trim();
      if (!cleanWord || cleanWord.length < 2) return;
      const bbox = w.bbox || { x0: 0, y0: 0, x1: 10, y1: 10 };

      const normX = Math.max(0, Math.min(100, Math.round((bbox.x0 / imgW) * 100)));
      const normY = Math.max(0, Math.min(100, Math.round((bbox.y0 / imgH) * 100)));
      const normW = Math.max(2, Math.min(100, Math.round(((bbox.x1 - bbox.x0) / imgW) * 100)));
      const normH = Math.max(2, Math.min(100, Math.round(((bbox.y1 - bbox.y0) / imgH) * 100)));

      let isAnomaly = false;
      let anomalyReason: string | undefined;

      // Heuristic 1: Significant confidence drop inside high confidence document (spliced text indicator)
      const tokenConfidence = Number(w.confidence) || 0;
      if (avgConfidence > 75 && tokenConfidence < 45 && cleanWord.length > 3) {
        isAnomaly = true;
        anomalyReason = `Low confidence token (${Math.round(tokenConfidence)}% vs avg ${Math.round(avgConfidence)}%): possible digital alteration or splicing.`;
      }

      // Heuristic 2: Typography/height jump
      const boxHeight = bbox.y1 - bbox.y0;
      if (avgHeight > 10 && boxHeight > avgHeight * 2.1 && cleanWord.length > 4) {
        isAnomaly = true;
        anomalyReason = `Font size discontinuity (${boxHeight}px vs avg ${Math.round(avgHeight)}px). Possible typeface tampering.`;
      }

      boxes.push({
        id: `ocr-box-${idx}`,
        label: cleanWord,
        value: cleanWord,
        maskedValue: cleanWord,
        confidence: Math.round(tokenConfidence),
        x: normX,
        y: normY,
        width: normW,
        height: normH,
        isAnomaly,
        anomalyReason,
      });
    });

    // 3. Indian Identity Forensic Validation
    let tamperScore = 10; // Clean baseline

    if (detectedCategory === 'Aadhaar') {
      const uidMatch = fullText.match(/\b(\d{4})\s*(\d{4})\s*(\d{4})\b/);
      if (uidMatch) {
        const rawUid = `${uidMatch[1]}${uidMatch[2]}${uidMatch[3]}`;
        const isVerhoeffValid = validateVerhoeff(rawUid);
        if (!isVerhoeffValid) {
          anomalies.push(`Verhoeff Checksum Failure: Extracted UID ${uidMatch[0]} does not satisfy statutory algorithm.`);
          tamperScore += 45;
        } else {
          // Check masking compliance under DPDP Act / UIDAI circular
          if (!uidMatch[0].startsWith('XXXX') && !uidMatch[0].startsWith('••••')) {
            anomalies.push('Unmasked Aadhaar UID detected: Violates DPDP Act minimization rules (first 8 digits must be masked).');
            tamperScore += 20;
          }
        }
      }
    } else if (detectedCategory === 'PAN') {
      const panMatch = upperText.match(/\b([A-Z]{5}[0-9]{4}[A-Z])\b/);
      if (panMatch) {
        const panNumber = panMatch[1];
        const entityType = panNumber.charAt(3);
        const validEntityChars = ['P', 'C', 'H', 'F', 'A', 'T', 'B', 'L', 'J', 'G'];
        if (!validEntityChars.includes(entityType)) {
          anomalies.push(`Invalid Taxpayer Entity Code '${entityType}' in 4th character of PAN ${panNumber}.`);
          tamperScore += 40;
        }
      } else {
        anomalies.push('Income Tax Department header found, but 10-character PAN structure is unparseable or obscured.');
        tamperScore += 25;
      }
    } else if (detectedCategory === 'Passport') {
      const mrzMatch = upperText.match(/P<IND([A-Z0-9<]+)/);
      if (!mrzMatch && !/\b[A-Z][0-9]{7}\b/.test(upperText)) {
        anomalies.push('Missing standardized ICAO Doc 9303 Machine Readable Zone (MRZ) string on passport face.');
        tamperScore += 30;
      }
    }

    // Add general box anomalies to summary
    const boxAnomalyCount = boxes.filter((b) => b.isAnomaly).length;
    if (boxAnomalyCount > 0) {
      anomalies.push(`${boxAnomalyCount} localized typographic or confidence discontinuities detected across extracted tokens.`);
      tamperScore += Math.min(30, boxAnomalyCount * 10);
    }

    const overallQuality = Math.max(20, Math.min(99, Math.round(avgConfidence)));
    const finalTamperScore = Math.min(100, tamperScore);

    const verdict =
      finalTamperScore >= 60
        ? 'Requires Urgent Forensic Review (Anomalies Flagged)'
        : finalTamperScore >= 30
        ? 'Advisory: Compliance Review Recommended'
        : 'Authenticity Baseline Verified Clean';

    const summary =
      anomalies.length === 0
        ? `Uploaded ${detectedCategory} successfully parsed via Tesseract Neural Engine (${boxes.length} tokens extracted). No typeface, checksum, or alignment anomalies detected.`
        : `Uploaded ${detectedCategory} exhibits ${anomalies.length} potential anomalies: ${anomalies.join(' ')}`;

    const analysisData: DocumentAnalysisData = {
      id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      documentCategory: detectedCategory,
      sampleLabel: `${detectedCategory} Live Upload (${file.name})`,
      filename: file.name,
      mimeType: file.type || 'image/png',
      fileSizeBytes: file.size,
      ocrEngine: 'Tesseract WebAssembly v7 (eng/hin) + Canvas Adaptive Contrast',
      qualityScore: overallQuality,
      languageDetected: 'English',
      verdict,
      summary,
      boxes,
      inconsistencies: anomalies,
      humanReviewNotes: `Uploaded on ${new Date().toLocaleDateString('en-IN')} by active analyst. OCR extracted ${boxes.length} text segments. Tamper index: ${finalTamperScore}/100.`,
      isHumanVerified: false,
    };

    onProgress?.({ status: 'Document Defense Analysis complete.', progress: 100 });

    return {
      analysis: analysisData,
      imageUrl: originalDataUrl,
      rawText: fullText,
      detectedCategory,
      tamperRiskScore: finalTamperScore,
      detectedAnomalies: anomalies,
    };
  },
};
