import React, { useState, useEffect } from 'react';
import {
  X,
  Save,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  BookOpen,
  Tag,
  Sparkles,
  Layers,
  ArrowUpDown,
  MoveRight,
  ListPlus,
  FileText,
} from 'lucide-react';
import {
  BankQuestion,
  QuestionType,
  DifficultyLevel,
  ChoiceOption,
  TrueFalseStatement,
  MatchingItem,
  OrderingItem,
  BlankItem,
  ShortAnswerConfig,
  EssayConfig,
  SubQuestion,
} from '../../../types/questionBank';
import { GRADE_LEVELS } from '../../../data/mockData';

interface QuestionEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (questionData: any) => void;
  initialQuestion?: BankQuestion | null;
}

const QUESTION_TYPES: { type: QuestionType; label: string; desc: string }[] = [
  { type: 'SINGLE_CHOICE', label: '1. Một đáp án đúng', desc: '>=2 lựa chọn, đúng chính xác 1 (Trắc nghiệm đơn)' },
  { type: 'MULTIPLE_CHOICE', label: '2. Nhiều đáp án đúng', desc: '>=2 lựa chọn, chọn nhiều đáp án đúng' },
  { type: 'TRUE_FALSE_SERIES', label: '3. Đúng / Sai từng ý', desc: 'Nhiều mệnh đề con, mỗi ý đúng/sai độc lập' },
  { type: 'MATCHING', label: '4. Ghép đôi (Cột A - B)', desc: 'Nối các cặp khái niệm, định nghĩa tương ứng' },
  { type: 'ORDERING', label: '5. Sắp xếp thứ tự', desc: 'Sắp xếp các bước hoặc quy trình theo đúng trình tự' },
  { type: 'FILL_IN_BLANK', label: '6. Điền khuyết [blank]', desc: 'Điền từ/số vào vị trí trống trong câu' },
  { type: 'SHORT_ANSWER', label: '7. Trả lời ngắn', desc: 'Học sinh nhập đáp án ngắn có dung sai số học' },
  { type: 'ESSAY', label: '8. Tự luận (Rubric)', desc: 'Chấm tự luận với ma trận thang điểm Rubric' },
  { type: 'PASSAGE_BASED', label: '9. Đọc hiểu / Tình huống', desc: 'Một đoạn trích/ngữ cảnh chung kèm nhiều câu hỏi con' },
];

const SUBJECTS = [
  'Toán học',
  'Ngữ văn',
  'Tiếng Anh',
  'Vật lý',
  'Hóa học',
  'Sinh học',
  'KHTN',
  'Lịch sử',
  'Địa lý',
  'Tin học',
  'GDCD',
];

const DIFFICULTIES: DifficultyLevel[] = [
  'Nhận biết',
  'Thông hiểu',
  'Vận dụng',
  'Vận dụng cao',
];

export const QuestionEditorModal: React.FC<QuestionEditorModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialQuestion,
}) => {
  const isEditing = !!initialQuestion;

  // Form states
  const [type, setType] = useState<QuestionType>('SINGLE_CHOICE');
  const [subject, setSubject] = useState<string>('Toán học');
  const [gradeLevel, setGradeLevel] = useState<number>(10);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('Nhận biết');
  const [chapter, setChapter] = useState<string>('');
  const [topic, setTopic] = useState<string>('');
  const [tagInput, setTagInput] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  const [points, setPoints] = useState<number>(0.25);
  const [stem, setStem] = useState<string>('');
  const [explanation, setExplanation] = useState<string>('');
  const [sourceRef, setSourceRef] = useState<string>('');
  const [validationError, setValidationError] = useState<string | null>(null);

  // 1 & 2: Single & Multiple Choice Options
  const [options, setOptions] = useState<ChoiceOption[]>([
    { id: 'opt-1', label: 'A', text: '', isCorrect: true },
    { id: 'opt-2', label: 'B', text: '', isCorrect: false },
    { id: 'opt-3', label: 'C', text: '', isCorrect: false },
    { id: 'opt-4', label: 'D', text: '', isCorrect: false },
  ]);
  const [gradingRule, setGradingRule] = useState<'ALL_OR_NOTHING' | 'PARTIAL_CREDIT'>('PARTIAL_CREDIT');

  // 3: True / False Statements
  const [trueFalseItems, setTrueFalseItems] = useState<TrueFalseStatement[]>([
    { id: 'tf-1', statement: 'Mệnh đề số 1...', isTrue: true },
    { id: 'tf-2', statement: 'Mệnh đề số 2...', isTrue: false },
    { id: 'tf-3', statement: 'Mệnh đề số 3...', isTrue: true },
    { id: 'tf-4', statement: 'Mệnh đề số 4...', isTrue: false },
  ]);

  // 4: Matching Pairs
  const [matchingItems, setMatchingItems] = useState<MatchingItem[]>([
    { id: 'm-1', leftText: 'Khái niệm 1', rightText: 'Định nghĩa tương ứng 1', correctMatchId: 'm-1' },
    { id: 'm-2', leftText: 'Khái niệm 2', rightText: 'Định nghĩa tương ứng 2', correctMatchId: 'm-2' },
    { id: 'm-3', leftText: 'Khái niệm 3', rightText: 'Định nghĩa tương ứng 3', correctMatchId: 'm-3' },
  ]);

  // 5: Ordering Items
  const [orderingItems, setOrderingItems] = useState<OrderingItem[]>([
    { id: 'ord-1', text: 'Bước thứ nhất', correctOrder: 1 },
    { id: 'ord-2', text: 'Bước thứ hai', correctOrder: 2 },
    { id: 'ord-3', text: 'Bước thứ ba', correctOrder: 3 },
  ]);

  // 6: Fill in Blank
  const [blankItems, setBlankItems] = useState<BlankItem[]>([
    { id: 'blk-1', blankIndex: 1, acceptableAnswers: ['đáp án 1'], caseSensitive: false },
  ]);

  // 7: Short Answer
  const [shortAnswer, setShortAnswer] = useState<ShortAnswerConfig>({
    sampleAnswer: '',
    acceptedVariants: [],
    numericTolerance: 0.01,
    unit: '',
    manualGradingFallback: true,
  });

  // 8: Essay Rubric
  const [essayConfig, setEssayConfig] = useState<EssayConfig>({
    maxScore: 2.0,
    referenceAnswer: '',
    gradingTips: '',
    rubric: [
      { id: 'rb-1', criterion: 'Hình thức & Ngữ pháp', maxPoints: 0.5, description: 'Đúng chính tả, diễn đạt chuẩn' },
      { id: 'rb-2', criterion: 'Nội dung kiến thức cốt lõi', maxPoints: 1.0, description: 'Nêu đầy đủ luận điểm cần thiết' },
      { id: 'rb-3', criterion: 'Sáng tạo & Lập luận mở rộng', maxPoints: 0.5, description: 'Có dẫn chứng sâu sắc' },
    ],
  });

  // 9: Passage based
  const [passageTitle, setPassageTitle] = useState<string>('');
  const [passageText, setPassageText] = useState<string>('');
  const [subQuestions, setSubQuestions] = useState<SubQuestion[]>([
    {
      id: 'sub-1',
      type: 'SINGLE_CHOICE',
      stem: 'Câu hỏi phụ số 1...',
      difficulty: 'Thông hiểu',
      points: 0.5,
      options: [
        { id: 's1-a', label: 'A', text: 'Phương án A', isCorrect: true },
        { id: 's1-b', label: 'B', text: 'Phương án B', isCorrect: false },
        { id: 's1-c', label: 'C', text: 'Phương án C', isCorrect: false },
        { id: 's1-d', label: 'D', text: 'Phương án D', isCorrect: false },
      ],
    },
  ]);

  // Populate when editing
  useEffect(() => {
    if (initialQuestion) {
      setType(initialQuestion.type);
      setSubject(initialQuestion.subject);
      setGradeLevel(initialQuestion.gradeLevel);
      setDifficulty(initialQuestion.difficulty);
      setChapter(initialQuestion.chapter || '');
      setTopic(initialQuestion.topic || '');
      setTags(initialQuestion.tags || []);
      setPoints(initialQuestion.points || 0.25);
      setStem(initialQuestion.stem || '');
      setExplanation(initialQuestion.explanation || '');
      setSourceRef(initialQuestion.sourceRef || '');

      if (initialQuestion.options) setOptions(initialQuestion.options);
      if (initialQuestion.trueFalseItems) setTrueFalseItems(initialQuestion.trueFalseItems);
      if (initialQuestion.matchingItems) setMatchingItems(initialQuestion.matchingItems);
      if (initialQuestion.orderingItems) setOrderingItems(initialQuestion.orderingItems);
      if (initialQuestion.blankItems) setBlankItems(initialQuestion.blankItems);
      if (initialQuestion.shortAnswerConfig) setShortAnswer(initialQuestion.shortAnswerConfig);
      if (initialQuestion.essayConfig) setEssayConfig(initialQuestion.essayConfig);
      if (initialQuestion.passageStimulus) {
        setPassageTitle(initialQuestion.passageStimulus.title || '');
        setPassageText(initialQuestion.passageStimulus.text || '');
      }
      if (initialQuestion.subQuestions) setSubQuestions(initialQuestion.subQuestions);
    } else {
      // Reset defaults
      setStem('');
      setExplanation('');
      setTopic('');
      setTags([]);
    }
  }, [initialQuestion, isOpen]);

  if (!isOpen) return null;

  // Add tag
  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (t: string) => {
    setTags(tags.filter((item) => item !== t));
  };

  // Option handlers for Single & Multiple Choice
  const handleToggleOptionCorrect = (optId: string) => {
    if (type === 'SINGLE_CHOICE') {
      setOptions(
        options.map((o) => ({
          ...o,
          isCorrect: o.id === optId,
        }))
      );
    } else {
      setOptions(
        options.map((o) => (o.id === optId ? { ...o, isCorrect: !o.isCorrect } : o))
      );
    }
  };

  const handleAddOption = () => {
    const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
    const nextLetter = letters[options.length] || `Opt${options.length + 1}`;
    setOptions([
      ...options,
      {
        id: `opt-${Date.now()}`,
        label: nextLetter,
        text: '',
        isCorrect: false,
      },
    ]);
  };

  const handleRemoveOption = (id: string) => {
    if (options.length <= 2) return;
    setOptions(options.filter((o) => o.id !== id));
  };

  // Validation before save
  const handleValidateAndSave = () => {
    setValidationError(null);

    if (!stem.trim()) {
      setValidationError('Vui lòng nhập nội dung câu hỏi.');
      return;
    }

    if (type === 'SINGLE_CHOICE') {
      const hasCorrect = options.some((o) => o.isCorrect);
      if (!hasCorrect) {
        setValidationError('Vui lòng chỉ định một đáp án đúng cho câu hỏi một lựa chọn.');
        return;
      }
      const hasEmpty = options.some((o) => !o.text.trim());
      if (hasEmpty) {
        setValidationError('Vui lòng không để trống nội dung của bất kỳ phương án nào.');
        return;
      }
    }

    if (type === 'MULTIPLE_CHOICE') {
      const correctCount = options.filter((o) => o.isCorrect).length;
      if (correctCount === 0) {
        setValidationError('Câu hỏi nhiều lựa chọn phải có ít nhất 1 đáp án đúng.');
        return;
      }
    }

    if (type === 'SHORT_ANSWER') {
      if (!shortAnswer.sampleAnswer.trim()) {
        setValidationError('Vui lòng nhập đáp án mẫu cho câu trả lời ngắn.');
        return;
      }
    }

    if (type === 'PASSAGE_BASED') {
      if (!passageText.trim()) {
        setValidationError('Vui lòng nhập nội dung đoạn văn / tình huống.');
        return;
      }
    }

    // Build payload
    const payload: Partial<BankQuestion> = {
      type,
      subject,
      gradeLevel,
      difficulty,
      chapter,
      topic,
      tags,
      points: Number(points) || 0.25,
      stem,
      explanation,
      sourceRef,
      status: initialQuestion?.status || 'APPROVED',
      sourceType: initialQuestion?.sourceType || 'MANUAL',
      authorName: initialQuestion?.authorName || 'Thầy Nguyễn Văn Hùng',
    };

    if (type === 'SINGLE_CHOICE' || type === 'MULTIPLE_CHOICE') {
      payload.options = options;
      payload.gradingRule = gradingRule;
    } else if (type === 'TRUE_FALSE_SERIES') {
      payload.trueFalseItems = trueFalseItems;
    } else if (type === 'MATCHING') {
      payload.matchingItems = matchingItems;
    } else if (type === 'ORDERING') {
      payload.orderingItems = orderingItems;
    } else if (type === 'FILL_IN_BLANK') {
      payload.blankItems = blankItems;
    } else if (type === 'SHORT_ANSWER') {
      payload.shortAnswerConfig = shortAnswer;
    } else if (type === 'ESSAY') {
      payload.essayConfig = essayConfig;
    } else if (type === 'PASSAGE_BASED') {
      payload.passageStimulus = {
        title: passageTitle,
        text: passageText,
      };
      payload.subQuestions = subQuestions;
    }

    onSave(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-[#0b1328] border border-cyan-500/40 rounded-3xl max-w-4xl w-full text-slate-100 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in-95">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-700/80 bg-[#080d1c] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-600/30 border border-cyan-500/50 flex items-center justify-center text-cyan-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white">
                {isEditing ? `Chỉnh Sửa Câu Hỏi (${initialQuestion.code})` : 'Thêm Câu Hỏi Mới Vào Ngân Hàng'}
              </h2>
              <p className="text-xs text-slate-400">
                Hỗ trợ đầy đủ 9 dạng câu hỏi chuẩn Bộ GD&ĐT & PISA, công thức toán LaTeX và ma trận điểm
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

        {/* Modal Scroll Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {validationError && (
            <div className="p-3.5 bg-rose-950/70 border border-rose-500 text-rose-200 rounded-2xl text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Type Selector Grid (9 Types) */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase text-slate-300 tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-cyan-400" />
              Chọn 1 trong 9 dạng câu hỏi:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {QUESTION_TYPES.map((qt) => {
                const isSelected = type === qt.type;
                return (
                  <button
                    key={qt.type}
                    type="button"
                    onClick={() => setType(qt.type)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-950/80 border-cyan-400 shadow-md shadow-cyan-500/20 ring-1 ring-cyan-400'
                        : 'bg-[#0f1730] border-slate-700/80 hover:bg-[#142146] text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-black ${isSelected ? 'text-cyan-300' : 'text-white'}`}>
                        {qt.label}
                      </span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-cyan-400" />}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {qt.desc}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Metadata Row: Subject, Grade, Difficulty, Points */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#080d1c] p-4 rounded-2xl border border-slate-700/80">
            <div>
              <label className="text-[11px] font-bold text-slate-400 block mb-1">Môn học</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-[#0f1730] border border-slate-600 rounded-xl px-2.5 py-1.5 text-xs text-white outline-none font-bold"
              >
                {SUBJECTS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-400 block mb-1">Khối lớp (1 - 12)</label>
              <select
                value={gradeLevel}
                onChange={(e) => setGradeLevel(Number(e.target.value))}
                className="w-full bg-[#0f1730] border border-slate-600 rounded-xl px-2.5 py-1.5 text-xs text-white outline-none font-bold"
              >
                {GRADE_LEVELS.map((g) => (
                  <option key={g.level} value={g.level}>{g.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-400 block mb-1">Mức độ nhận thức</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as DifficultyLevel)}
                className="w-full bg-[#0f1730] border border-slate-600 rounded-xl px-2.5 py-1.5 text-xs text-white outline-none font-bold"
              >
                {DIFFICULTIES.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-400 block mb-1">Điểm mặc định</label>
              <input
                type="number"
                step="0.25"
                min="0.25"
                max="10"
                value={points}
                onChange={(e) => setPoints(parseFloat(e.target.value))}
                className="w-full bg-[#0f1730] border border-slate-600 rounded-xl px-2.5 py-1.5 text-xs text-white outline-none font-bold"
              />
            </div>
          </div>

          {/* Chapter, Topic, Tags */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Chương / Bài</label>
              <input
                type="text"
                placeholder="VD: Chương 2: Vectơ"
                value={chapter}
                onChange={(e) => setChapter(e.target.value)}
                className="w-full bg-[#0f1730] border border-slate-600 rounded-xl px-3 py-1.5 text-xs text-white outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Chủ đề chi tiết</label>
              <input
                type="text"
                placeholder="VD: Tích vô hướng của 2 vectơ"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full bg-[#0f1730] border border-slate-600 rounded-xl px-3 py-1.5 text-xs text-white outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Thẻ từ khóa (Tags)</label>
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  placeholder="Thêm tag..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  className="flex-1 bg-[#0f1730] border border-slate-600 rounded-xl px-3 py-1.5 text-xs text-white outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-2.5 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-xl text-xs font-bold text-white cursor-pointer"
                >
                  Thêm
                </button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {tags.map((t) => (
                    <span
                      key={t}
                      onClick={() => handleRemoveTag(t)}
                      className="px-2 py-0.5 rounded-md bg-blue-950 text-blue-300 border border-blue-500/40 text-[10px] cursor-pointer hover:bg-rose-950 hover:text-rose-300 hover:border-rose-500"
                      title="Click để xóa tag"
                    >
                      #{t} ×
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* PASSAGE STIMULUS (Only for Type 9) */}
          {type === 'PASSAGE_BASED' && (
            <div className="p-4 rounded-2xl bg-[#090f20] border border-fuchsia-500/40 space-y-3">
              <div className="text-xs font-black uppercase text-fuchsia-300 tracking-wider flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Đoạn trích / Ngữ cảnh chung (Passage / Stimulus)
              </div>
              <input
                type="text"
                placeholder="Tiêu đề đoạn trích (tùy chọn)..."
                value={passageTitle}
                onChange={(e) => setPassageTitle(e.target.value)}
                className="w-full bg-[#070b16] border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white outline-none font-bold"
              />
              <textarea
                rows={4}
                placeholder="Dán toàn bộ văn bản đọc hiểu, bảng biểu hoặc trích đoạn vào đây..."
                value={passageText}
                onChange={(e) => setPassageText(e.target.value)}
                className="w-full bg-[#070b16] border border-slate-700 rounded-xl p-3 text-xs text-white outline-none focus:border-fuchsia-400 leading-relaxed font-sans"
              />
            </div>
          )}

          {/* Stem / Question Text */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase text-slate-300 tracking-wider">
                Nội dung câu hỏi (Chấp nhận công thức LaTeX $...$ và ký tự đặc biệt):
              </label>
              <span className="text-[11px] text-cyan-400 font-medium">{'Hỗ trợ LaTeX: $\\sqrt{x}$, $\\frac{a}{b}$, $x^2$'}</span>
            </div>
            <textarea
              rows={3}
              placeholder="Nhập nội dung đề bài tại đây..."
              value={stem}
              onChange={(e) => setStem(e.target.value)}
              className="w-full bg-[#0f1730] border border-slate-600 rounded-2xl p-3.5 text-xs text-white outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 leading-relaxed"
            />
          </div>

          {/* =========================================================================
              DYNAMIC ANSWER CONFIGURATORS ACCORDING TO 9 TYPES
              ========================================================================= */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            {/* TYPE 1 & 2: Single & Multiple Choice */}
            {(type === 'SINGLE_CHOICE' || type === 'MULTIPLE_CHOICE') && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-black uppercase text-slate-300 tracking-wider">
                    {type === 'SINGLE_CHOICE' ? 'Các lựa chọn (Tích chọn đúng 1 đáp án):' : 'Các lựa chọn (Tích chọn các đáp án đúng):'}
                  </div>
                  {type === 'MULTIPLE_CHOICE' && (
                    <select
                      value={gradingRule}
                      onChange={(e) => setGradingRule(e.target.value as any)}
                      className="bg-[#0f1730] border border-slate-600 text-[11px] text-white rounded-lg px-2 py-1 outline-none font-bold"
                    >
                      <option value="PARTIAL_CREDIT">Chấm điểm từng phần (Khuyên dùng)</option>
                      <option value="ALL_OR_NOTHING">Đúng toàn bộ mới có điểm</option>
                    </select>
                  )}
                </div>

                <div className="space-y-2">
                  {options.map((opt) => (
                    <div
                      key={opt.id}
                      className={`flex items-center gap-2.5 p-2.5 rounded-2xl border transition-all ${
                        opt.isCorrect
                          ? 'bg-emerald-950/40 border-emerald-500/70 ring-1 ring-emerald-500/50'
                          : 'bg-[#0f1730] border-slate-700'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => handleToggleOptionCorrect(opt.id)}
                        className={`w-7 h-7 rounded-xl text-xs font-black flex items-center justify-center transition-transform active:scale-90 cursor-pointer ${
                          opt.isCorrect
                            ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/40'
                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        }`}
                        title="Click để chọn làm đáp án đúng"
                      >
                        {opt.label}
                      </button>

                      <input
                        type="text"
                        placeholder={`Nội dung lựa chọn ${opt.label}...`}
                        value={opt.text}
                        onChange={(e) =>
                          setOptions(
                            options.map((o) => (o.id === opt.id ? { ...o, text: e.target.value } : o))
                          )
                        }
                        className="flex-1 bg-transparent border-none text-xs text-white outline-none"
                      />

                      {options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveOption(opt.id)}
                          className="p-1 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleAddOption}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0f1936] hover:bg-[#14234d] border border-slate-700 rounded-xl text-xs font-bold text-cyan-300 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Thêm phương án</span>
                </button>
              </div>
            )}

            {/* TYPE 3: True / False Series */}
            {type === 'TRUE_FALSE_SERIES' && (
              <div className="space-y-3">
                <div className="text-xs font-black uppercase text-slate-300 tracking-wider">
                  Các mệnh đề kiểm tra Đúng / Sai:
                </div>
                <div className="space-y-2">
                  {trueFalseItems.map((tf, idx) => (
                    <div key={tf.id} className="p-3 rounded-2xl bg-[#0f1730] border border-slate-700 flex items-center gap-3">
                      <span className="w-6 h-6 rounded-lg bg-slate-800 text-xs font-bold flex items-center justify-center text-slate-300">
                        {idx + 1}
                      </span>
                      <input
                        type="text"
                        placeholder="Nội dung mệnh đề..."
                        value={tf.statement}
                        onChange={(e) =>
                          setTrueFalseItems(
                            trueFalseItems.map((item) =>
                              item.id === tf.id ? { ...item, statement: e.target.value } : item
                            )
                          )
                        }
                        className="flex-1 bg-transparent border-none text-xs text-white outline-none"
                      />
                      <div className="flex items-center gap-1 bg-[#0a1022] p-1 rounded-xl border border-slate-700">
                        <button
                          type="button"
                          onClick={() =>
                            setTrueFalseItems(
                              trueFalseItems.map((item) =>
                                item.id === tf.id ? { ...item, isTrue: true } : item
                              )
                            )
                          }
                          className={`px-2.5 py-1 text-xs font-black rounded-lg transition-colors cursor-pointer ${
                            tf.isTrue ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          ĐÚNG
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setTrueFalseItems(
                              trueFalseItems.map((item) =>
                                item.id === tf.id ? { ...item, isTrue: false } : item
                              )
                            )
                          }
                          className={`px-2.5 py-1 text-xs font-black rounded-lg transition-colors cursor-pointer ${
                            !tf.isTrue ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          SAI
                        </button>
                      </div>
                      {trueFalseItems.length > 2 && (
                        <button
                          type="button"
                          onClick={() => setTrueFalseItems(trueFalseItems.filter((i) => i.id !== tf.id))}
                          className="p-1 text-slate-400 hover:text-rose-400 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setTrueFalseItems([
                      ...trueFalseItems,
                      { id: `tf-${Date.now()}`, statement: '', isTrue: true },
                    ])
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0f1936] hover:bg-[#14234d] border border-slate-700 rounded-xl text-xs font-bold text-cyan-300 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Thêm mệnh đề</span>
                </button>
              </div>
            )}

            {/* TYPE 4: Matching */}
            {type === 'MATCHING' && (
              <div className="space-y-3">
                <div className="text-xs font-black uppercase text-slate-300 tracking-wider">
                  Cặp ghép nối Cột A và Cột B:
                </div>
                <div className="space-y-2">
                  {matchingItems.map((m, idx) => (
                    <div key={m.id} className="p-3 rounded-2xl bg-[#0f1730] border border-slate-700 flex items-center gap-3">
                      <span className="font-bold text-xs text-blue-400">#{idx + 1}</span>
                      <input
                        type="text"
                        placeholder="Nội dung Cột A..."
                        value={m.leftText}
                        onChange={(e) =>
                          setMatchingItems(
                            matchingItems.map((item) =>
                              item.id === m.id ? { ...item, leftText: e.target.value } : item
                            )
                          )
                        }
                        className="flex-1 bg-[#0a1022] border border-slate-700 rounded-xl px-2.5 py-1 text-xs text-white outline-none"
                      />
                      <MoveRight className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                      <input
                        type="text"
                        placeholder="Nội dung tương ứng Cột B..."
                        value={m.rightText}
                        onChange={(e) =>
                          setMatchingItems(
                            matchingItems.map((item) =>
                              item.id === m.id ? { ...item, rightText: e.target.value } : item
                            )
                          )
                        }
                        className="flex-1 bg-[#0a1022] border border-slate-700 rounded-xl px-2.5 py-1 text-xs text-white outline-none"
                      />
                      {matchingItems.length > 2 && (
                        <button
                          type="button"
                          onClick={() => setMatchingItems(matchingItems.filter((i) => i.id !== m.id))}
                          className="p-1 text-slate-400 hover:text-rose-400 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setMatchingItems([
                      ...matchingItems,
                      { id: `m-${Date.now()}`, leftText: '', rightText: '', correctMatchId: `m-${Date.now()}` },
                    ])
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0f1936] hover:bg-[#14234d] border border-slate-700 rounded-xl text-xs font-bold text-cyan-300 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Thêm cặp ghép đôi</span>
                </button>
              </div>
            )}

            {/* TYPE 5: Ordering */}
            {type === 'ORDERING' && (
              <div className="space-y-3">
                <div className="text-xs font-black uppercase text-slate-300 tracking-wider">
                  Các mục và Thứ tự đúng chuẩn (Học sinh sẽ được xáo trộn ngẫu nhiên khi làm):
                </div>
                <div className="space-y-2">
                  {orderingItems.map((ord, idx) => (
                    <div key={ord.id} className="p-3 rounded-2xl bg-[#0f1730] border border-slate-700 flex items-center gap-3">
                      <span className="w-7 h-7 rounded-xl bg-purple-950 text-purple-300 border border-purple-500/40 text-xs font-black flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <input
                        type="text"
                        placeholder="Nội dung bước / giai đoạn..."
                        value={ord.text}
                        onChange={(e) =>
                          setOrderingItems(
                            orderingItems.map((item) =>
                              item.id === ord.id ? { ...item, text: e.target.value } : item
                            )
                          )
                        }
                        className="flex-1 bg-transparent border-none text-xs text-white outline-none"
                      />
                      {orderingItems.length > 2 && (
                        <button
                          type="button"
                          onClick={() => setOrderingItems(orderingItems.filter((i) => i.id !== ord.id))}
                          className="p-1 text-slate-400 hover:text-rose-400 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setOrderingItems([
                      ...orderingItems,
                      { id: `ord-${Date.now()}`, text: '', correctOrder: orderingItems.length + 1 },
                    ])
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0f1936] hover:bg-[#14234d] border border-slate-700 rounded-xl text-xs font-bold text-cyan-300 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Thêm phần tử sắp xếp</span>
                </button>
              </div>
            )}

            {/* TYPE 6: Fill in blank */}
            {type === 'FILL_IN_BLANK' && (
              <div className="space-y-3">
                <div className="text-xs font-black uppercase text-slate-300 tracking-wider">
                  Cấu hình đáp án các ô trống:
                </div>
                <p className="text-[11px] text-slate-400">
                  Trong phần nội dung câu hỏi, hãy đánh dấu vị trí điền khuyết bằng [blank_1], [blank_2]...
                </p>
                <div className="space-y-2">
                  {blankItems.map((blk) => (
                    <div key={blk.id} className="p-3 rounded-2xl bg-[#0f1730] border border-slate-700 flex items-center gap-3">
                      <span className="font-bold text-xs text-cyan-300 flex-shrink-0">
                        Ô [blank_{blk.blankIndex}]:
                      </span>
                      <input
                        type="text"
                        placeholder="Nhập các đáp án chấp nhận (ngăn cách bởi dấu phẩy)..."
                        value={blk.acceptableAnswers.join(', ')}
                        onChange={(e) => {
                          const arr = e.target.value.split(',').map((s) => s.trim()).filter(Boolean);
                          setBlankItems(
                            blankItems.map((item) =>
                              item.id === blk.id ? { ...item, acceptableAnswers: arr } : item
                            )
                          );
                        }}
                        className="flex-1 bg-[#0a1022] border border-slate-700 rounded-xl px-2.5 py-1 text-xs text-white outline-none"
                      />
                      {blankItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setBlankItems(blankItems.filter((i) => i.id !== blk.id))}
                          className="p-1 text-slate-400 hover:text-rose-400 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setBlankItems([
                      ...blankItems,
                      { id: `blk-${Date.now()}`, blankIndex: blankItems.length + 1, acceptableAnswers: [] },
                    ])
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0f1936] hover:bg-[#14234d] border border-slate-700 rounded-xl text-xs font-bold text-cyan-300 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Thêm ô trống</span>
                </button>
              </div>
            )}

            {/* TYPE 7: Short answer */}
            {type === 'SHORT_ANSWER' && (
              <div className="p-4 rounded-2xl bg-[#0f1730] border border-slate-700 space-y-3">
                <div className="text-xs font-black uppercase text-slate-300 tracking-wider">
                  Cấu hình đáp án trả lời ngắn:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-400 block mb-1">Đáp án chuẩn (Chính xác)</label>
                    <input
                      type="text"
                      placeholder="VD: 15.5 hoặc H2SO4"
                      value={shortAnswer.sampleAnswer}
                      onChange={(e) => setShortAnswer({ ...shortAnswer, sampleAnswer: e.target.value })}
                      className="w-full bg-[#0a1022] border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white outline-none font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 block mb-1">Dung sai số học (±)</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="VD: 0.05"
                      value={shortAnswer.numericTolerance || 0}
                      onChange={(e) => setShortAnswer({ ...shortAnswer, numericTolerance: parseFloat(e.target.value) })}
                      className="w-full bg-[#0a1022] border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-1">Các cách viết khác được chấp nhận (ngăn cách bởi dấu phẩy)</label>
                  <input
                    type="text"
                    placeholder="VD: 15,5, 31/2, mười lăm phẩy năm"
                    value={shortAnswer.acceptedVariants.join(', ')}
                    onChange={(e) =>
                      setShortAnswer({
                        ...shortAnswer,
                        acceptedVariants: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                      })
                    }
                    className="w-full bg-[#0a1022] border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white outline-none"
                  />
                </div>
              </div>
            )}

            {/* TYPE 8: Essay Rubric */}
            {type === 'ESSAY' && (
              <div className="space-y-3">
                <div className="text-xs font-black uppercase text-slate-300 tracking-wider">
                  Thang điểm Rubric & Hướng dẫn chấm:
                </div>
                <div className="space-y-2">
                  {essayConfig.rubric.map((rb) => (
                    <div key={rb.id} className="p-3 rounded-2xl bg-[#0f1730] border border-slate-700 flex items-start gap-3">
                      <div className="flex-1 space-y-1.5">
                        <input
                          type="text"
                          placeholder="Tiêu chí đánh giá..."
                          value={rb.criterion}
                          onChange={(e) =>
                            setEssayConfig({
                              ...essayConfig,
                              rubric: essayConfig.rubric.map((item) =>
                                item.id === rb.id ? { ...item, criterion: e.target.value } : item
                              ),
                            })
                          }
                          className="w-full bg-[#0a1022] border border-slate-700 rounded-xl px-2.5 py-1 text-xs text-white font-bold outline-none"
                        />
                        <input
                          type="text"
                          placeholder="Mô tả mức đạt được..."
                          value={rb.description}
                          onChange={(e) =>
                            setEssayConfig({
                              ...essayConfig,
                              rubric: essayConfig.rubric.map((item) =>
                                item.id === rb.id ? { ...item, description: e.target.value } : item
                              ),
                            })
                          }
                          className="w-full bg-[#0a1022] border border-slate-700 rounded-xl px-2.5 py-1 text-[11px] text-slate-300 outline-none"
                        />
                      </div>
                      <div className="w-20">
                        <input
                          type="number"
                          step="0.25"
                          placeholder="Điểm"
                          value={rb.maxPoints}
                          onChange={(e) =>
                            setEssayConfig({
                              ...essayConfig,
                              rubric: essayConfig.rubric.map((item) =>
                                item.id === rb.id ? { ...item, maxPoints: parseFloat(e.target.value) } : item
                              ),
                            })
                          }
                          className="w-full bg-[#0a1022] border border-slate-700 rounded-xl px-2 py-1 text-xs text-amber-300 font-black outline-none text-right"
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-1">Đáp án mẫu / Dàn ý gợi ý</label>
                  <textarea
                    rows={2}
                    placeholder="Nội dung bài viết mẫu hoặc dàn ý chính để giáo viên đối chiếu..."
                    value={essayConfig.referenceAnswer}
                    onChange={(e) => setEssayConfig({ ...essayConfig, referenceAnswer: e.target.value })}
                    className="w-full bg-[#0f1730] border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Explanation / Lời giải chi tiết */}
          <div className="space-y-1.5 pt-2 border-t border-slate-800">
            <label className="text-xs font-black uppercase text-emerald-400 tracking-wider flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4" />
              Lời giải & Hướng dẫn giải chi tiết (Khuyên dùng để học sinh xem lại sau khi nộp bài):
            </label>
            <textarea
              rows={3}
              placeholder="Nhập giải thích từng bước hoặc ghi chú sư phạm..."
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              className="w-full bg-[#0f1730] border border-slate-600 rounded-2xl p-3 text-xs text-white outline-none focus:border-emerald-400"
            />
          </div>

          {/* Source Ref */}
          <div>
            <label className="text-xs font-bold text-slate-400 block mb-1">Nguồn câu hỏi / Tham chiếu</label>
            <input
              type="text"
              placeholder="VD: Đề thi THPT Quốc Gia 2024 / SGK Kết Nối Tri Thức bài 12"
              value={sourceRef}
              onChange={(e) => setSourceRef(e.target.value)}
              className="w-full bg-[#0f1730] border border-slate-600 rounded-xl px-3 py-1.5 text-xs text-white outline-none"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-700/80 bg-[#080d1c] flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            Hủy bỏ
          </button>

          <button
            type="button"
            onClick={handleValidateAndSave}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-cyan-500/30 transition-all cursor-pointer active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>{isEditing ? 'Cập nhật câu hỏi' : 'Lưu vào ngân hàng'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
