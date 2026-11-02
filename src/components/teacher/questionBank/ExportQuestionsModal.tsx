import React, { useState } from 'react';
import {
  X,
  Download,
  Printer,
  FileSpreadsheet,
  FileText,
  FileCheck2,
  Check,
  Settings2,
  Sparkles,
} from 'lucide-react';
import { BankQuestion, QuestionExportOptions } from '../../../types/questionBank';

interface ExportQuestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  questions: BankQuestion[];
  selectedIds: string[];
}

export const ExportQuestionsModal: React.FC<ExportQuestionsModalProps> = ({
  isOpen,
  onClose,
  questions,
  selectedIds,
}) => {
  const [scope, setScope] = useState<'SELECTED_ONLY' | 'ALL_FILTERED'>(
    selectedIds.length > 0 ? 'SELECTED_ONLY' : 'ALL_FILTERED'
  );
  const [format, setFormat] = useState<'DOCX' | 'XLSX' | 'PDF' | 'JSON'>('DOCX');
  const [includeAnswers, setIncludeAnswers] = useState<boolean>(true);
  const [includeExplanations, setIncludeExplanations] = useState<boolean>(true);
  const [answersAtEnd, setAnswersAtEnd] = useState<boolean>(false);
  const [schoolName, setSchoolName] = useState<string>('TRƯỜNG THPT CHUYÊN HÀ NỘI - AMSTERDAM');
  const [examTitle, setExamTitle] = useState<string>('ĐỀ KIỂM TRA ĐÁNH GIÁ CHẤT LƯỢNG HỌC KỲ');
  const [examDuration, setExamDuration] = useState<string>('45 phút');

  if (!isOpen) return null;

  const targetQuestions =
    scope === 'SELECTED_ONLY' && selectedIds.length > 0
      ? questions.filter((q) => selectedIds.includes(q.id))
      : questions;

  const handleExport = () => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

    if (format === 'JSON') {
      const dataStr = JSON.stringify(targetQuestions, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Ngan_Hang_Cau_Hoi_${timestamp}.json`;
      link.click();
      URL.revokeObjectURL(url);
      onClose();
      return;
    }

    if (format === 'XLSX') {
      let csvContent = 'Mã câu,Môn,Khối,Dạng,Mức độ,Nội dung câu hỏi,Phương án / Chi tiết,Đáp án đúng,Lời giải,Điểm\n';
      targetQuestions.forEach((q) => {
        let optionsStr = '';
        let ansStr = '';
        if (q.options) {
          optionsStr = q.options.map((o) => `${o.label}. ${o.text}`).join(' | ');
          ansStr = q.options.find((o) => o.isCorrect)?.label || '';
        } else if (q.trueFalseItems) {
          optionsStr = q.trueFalseItems.map((tf) => tf.statement).join(' | ');
          ansStr = q.trueFalseItems.map((tf) => (tf.isTrue ? 'Đ' : 'S')).join(', ');
        }
        const cleanStem = `"${(q.stem || '').replace(/"/g, '""')}"`;
        const cleanExp = `"${(q.explanation || '').replace(/"/g, '""')}"`;
        const cleanOpt = `"${optionsStr.replace(/"/g, '""')}"`;
        csvContent += `${q.code},${q.subject},${q.gradeLevel},${q.type},${q.difficulty},${cleanStem},${cleanOpt},"${ansStr}",${cleanExp},${q.points}\n`;
      });

      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Danh_Sach_Cau_Hoi_${timestamp}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      onClose();
      return;
    }

    // DOCX or PDF Print HTML
    let bodyHtml = `
      <div style="font-family: 'Times New Roman', Times, serif; color: #000; line-height: 1.5; padding: 20px;">
        <table style="width: 100%; margin-bottom: 25px; border-bottom: 2px solid #000; padding-bottom: 15px;">
          <tr>
            <td style="width: 50%; vertical-align: top; text-align: center;">
              <div style="font-size: 13px; font-weight: bold; text-transform: uppercase;">SỞ GIÁO DỤC VÀ ĐÀO TẠO</div>
              <div style="font-size: 14px; font-weight: bold; text-transform: uppercase;">${schoolName}</div>
              <div style="margin-top: 5px;">Mã đề: <strong>101</strong></div>
            </td>
            <td style="width: 50%; vertical-align: top; text-align: center;">
              <div style="font-size: 15px; font-weight: bold; text-transform: uppercase;">${examTitle}</div>
              <div style="font-size: 13px; font-style: italic; margin-top: 5px;">Thời gian làm bài: ${examDuration}</div>
              <div style="font-size: 12px; margin-top: 5px;">(Đề thi gồm ${targetQuestions.length} câu)</div>
            </td>
          </tr>
        </table>

        <div style="margin-bottom: 20px; font-style: italic; font-size: 13px;">
          Họ và tên thí sinh: .................................................................... Lớp: ................. SBD: .................
        </div>

        <div style="font-size: 14px;">
    `;

    targetQuestions.forEach((q, index) => {
      bodyHtml += `
        <div style="margin-bottom: 20px; page-break-inside: avoid;">
          <div style="font-weight: bold; margin-bottom: 6px;">
            Câu ${index + 1} (${q.points}đ) [${q.code} - ${q.difficulty}]:
            <span style="font-weight: normal;"> ${q.stem}</span>
          </div>
      `;

      if (q.options && q.options.length > 0) {
        bodyHtml += `<div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; margin-left: 20px;">`;
        q.options.forEach((opt) => {
          const isCorrect = opt.isCorrect && includeAnswers && !answersAtEnd;
          bodyHtml += `
            <div style="${isCorrect ? 'font-weight: bold; color: #166534;' : ''}">
              ${opt.label}. ${opt.text} ${isCorrect ? ' (*)' : ''}
            </div>
          `;
        });
        bodyHtml += `</div>`;
      }

      if (q.trueFalseItems && q.trueFalseItems.length > 0) {
        bodyHtml += `<div style="margin-left: 20px; margin-top: 6px;">`;
        q.trueFalseItems.forEach((tf, i) => {
          bodyHtml += `
            <div style="margin-bottom: 4px;">
              ${String.fromCharCode(97 + i)}) ${tf.statement} 
              ${includeAnswers && !answersAtEnd ? `<strong>[${tf.isTrue ? 'Đúng' : 'Sai'}]</strong>` : ''}
            </div>
          `;
        });
        bodyHtml += `</div>`;
      }

      if (includeExplanations && q.explanation) {
        bodyHtml += `
          <div style="margin-top: 6px; margin-left: 20px; font-style: italic; color: #1e3a8a; font-size: 13px; background: #f0fdf4; padding: 6px; border-left: 3px solid #16a34a;">
            <strong>Lời giải:</strong> ${q.explanation}
          </div>
        `;
      }

      bodyHtml += `</div>`;
    });

    if (answersAtEnd && includeAnswers) {
      bodyHtml += `
        <div style="margin-top: 40px; page-break-before: always; border-top: 2px dashed #000; padding-top: 20px;">
          <div style="font-size: 16px; font-weight: bold; text-align: center; margin-bottom: 15px; text-transform: uppercase;">
            BẢNG ĐÁP ÁN VÀ MA TRẬN ĐỀ THI
          </div>
          <table style="width: 100%; border-collapse: collapse; text-align: center; font-size: 13px;">
            <thead>
              <tr style="background: #f1f5f9;">
                <th style="border: 1px solid #000; padding: 6px;">Câu</th>
                <th style="border: 1px solid #000; padding: 6px;">Mã câu</th>
                <th style="border: 1px solid #000; padding: 6px;">Mức độ</th>
                <th style="border: 1px solid #000; padding: 6px;">Đáp án đúng</th>
                <th style="border: 1px solid #000; padding: 6px;">Điểm</th>
              </tr>
            </thead>
            <tbody>
      `;

      targetQuestions.forEach((q, i) => {
        let ans = '';
        if (q.options) ans = q.options.find((o) => o.isCorrect)?.label || '';
        else if (q.trueFalseItems) ans = q.trueFalseItems.map((tf) => (tf.isTrue ? 'Đ' : 'S')).join('-');
        else if (q.shortAnswerConfig) ans = q.shortAnswerConfig.sampleAnswer;
        else ans = 'Theo Rubric';

        bodyHtml += `
          <tr>
            <td style="border: 1px solid #000; padding: 5px;">${i + 1}</td>
            <td style="border: 1px solid #000; padding: 5px; font-family: monospace;">${q.code}</td>
            <td style="border: 1px solid #000; padding: 5px;">${q.difficulty}</td>
            <td style="border: 1px solid #000; padding: 5px; font-weight: bold; color: #166534;">${ans}</td>
            <td style="border: 1px solid #000; padding: 5px;">${q.points}đ</td>
          </tr>
        `;
      });

      bodyHtml += `
            </tbody>
          </table>
        </div>
      `;
    }

    bodyHtml += `</div></div>`;

    if (format === 'PDF') {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>${examTitle} - SmartClass</title>
              <meta charset="utf-8" />
              <style>
                @page { size: A4; margin: 15mm; }
                body { margin: 0; }
              </style>
            </head>
            <body>
              ${bodyHtml}
              <script>
                window.onload = function() {
                  window.print();
                };
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
      }
      onClose();
      return;
    }

    // DOCX download via HTML Doc
    const docBlob = new Blob(
      [
        `<!DOCTYPE html><html><head><meta charset="utf-8"><title>De_Thi</title></head><body>${bodyHtml}</body></html>`,
      ],
      { type: 'application/msword;charset=utf-8' }
    );
    const docUrl = URL.createObjectURL(docBlob);
    const link = document.createElement('a');
    link.href = docUrl;
    link.download = `De_Kiem_Tra_${timestamp}.doc`;
    link.click();
    URL.revokeObjectURL(docUrl);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-[#0b1328] border border-blue-500/40 rounded-3xl max-w-2xl w-full text-slate-100 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-700/80 bg-[#080d1c] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/30 border border-blue-500/50 flex items-center justify-center text-blue-300">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white">Xuất Ngân Hàng Câu Hỏi / Đề Thi</h2>
              <p className="text-xs text-slate-400">
                Xuất file Word (.doc), Excel (.csv/.xlsx), PDF in ấn A4 chuẩn tiếng Việt Unicode
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 space-y-5 text-xs">
          {/* Scope selection */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-300">Phạm vi câu hỏi xuất:</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setScope('SELECTED_ONLY')}
                disabled={selectedIds.length === 0}
                className={`p-3 rounded-xl border text-left cursor-pointer transition-colors ${
                  scope === 'SELECTED_ONLY'
                    ? 'bg-blue-950 border-blue-400 text-blue-200'
                    : 'bg-[#0f1730] border-slate-700 text-slate-400 disabled:opacity-40'
                }`}
              >
                <div className="font-bold">Các câu đã chọn ({selectedIds.length} câu)</div>
                <div className="text-[11px] text-slate-400">Chỉ xuất các câu được tích chọn</div>
              </button>

              <button
                type="button"
                onClick={() => setScope('ALL_FILTERED')}
                className={`p-3 rounded-xl border text-left cursor-pointer transition-colors ${
                  scope === 'ALL_FILTERED'
                    ? 'bg-blue-950 border-blue-400 text-blue-200'
                    : 'bg-[#0f1730] border-slate-700 text-slate-400'
                }`}
              >
                <div className="font-bold">Tất cả câu hỏi hiện tại ({questions.length} câu)</div>
                <div className="text-[11px] text-slate-400">Xuất toàn bộ theo bộ lọc đang mở</div>
              </button>
            </div>
          </div>

          {/* Format selection */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-300">Định dạng tệp:</label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { f: 'DOCX' as const, label: 'Word (.doc)', icon: FileText },
                { f: 'PDF' as const, label: 'PDF In A4', icon: Printer },
                { f: 'XLSX' as const, label: 'Excel (.csv)', icon: FileSpreadsheet },
                { f: 'JSON' as const, label: 'JSON Schema', icon: Download },
              ].map((item) => (
                <button
                  key={item.f}
                  type="button"
                  onClick={() => setFormat(item.f)}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                    format === item.f
                      ? 'bg-blue-600 text-white font-black border-blue-400 shadow-md'
                      : 'bg-[#0f1730] border-slate-700 text-slate-300 hover:text-white'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Options toggles */}
          <div className="p-4 rounded-2xl bg-[#080d1c] border border-slate-700/80 space-y-2.5">
            <div className="font-bold text-white mb-1">Tùy chọn hiển thị nội dung:</div>
            <label className="flex items-center gap-2 cursor-pointer text-slate-200">
              <input
                type="checkbox"
                checked={includeAnswers}
                onChange={(e) => setIncludeAnswers(e.target.checked)}
                className="w-4 h-4 accent-blue-600 rounded"
              />
              <span>Bao gồm đáp án đúng (Bản dành cho giáo viên)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-slate-200">
              <input
                type="checkbox"
                checked={includeExplanations}
                onChange={(e) => setIncludeExplanations(e.target.checked)}
                className="w-4 h-4 accent-blue-600 rounded"
              />
              <span>Bao gồm lời giải chi tiết & hướng dẫn chấm</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-slate-200">
              <input
                type="checkbox"
                checked={answersAtEnd}
                onChange={(e) => setAnswersAtEnd(e.target.checked)}
                className="w-4 h-4 accent-blue-600 rounded"
              />
              <span>Tách bảng đáp án ra trang cuối (Phiếu soi đáp án)</span>
            </label>
          </div>

          {/* Header Metadata for Word/PDF */}
          {(format === 'DOCX' || format === 'PDF') && (
            <div className="space-y-3">
              <div className="font-bold text-slate-300">Thông tin tiêu đề đề thi:</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Tên trường..."
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  className="bg-[#0f1730] border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white outline-none font-bold"
                />
                <input
                  type="text"
                  placeholder="Tiêu đề kỳ thi..."
                  value={examTitle}
                  onChange={(e) => setExamTitle(e.target.value)}
                  className="bg-[#0f1730] border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white outline-none font-bold"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-700/80 bg-[#080d1c] flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white cursor-pointer"
          >
            Hủy bỏ
          </button>

          <button
            type="button"
            onClick={handleExport}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs rounded-xl shadow-lg shadow-blue-600/30 cursor-pointer transition-all active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Tải tệp ({targetQuestions.length} câu hỏi)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
