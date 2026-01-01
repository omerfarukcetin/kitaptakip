import React from 'react';
import { Download } from 'lucide-react';
import jsPDF from 'jspdf';
import type { BookNote } from '../../lib/database.types';

interface ExportBookNotesProps {
    notes: BookNote[];
    bookTitle: string;
    bookAuthor?: string;
}

export const ExportBookNotes: React.FC<ExportBookNotesProps> = ({
    notes,
    bookTitle,
    bookAuthor,
}) => {
    const handleExport = () => {
        if (notes.length === 0) {
            alert('Bu kitap için henüz not bulunmuyor');
            return;
        }

        const doc = new jsPDF();
        let yPos = 20;
        const pageHeight = doc.internal.pageSize.height;
        const margin = 20;
        const lineHeight = 7;

        // Helper to check if we need a new page
        const checkAddPage = (neededSpace: number) => {
            if (yPos + neededSpace > pageHeight - margin) {
                doc.addPage();
                yPos = margin;
                return true;
            }
            return false;
        };

        // Title
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text(bookTitle, margin, yPos);
        yPos += 10;

        // Author
        if (bookAuthor) {
            doc.setFontSize(12);
            doc.setFont('helvetica', 'normal');
            doc.text(`Yazar: ${bookAuthor}`, margin, yPos);
            yPos += 8;
        }

        // Info
        doc.setFontSize(10);
        doc.text(`Not Sayisi: ${notes.length}`, margin, yPos);
        yPos += 6;
        doc.text(`Tarih: ${new Date().toLocaleDateString('tr-TR')}`, margin, yPos);
        yPos += 12;

        // Separator line
        doc.setDrawColor(200, 200, 200);
        doc.line(margin, yPos, doc.internal.pageSize.width - margin, yPos);
        yPos += 10;

        // Group notes by type
        const quoteNotes = notes.filter(n => n.note_type === 'quote');
        const thoughtNotes = notes.filter(n => n.note_type === 'thought');
        const summaryNotes = notes.filter(n => n.note_type === 'summary');

        // Helper to add notes section
        const addNotesSection = (sectionNotes: typeof notes, title: string, emoji: string) => {
            if (sectionNotes.length === 0) return;

            checkAddPage(20);
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text(`${emoji} ${title} (${sectionNotes.length})`, margin, yPos);
            yPos += 10;

            sectionNotes.forEach((note, index) => {
                checkAddPage(30);

                // Note number and page
                doc.setFontSize(11);
                doc.setFont('helvetica', 'bold');
                let noteTitle = `${index + 1}. ${title}`;
                if (note.page_number) {
                    noteTitle += ` (Sayfa ${note.page_number})`;
                }
                doc.text(noteTitle, margin, yPos);
                yPos += 7;

                // Content
                doc.setFontSize(10);
                doc.setFont('helvetica', 'normal');
                const splitContent = doc.splitTextToSize(note.content, doc.internal.pageSize.width - 2 * margin);
                splitContent.forEach((line: string) => {
                    checkAddPage(lineHeight);
                    doc.text(line, margin + 5, yPos);
                    yPos += lineHeight;
                });
                yPos += 3;

                // Categories and tags
                if (note.categories && note.categories.length > 0) {
                    checkAddPage(lineHeight);
                    doc.setFont('helvetica', 'bold');
                    doc.text(`Kategoriler: ${note.categories.join(', ')}`, margin + 5, yPos);
                    yPos += lineHeight;
                }

                if (note.tags && note.tags.length > 0) {
                    checkAddPage(lineHeight);
                    doc.setFont('helvetica', 'bold');
                    doc.text(`Etiketler: ${note.tags.map(t => `#${t}`).join(', ')}`, margin + 5, yPos);
                    yPos += lineHeight;
                }

                // Date
                doc.setFont('helvetica', 'italic');
                doc.setFontSize(9);
                checkAddPage(lineHeight);
                doc.text(new Date(note.created_at).toLocaleDateString('tr-TR'), margin + 5, yPos);
                yPos += 10;

                // Separator
                if (index < sectionNotes.length - 1) {
                    checkAddPage(5);
                    doc.setDrawColor(220, 220, 220);
                    doc.line(margin, yPos, doc.internal.pageSize.width - margin, yPos);
                    yPos += 8;
                }
            });

            yPos += 5;
        };

        // Add all sections
        addNotesSection(quoteNotes, 'Alinti', 'o');
        addNotesSection(thoughtNotes, 'Dusunce', '*');
        addNotesSection(summaryNotes, 'Ozet', '>');

        // Save PDF
        doc.save(`${bookTitle.replace(/[^a-z0-9]/gi, '_')}_notlar.pdf`);
    };

    return (
        <button
            onClick={handleExport}
            disabled={notes.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all"
            title="Tüm notları PDF olarak indir"
        >
            <Download size={18} />
            PDF İndir
        </button>
    );
};
