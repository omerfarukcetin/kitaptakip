import type { GoogleBook } from './database.types';

const GOOGLE_BOOKS_API = 'https://www.googleapis.com/books/v1/volumes';

/**
 * Search for a book by ISBN using Google Books API
 */
export async function searchBookByISBN(isbn: string): Promise<GoogleBook | null> {
    try {
        const cleanISBN = isbn.replace(/[-\s]/g, '');
        const response = await fetch(`${GOOGLE_BOOKS_API}?q=isbn:${cleanISBN}`);

        if (!response.ok) {
            throw new Error('Google Books API request failed');
        }

        const data = await response.json();

        if (data.items && data.items.length > 0) {
            return data.items[0] as GoogleBook;
        }

        return null;
    } catch (error) {
        console.error('Error fetching book by ISBN:', error);
        return null;
    }
}

/**
 * Search for books by title/author
 */
export async function searchBooks(query: string): Promise<GoogleBook[]> {
    try {
        const response = await fetch(`${GOOGLE_BOOKS_API}?q=${encodeURIComponent(query)}&maxResults=10`);

        if (!response.ok) {
            throw new Error('Google Books API request failed');
        }

        const data = await response.json();
        return data.items || [];
    } catch (error) {
        console.error('Error searching books:', error);
        return [];
    }
}

/**
 * Extract book data from Google Books API response
 */
export function extractBookData(googleBook: GoogleBook) {
    const { volumeInfo } = googleBook;

    // Get the best quality cover image available
    let coverUrl = null;
    if (volumeInfo.imageLinks) {
        // Try to get the largest image available
        coverUrl = volumeInfo.imageLinks.thumbnail ||
            volumeInfo.imageLinks.smallThumbnail ||
            null;

        // Convert to HTTPS and increase image size by removing zoom parameter
        if (coverUrl) {
            coverUrl = coverUrl.replace('http://', 'https://');
            // Remove zoom parameter to get larger image
            coverUrl = coverUrl.replace(/&zoom=\d+/, '');
            // Try to get larger version by replacing zoom=1 with zoom=2 or removing it
            if (!coverUrl.includes('zoom')) {
                coverUrl = coverUrl + '&zoom=2';
            }
        }
    }

    return {
        title: volumeInfo.title || '',
        author: volumeInfo.authors?.join(', ') || '',
        total_pages: volumeInfo.pageCount || 0,
        cover_url: coverUrl,
        isbn: volumeInfo.industryIdentifiers?.find(id => id.type === 'ISBN_13')?.identifier ||
            volumeInfo.industryIdentifiers?.find(id => id.type === 'ISBN_10')?.identifier || null,
        categories: volumeInfo.categories || [],
    };
}
