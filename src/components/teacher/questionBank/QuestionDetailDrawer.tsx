import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  AlertCircle,
  Copy,
  Edit3,
  Trash2,
  Clock,
  BookOpen,
  Tag,
  Sparkles,
  Share2,
  History,
  Archive,
  Check,
  FileText,
  HelpCircle,
  CornerDownRight,
  ShieldAlert,
} from 'lucide-react';
import {
  BankQuestion,
  QuestionType,
  DifficultyLevel,
  QuestionStatus,
} from '../../../types/questionBank';

interface QuestionDetailDrawerProps {
  question: BankQuestion | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (question: BankQuestion) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onClone: (id: string) => void;
  onDelete: (id: string) => void;
  onArchive: (id: string) => void;
}

const TYPE_LABELS: Record<QuestionType, { label: string; color: string }> = {
  SINGLE_CHOICE: { label: 'Một đáp án (Single)', color: 'bg-blue-950 text-blue-300 border-blue-500/40' },
  MULTIPLE_CHOICE: { label: 'Nhiều đáp án (Multi)', color: 'bg-indigo-950 text-indigo-300 border-indigo-500/40' },
  TRUE_FALSE_SERIES: { label: 'Đúng / Sai theo ý', color: 'bg-emerald-950 text-emerald-300 border-emerald-500/40' },
  MATCHING: { label: 'Ghép đôi (Matching)', color: 'bg-amber-950 text-amber-300 border-amber-500/40' },
  ORDERING: { label: 'Sắp xếp thứ tự', color: 'bg-purple-950 text-purple-300 border-purple-500/40' },
  FILL_IN_BLANK: { label: 'Điền khuyết (Blank)', color: 'bg-cyan-950 text-cyan-300 border-cyan-500/40' },
  SHORT_ANSWER: { label: 'Trả lời ngắn', color: 'bg-teal-950 text-teal-300 border-teal-500/40' },
  ESSAY: { label: 'Tự luận (Rubric)', color: 'bg-rose-950 text-rose-300 border-rose-500/40' },
  PASSAGE_BASED: { label: 'Bài đọc / Tình huống', color: 'bg-fuchsia-950 text-fuchsia-300 border-fuchsia-500/40' },
};

const DIFFICULTY_COLORS: Record<DifficultyLevel, string> = {
  'Nhận biết': 'bg-sky-950 text-sky-300 border-sky-500/40',
  'Thông hiểu': 'bg-emerald-950 text-emerald-300 border-emerald-500/40',
  'Vận dụng': 'bg-amber-950 text-amber-300 border-amber-500/40',
  'Vận dụng cao': 'bg-rose-950 text-rose-300 border-rose-500/40',
};

const STATUS_CONFIG: Record<QuestionStatus, { label: string; color: string; icon: any }> = {
  APPROVED: { label: 'Đã duyệt', color: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50', icon: CheckCircle2 },
  PENDING_REVIEW: { label: 'Chờ duyệt', color: 'bg-amber-950/80 text-amber-300 border-amber-500/50', icon: Clock },
  DRAFT: { label: 'Bản nháp', color: 'bg-slate-800 text-slate-300 border-slate-600', icon: FileText },
  REJECTED: { label: 'Cần chỉnh sửa', color: 'bg-rose-950/80 text-rose-300 border-rose-500/50', icon: AlertCircle },
  ARCHIVED: { label: 'Đã lưu trữ', color: 'bg-zinc-800 text-zinc-400 border-zinc-600', icon: Archive },
};

export const QuestionDetailDrawer: React.FC<QuestionDetailDrawerProps> = ({
  question,
  isOpen,
  onClose,
  onEdit,
  onApprove,
  onReject,
  onClone,
  onDelete,
  onArchive,
}) => {
  const [activeTab, setActiveTab] = useState<'content' | 'revisions' | 'metadata'>('content');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!isOpen || !question) return null;

  const StatusIcon = STATUS_CONFIG[question.status]?.icon || FileText;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-xs transition-opacity animate-in fade-in"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-2xl bg-[#0a1022] border-l border-slate-700/80 shadow-2xl flex flex-col text-slate-100">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-700/80 bg-[#0c142b] flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-300 font-black text-sm">
                Q
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-sm font-black text-white">{question.code}</span>
                  <span
                    className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                      STATUS_CONFIG[question.status]?.color
                    } flex items-center gap-1`}
                  >
                    <StatusIcon className="w-3 h-3" />
                    {STATUS_CONFIG[question.status]?.label}
                  </span>
                  {question.isAiGenerated && (
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-500/40 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      AI Đề Xuất
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  {question.subject} · Khối {question.gradeLevel} · Phiên bản v{question.version}
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="px-5 pt-2 border-b border-slate-800 flex items-center gap-4 bg-[#080d1c] text-xs">
            <button
              onClick={() => setActiveTab('content')}
              className={`pb-2.5 font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === 'content'
                  ? 'border-blue-400 text-blue-300'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              Nội dung & Lời giải
            </button>
            <button
              onClick={() => setActiveTab('revisions')}
              className={`pb-2.5 font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'revisions'
                  ? 'border-blue-400 text-blue-300'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Lịch sử phiên bản ({question.revisions?.length || 1})</span>
            </button>
            <button
              onClick={() => setActiveTab('metadata')}
              className={`pb-2.5 font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === 'metadata'
                  ? 'border-blue-400 text-blue-300'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              Thuộc tính & Phân loại
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {activeTab === 'content' && (
              <>
                {/* Badges bar */}
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`text-xs font-black px-2.5 py-1 rounded-lg border ${
                      TYPE_LABELS[question.type]?.color || 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {TYPE_LABELS[question.type]?.label || question.type}
                  </span>
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${
                      DIFFICULTY_COLORS[question.difficulty]
                    }`}
                  >
                    Mức độ: {question.difficulty}
                  </span>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-[#111c38] text-blue-200 border border-blue-500/30">
                    Điểm: {question.points}đ
                  </span>
                </div>

                {/* Stimulus / Passage if PASSAGE_BASED */}
                {question.type === 'PASSAGE_BASED' && question.passageStimulus && (
                  <div className="p-4 rounded-2xl bg-[#0f1730] border border-fuchsia-500/30 space-y-2">
                    <div className="text-xs font-black uppercase text-fuchsia-300 tracking-wider flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4" />
                      Ngữ cảnh / Bài đọc tham chiếu
                    </div>
                    {question.passageStimulus.title && (
                      <div className="font-bold text-sm text-white">
                        {question.passageStimulus.title}
                      </div>
                    )}
                    <div className="text-xs text-slate-200 leading-relaxed italic bg-[#070b16] p-3 rounded-xl border border-slate-700">
                      {question.passageStimulus.text}
                    </div>
                  </div>
                )}

                {/* Stem / Question Content */}
                <div className="space-y-2">
                  <div className="text-xs font-black uppercase tracking-wider text-slate-400">
                    Nội dung câu hỏi:
                  </div>
                  <div className="text-sm text-white font-medium bg-[#0f1936] p-4 rounded-2xl border border-slate-700 leading-relaxed whitespace-pre-wrap">
                    {question.stem}
                  </div>
                </div>

                {/* Specific answer representations according to 9 types */}
                <div className="space-y-2">
                  <div className="text-xs font-black uppercase tracking-wider text-slate-400">
                    Phương án & Đáp án:
                  </div>

                  {/* 1 & 2: Single and Multiple Choice */}
                  {(question.type === 'SINGLE_CHOICE' || question.type === 'MULTIPLE_CHOICE') &&
                    question.options && (
                      <div className="space-y-2">
                        {question.options.map((opt) => (
                          <div
                            key={opt.id}
                            className={`p-3 rounded-xl border flex items-start gap-3 transition-colors ${
                              opt.isCorrect
                                ? 'bg-emerald-950/60 border-emerald-500/70 text-emerald-100 shadow-sm'
                                : 'bg-[#0a1124] border-slate-700/80 text-slate-300'
                            }`}
                          >
                            <span
                              className={`w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center flex-shrink-0 ${
                                opt.isCorrect
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-slate-800 text-slate-300'
                              }`}
                            >
                              {opt.label}
                            </span>
                            <div className="flex-1 text-xs font-medium pt-0.5">{opt.text}</div>
                            {opt.isCorrect && (
                              <span className="text-[11px] font-black text-emerald-400 flex items-center gap-1 flex-shrink-0">
                                <Check className="w-3.5 h-3.5" />
                                Đáp án đúng
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                  {/* 3: True / False Series */}
                  {question.type === 'TRUE_FALSE_SERIES' && question.trueFalseItems && (
                    <div className="space-y-2">
                      {question.trueFalseItems.map((tf, i) => (
                        <div
                          key={tf.id}
                          className="p-3 rounded-xl bg-[#0a1124] border border-slate-700/80 flex items-center justify-between gap-3 text-xs"
                        >
                          <div className="flex items-start gap-2 flex-1">
                            <span className="font-bold text-slate-400">{i + 1}.</span>
                            <span className="text-slate-200">{tf.statement}</span>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-lg font-black text-xs flex-shrink-0 ${
                              tf.isTrue
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50'
                                : 'bg-rose-950 text-rose-300 border border-rose-500/50'
                            }`}
                          >
                            {tf.isTrue ? '✓ ĐÚNG' : '✗ SAI'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 4: Matching */}
                  {question.type === 'MATCHING' && question.matchingItems && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="p-3 rounded-xl bg-[#0a1124] border border-slate-700/80 space-y-2">
                        <div className="text-[11px] font-bold text-blue-300 uppercase">Cột A</div>
                        {question.matchingItems.map((m) => (
                          <div key={m.id} className="p-2 bg-[#0e1730] rounded-lg text-xs text-white">
                            {m.leftText}
                          </div>
                        ))}
                      </div>
                      <div className="p-3 rounded-xl bg-[#0a1124] border border-slate-700/80 space-y-2">
                        <div className="text-[11px] font-bold text-amber-300 uppercase">Cột B (Đối ứng)</div>
                        {question.matchingItems.map((m) => (
                          <div key={m.id} className="p-2 bg-[#0e1730] rounded-lg text-xs text-amber-200 flex items-center gap-1.5">
                            <CornerDownRight className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                            <span>{m.rightText}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 5: Ordering */}
                  {question.type === 'ORDERING' && question.orderingItems && (
                    <div className="space-y-2">
                      {question.orderingItems
                        .slice()
                        .sort((a, b) => a.correctOrder - b.correctOrder)
                        .map((ord, idx) => (
                          <div
                            key={ord.id}
                            className="p-3 rounded-xl bg-[#0a1124] border border-purple-500/30 flex items-center gap-3 text-xs"
                          >
                            <span className="w-6 h-6 rounded-lg bg-purple-950 text-purple-300 border border-purple-500/40 flex items-center justify-center font-black">
                              {idx + 1}
                            </span>
                            <span className="text-white font-medium">{ord.text}</span>
                          </div>
                        ))}
                    </div>
                  )}

                  {/* 6: Fill in Blank */}
                  {question.type === 'FILL_IN_BLANK' && question.blankItems && (
                    <div className="p-3.5 rounded-xl bg-[#0a1124] border border-cyan-500/30 space-y-2 text-xs">
                      {question.blankItems.map((blk) => (
                        <div key={blk.id} className="flex items-center gap-2">
                          <span className="font-bold text-cyan-300">[Ô trống #{blk.blankIndex}]:</span>
                          <span className="font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-200 border border-cyan-500/40">
                            {blk.acceptableAnswers.join(' / ')}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 7: Short Answer */}
                  {question.type === 'SHORT_ANSWER' && question.shortAnswerConfig && (
                    <div className="p-3.5 rounded-xl bg-[#0a1124] border border-teal-500/30 space-y-1.5 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 font-bold">Đáp án chuẩn:</span>
                        <span className="font-mono font-black text-teal-300 bg-teal-950 px-2 py-0.5 rounded border border-teal-500/40">
                          {question.shortAnswerConfig.sampleAnswer}
                        </span>
                      </div>
                      {question.shortAnswerConfig.acceptedVariants.length > 0 && (
                        <div className="text-slate-400 text-[11px]">
                          Các biến thể chấp nhận: {question.shortAnswerConfig.acceptedVariants.join(', ')}
                        </div>
                      )}
                      {question.shortAnswerConfig.numericTolerance !== undefined && (
                        <div className="text-slate-400 text-[11px]">
                          Dung sai số học: ±{question.shortAnswerConfig.numericTolerance}
                        </div>
                      )}
                    </div>
                  )}

                  {/* 8: Essay with Rubric */}
                  {question.type === 'ESSAY' && question.essayConfig && (
                    <div className="space-y-3">
                      <div className="p-3 rounded-xl bg-[#0a1124] border border-rose-500/30 space-y-2 text-xs">
                        <div className="font-bold text-rose-300 uppercase text-[11px]">Đáp án tham khảo:</div>
                        <p className="text-slate-200 leading-relaxed italic">{question.essayConfig.referenceAnswer}</p>
                      </div>

                      <div className="space-y-1.5">
                        <div className="font-bold text-slate-300 text-xs">Thang điểm Rubric ({question.essayConfig.maxScore}đ):</div>
                        <div className="space-y-1.5">
                          {question.essayConfig.rubric.map((rb) => (
                            <div key={rb.id} className="p-2.5 rounded-lg bg-[#0e1732] border border-slate-700 text-xs flex justify-between gap-3">
                              <div>
                                <div className="font-bold text-white">{rb.criterion}</div>
                                <div className="text-[11px] text-slate-400 mt-0.5">{rb.description}</div>
                              </div>
                              <span className="text-xs font-black text-amber-300 flex-shrink-0">
                                {rb.maxPoints}đ
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 9: Passage Sub-questions */}
                  {question.type === 'PASSAGE_BASED' && question.subQuestions && (
                    <div className="space-y-3 pt-2">
                      <div className="text-xs font-black text-fuchsia-300 uppercase">
                        Các câu hỏi phụ ({question.subQuestions.length} câu):
                      </div>
                      {question.subQuestions.map((sub, idx) => (
                        <div key={sub.id} className="p-3.5 rounded-xl bg-[#090e1e] border border-slate-700/80 space-y-2 text-xs">
                          <div className="font-bold text-white">
                            Câu {idx + 1}: {sub.stem}
                          </div>
                          {sub.options && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                              {sub.options.map((so) => (
                                <div
                                  key={so.id}
                                  className={`p-1.5 rounded-lg text-[11px] border ${
                                    so.isCorrect
                                      ? 'bg-emerald-950/70 border-emerald-500 text-emerald-200 font-bold'
                                      : 'bg-[#0f1730] border-slate-700 text-slate-300'
                                  }`}
                                >
                                  {so.label}. {so.text}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Explanation */}
                {question.explanation && (
                  <div className="space-y-2">
                    <div className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                      <HelpCircle className="w-4 h-4" />
                      Lời giải & Giải thích chi tiết:
                    </div>
                    <div className="text-xs text-emerald-100 bg-emerald-950/30 p-3.5 rounded-xl border border-emerald-500/40 leading-relaxed whitespace-pre-wrap">
                      {question.explanation}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* TAB: REVISION HISTORY */}
            {activeTab === 'revisions' && (
              <div className="space-y-3">
                <div className="text-xs text-slate-400 mb-2">
                  Hệ thống ghi nhận mọi lần chỉnh sửa để phục vụ kiểm toán và không làm ảnh hưởng đến các đề thi đã phát hành.
                </div>
                {question.revisions && question.revisions.length > 0 ? (
                  question.revisions.map((rev) => (
                    <div
                      key={rev.version}
                      className="p-3.5 rounded-xl bg-[#0e1732] border border-slate-700/80 space-y-1.5 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-black text-blue-300">Phiên bản v{rev.version}</span>
                        <span className="text-slate-400 text-[11px]">{new Date(rev.updatedAt).toLocaleString('vi-VN')}</span>
                      </div>
                      <div className="font-medium text-white">{rev.changeNote}</div>
                      <div className="text-[11px] text-slate-400">Thực hiện bởi: {rev.updatedBy}</div>
                      {rev.snapshotStem && (
                        <div className="text-[11px] text-slate-400 italic bg-[#080d1e] p-2 rounded border border-slate-800 line-clamp-2">
                          "{rev.snapshotStem}"
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-xs text-slate-500">Chưa có lịch sử thay đổi phiên bản.</div>
                )}
              </div>
            )}

            {/* TAB: METADATA */}
            {activeTab === 'metadata' && (
              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-[#0e1732] border border-slate-700/80">
                    <span className="text-slate-400 block text-[11px]">Môn học</span>
                    <span className="font-bold text-white text-sm">{question.subject}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#0e1732] border border-slate-700/80">
                    <span className="text-slate-400 block text-[11px]">Khối học</span>
                    <span className="font-bold text-white text-sm">Khối {question.gradeLevel}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#0e1732] border border-slate-700/80">
                    <span className="text-slate-400 block text-[11px]">Chương / Học phần</span>
                    <span className="font-bold text-white">{question.chapter || 'Chưa phân chương'}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#0e1732] border border-slate-700/80">
                    <span className="text-slate-400 block text-[11px]">Chủ đề</span>
                    <span className="font-bold text-white">{question.topic || 'Chưa phân chủ đề'}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#0e1732] border border-slate-700/80">
                    <span className="text-slate-400 block text-[11px]">Nguồn trích dẫn</span>
                    <span className="font-bold text-white">{question.sourceRef || question.sourceType}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#0e1732] border border-slate-700/80">
                    <span className="text-slate-400 block text-[11px]">Số lần đã sử dụng</span>
                    <span className="font-bold text-cyan-300 text-sm">{question.usageCount || 0} lần</span>
                  </div>
                </div>

                {/* Tags */}
                <div className="p-3 rounded-xl bg-[#0e1732] border border-slate-700/80 space-y-2">
                  <span className="text-slate-400 block text-[11px]">Thẻ từ khóa (Tags):</span>
                  <div className="flex flex-wrap gap-1.5">
                    {question.tags.map((tag) => (
                      <span key={tag} className="px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-500/40 text-[11px]">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Author Info */}
                <div className="p-3 rounded-xl bg-[#0e1732] border border-slate-700/80 space-y-1">
                  <span className="text-slate-400 block text-[11px]">Tác giả / Người biên soạn:</span>
                  <div className="font-bold text-white">{question.authorName}</div>
                  <div className="text-slate-400 text-[11px]">Ngày tạo: {new Date(question.createdAt).toLocaleString('vi-VN')}</div>
                  <div className="text-slate-400 text-[11px]">Cập nhật lần cuối: {new Date(question.updatedAt).toLocaleString('vi-VN')}</div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-4 sm:p-5 border-t border-slate-700/80 bg-[#0c142b] flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              {question.status !== 'APPROVED' && (
                <button
                  onClick={() => onApprove(question.id)}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black flex items-center gap-1.5 transition-colors cursor-pointer shadow-md shadow-emerald-600/30"
                  title="Duyệt câu hỏi vào ngân hàng chính thức"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Duyệt câu hỏi</span>
                </button>
              )}

              {question.status === 'PENDING_REVIEW' && (
                <button
                  onClick={() => onReject(question.id)}
                  className="px-3.5 py-2 bg-rose-950 hover:bg-rose-900 border border-rose-500/50 text-rose-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Từ chối và yêu cầu giáo viên sửa lại"
                >
                  <AlertCircle className="w-4 h-4" />
                  <span>Cần sửa lại</span>
                </button>
              )}

              <button
                onClick={() => onEdit(question)}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black flex items-center gap-1.5 transition-colors cursor-pointer shadow-md shadow-blue-600/30"
              >
                <Edit3 className="w-4 h-4" />
                <span>Chỉnh sửa</span>
              </button>

              <button
                onClick={() => onClone(question.id)}
                className="px-3 py-2 bg-[#121c38] hover:bg-[#1a2952] border border-slate-600 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Nhân bản câu hỏi này"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Nhân bản</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onArchive(question.id)}
                className="px-3 py-2 bg-[#121c38] hover:bg-[#1a2952] border border-slate-600 text-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Lưu trữ câu hỏi"
              >
                <Archive className="w-3.5 h-3.5" />
                <span>Lưu trữ</span>
              </button>

              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-2 text-rose-400 hover:text-white hover:bg-rose-900/50 rounded-xl transition-colors cursor-pointer"
                title="Xóa câu hỏi này"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#0c142b] border border-rose-500/50 rounded-2xl max-w-md w-full p-6 text-white space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="w-10 h-10 rounded-xl bg-rose-950 flex items-center justify-center border border-rose-500">
                <Trash2 className="w-5 h-5 text-rose-300" />
              </div>
              <div>
                <h3 className="font-black text-base text-white">Xác nhận xóa câu hỏi</h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">{question.code}</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Bạn có chắc chắn muốn xóa câu hỏi này khỏi Ngân hàng câu hỏi? Nếu câu hỏi đã được đưa vào các đề thi trước đây, đề thi cũ vẫn được bảo toàn dữ liệu snapshot.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  onDelete(question.id);
                  onClose();
                }}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-black shadow-lg shadow-rose-600/40 transition-colors cursor-pointer"
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
