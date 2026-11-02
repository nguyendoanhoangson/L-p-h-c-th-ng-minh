import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Plus,
  Sparkles,
  Upload,
  Download,
  FileCheck2,
  CheckCircle2,
  Clock,
  AlertCircle,
  Archive,
  Trash2,
  Edit3,
  Copy,
  Eye,
  RefreshCw,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Layers,
  SlidersHorizontal,
  FolderPlus,
  HelpCircle,
  Check,
  X,
  FileSpreadsheet,
} from 'lucide-react';
import {
  BankQuestion,
  QuestionFilterState,
  QuestionStatus,
  QuestionType,
  DifficultyLevel,
} from '../../../types/questionBank';
import { questionBankService } from '../../../services/questionBankService';
import { storageService } from '../../../services/storageService';
import { useNotification } from '../../../contexts/NotificationContext';
import { QuestionDetailDrawer } from './QuestionDetailDrawer';
import { QuestionEditorModal } from './QuestionEditorModal';
import { AiQuestionWizardModal } from './AiQuestionWizardModal';
import { ImportQuestionsWizardModal } from './ImportQuestionsWizardModal';
import { ExportQuestionsModal } from './ExportQuestionsModal';
import { CreateQuizFromQuestionsModal } from './CreateQuizFromQuestionsModal';

const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  SINGLE_CHOICE: 'Một đáp án',
  MULTIPLE_CHOICE: 'Nhiều đáp án',
  TRUE_FALSE_SERIES: 'Đúng / Sai theo ý',
  MATCHING: 'Ghép đôi',
  ORDERING: 'Sắp xếp thứ tự',
  FILL_IN_BLANK: 'Điền khuyết',
  SHORT_ANSWER: 'Trả lời ngắn',
  ESSAY: 'Tự luận (Rubric)',
  PASSAGE_BASED: 'Đoạn văn tình huống',
};

export const QuestionBankWorkspace: React.FC = () => {
  const { success, info, warning } = useNotification();
  const classes = storageService.getClasses();

  // Questions state
  const [questions, setQuestions] = useState<BankQuestion[]>(() => questionBankService.getAll());
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'ALL' | 'APPROVED' | 'PENDING_REVIEW' | 'DRAFT' | 'NEED_FIX'>('ALL');

  // Drawer & Modals state
  const [viewingQuestion, setViewingQuestion] = useState<BankQuestion | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false);
  const [editingQuestion, setEditingQuestion] = useState<BankQuestion | null>(null);
  const [isAiWizardOpen, setIsAiWizardOpen] = useState<boolean>(false);
  const [isImportOpen, setIsImportOpen] = useState<boolean>(false);
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);
  const [isCreateQuizOpen, setIsCreateQuizOpen] = useState<boolean>(false);

  // Filters state
  const [search, setSearch] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('ALL');
  const [selectedGrade, setSelectedGrade] = useState<number | 'ALL'>('ALL');
  const [selectedType, setSelectedType] = useState<QuestionType | 'ALL'>('ALL');
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel | 'ALL'>('ALL');

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 8;

  // Refresh questions list
  const refreshQuestions = () => {
    setQuestions(questionBankService.getAll());
  };

  // KPIs
  const kpis = useMemo(() => {
    return questionBankService.getKPIs();
  }, [questions]);

  // Filtered Questions
  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      // Tab filter
      if (activeTab === 'APPROVED' && q.status !== 'APPROVED') return false;
      if (activeTab === 'PENDING_REVIEW' && q.status !== 'PENDING_REVIEW') return false;
      if (activeTab === 'DRAFT' && q.status !== 'DRAFT') return false;
      if (activeTab === 'NEED_FIX' && q.status !== 'REJECTED' && q.status !== 'ARCHIVED') return false;

      // Subject filter
      if (selectedSubject !== 'ALL' && q.subject !== selectedSubject) return false;

      // Grade filter
      if (selectedGrade !== 'ALL' && q.gradeLevel !== selectedGrade) return false;

      // Type filter
      if (selectedType !== 'ALL' && q.type !== selectedType) return false;

      // Difficulty filter
      if (selectedDifficulty !== 'ALL' && q.difficulty !== selectedDifficulty) return false;

      // Search term
      if (search.trim()) {
        const term = search.toLowerCase().trim();
        const matchesStem = q.stem.toLowerCase().includes(term);
        const matchesCode = q.code.toLowerCase().includes(term);
        const matchesTopic = q.topic?.toLowerCase().includes(term) ?? false;
        const matchesTags = q.tags.some((t) => t.toLowerCase().includes(term));
        if (!matchesStem && !matchesCode && !matchesTopic && !matchesTags) return false;
      }

      return true;
    });
  }, [questions, activeTab, selectedSubject, selectedGrade, selectedType, selectedDifficulty, search]);

  // Paginated questions
  const totalPages = Math.ceil(filteredQuestions.length / pageSize) || 1;
  const paginatedQuestions = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredQuestions.slice(start, start + pageSize);
  }, [filteredQuestions, currentPage]);

  // Multi-select handlers
  const handleToggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleSelectAllOnPage = () => {
    const pageIds = paginatedQuestions.map((q) => q.id);
    const allSelected = pageIds.every((id) => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds(selectedIds.filter((id) => !pageIds.includes(id)));
    } else {
      setSelectedIds(Array.from(new Set([...selectedIds, ...pageIds])));
    }
  };

  // CRUD actions
  const handleApprove = (id: string) => {
    questionBankService.updateStatus(id, 'APPROVED');
    refreshQuestions();
    success('Đã duyệt câu hỏi vào ngân hàng chính thức!');
  };

  const handleReject = (id: string) => {
    questionBankService.updateStatus(id, 'REJECTED');
    refreshQuestions();
    info('Đã đánh dấu câu hỏi cần chỉnh sửa.');
  };

  const handleArchive = (id: string) => {
    questionBankService.updateStatus(id, 'ARCHIVED');
    refreshQuestions();
    info('Đã lưu trữ câu hỏi.');
  };

  const handleClone = (id: string) => {
    const cloned = questionBankService.duplicate(id);
    if (cloned) {
      refreshQuestions();
      success(`Đã nhân bản thành công câu hỏi ${cloned.code}!`);
    }
  };

  const handleDelete = (id: string) => {
    questionBankService.softDelete(id);
    refreshQuestions();
    setSelectedIds(selectedIds.filter((item) => item !== id));
    success('Đã xóa câu hỏi khỏi ngân hàng!');
  };

  // Bulk actions
  const handleBulkApprove = () => {
    const count = questionBankService.bulkUpdateStatus(selectedIds, 'APPROVED');
    refreshQuestions();
    setSelectedIds([]);
    success(`Đã duyệt đồng loạt ${count} câu hỏi!`);
  };

  const handleBulkArchive = () => {
    const count = questionBankService.bulkUpdateStatus(selectedIds, 'ARCHIVED');
    refreshQuestions();
    setSelectedIds([]);
    info(`Đã lưu trữ ${count} câu hỏi.`);
  };

  const handleBulkDelete = () => {
    const count = questionBankService.bulkDelete(selectedIds);
    refreshQuestions();
    setSelectedIds([]);
    success(`Đã xóa ${count} câu hỏi!`);
  };

  // Save from Editor
  const handleSaveQuestion = (data: any) => {
    if (editingQuestion) {
      questionBankService.update(editingQuestion.id, data, 'Cập nhật từ modal chỉnh sửa');
      success(`Đã cập nhật câu hỏi ${editingQuestion.code}!`);
    } else {
      const created = questionBankService.create(data);
      success(`Đã thêm mới câu hỏi ${created.code} vào ngân hàng!`);
    }
    refreshQuestions();
  };

  // AI Generated callback
  const handleAiQuestionsGenerated = (approvedList: BankQuestion[]) => {
    approvedList.forEach((q) => {
      questionBankService.create(q);
    });
    refreshQuestions();
    success(`Đã lưu ${approvedList.length} câu hỏi AI phê duyệt vào ngân hàng!`);
  };

  // Import completed callback
  const handleImportCompleted = (importedList: BankQuestion[]) => {
    importedList.forEach((q) => {
      questionBankService.create(q);
    });
    refreshQuestions();
    success(`Đã nhập thành công ${importedList.length} câu hỏi mới vào ngân hàng!`);
  };

  const selectedQuestionsForQuiz = useMemo(() => {
    return questions.filter((q) => selectedIds.includes(q.id));
  }, [questions, selectedIds]);

  return (
    <div className="space-y-4">
      {/* 1. Breadcrumb & Title */}
      <div className="bg-[#0b1326] rounded-2xl border border-cyan-500/30 p-4 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
              <span>Giáo viên</span>
              <span>/</span>
              <span>Dạy & Học</span>
              <span>/</span>
              <span className="text-cyan-300 font-bold">Ngân hàng câu hỏi thông minh</span>
            </div>
            <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2.5 whitespace-nowrap">
              <div className="w-2.5 h-6 bg-cyan-400 rounded-full shrink-0" />
              <span className="truncate">Ngân Hàng Câu Hỏi Thông Minh</span>
              <span className="text-xs px-2.5 py-0.5 rounded-lg bg-cyan-950 text-cyan-300 border border-cyan-500/40 font-bold shrink-0">
                Chuẩn 9 Dạng Bộ GD&ĐT
              </span>
            </h1>
            <p className="text-xs text-slate-300 mt-0.5 truncate whitespace-nowrap" title="Kho tri thức ma trận chuẩn, sinh câu hỏi AI bám sát chương trình & liên thông đề thi">
              Kho tri thức ma trận chuẩn, sinh câu hỏi AI bám sát chương trình & liên thông đề thi
            </p>
          </div>

          {/* Action CTAs (Tất cả 4 nút trên 1 dòng duy nhất, không rớt dòng Export) */}
          <div className="flex items-center gap-2 flex-nowrap shrink-0 overflow-x-auto">
            <button
              onClick={() => {
                setEditingQuestion(null);
                setIsEditorOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-cyan-500/30 transition-all cursor-pointer active:scale-95 whitespace-nowrap shrink-0"
            >
              <Plus className="w-4 h-4 shrink-0" />
              <span>+ Tạo thủ công</span>
            </button>

            <button
              onClick={() => setIsAiWizardOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs rounded-xl shadow-lg shadow-purple-600/30 transition-all cursor-pointer active:scale-95 whitespace-nowrap shrink-0"
            >
              <Sparkles className="w-4 h-4 text-purple-200 shrink-0" />
              <span>Tạo bằng AI (Gemini)</span>
            </button>

            <button
              onClick={() => setIsImportOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#101b38] hover:bg-[#162752] border border-cyan-500/40 text-cyan-200 text-xs font-bold rounded-xl transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <Upload className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>Import</span>
            </button>

            <button
              onClick={() => setIsExportOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#101b38] hover:bg-[#162752] border border-cyan-500/40 text-cyan-200 text-xs font-bold rounded-xl transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. 4 KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-[#0b1326] p-4 rounded-2xl border border-slate-700/80 shadow-md">
          <div className="flex items-center justify-between text-slate-300 text-xs font-bold">
            <span>Tổng câu hỏi</span>
            <BookOpen className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-white mt-1">{kpis.total}</div>
          <div className="text-[11px] text-blue-300 mt-0.5">Sẵn sàng tái sử dụng</div>
        </div>

        <div className="bg-[#0b1326] p-4 rounded-2xl border border-slate-700/80 shadow-md">
          <div className="flex items-center justify-between text-slate-300 text-xs font-bold">
            <span>Đã duyệt (Official)</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-300 mt-1">{kpis.approved}</div>
          <div className="text-[11px] text-emerald-400 mt-0.5">Đạt chuẩn khảo thí</div>
        </div>

        <div className="bg-[#0b1326] p-4 rounded-2xl border border-slate-700/80 shadow-md">
          <div className="flex items-center justify-between text-slate-300 text-xs font-bold">
            <span>Chờ phê duyệt</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-300 mt-1">{kpis.pendingReview}</div>
          <div className="text-[11px] text-amber-400 mt-0.5">{kpis.aiSuggested} câu do AI đề xuất</div>
        </div>

        <div className="bg-[#0b1326] p-4 rounded-2xl border border-slate-700/80 shadow-md">
          <div className="flex items-center justify-between text-slate-300 text-xs font-bold">
            <span>Bản nháp & Cần sửa</span>
            <AlertCircle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-black text-rose-300 mt-1">
            {kpis.draft + kpis.rejectedOrNeedFix}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">{kpis.draft} nháp · {kpis.rejectedOrNeedFix} cần sửa</div>
        </div>
      </div>

      {/* 3. Main Workspace Container */}
      <div className="bg-[#0b1326] rounded-2xl border border-slate-700/90 shadow-xl overflow-hidden">
        {/* Navigation Tabs */}
        <div className="px-4 pt-3 border-b border-slate-700 bg-[#080d1c] flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-bold">
            {[
              { id: 'ALL' as const, label: 'Tất cả', count: kpis.total },
              { id: 'APPROVED' as const, label: 'Đã duyệt', count: kpis.approved },
              { id: 'PENDING_REVIEW' as const, label: 'Chờ duyệt', count: kpis.pendingReview },
              { id: 'DRAFT' as const, label: 'Bản nháp', count: kpis.draft },
              { id: 'NEED_FIX' as const, label: 'Cần sửa / Lưu trữ', count: kpis.rejectedOrNeedFix },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setCurrentPage(1);
                  }}
                  className={`px-3.5 py-2.5 rounded-t-xl transition-all border-b-2 cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                    isActive
                      ? 'border-cyan-400 text-cyan-300 bg-[#0e1732] font-black'
                      : 'border-transparent text-slate-400 hover:text-white hover:bg-[#0c1429]'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300">
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Quick Create Quiz button if items selected */}
          {selectedIds.length > 0 && (
            <button
              onClick={() => setIsCreateQuizOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all cursor-pointer active:scale-95 mb-2"
            >
              <FileCheck2 className="w-4 h-4 text-slate-950" />
              <span>Tạo đề từ {selectedIds.length} câu đã chọn</span>
            </button>
          )}
        </div>

        {/* Filter Toolbar */}
        <div className="p-4 border-b border-slate-700/80 bg-[#0a1124] space-y-3">
          <div className="flex flex-col sm:flex-row items-center gap-2.5">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-cyan-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Tìm kiếm nội dung câu hỏi, mã câu, chủ đề, tag..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-[#070c1a] border border-slate-700 rounded-xl text-white outline-none focus:border-cyan-400 font-medium placeholder:text-slate-400"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
              {/* Subject Select */}
              <select
                value={selectedSubject}
                onChange={(e) => {
                  setSelectedSubject(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-[#070c1a] border border-slate-700 text-xs text-white rounded-xl px-2.5 py-2 outline-none font-bold cursor-pointer"
              >
                <option value="ALL">Tất cả môn</option>
                <option value="Toán học">Toán học</option>
                <option value="Vật lý">Vật lý</option>
                <option value="Hóa học">Hóa học</option>
                <option value="Sinh học">Sinh học</option>
                <option value="Ngữ văn">Ngữ văn</option>
                <option value="Tiếng Anh">Tiếng Anh</option>
              </select>

              {/* Grade Select */}
              <select
                value={selectedGrade}
                onChange={(e) => {
                  setSelectedGrade(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-[#070c1a] border border-slate-700 text-xs text-white rounded-xl px-2.5 py-2 outline-none font-bold cursor-pointer"
              >
                <option value="ALL">Mọi khối lớp</option>
                {[6, 7, 8, 9, 10, 11, 12].map((g) => (
                  <option key={g} value={g}>Khối {g}</option>
                ))}
              </select>

              {/* Type Select */}
              <select
                value={selectedType}
                onChange={(e) => {
                  setSelectedType(e.target.value as any);
                  setCurrentPage(1);
                }}
                className="bg-[#070c1a] border border-slate-700 text-xs text-white rounded-xl px-2.5 py-2 outline-none font-bold cursor-pointer"
              >
                <option value="ALL">Tất cả 9 dạng câu</option>
                {Object.entries(QUESTION_TYPE_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>

              {/* Difficulty Select */}
              <select
                value={selectedDifficulty}
                onChange={(e) => {
                  setSelectedDifficulty(e.target.value as any);
                  setCurrentPage(1);
                }}
                className="bg-[#070c1a] border border-slate-700 text-xs text-white rounded-xl px-2.5 py-2 outline-none font-bold cursor-pointer"
              >
                <option value="ALL">Mọi mức độ</option>
                <option value="Nhận biết">Nhận biết</option>
                <option value="Thông hiểu">Thông hiểu</option>
                <option value="Vận dụng">Vận dụng</option>
                <option value="Vận dụng cao">Vận dụng cao</option>
              </select>
            </div>
          </div>

          {/* Bulk Action Bar when items selected */}
          {selectedIds.length > 0 && (
            <div className="p-2.5 rounded-xl bg-cyan-950/70 border border-cyan-500/50 flex items-center justify-between flex-wrap gap-2 animate-in fade-in">
              <div className="flex items-center gap-2 text-xs font-bold text-cyan-200">
                <Check className="w-4 h-4 text-cyan-400" />
                <span>Đã chọn {selectedIds.length} câu hỏi</span>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={handleBulkApprove}
                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  Duyệt hàng loạt
                </button>
                <button
                  type="button"
                  onClick={handleBulkArchive}
                  className="px-2.5 py-1 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  Lưu trữ
                </button>
                <button
                  type="button"
                  onClick={() => setIsExportOpen(true)}
                  className="px-2.5 py-1 bg-[#101c38] hover:bg-[#162750] border border-cyan-500/40 text-cyan-200 rounded-lg text-xs font-bold cursor-pointer"
                >
                  Xuất {selectedIds.length} câu
                </button>
                <button
                  type="button"
                  onClick={handleBulkDelete}
                  className="px-2.5 py-1 bg-rose-950 hover:bg-rose-900 border border-rose-500/50 text-rose-300 rounded-lg text-xs font-bold cursor-pointer"
                >
                  Xóa
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedIds([])}
                  className="p-1 text-slate-400 hover:text-white cursor-pointer"
                  title="Hủy chọn"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Questions List Table / Cards */}
        <div className="p-4 space-y-3">
          {paginatedQuestions.length === 0 ? (
            <div className="py-16 text-center text-slate-400 space-y-3">
              <BookOpen className="w-12 h-12 text-slate-600 mx-auto" />
              <div className="text-sm font-bold text-white">Không tìm thấy câu hỏi phù hợp</div>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Hãy thử nới lỏng bộ lọc hoặc nhấn nút "+ Tạo thủ công" / "Tạo bằng AI" để bổ sung câu hỏi mới.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {/* Select All on Page Header */}
              <div className="flex items-center justify-between text-xs text-slate-400 px-2">
                <label className="flex items-center gap-2 cursor-pointer font-bold">
                  <input
                    type="checkbox"
                    checked={
                      paginatedQuestions.length > 0 &&
                      paginatedQuestions.every((q) => selectedIds.includes(q.id))
                    }
                    onChange={handleSelectAllOnPage}
                    className="w-4 h-4 accent-cyan-500 rounded"
                  />
                  <span>Chọn tất cả trên trang này ({paginatedQuestions.length} câu)</span>
                </label>
                <span>Hiển thị trang {currentPage}/{totalPages} (Tổng {filteredQuestions.length} câu)</span>
              </div>

              {/* Items List */}
              {paginatedQuestions.map((q) => {
                const isSelected = selectedIds.includes(q.id);
                return (
                  <div
                    key={q.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      isSelected
                        ? 'bg-[#0f1b3b] border-cyan-400/80 shadow-md shadow-cyan-500/10 ring-1 ring-cyan-400/40'
                        : 'bg-[#080d1e] border-slate-700/80 hover:border-cyan-500/40 hover:bg-[#0b1328]'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Selection Checkbox */}
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelect(q.id)}
                        className="w-4 h-4 accent-cyan-500 rounded mt-1 cursor-pointer flex-shrink-0"
                      />

                      {/* Content block */}
                      <div className="flex-1 min-w-0 space-y-2">
                        {/* Badges line */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-black text-cyan-300 bg-cyan-950/70 border border-cyan-500/40 px-2 py-0.5 rounded-md">
                            {q.code}
                          </span>
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-950 text-blue-200 border border-blue-500/40">
                            {q.subject} · Khối {q.gradeLevel}
                          </span>
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700">
                            {QUESTION_TYPE_LABELS[q.type] || q.type}
                          </span>
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-amber-950/70 text-amber-300 border border-amber-500/40">
                            {q.difficulty}
                          </span>
                          <span className="text-[11px] font-bold text-slate-400">
                            {q.points}đ
                          </span>

                          {q.isAiGenerated && (
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-500/40 flex items-center gap-1">
                              <Sparkles className="w-3 h-3" />
                              AI Đề Xuất
                            </span>
                          )}

                          {q.status === 'APPROVED' && (
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                              ✓ Đã duyệt
                            </span>
                          )}
                          {q.status === 'PENDING_REVIEW' && (
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-500/40">
                              ⏳ Chờ duyệt
                            </span>
                          )}
                          {q.status === 'DRAFT' && (
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-600">
                              Bản nháp
                            </span>
                          )}
                        </div>

                        {/* Stem */}
                        <div
                          onClick={() => setViewingQuestion(q)}
                          className="text-xs text-white font-medium line-clamp-2 cursor-pointer hover:text-cyan-300 transition-colors leading-relaxed"
                          title="Click để xem chi tiết đầy đủ đáp án & lời giải"
                        >
                          {q.stem}
                        </div>

                        {/* Options preview if Single/Multi */}
                        {q.options && q.options.length > 0 && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 pt-1">
                            {q.options.map((opt) => (
                              <div
                                key={opt.id}
                                className={`p-1.5 rounded-lg text-[11px] border truncate ${
                                  opt.isCorrect
                                    ? 'bg-emerald-950/50 border-emerald-500/60 text-emerald-300 font-bold'
                                    : 'bg-[#060a16] border-slate-800 text-slate-300'
                                }`}
                              >
                                <span className="font-black mr-1">{opt.label}.</span>
                                <span>{opt.text}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Metadata tags */}
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-1 flex-wrap">
                          <span>Tác giả: {q.authorName}</span>
                          <span>·</span>
                          <span>Đã dùng trong {q.usageCount || 0} đề thi</span>
                          {q.topic && (
                            <>
                              <span>·</span>
                              <span className="text-cyan-400 font-medium">Chủ đề: {q.topic}</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Action buttons on item */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => setViewingQuestion(q)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-[#121c38] transition-colors cursor-pointer"
                          title="Xem chi tiết câu hỏi & lời giải"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setEditingQuestion(q);
                            setIsEditorOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-300 hover:bg-[#121c38] transition-colors cursor-pointer"
                          title="Chỉnh sửa câu hỏi"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleClone(q.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-purple-300 hover:bg-[#121c38] transition-colors cursor-pointer"
                          title="Nhân bản câu hỏi"
                        >
                          <Copy className="w-4 h-4" />
                        </button>

                        {q.status !== 'APPROVED' && (
                          <button
                            type="button"
                            onClick={() => handleApprove(q.id)}
                            className="p-1.5 rounded-lg text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/60 transition-colors cursor-pointer"
                            title="Duyệt câu hỏi này"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleDelete(q.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/60 transition-colors cursor-pointer"
                          title="Xóa câu hỏi"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs text-slate-400">
              <div>
                Trang {currentPage} trên tổng số {totalPages} trang
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="p-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-300 disabled:opacity-40 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setCurrentPage(num)}
                    className={`w-7 h-7 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                      currentPage === num
                        ? 'bg-cyan-500 text-slate-950 font-black'
                        : 'border border-slate-700 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {num}
                  </button>
                ))}

                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="p-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-300 disabled:opacity-40 cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4. Question Detail Drawer */}
      <QuestionDetailDrawer
        question={viewingQuestion}
        isOpen={!!viewingQuestion}
        onClose={() => setViewingQuestion(null)}
        onEdit={(q) => {
          setViewingQuestion(null);
          setEditingQuestion(q);
          setIsEditorOpen(true);
        }}
        onApprove={handleApprove}
        onReject={handleReject}
        onClone={handleClone}
        onDelete={handleDelete}
        onArchive={handleArchive}
      />

      {/* 5. Question Editor Modal (9 types) */}
      <QuestionEditorModal
        isOpen={isEditorOpen}
        onClose={() => {
          setIsEditorOpen(false);
          setEditingQuestion(null);
        }}
        initialQuestion={editingQuestion}
        onSave={handleSaveQuestion}
      />

      {/* 6. AI 5-Step Wizard Modal */}
      <AiQuestionWizardModal
        isOpen={isAiWizardOpen}
        onClose={() => setIsAiWizardOpen(false)}
        onQuestionsGenerated={handleAiQuestionsGenerated}
      />

      {/* 7. Import Wizard Modal */}
      <ImportQuestionsWizardModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImportCompleted={handleImportCompleted}
        existingQuestions={questions}
      />

      {/* 8. Export Modal */}
      <ExportQuestionsModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        questions={filteredQuestions}
        selectedIds={selectedIds}
      />

      {/* 9. Create Quiz Modal */}
      <CreateQuizFromQuestionsModal
        isOpen={isCreateQuizOpen}
        onClose={() => setIsCreateQuizOpen(false)}
        selectedQuestions={selectedQuestionsForQuiz}
        classes={classes}
        onQuizCreated={(quizId) => {
          refreshQuestions();
          setSelectedIds([]);
          success('Đề thi đã được phát hành thành công cho lớp học!');
        }}
      />
    </div>
  );
};
