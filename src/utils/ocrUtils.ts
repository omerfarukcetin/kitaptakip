import Tesseract from 'tesseract.js';

export interface OCRProgress {
    status: string;
    progress: number;
}

/**
 * Perform OCR on an image file.
 * @param file - The image file to process
 * @param onProgress - Optional callback for progress updates
 * @returns The recognized text
 */
export const recognizeText = async (
    file: File | string,
    onProgress?: (progress: OCRProgress) => void
): Promise<string> => {
    const worker = await Tesseract.createWorker('tur', 1, {
        logger: m => {
            if (m.status === 'recognizing' && onProgress) {
                onProgress({ status: m.status, progress: m.progress });
            }
        },
    });

    try {
        const { data: { text } } = await worker.recognize(file);
        return text.trim();
    } catch (error) {
        console.error('OCR Error:', error);
        throw new Error('Metin tanıma sırasında bir hata oluştu.');
    } finally {
        await worker.terminate();
    }
};

/**
 * Extracts ISBN from text.
 * Support for ISBN-10 and ISBN-13 patterns.
 */
export const extractISBN = (text: string): string | null => {
    // Regex for ISBN-13: Usually starts with 978 or 979
    const isbn13Regex = /(97[89][-\s]?\d[\d-\s]{10,16}\d)/;
    // Regex for ISBN-10: 10 digits or 9 digits + X
    const isbn10Regex = /(?:\bISBN(?:-1[03])?:?\s*)?([0-9Xx]{10,13})/;

    const match13 = text.match(isbn13Regex);
    if (match13) return match13[1].replace(/[-\s]/g, '');

    const match10 = text.match(isbn10Regex);
    if (match10) return match10[1].replace(/[-\s]/g, '');

    return null;
};
