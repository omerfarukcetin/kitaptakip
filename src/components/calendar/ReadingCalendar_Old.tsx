
import React, { useState, useRef } from 'react';
import { BookOpen, Calendar, Download, RefreshCw, Layers, CheckSquare, ChevronDown, FileText } from 'lucide-react';
import { ReadingPlan, CalculationMode, ReadingDay } from './types';
import { toTitleCase, formatDate, addDays, getDaysDifference } from './utils';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const App: React.FC = () => {
  const [bookTitle, setBookTitle] = useState('');
  const [totalPages, setTotalPages] = useState<number | ''>('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [calculationMode, setCalculationMode] = useState<CalculationMode>('pages');
  const [dailyPagesInput, setDailyPagesInput] = useState<number | ''>('');
  const [endDateInput, setEndDateInput] = useState('');
  const [showCheckboxes, setShowCheckboxes] = useState(false);
  
  const [plan, setPlan] = useState<ReadingPlan | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const tableRef = useRef<HTMLDivElement>(null);

  const calculatePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookTitle || !totalPages || !startDate) return;

    let totalDays = 0;
    let dailyPages = 0;
    const start = new Date(startDate);
    const total = Number(totalPages);

    if (calculationMode === 'pages') {
      if (!dailyPagesInput) return;
      dailyPages = Number(dailyPagesInput);
      totalDays = Math.ceil(total / dailyPages);
    } else {
      if (!endDateInput) return;
      const end = new Date(endDateInput);
      totalDays = getDaysDifference(start, end);
      if (totalDays <= 0) {
        alert("Bitiş tarihi başlangıç tarihinden sonra olmalıdır.");
        return;
      }
      dailyPages = Math.ceil(total / totalDays);
    }

    const days: ReadingDay[] = [];
    let currentPage = 1;

    for (let i = 0; i < totalDays; i++) {
      const remainingPages = total - currentPage + 1;
      if (remainingPages <= 0) break;

      const currentDailyTarget = Math.min(dailyPages, remainingPages);
      const endPage = currentPage + currentDailyTarget - 1;
      
      days.push({
        dayNumber: i + 1,
        date: formatDate(addDays(start, i)),
        startPage: currentPage,
        endPage: endPage,
        dailyPages: currentDailyTarget
      });
      
      currentPage = endPage + 1;
    }

    const lastDayDate = days.length > 0 ? days[days.length - 1].date : formatDate(start);

    setPlan({
      bookTitle: toTitleCase(bookTitle),
      totalPages: total,
      startDate: formatDate(start),
      dailyPages: dailyPages,
      totalDays: days.length,
      endDate: lastDayDate,
      days: days
    });
  };

  const exportAsImage = async () => {
    if (!tableRef.current) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(tableRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true
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
        useCORS: true
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? 'l' : 'p',
        unit: 'px',
        format: [canvas.width, canvas.height]
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
  const chunkedDays: ReadingDay[][] = plan ? chunkArray<ReadingDay>(plan.days, Math.ceil(plan.days.length / colsCount)) : [];

  const getGridColsClass = (count: number) => {
    switch(count) {
      case 2: return 'md:grid-cols-2';
      case 3: return 'md:grid-cols-3';
      case 4: return 'md:grid-cols-4';
      case 5: return 'md:grid-cols-5';
      default: return 'grid-cols-1';
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col items-center bg-[#fcfdfe]">
      <header className="w-full max-w-[1600px] mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-3">
          Kitap Okuma <span className="text-indigo-600">Takvimi</span>
        </h1>
        <p className="text-slate-500 text-lg font-medium">Hedeflerini belirle, okuma yolculuğunu planla.</p>
      </header>

      <main className="w-full max-w-[1600px] space-y-12">
        <section className="bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] p-6 md:p-12 border border-slate-100 no-print max-w-6xl mx-auto relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <BookOpen size={120} />
          </div>
          
          <form onSubmit={calculatePlan} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-6 relative z-10">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 px-1">
                <BookOpen size={14} className="text-indigo-500" /> Kitap Adı
              </label>
              <input
                type="text"
                required
                placeholder="Örn: Sefiller"
                className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-slate-700 font-medium placeholder:text-slate-300"
                value={bookTitle}
                onChange={(e) => setBookTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 px-1">
                <Layers size={14} className="text-indigo-500" /> Toplam Sayfa
              </label>
              <input
                type="number"
                required
                min="1"
                placeholder="Örn: 350"
                className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-slate-700 font-medium placeholder:text-slate-300"
                value={totalPages}
                onChange={(e) => setTotalPages(e.target.value === '' ? '' : Number(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 px-1">
                <Calendar size={14} className="text-indigo-500" /> Başlangıç Tarihi
              </label>
              <div className="relative group">
                <input
                  type="date"
                  required
                  className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-slate-700 font-medium appearance-none block relative z-10 [&::-webkit-calendar-picker-indicator]:opacity-100 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert-[0.3]"
                  style={{ colorScheme: 'light' }}
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 px-1">
                <RefreshCw size={14} className="text-indigo-500" /> Hesaplama Modu
              </label>
              <div className="relative">
                <select
                  className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-slate-700 font-bold appearance-none cursor-pointer"
                  value={calculationMode}
                  onChange={(e) => setCalculationMode(e.target.value as CalculationMode)}
                >
                  <option value="pages">Günlük Sayfa Sayısı</option>
                  <option value="date">Bitiş Tarihi</option>
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <ChevronDown size={18} />
                </div>
              </div>
            </div>

            {calculationMode === 'pages' ? (
              <div className="space-y-2 md:col-span-1 lg:col-span-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Günde Kaç Sayfa?</label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="Örn: 20"
                  className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-slate-700 font-medium placeholder:text-slate-300"
                  value={dailyPagesInput}
                  onChange={(e) => setDailyPagesInput(e.target.value === '' ? '' : Number(e.target.value))}
                />
              </div>
            ) : (
              <div className="space-y-2 md:col-span-1 lg:col-span-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1 flex items-center gap-2">
                   Ne Zaman Bitmeli?
                </label>
                <div className="relative group">
                  <input
                    type="date"
                    required
                    className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-slate-700 font-medium block relative z-10 [&::-webkit-calendar-picker-indicator]:opacity-100 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert-[0.3]"
                    style={{ colorScheme: 'light' }}
                    value={endDateInput}
                    onChange={(e) => setEndDateInput(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2 md:col-span-1 lg:col-span-2 flex items-center h-full pt-4 lg:pt-6">
              <label className="flex items-center gap-4 cursor-pointer group bg-slate-50/50 p-3 pr-6 rounded-2xl border border-slate-50 hover:bg-slate-50 hover:border-slate-100 transition-all w-full md:w-auto">
                <div className="relative">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={showCheckboxes}
                    onChange={(e) => setShowCheckboxes(e.target.checked)}
                  />
                  <div className={`w-14 h-7 rounded-full transition-all duration-300 ${showCheckboxes ? 'bg-indigo-600 shadow-[0_0_15px_rgba(79,70,229,0.3)]' : 'bg-slate-200'}`}></div>
                  <div className={`absolute left-1 top-1 w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-300 transform ${showCheckboxes ? 'translate-x-7' : 'translate-x-0'}`}></div>
                </div>
                <span className={`text-sm font-bold transition-colors ${showCheckboxes ? 'text-indigo-600' : 'text-slate-500'}`}>
                   Kutucukları Göster
                </span>
              </label>
            </div>

            <div className="md:col-span-2 lg:col-span-4 pt-4">
              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg py-5 rounded-[1.25rem] shadow-[0_15px_30px_rgba(79,70,229,0.2)] hover:shadow-[0_20px_40px_rgba(79,70,229,0.3)] transform transition-all active:scale-[0.98] flex items-center justify-center gap-3"
              >
                Planı Oluştur
              </button>
            </div>
          </form>
        </section>

        {plan && (
          <div className="space-y-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-end no-print px-4 gap-4 max-w-6xl mx-auto">
              <div>
                <h2 className="text-2xl font-black text-slate-800">Hazırlanan Plan</h2>
                <p className="text-slate-400 text-sm font-medium">Bu planı PDF veya Resim olarak indirebilirsin.</p>
              </div>
              <div className="flex flex-wrap gap-3 w-full sm:w-auto">
                <button
                  onClick={exportAsPDF}
                  disabled={isExportingPDF || isExporting}
                  className="flex items-center gap-3 px-6 py-4 bg-rose-500 hover:bg-rose-600 disabled:bg-slate-400 text-white font-bold rounded-2xl shadow-[0_10px_20px_rgba(244,63,94,0.2)] hover:shadow-[0_15px_30px_rgba(244,63,94,0.3)] transition-all flex-1 sm:flex-none justify-center group active:scale-95"
                >
                  <FileText size={20} className="group-hover:scale-110 transition-transform" />
                  {isExportingPDF ? 'Hazırlanıyor...' : 'PDF İndir'}
                </button>
                <button
                  onClick={exportAsImage}
                  disabled={isExporting || isExportingPDF}
                  className="flex items-center gap-3 px-6 py-4 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-400 text-white font-bold rounded-2xl shadow-[0_10px_20px_rgba(16,185,129,0.2)] hover:shadow-[0_15px_30px_rgba(16,185,129,0.3)] transition-all flex-1 sm:flex-none justify-center group active:scale-95"
                >
                  <Download size={20} className="group-hover:translate-y-0.5 transition-transform" />
                  {isExporting ? 'Hazırlanıyor...' : 'Resim İndir'}
                </button>
              </div>
            </div>

            <div 
              ref={tableRef} 
              className="bg-white rounded-[3rem] shadow-[0_40px_100px_rgba(0,0,0,0.06)] p-6 md:p-14 border border-slate-100 overflow-hidden w-full mx-auto"
            >
              <div className="flex flex-col lg:flex-row items-center justify-between mb-12 gap-10 pb-10 border-b border-slate-50">
                <div className="text-center lg:text-left">
                  <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-[0.2em] rounded-full mb-3">Okuma Listesi</span>
                  <h3 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 leading-tight tracking-tight">{plan.bookTitle}</h3>
                  <div className="flex flex-wrap justify-center lg:justify-start gap-x-8 gap-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-slate-200"></div>
                      <p className="text-slate-400 font-semibold text-xs">Başlangıç: <span className="text-slate-600">{plan.startDate}</span></p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-indigo-400"></div>
                      <p className="text-indigo-500 font-bold text-xs uppercase tracking-wider">Hedef Bitiş: <span>{plan.endDate}</span></p>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-4 md:gap-8 bg-[#fbfcfd] px-8 md:px-14 py-6 md:py-8 rounded-[2rem] w-full lg:w-auto border border-slate-50 shadow-sm">
                  <div className="text-center">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2">Sayfa</p>
                    <p className="text-2xl md:text-3xl font-black text-slate-900">{plan.totalPages}</p>
                  </div>
                  <div className="w-px bg-slate-100"></div>
                  <div className="text-center">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2">Süre</p>
                    <p className="text-2xl md:text-3xl font-black text-slate-900">{plan.totalDays}<span className="text-sm ml-0.5"> Gün</span></p>
                  </div>
                  <div className="w-px bg-slate-100"></div>
                  <div className="text-center">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2">Günlük</p>
                    <p className="text-2xl md:text-3xl font-black text-slate-900">{plan.dailyPages}</p>
                  </div>
                </div>
              </div>

              <div className={`grid grid-cols-1 ${getGridColsClass(colsCount)} gap-8 items-start`}>
                {chunkedDays.map((chunk, chunkIdx) => (
                  <div key={chunkIdx} className="border border-slate-50 rounded-[1.5rem] overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.01)] bg-white h-full relative">
                    <table className="w-full text-left table-fixed">
                      <thead className="bg-[#fcfdfe] text-slate-400 font-black uppercase text-[10px] tracking-widest border-b border-slate-50">
                        <tr>
                          {showCheckboxes && <th className="px-2 py-5 text-center w-8">OKU</th>}
                          <th className="px-2 py-5 text-center w-12">GÜN</th>
                          <th className="px-2 py-5 w-24">TARİH</th>
                          <th className="px-2 py-5 text-right w-20">ARALIK</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50/50">
                        {chunk.map((day: ReadingDay, index: number) => (
                          <tr key={day.dayNumber} className="hover:bg-indigo-50/10 transition-colors group relative">
                            {showCheckboxes && (
                              <td className="px-2 py-4 text-center align-middle">
                                <div className="w-5 h-5 border-2 border-slate-200 rounded-lg mx-auto group-hover:border-indigo-200 transition-all shadow-inner"></div>
                              </td>
                            )}
                            <td className="px-2 py-4 text-center relative align-middle">
                              {/* Zinciri Kırma Line - Unified connection logic */}
                              {index < chunk.length - 1 && (
                                <div className="absolute left-1/2 top-1/2 bottom-0 w-0.5 bg-indigo-100 -translate-x-1/2 z-0"></div>
                              )}
                              {index > 0 && (
                                <div className="absolute left-1/2 top-0 h-1/2 w-0.5 bg-indigo-100 -translate-x-1/2 z-0"></div>
                              )}
                              
                              <div className="relative z-10 flex items-center justify-center">
                                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 text-[11px] font-black shadow-sm group-hover:bg-indigo-100 transition-colors leading-none">
                                  {day.dayNumber}
                                </span>
                              </div>
                            </td>
                            <td className="px-2 py-4 text-slate-600 font-semibold text-[10px] leading-tight truncate align-middle">
                              {day.date.replace(' Pazartesi', ' Pzt').replace(' Salı', ' Sal').replace(' Çarşamba', ' Çar').replace(' Perşembe', ' Per').replace(' Cuma', ' Cum').replace(' Cumartesi', ' Cmt').replace(' Pazar', ' Paz')}
                            </td>
                            <td className="px-2 py-4 text-right font-mono font-bold text-slate-800 text-[11px] tracking-tight align-middle">
                              {day.startPage}—{day.endPage}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
              
              <div className="mt-16 pt-8 border-t border-slate-50 flex items-center justify-between">
                <div className="text-slate-300 text-[9px] font-black uppercase tracking-[0.5em]">
                  İstikrar Başarının Anahtarıdır
                </div>
                <div className="text-indigo-100">
                  <BookOpen size={24} />
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="mt-24 mb-12 text-slate-400 text-xs font-bold uppercase tracking-widest no-print text-center">
        <p>&copy; {new Date().getFullYear()} Okuma Takvimi • Tasarım ve Verimlilik</p>
      </footer>
    </div>
  );
};

export default App;
