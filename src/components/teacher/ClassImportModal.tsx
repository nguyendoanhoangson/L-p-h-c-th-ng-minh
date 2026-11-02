import React, { useState } from 'react';
import {
  X,
  FileSpreadsheet,
  Download,
  Upload,
  CheckCircle2,
  AlertCircle,
  School,
  FileText,
  Sparkles,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { Classroom } from '../../types';
import { storageService } from '../../services/storageService';
import { useNotification } from '../../contexts/NotificationContext';

interface ClassImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImported: () => void;
}

const PRESET_COLORS = [
  '#06B6D4', // Cyan
  '#3B82F6', // Blue
  '#10B981', // Emerald
  '#8B5CF6', // Purple
  '#F59E0B', // Amber
  '#EC4899', // Pink
  '#14B8A6', // Teal
  '#6366F1', // Indigo
];

export const ClassImportModal: React.FC<ClassImportModalProps> = ({
  isOpen,
  onClose,
  onImported,
}) => {
  const { success, warning, error } = useNotification();
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [fileName, setFileName] = useState<string>('');
  const [pasteContent, setPasteContent] = useState<string>('');
  const [parsedClasses, setParsedClasses] = useState<Classroom[]>([]);
  const [step, setStep] = useState<1 | 2>(1);

  if (!isOpen) return null;

  // Download Sample CSV template
  const handleDownloadSample = () => {
    const csvContent =
      '\uFEFF' +
      'Tên lớp,Khối,Phòng học,Sĩ số tối đa,Môn học,Giáo viên phụ trách\n' +
      'Lớp 10A1,10,Phòng A.201,40,Toán học & Tin học,Thầy Nguyễn Văn Hùng\n' +
      'Lớp 10A2,10,Phòng A.202,42,Ngữ Văn & KHXH,Cô Lê Thị Mai\n' +
      'Lớp 11B1,11,Phòng B.301,38,Vật lý & KHTN,Thầy Trần Minh Tuấn\n' +
      'Lớp 11B2,11,Phòng B.302,40,Hóa học & Sinh học,Cô Phạm Thu Hà\n' +
      'Lớp 12C1,12,Phòng C.401,36,Toán - Lý - Anh,Thầy Hoàng Quốc Bảo\n';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'mau_danh_sach_lop_hoc.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    success('Đã tải xuống file mẫu danh sách lớp học!');
  };

  // Helper to parse rows of text (CSV, TSV, or comma/tab separated)
  const parseLinesToClasses = (text: string): Classroom[] => {
    const lines = text
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    const results: Classroom[] = [];
    const currentAcademicYear = storageService.getAcademicYear() || '2024 - 2025';

    lines.forEach((line, idx) => {
      // Skip header if detected
      if (
        idx === 0 &&
        (line.toLowerCase().includes('tên lớp') ||
          line.toLowerCase().includes('khoi') ||
          line.toLowerCase().includes('khối'))
      ) {
        return;
      }

      // Split by comma, tab, or semicolon
      let parts = line.split(/[,\t;|]/).map((p) => p.trim());
      if (parts.length === 1 && line.includes(',')) {
        parts = line.split(',').map((p) => p.trim());
      }

      if (parts.length >= 1 && parts[0]) {
        const rawName = parts[0];
        // Guess grade from name (e.g. "10A1" -> 10, "Lớp 7A3" -> 7, "Khối 12" -> 12)
        let gradeLevel = 10;
        const gradeMatch = rawName.match(/\b(1[0-2]|[1-9])\b/);
        if (parts[1] && !isNaN(Number(parts[1]))) {
          gradeLevel = Math.max(1, Math.min(12, Number(parts[1])));
        } else if (gradeMatch) {
          gradeLevel = Math.max(1, Math.min(12, Number(gradeMatch[0])));
        }

        const room = parts[2] || `Phòng ${gradeLevel}0${(idx % 8) + 1}`;
        const maxStudents = parts[3] && !isNaN(Number(parts[3])) ? Number(parts[3]) : 40;
        const subject = parts[4] || 'Chung';
        const teacherName = parts[5] || 'Thầy Nguyễn Văn Hùng';

        // Generate clean join code: Name + random digits
        const cleanCode =
          rawName.replace(/\s+/g, '').toUpperCase().slice(0, 5) +
          '-' +
          Math.floor(1000 + Math.random() * 9000);

        results.push({
          id: `cls-imp-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 4)}`,
          name: rawName.startsWith('Lớp ') ? rawName : `Lớp ${rawName}`,
          gradeLevel,
          academicYear: currentAcademicYear,
          room,
          teacherId: 'usr-teacher-1',
          teacherName,
          studentCount: 0,
          maxStudents,
          subject,
          colorTheme: PRESET_COLORS[idx % PRESET_COLORS.length],
          joinCode: cleanCode,
          status: 'ACTIVE',
        });
      }
    });

    return results;
  };

  // Handle File Upload (CSV, JSON, Text)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        if (!content) return;

        // Check if JSON
        if (file.name.endsWith('.json')) {
          const json = JSON.parse(content);
          const list = Array.isArray(json) ? json : json.classes || [json];
          const mapped: Classroom[] = list.map((item: any, idx: number) => ({
            id: item.id || `cls-imp-${Date.now()}-${idx}`,
            name: item.name || `Lớp Mới ${idx + 1}`,
            gradeLevel: Number(item.gradeLevel) || 10,
            academicYear: item.academicYear || storageService.getAcademicYear() || '2024 - 2025',
            room: item.room || `Phòng ${idx + 1}01`,
            teacherId: item.teacherId || 'usr-teacher-1',
            teacherName: item.teacherName || 'Giáo viên phụ trách',
            studentCount: Number(item.studentCount) || 0,
            maxStudents: Number(item.maxStudents) || 40,
            subject: item.subject || 'Chung',
            colorTheme: item.colorTheme || PRESET_COLORS[idx % PRESET_COLORS.length],
            joinCode: item.joinCode || `CLS-${Math.floor(1000 + Math.random() * 9000)}`,
            status: item.status || 'ACTIVE',
          }));
          setParsedClasses(mapped);
          setStep(2);
          success(`Đã phân tích được ${mapped.length} lớp học từ file JSON!`);
          return;
        }

        // CSV or text
        const parsed = parseLinesToClasses(content);
        if (parsed.length === 0) {
          warning('Không tìm thấy dòng dữ liệu lớp học hợp lệ trong file!');
          return;
        }

        setParsedClasses(parsed);
        setStep(2);
        success(`Đã đọc và nhận diện được ${parsed.length} lớp học từ file!`);
      } catch (err) {
        error('Có lỗi xảy ra khi đọc file. Vui lòng kiểm tra định dạng.');
      }
    };

    reader.readAsText(file);
  };

  // Handle Paste Parse
  const handleParsePaste = () => {
    if (!pasteContent.trim()) {
      warning('Vui lòng dán nội dung danh sách lớp vào khung!');
      return;
    }

    const parsed = parseLinesToClasses(pasteContent);
    if (parsed.length === 0) {
      warning('Không trích xuất được lớp học nào từ nội dung dán!');
      return;
    }

    setParsedClasses(parsed);
    setStep(2);
    success(`Đã nhận diện thành công ${parsed.length} lớp học từ nội dung dán!`);
  };

  // Quick Demo Classes
  const handleLoadSampleDemo = () => {
    const demoSample: Classroom[] = [
      {
        id: `cls-imp-${Date.now()}-1`,
        name: 'Lớp 10A1 - Chuyên Toán',
        gradeLevel: 10,
        academicYear: storageService.getAcademicYear() || '2024 - 2025',
        room: 'Phòng A.201',
        teacherId: 'usr-teacher-1',
        teacherName: 'Thầy Nguyễn Văn Hùng',
        studentCount: 38,
        maxStudents: 40,
        subject: 'Toán học & Tin học',
        colorTheme: '#06B6D4',
        joinCode: '10A1-8899',
        status: 'ACTIVE',
      },
      {
        id: `cls-imp-${Date.now()}-2`,
        name: 'Lớp 10A2 - Chuyên Văn',
        gradeLevel: 10,
        academicYear: storageService.getAcademicYear() || '2024 - 2025',
        room: 'Phòng A.202',
        teacherId: 'usr-teacher-1',
        teacherName: 'Cô Lê Thị Mai',
        studentCount: 35,
        maxStudents: 42,
        subject: 'Ngữ Văn & KHXH',
        colorTheme: '#EC4899',
        joinCode: '10A2-4422',
        status: 'ACTIVE',
      },
      {
        id: `cls-imp-${Date.now()}-3`,
        name: 'Lớp 11B1 - Tự Nhiên',
        gradeLevel: 11,
        academicYear: storageService.getAcademicYear() || '2024 - 2025',
        room: 'Phòng B.301',
        teacherId: 'usr-teacher-1',
        teacherName: 'Thầy Trần Minh Tuấn',
        studentCount: 36,
        maxStudents: 40,
        subject: 'Vật lý & KHTN',
        colorTheme: '#3B82F6',
        joinCode: '11B1-3311',
        status: 'ACTIVE',
      },
      {
        id: `cls-imp-${Date.now()}-4`,
        name: 'Lớp 12C1 - Luyện Thi Quốc Gia',
        gradeLevel: 12,
        academicYear: storageService.getAcademicYear() || '2024 - 2025',
        room: 'Phòng C.401',
        teacherId: 'usr-teacher-1',
        teacherName: 'Thầy Hoàng Quốc Bảo',
        studentCount: 40,
        maxStudents: 45,
        subject: 'Toán - Lý - Hóa',
        colorTheme: '#10B981',
        joinCode: '12C1-9900',
        status: 'ACTIVE',
      },
    ];

    setParsedClasses(demoSample);
    setStep(2);
    success('Đã tải 4 lớp học mẫu!');
  };

  // Confirm Import
  const handleConfirmImport = () => {
    if (parsedClasses.length === 0) return;

    parsedClasses.forEach((cls) => {
      storageService.saveClass(cls);
    });

    success(`Đã import thành công ${parsedClasses.length} lớp học vào hệ thống!`, 'Nhập lớp thành công');
    onImported();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div className="bg-[#0b1326] border border-cyan-500/40 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col my-auto max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-700/80 bg-[#070d1e] flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-600/20 border border-cyan-500/40 text-cyan-400">
              <FileSpreadsheet className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                <span>Import Lớp Học Vào Hệ Thống</span>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 uppercase">
                  Excel / CSV / Text
                </span>
              </h2>
              <p className="text-[11px] text-slate-300 font-medium">
                Nhập danh sách nhiều lớp học cùng lúc từ bảng tính hoặc văn bản
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#16254e] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 overflow-y-auto flex-1 space-y-4">
          {step === 1 ? (
            <>
              {/* Tabs: Upload File vs Paste Text */}
              <div className="flex items-center gap-2 p-1 bg-[#060b17] rounded-xl border border-slate-700 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setActiveTab('upload')}
                  className={`flex-1 py-2 px-3 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    activeTab === 'upload'
                      ? 'bg-cyan-500 text-slate-950 font-black shadow-md'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <Upload className="w-4 h-4" />
                  <span>Tải lên file (Excel / CSV / JSON)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('paste')}
                  className={`flex-1 py-2 px-3 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    activeTab === 'paste'
                      ? 'bg-cyan-500 text-slate-950 font-black shadow-md'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>Dán trực tiếp văn bản từ Excel</span>
                </button>
              </div>

              {/* Tab 1: Upload File */}
              {activeTab === 'upload' ? (
                <div className="space-y-3">
                  <div className="border-2 border-dashed border-cyan-500/40 rounded-2xl p-6 text-center hover:border-cyan-400 hover:bg-cyan-950/20 transition-all cursor-pointer relative bg-[#070e22]">
                    <input
                      type="file"
                      accept=".csv,.xlsx,.xls,.json,.txt"
                      onChange={handleFileUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    <Upload className="w-10 h-10 mx-auto text-cyan-400 mb-2" />
                    <div className="text-sm font-black text-white">
                      Kéo thả file vào đây hoặc nhấp để chọn file
                    </div>
                    <p className="text-xs text-slate-300 mt-1">
                      Hỗ trợ file <strong>.CSV</strong>, <strong>.XLSX</strong>, <strong>.JSON</strong>, <strong>.TXT</strong>
                    </p>
                    {fileName && (
                      <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-cyan-900/60 text-cyan-200 border border-cyan-400/40 rounded-xl text-xs font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-cyan-300" />
                        <span>Đã chọn: {fileName}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                    <button
                      type="button"
                      onClick={handleDownloadSample}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0e1935] hover:bg-[#162754] text-cyan-200 text-xs font-bold rounded-xl border border-cyan-500/30 transition-all cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Tải file CSV mẫu chuẩn</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleLoadSampleDemo}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 text-xs font-bold rounded-xl border border-cyan-500/40 transition-all cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Dùng dữ liệu mẫu (4 lớp)</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Tab 2: Paste Direct Text */
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-200 mb-1.5">
                      Dán các dòng lớp học từ Excel (Mỗi dòng 1 lớp, phân tách bằng dấu phẩy, tab hoặc gạch đứng):
                    </label>
                    <textarea
                      rows={6}
                      value={pasteContent}
                      onChange={(e) => setPasteContent(e.target.value)}
                      placeholder={`Ví dụ:\nLớp 10A1, 10, Phòng 201, 40, Toán - Tin, Thầy Nguyễn Văn Hùng\nLớp 10A2, 10, Phòng 202, 42, Ngữ Văn, Cô Lê Thị Mai\nLớp 11B1, 11, Phòng 301, 38, Vật Lý, Thầy Trần Minh Tuấn`}
                      className="w-full p-3 bg-[#070e22] border border-cyan-500/30 rounded-xl text-white text-xs font-mono focus:ring-2 focus:ring-cyan-400 outline-none placeholder:text-slate-500 leading-relaxed"
                    />
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={handleDownloadSample}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0e1935] hover:bg-[#162754] text-cyan-200 text-xs font-bold rounded-xl border border-cyan-500/30 transition-all cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Xem file mẫu</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleParsePaste}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs rounded-xl shadow-md shadow-cyan-500/20 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Phân tích dữ liệu đã dán</span>
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Step 2: Preview Parsed Classes */
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-cyan-950/40 border border-cyan-500/40 p-3 rounded-xl">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                  <div>
                    <div className="text-xs font-black text-white">
                      Đã sẵn sàng nhập <span className="text-cyan-300 font-extrabold">{parsedClasses.length} lớp học</span>
                    </div>
                    <div className="text-[11px] text-slate-300">
                      Vui lòng kiểm tra lại thông tin trước khi xác nhận lưu vào hệ thống
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Chọn lại file
                </button>
              </div>

              {/* Table preview */}
              <div className="max-h-60 overflow-y-auto border border-slate-700 rounded-xl bg-[#070e22]">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-[#0c1630] border-b border-slate-700 text-cyan-200 sticky top-0 font-bold">
                    <tr>
                      <th className="p-2.5">Tên lớp</th>
                      <th className="p-2.5">Khối</th>
                      <th className="p-2.5">Phòng học</th>
                      <th className="p-2.5">Sĩ số</th>
                      <th className="p-2.5">Mã lớp</th>
                      <th className="p-2.5">Môn / Chuyên</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-200">
                    {parsedClasses.map((cls, idx) => (
                      <tr key={cls.id || idx} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-2.5 font-black text-white flex items-center gap-1.5">
                          <span
                            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: cls.colorTheme }}
                          />
                          <span>{cls.name}</span>
                        </td>
                        <td className="p-2.5">
                          <span className="px-2 py-0.5 rounded-md bg-blue-950 text-blue-300 font-bold border border-blue-500/40 text-[10px]">
                            Khối {cls.gradeLevel}
                          </span>
                        </td>
                        <td className="p-2.5 font-medium">{cls.room}</td>
                        <td className="p-2.5 font-bold text-slate-100">{cls.maxStudents} HS</td>
                        <td className="p-2.5 font-mono text-[11px] text-cyan-300">{cls.joinCode}</td>
                        <td className="p-2.5 text-[11px] text-slate-300 truncate max-w-28">{cls.subject}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-slate-700/80 bg-[#070d1e] flex items-center justify-between gap-3 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-all cursor-pointer"
          >
            Đóng
          </button>

          {step === 2 && (
            <button
              type="button"
              onClick={handleConfirmImport}
              className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-lg shadow-emerald-600/30 transition-all cursor-pointer ring-1 ring-emerald-400"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Xác nhận nhập {parsedClasses.length} lớp học</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
