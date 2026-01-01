import React, { useState, useRef } from 'react';
import { X, Calendar, FileText, Download, Loader2 } from 'lucide-react';
import { formatDate, addDays, getDaysDifference, parseISODate, formatISODate } from '../../utils/dateUtils';
import type { ReadingPlanData, ReadingDay, CalculationMode } from '../../lib/types';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface ReadingPlanModalProps {
    isOpen: boolean;
    onClose: () => void;
    bookTitle: string;
    totalPages: number;
    currentPage?: number;
    bookId: string;
    onPlanCreated?: (plan: { start_date: string; end_date: string; daily_pages: number; calculation_mode: string }) => void;
}

export const ReadingPlanModal: React.FC<ReadingPlanModalProps> = ({
    isOpen,
    onClose,
    bookTitle,
    totalPages,
    currentPage = 0,
    bookId,
    onPlanCreated,
}) => {
    const [startDate, setStartDate] = useState(formatISODate(new Date()));
    const [calculationMode, setCalculationMode] = useState<CalculationMode>('pages');
    const [dailyPagesInput, setDailyPagesInput] = useState<number | ''>('');
    const [endDateInput, setEndDateInput] = useState('');
    const [plan, setPlan] = useState<ReadingPlanData | null>(null);
    const [isExporting, setIsExporting] = useState(false);
    const [isExportingPDF, setIsExportingPDF] = useState(false);
    const tableRef = useRef<HTMLDivElement>(null);

    if (!isOpen) return null;

    const remainingPages = totalPages - currentPage;

    const calculatePlan = (e: React.FormEvent) => {
        e.preventDefault();
        if (!startDate) return;

        let totalDays = 0;
        let dailyPages = 0;
        const start = parseISODate(startDate);
        const remaining = remainingPages;

        if (calculationMode === 'pages') {
            if (!dailyPagesInput) return;
            dailyPages = Number(dailyPagesInput);
            totalDays = Math.ceil(remaining / dailyPages);
        } else {
            if (!endDateInput) return;
            const end = parseISODate(endDateInput);
            totalDays = getDaysDifference(start, end);
            if (totalDays <= 0) {
                alert('Bitiş tarihi başlangıç tarihinden sonra olmalıdır.');
                return;
            }
            dailyPages = Math.ceil(remaining / totalDays);
        }

        const days: ReadingDay[] = [];
        let currentPageNum = currentPage + 1;

        for (let i = 0; i < totalDays; i++) {
            const remainingNow = totalPages - currentPageNum + 1;
            if (remainingNow <= 0) break;

            const currentDailyTarget = Math.min(dailyPages, remainingNow);
            const endPage = currentPageNum + currentDailyTarget - 1;

            days.push({
                dayNumber: i + 1,
                date: formatDate(addDays(start, i)),
                startPage: currentPageNum,
                endPage: endPage,
                dailyPages: currentDailyTarget,
            });

            currentPageNum = endPage + 1;
        }

        const lastDayDate = days.length > 0 ? days[days.length - 1].date : formatDate(start);

        setPlan({
            bookTitle: bookTitle,
            totalPages: totalPages,
            startDate: formatDate(start),
            dailyPages: dailyPages,
            totalDays: days.length,
            endDate: lastDayDate,
            days: days,
        });

        // Call the callback to save to database
        if (onPlanCreated && calculationMode) {
            onPlanCreated({
                start_date: formatISODate(start),
                end_date: formatISODate(addDays(start, days.length - 1)),
                daily_pages: dailyPages,
                calculation_mode: calculationMode,
                starting_page: currentPage,
            });
        }
    };

    const handleSaveAndClose = () => {
        if (plan && onPlanCreated) {
            onClose();
        }
    };

    const exportAsImage = async () => {
        if (!tableRef.current) return;
        setIsExporting(true);
        try {
            const canvas = await html2canvas(tableRef.current, {
                scale: 2,
                backgroundColor: '#ffffff',
                logging: false,
                useCORS: true,
            });
            const link = document.createElement('a');
            link.download = `${plan?.bookTitle || 'okuma-takvimi'}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (err) {
            console.error('Resim oluşturulurken hata oluştu:', err);
        } finally {
            setIsExporting(false);
        }
    };

    const exportAsPDF = async () => {
        if (!tableRef.current) return;
        setIsExportingPDF(true);
        try {
            const canvas = await html2canvas(tableRef.current, {
                scale: 2,
                backgroundColor: '#ffffff',
                logging: false,
                useCORS: true,
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: canvas.width > canvas.height ? 'l' : 'p',
                unit: 'px',
                format: [canvas.width, canvas.height],
            });

            pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
            pdf.save(`${plan?.bookTitle || 'okuma-takvimi'}.pdf`);
        } catch (err) {
            console.error('PDF oluşturulurken hata oluştu:', err);
        } finally {
            setIsExportingPDF(false);
        }
    };

    const chunkArray = <T,>(array: T[], size: number): T[][] => {
        const result: T[][] = [];
        for (let i = 0; i < array.length; i += size) {
            result.push(array.slice(i, i + size));
        }
        return result;
    };

    const getColumns = (days: number) => {
        if (days <= 12) return 1;
        if (days <= 30) return 2;
        if (days <= 60) return 3;
        if (days <= 100) return 4;
        return 5;
    };

    const colsCount = plan ? getColumns(plan.totalDays) : 1;
    const chunkedDays: ReadingDay[][] = plan
        ? chunkArray<ReadingDay>(plan.days, Math.ceil(plan.days.length / colsCount))
        : [];

    const getGridColsClass = (count: number) => {
        switch (count) {
            case 2:
                return 'md:grid-cols-2';
            case 3:
                return 'md:grid-cols-3';
            case 4:
                return 'md:grid-cols-4';
            case 5:
                return 'md:grid-cols-5';
            default:
                return 'grid-cols-1';
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-7xl w-full my-8 p-8 relative max-h-[90vh] overflow-y-auto border border-slate-100 dark:border-slate-800">
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors z-10"
                >
                    <X size={24} />
                </button>

                <h2 className="text-3xl font-black text-slate-900 dark:text-slate-100 mb-2">Okuma Planı Oluştur</h2>
                <p className="text-slate-600 dark:text-slate-400 mb-6 font-medium">
                    {bookTitle} ({currentPage > 0 ? `Kalan: ${remainingPages}` : totalPages} sayfa)
                </p>

                {!plan ? (
                    <form onSubmit={calculatePlan} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                    <Calendar size={14} className="text-indigo-500" /> Başlangıç Tarihi
                                </label>
                                <input
                                    type="date"
                                    required
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-slate-900 dark:text-slate-100"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                    Hesaplama Modu
                                </label>
                                <select
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium text-slate-900 dark:text-slate-100"
                                    value={calculationMode}
                                    onChange={(e) => setCalculationMode(e.target.value as CalculationMode)}
                                >
                                    <option value="pages" className="dark:bg-slate-900">Günlük Sayfa Sayısı</option>
                                    <option value="date" className="dark:bg-slate-900">Bitiş Tarihi</option>
                                </select>
                            </div>

                            {calculationMode === 'pages' ? (
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                        Günde Kaç Sayfa?
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        placeholder="Örn: 20"
                                        className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-slate-900 dark:text-slate-100"
                                        value={dailyPagesInput}
                                        onChange={(e) => setDailyPagesInput(e.target.value ? Number(e.target.value) : '')}
                                    />
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                        Ne Zaman Bitmeli?
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-slate-900 dark:text-slate-100"
                                        value={endDateInput}
                                        onChange={(e) => setEndDateInput(e.target.value)}
                                    />
                                </div>
                            )}
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all"
                        >
                            Planı Oluştur
                        </button>
                    </form>
                ) : (
                    <div className="space-y-6">
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setPlan(null)}
                                className="px-6 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl transition-all border border-slate-200 dark:border-slate-700"
                            >
                                Yeni Plan
                            </button>
                            <button
                                onClick={exportAsPDF}
                                disabled={isExportingPDF || isExporting}
                                className="flex items-center gap-2 px-6 py-3 bg-rose-500 hover:bg-rose-600 disabled:bg-slate-400 text-white font-bold rounded-xl transition-all"
                            >
                                {isExportingPDF ? (
                                    <Loader2 size={20} className="animate-spin" />
                                ) : (
                                    <FileText size={20} />
                                )}
                                PDF İndir
                            </button>
                            <button
                                onClick={exportAsImage}
                                disabled={isExporting || isExportingPDF}
                                className="flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-400 text-white font-bold rounded-xl transition-all"
                            >
                                {isExporting ? (
                                    <Loader2 size={20} className="animate-spin" />
                                ) : (
                                    <Download size={20} />
                                )}
                                Resim İndir
                            </button>
                        </div>

                        <div ref={tableRef} className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-100 dark:border-slate-800 shadow-xl">
                            <div className="mb-8 pb-6 border-b border-slate-100 dark:border-slate-800">
                                <h3 className="text-3xl font-black text-slate-900 dark:text-slate-100 mb-3">{plan.bookTitle}</h3>
                                <div className="flex flex-wrap gap-6">
                                    <div>
                                        <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">Başlangıç</span>
                                        <p className="font-bold text-slate-900 dark:text-slate-100">{plan.startDate}</p>
                                    </div>
                                    <div>
                                        <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">Bitiş</span>
                                        <p className="font-bold text-indigo-600 dark:text-indigo-400">{plan.endDate}</p>
                                    </div>
                                    <div>
                                        <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">Toplam Gün</span>
                                        <p className="font-bold text-slate-900 dark:text-slate-100">{plan.totalDays}</p>
                                    </div>
                                    <div>
                                        <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">Günlük</span>
                                        <p className="font-bold text-slate-900 dark:text-slate-100">{plan.dailyPages} sayfa</p>
                                    </div>
                                </div>
                            </div>

                            <div className={`grid grid-cols-1 ${getGridColsClass(colsCount)} gap-6`}>
                                {chunkedDays.map((chunk, chunkIdx) => (
                                    <div
                                        key={chunkIdx}
                                        className="border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden"
                                    >
                                        <table className="w-full text-left">
                                            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold text-xs uppercase">
                                                <tr>
                                                    <th className="px-3 py-3 text-center">Gün</th>
                                                    <th className="px-3 py-3">Tarih</th>
                                                    <th className="px-3 py-3 text-right">Aralık</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                                {chunk.map((day: ReadingDay) => (
                                                    <tr key={day.dayNumber} className="hover:bg-indigo-50/50 transition-colors">
                                                        <td className="px-3 py-3 text-center">
                                                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 text-xs font-bold">
                                                                {day.dayNumber}
                                                            </span>
                                                        </td>
                                                        <td className="px-3 py-3 text-sm text-slate-700 dark:text-slate-300 font-medium">
                                                            {day.date
                                                                .replace(' Pazartesi', ' Pzt')
                                                                .replace(' Salı', ' Sal')
                                                                .replace(' Çarşamba', ' Çar')
                                                                .replace(' Perşembe', ' Per')
                                                                .replace(' Cuma', ' Cum')
                                                                .replace(' Cumartesi', ' Cmt')
                                                                .replace(' Pazar', ' Paz')}
                                                        </td>
                                                        <td className="px-3 py-3 text-right font-mono font-bold text-slate-800 dark:text-slate-200 text-sm">
                                                            {day.startPage}—{day.endPage}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
