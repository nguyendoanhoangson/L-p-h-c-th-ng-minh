import React, { useState } from 'react';
import {
  X,
  Upload,
  Download,
  FileSpreadsheet,
  FileText,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Copy,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Layers,
  Sparkles,
} from 'lucide-react';
import { BankQuestion, QuestionType, DifficultyLevel } from '../../../types/questionBank';

interface ImportQuestionsWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportCompleted: (importedQuestions: BankQuestion[]) => void;
  existingQuestions: BankQuestion[];
}

interface ParsedRow {
  rowNum: number;
  code: string;
  type: QuestionType;
  stem: string;
  difficulty: DifficultyLevel;
  subject: string;
  gradeLevel: number;
  correctAnswer: string;
  explanation: string;
  status: 'VALID' | 'WARNING' | 'ERROR' | 'DUPLICATE';
  issueMessage?: string;
  duplicateWith?: BankQuestion;
}

export const ImportQuestionsWizardModal: React.FC<ImportQuestionsWizardModalProps> = ({
  isOpen,
  onClose,
  onImportCompleted,
  existingQuestions,
}) => {
  const [step, setStep] = useState<number>(1); // 1: Upload & Template -> 2: Preview & Validate -> 3: Trùng lặp & Lưu
  const [selectedFormat, setSelectedFormat] = useState<'EXCEL' | 'WORD' | 'JSON'>('EXCEL');
  const [fileName, setFileName] = useState<string | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [duplicateAction, setDuplicateAction] = useState<'SKIP' | 'CREATE_NEW' | 'UPDATE'>('SKIP');

  if (!isOpen) return null;

  // Download template function
  const handleDownloadTemplate = (format: 'EXCEL' | 'WORD' | 'JSON') => {
    let content = '';
    let filename = '';
    let mime = '';

    if (format === 'EXCEL') {
      content = `Mã câu hỏi,Môn học,Khối,Mức độ,Dạng câu hỏi,Nội dung câu hỏi,Phương án A,Phương án B,Phương án C,Phương án D,Đáp án đúng,Lời giải chi tiết
TOAN10-NB-101,Toán học,10,Nhận biết,SINGLE_CHOICE,"Tập hợp số tự nhiên kí hiệu là gì?","A. N","B. Z","C. Q","D. R",A,"Tập hợp các số tự nhiên là N."
TOAN10-TH-102,Toán học,10,Thông hiểu,SINGLE_CHOICE,"Phương trình x^2 - 4 = 0 có tập nghiệm là:","A. {-2; 2}","B. {2}","C. {-2}","D. Vô nghiệm",A,"x^2 = 4 <=> x = 2 hoặc x = -2."
VAN10-TH-103,Ngữ văn,10,Thông hiểu,ESSAY,"Nêu tác dụng của biện pháp tu từ so sánh trong câu văn sau...","","","","","Tự luận","Biện pháp so sánh giúp hình ảnh sống động..."`;
      filename = 'Template_Ngan_Hang_Cau_Hoi_SmartClass.csv';
      mime = 'text/csv;charset=utf-8;';
    } else if (format === 'WORD') {
      content = `BẢN MẪU SOẠN THẢO CÂU HỎI SMART CLASS (WORD STANDARD)
[Câu 1]
Môn: Toán học | Khối: 10 | Mức độ: Nhận biết | Dạng: Một đáp án
Nội dung: Mệnh đề phủ định của mệnh đề "Mọi học sinh đều thích học Toán" là:
A. Có ít nhất một học sinh không thích học Toán (*)
B. Mọi học sinh đều không thích học Toán
C. Không có học sinh nào thích học Toán
D. Tất cả học sinh đều thích học Văn
Đáp án: A
Lời giải: Phủ định của "Mọi" là "Tồn tại ít nhất một" và phủ định của "thích" là "không thích".

[Câu 2]
Môn: Vật lý | Khối: 10 | Mức độ: Thông hiểu | Dạng: Trả lời ngắn
Nội dung: Một vật rơi tự do từ độ cao 20m xuống đất, lấy g = 10 m/s^2. Vận tốc khi chạm đất là bao nhiêu m/s?
Đáp án: 20
Lời giải: Áp dụng công thức v = sqrt(2gh) = sqrt(2 * 10 * 20) = 20 m/s.`;
      filename = 'Template_Soan_Cau_Hoi_Word_Chuan.txt';
      mime = 'text/plain;charset=utf-8;';
    } else {
      const sampleJson = [
        {
          code: 'TOAN10-NB-JSON01',
          subject: 'Toán học',
          gradeLevel: 10,
          difficulty: 'Nhận biết',
          type: 'SINGLE_CHOICE',
          stem: 'Nghiệm của phương trình 2x - 6 = 0 là:',
          options: [
            { label: 'A', text: 'x = 3', isCorrect: true },
            { label: 'B', text: 'x = -3', isCorrect: false },
            { label: 'C', text: 'x = 6', isCorrect: false },
            { label: 'D', text: 'x = 0', isCorrect: false },
          ],
          explanation: '2x = 6 <=> x = 3.',
        },
      ];
      content = JSON.stringify(sampleJson, null, 2);
      filename = 'Template_Question_Bank_Schema.json';
      mime = 'application/json;charset=utf-8;';
    }

    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Simulate file parse
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    // Simulate parsing into 4 rows with validation and duplicate detection
    setTimeout(() => {
      const mockParsed: ParsedRow[] = [
        {
          rowNum: 1,
          code: 'TOAN10-NB-IMP01',
          type: 'SINGLE_CHOICE',
          stem: 'Phương trình bậc nhất một ẩn ax + b = 0 (a ≠ 0) có bao nhiêu nghiệm?',
          difficulty: 'Nhận biết',
          subject: 'Toán học',
          gradeLevel: 10,
          correctAnswer: 'A. Có nghiệm duy nhất x = -b/a',
          explanation: 'Phương trình bậc nhất ax + b = 0 với a ≠ 0 luôn có nghiệm duy nhất x = -b/a.',
          status: 'VALID',
        },
        {
          rowNum: 2,
          code: 'LY10-TH-IMP02',
          type: 'MULTIPLE_CHOICE',
          stem: 'Chuyển động rơi tự do có những đặc điểm nào sau đây?',
          difficulty: 'Thông hiểu',
          subject: 'Vật lý',
          gradeLevel: 10,
          correctAnswer: 'A, C',
          explanation: 'Rơi tự do là chuyển động thẳng nhanh dần đều theo phương thẳng đứng chiều từ trên xuống.',
          status: 'VALID',
        },
        {
          rowNum: 3,
          code: 'TOAN10-NB-001', // TRÙNG MÃ VÀ NỘI DUNG VỚI CÂU ĐÃ CÓ
          type: 'SINGLE_CHOICE',
          stem: 'Cho mệnh đề P: "Với mọi số thực x, x² + 1 > 0". Mệnh đề phủ định của P là:',
          difficulty: 'Nhận biết',
          subject: 'Toán học',
          gradeLevel: 10,
          correctAnswer: 'A',
          explanation: 'Phủ định lượng từ',
          status: 'DUPLICATE',
          issueMessage: 'Trùng mã hoặc nội dung với câu TOAN10-NB-001 đã có trong ngân hàng',
          duplicateWith: existingQuestions[0],
        },
        {
          rowNum: 4,
          code: 'HOA10-ERR-004',
          type: 'SINGLE_CHOICE',
          stem: 'Cấu hình electron nào sau đây là của khí hiếm?',
          difficulty: 'Nhận biết',
          subject: 'Hóa học',
          gradeLevel: 10,
          correctAnswer: '',
          explanation: '',
          status: 'ERROR',
          issueMessage: 'Thiếu đáp án đúng hoặc lời giải',
        },
      ];

      setParsedRows(mockParsed);
      setStep(2);
    }, 400);
  };

  // Confirm import
  const handleConfirmImport = () => {
    const now = new Date().toISOString();
    const toImport: BankQuestion[] = [];

    parsedRows.forEach((row) => {
      if (row.status === 'ERROR') return; // Không nhập câu lỗi

      if (row.status === 'DUPLICATE') {
        if (duplicateAction === 'SKIP') return;
        if (duplicateAction === 'UPDATE' && row.duplicateWith) {
          // handled in update
          return;
        }
      }

      // Valid or create new version
      toImport.push({
        id: `qb-imp-${Date.now()}-${row.rowNum}`,
        code: row.status === 'DUPLICATE' ? `${row.code}-V2` : row.code,
        type: row.type,
        stem: row.stem,
        difficulty: row.difficulty,
        gradeLevel: row.gradeLevel,
        subject: row.subject,
        tags: ['import', row.subject.toLowerCase()],
        points: 0.25,
        options: [
          { id: 'opt-1', label: 'A', text: row.correctAnswer, isCorrect: true },
          { id: 'opt-2', label: 'B', text: 'Phương án B mẫu', isCorrect: false },
          { id: 'opt-3', label: 'C', text: 'Phương án C mẫu', isCorrect: false },
          { id: 'opt-4', label: 'D', text: 'Phương án D mẫu', isCorrect: false },
        ],
        explanation: row.explanation,
        status: 'APPROVED',
        sourceType: selectedFormat === 'EXCEL' ? 'IMPORT_EXCEL' : selectedFormat === 'WORD' ? 'IMPORT_WORD' : 'IMPORT_JSON',
        sourceRef: `File: ${fileName}`,
        authorId: 'tch-01',
        authorName: 'Thầy Nguyễn Văn Hùng',
        version: 1,
        revisions: [],
        usageCount: 0,
        createdAt: now,
        updatedAt: now,
      });
    });

    onImportCompleted(toImport);
    onClose();
  };

  const validCount = parsedRows.filter((r) => r.status === 'VALID').length;
  const duplicateCount = parsedRows.filter((r) => r.status === 'DUPLICATE').length;
  const errorCount = parsedRows.filter((r) => r.status === 'ERROR').length;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-[#0b1328] border border-emerald-500/40 rounded-3xl max-w-4xl w-full text-slate-100 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in-95">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-700/80 bg-[#080d1c] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600/30 border border-emerald-500/50 flex items-center justify-center text-emerald-300">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span>Nhập Dữ Liệu Câu Hỏi Từ File (Excel, Word, JSON)</span>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/50">
                  Chuẩn Hóa Thông Minh
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Tự động ánh xạ cột, kiểm tra cú pháp, phát hiện trùng lặp và phân loại lỗi chi tiết
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

        {/* Step Indicator */}
        <div className="px-5 py-3 border-b border-slate-800 bg-[#070b18] flex items-center justify-between text-xs">
          {[
            { num: 1, title: '1. Chọn mẫu & Tải file' },
            { num: 2, title: '2. Preview & Thẩm định lỗi' },
            { num: 3, title: '3. Xử lý trùng & Hoàn tất' },
          ].map((s) => (
            <div
              key={s.num}
              className={`font-bold ${
                step === s.num
                  ? 'text-emerald-300'
                  : step > s.num
                  ? 'text-emerald-400'
                  : 'text-slate-500'
              }`}
            >
              {s.title}
            </div>
          ))}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* STEP 1: DOWNLOAD TEMPLATE & UPLOAD */}
          {step === 1 && (
            <div className="space-y-5">
              {/* Template Download Section */}
              <div className="p-4 rounded-2xl bg-[#090f20] border border-slate-700/80 space-y-3">
                <div className="text-xs font-black uppercase text-slate-300 tracking-wider flex items-center justify-between">
                  <span>Bước 1: Tải file mẫu chuẩn (Template):</span>
                  <span className="text-[11px] text-emerald-400 font-normal">Hỗ trợ đầy đủ tiếng Việt Unicode</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => handleDownloadTemplate('EXCEL')}
                    className="p-3 bg-[#0f1730] hover:bg-[#14234b] border border-emerald-500/40 rounded-xl text-left transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs mb-1">
                      <FileSpreadsheet className="w-4 h-4" />
                      <span>Template Excel (.CSV / .XLSX)</span>
                    </div>
                    <p className="text-[11px] text-slate-400 group-hover:text-slate-300">
                      Cấu trúc hàng cột rõ ràng, sheet câu hỏi và đáp án
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDownloadTemplate('WORD')}
                    className="p-3 bg-[#0f1730] hover:bg-[#14234b] border border-blue-500/40 rounded-xl text-left transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-2 text-blue-300 font-bold text-xs mb-1">
                      <FileText className="w-4 h-4" />
                      <span>Template Word (.DOCX / .TXT)</span>
                    </div>
                    <p className="text-[11px] text-slate-400 group-hover:text-slate-300">
                      Quy ước [Câu 1], A/B/C/D, Đáp án, Lời giải
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDownloadTemplate('JSON')}
                    className="p-3 bg-[#0f1730] hover:bg-[#14234b] border border-purple-500/40 rounded-xl text-left transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-2 text-purple-300 font-bold text-xs mb-1">
                      <Copy className="w-4 h-4" />
                      <span>Template JSON Schema</span>
                    </div>
                    <p className="text-[11px] text-slate-400 group-hover:text-slate-300">
                      Dành cho IT & nhập dữ liệu số lượng lớn
                    </p>
                  </button>
                </div>
              </div>

              {/* Upload Dropzone */}
              <div className="border-2 border-dashed border-emerald-500/40 rounded-3xl p-8 text-center bg-[#080e1e] space-y-3">
                <Upload className="w-10 h-10 text-emerald-400 mx-auto" />
                <div>
                  <h3 className="text-sm font-black text-white">Bước 2: Tải lên file câu hỏi của bạn</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Kéo thả file vào đây hoặc bấm nút để chọn (Hỗ trợ .csv, .xlsx, .docx, .txt, .json)
                  </p>
                </div>

                <input
                  type="file"
                  accept=".csv,.xlsx,.xls,.docx,.doc,.txt,.json"
                  onChange={handleFileChange}
                  className="hidden"
                  id="bank-import-file"
                />
                <label
                  htmlFor="bank-import-file"
                  className="inline-block px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-lg shadow-emerald-600/30 cursor-pointer transition-all active:scale-95"
                >
                  {fileName ? `Đang tải: ${fileName}` : 'Chọn file từ máy tính'}
                </label>
              </div>
            </div>
          )}

          {/* STEP 2: PREVIEW & VALIDATION */}
          {step === 2 && (
            <div className="space-y-4">
              {/* Validation Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-2xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-300">
                  <div className="text-[11px] font-bold">Hợp lệ để nhập:</div>
                  <div className="text-xl font-black text-white mt-0.5">{validCount} câu</div>
                </div>
                <div className="p-3 rounded-2xl bg-amber-950/60 border border-amber-500/50 text-amber-300">
                  <div className="text-[11px] font-bold">Phát hiện trùng lặp:</div>
                  <div className="text-xl font-black text-white mt-0.5">{duplicateCount} câu</div>
                </div>
                <div className="p-3 rounded-2xl bg-rose-950/60 border border-rose-500/50 text-rose-300">
                  <div className="text-[11px] font-bold">Lỗi không thể nhập:</div>
                  <div className="text-xl font-black text-white mt-0.5">{errorCount} câu</div>
                </div>
              </div>

              {/* Rows List */}
              <div className="space-y-2.5">
                <div className="text-xs font-black uppercase text-slate-300 tracking-wider">
                  Danh sách kết quả đọc file ({parsedRows.length} dòng):
                </div>
                {parsedRows.map((row) => (
                  <div
                    key={row.rowNum}
                    className={`p-3.5 rounded-2xl border text-xs space-y-1.5 transition-colors ${
                      row.status === 'VALID'
                        ? 'bg-[#0a1224] border-emerald-500/40'
                        : row.status === 'DUPLICATE'
                        ? 'bg-amber-950/30 border-amber-500/60'
                        : 'bg-rose-950/30 border-rose-500/60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-400">Dòng {row.rowNum}</span>
                        <span className="font-mono font-bold text-white">{row.code}</span>
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300">
                          {row.subject} · K{row.gradeLevel}
                        </span>
                      </div>
                      <span
                        className={`text-[11px] font-black px-2 py-0.5 rounded-full ${
                          row.status === 'VALID'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-500'
                            : row.status === 'DUPLICATE'
                            ? 'bg-amber-950 text-amber-300 border border-amber-500'
                            : 'bg-rose-950 text-rose-300 border border-rose-500'
                        }`}
                      >
                        {row.status === 'VALID' && '✓ HỢP LỆ'}
                        {row.status === 'DUPLICATE' && '⚠ TRÙNG LẶP'}
                        {row.status === 'ERROR' && '✗ LỖI DỮ LIỆU'}
                      </span>
                    </div>

                    <div className="text-white font-medium line-clamp-2">{row.stem}</div>

                    {row.issueMessage && (
                      <div className="text-[11px] font-bold text-amber-300 flex items-center gap-1 mt-1">
                        <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>{row.issueMessage}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: DUPLICATE RESOLUTION */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/50 space-y-2 text-xs">
                <div className="font-bold text-amber-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Xử lý các câu hỏi bị trùng lặp ({duplicateCount} câu):
                </div>
                <p className="text-slate-300 leading-relaxed">
                  Hệ thống phát hiện một số câu hỏi có mã hoặc nội dung tương đồng với câu hỏi đã có sẵn. Hãy chọn phương án xử lý mong muốn:
                </p>
              </div>

              <div className="space-y-2">
                {[
                  {
                    action: 'SKIP' as const,
                    title: '1. Bỏ qua các câu bị trùng (Khuyên dùng)',
                    desc: 'Chỉ nhập những câu hỏi hoàn toàn mới, giữ nguyên câu hỏi cũ trong ngân hàng.',
                  },
                  {
                    action: 'CREATE_NEW' as const,
                    title: '2. Nhập thành bản mới (Tạo mã hậu tố -V2)',
                    desc: 'Lưu cả câu cũ và câu mới, tự động đánh số phiên bản riêng biệt.',
                  },
                  {
                    action: 'UPDATE' as const,
                    title: '3. Ghi đè / Cập nhật nội dung câu cũ',
                    desc: 'Thay thế nội dung câu cũ bằng nội dung mới và tăng số phiên bản (revision).',
                  },
                ].map((opt) => (
                  <button
                    key={opt.action}
                    type="button"
                    onClick={() => setDuplicateAction(opt.action)}
                    className={`w-full p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                      duplicateAction === opt.action
                        ? 'bg-emerald-950/70 border-emerald-400 ring-1 ring-emerald-400'
                        : 'bg-[#0f1730] border-slate-700 text-slate-300 hover:bg-[#142247]'
                    }`}
                  >
                    <div className="font-black text-xs text-white">{opt.title}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="p-4 sm:p-5 border-t border-slate-700/80 bg-[#080d1c] flex items-center justify-between">
          {step > 1 && (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:bg-slate-800 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Quay lại</span>
            </button>
          )}

          {step === 1 && (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white cursor-pointer"
            >
              Hủy bỏ
            </button>
          )}

          {step === 2 && (
            <button
              type="button"
              onClick={() => (duplicateCount > 0 ? setStep(3) : handleConfirmImport())}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-lg shadow-emerald-600/30 cursor-pointer"
            >
              <span>{duplicateCount > 0 ? 'Tiếp tục: Xử lý trùng lặp' : `Xác nhận nhập ${validCount} câu`}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {step === 3 && (
            <button
              type="button"
              onClick={handleConfirmImport}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-lg shadow-emerald-600/30 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Xác nhận nhập dữ liệu vào ngân hàng</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
