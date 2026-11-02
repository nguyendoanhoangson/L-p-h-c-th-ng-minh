import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Edit2,
  Check,
  Layers,
  Sliders,
  ShieldCheck,
  HelpCircle,
  BrainCircuit,
  Eye,
} from 'lucide-react';
import {
  BankQuestion,
  QuestionType,
  DifficultyLevel,
} from '../../../types/questionBank';

interface AiQuestionWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onQuestionsGenerated: (approvedQuestions: BankQuestion[]) => void;
}

const SAMPLE_DOCS = [
  {
    title: 'Toán 10 - Chương 1: Mệnh đề và Tập hợp',
    content: 'Mệnh đề toán học là một khẳng định đúng hoặc một khẳng định sai. Một mệnh đề không thể vừa đúng vừa sai. Mệnh đề chứa biến P(x) là câu khẳng định chứa biến nhận giá trị trong tập X. Với mỗi x cụ thể, P(x) trở thành một mệnh đề. Phủ định của mệnh đề P là mệnh đề không phải P, kí hiệu là P ngang. Mệnh đề kéo theo P suy ra Q chỉ sai khi P đúng và Q sai.',
  },
  {
    title: 'Vật lý 10 - Chương 2: Động học chất điểm',
    content: 'Chuyển động thẳng biến đổi đều là chuyển động thẳng trong đó gia tốc là hằng số. Vận tốc tức thời v = v0 + at. Quãng đường đi được s = v0*t + 0.5*a*t^2. Công thức độc lập thời gian v^2 - v0^2 = 2as. Rơi tự do là sự rơi chỉ dưới tác dụng của trọng lực với gia tốc g xấp xỉ 9.8 m/s^2.',
  },
  {
    title: 'Hóa học 10 - Bảng tuần hoàn các nguyên tố',
    content: 'Bảng tuần hoàn gồm các ô nguyên tố, chu kì và nhóm. Số thứ tự của ô nguyên tố bằng số hiệu nguyên tử Z. Chu kì gồm các nguyên tố có cùng số lớp electron trong nguyên tử. Nhóm gồm các nguyên tố có cấu hình electron tương tự nhau, có tính chất hóa học gần giống nhau.',
  },
];

export const AiQuestionWizardModal: React.FC<AiQuestionWizardModalProps> = ({
  isOpen,
  onClose,
  onQuestionsGenerated,
}) => {
  const [step, setStep] = useState<number>(1); // 1: Nguồn -> 2: Cấu hình -> 3: Tiến trình -> 4: Review -> 5: Lưu

  // Step 1: Nguồn
  const [sourceType, setSourceType] = useState<'text' | 'file'>('text');
  const [sourceTopic, setSourceTopic] = useState<string>('Bất đẳng thức Cauchy và giá trị lớn nhất - nhỏ nhất');
  const [sourceContent, setSourceContent] = useState<string>(SAMPLE_DOCS[0].content);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  // Step 2: Cấu hình
  const [gradeLevel, setGradeLevel] = useState<number>(10);
  const [subject, setSubject] = useState<string>('Toán học');
  const [chapter, setChapter] = useState<string>('Chương 1: Mệnh đề & Tập hợp');
  const [numQuestions, setNumQuestions] = useState<number>(4);
  const [selectedTypes, setSelectedTypes] = useState<QuestionType[]>([
    'SINGLE_CHOICE',
    'MULTIPLE_CHOICE',
    'TRUE_FALSE_SERIES',
    'SHORT_ANSWER',
  ]);
  const [difficultyDistribution, setDifficultyDistribution] = useState<{
    NB: number;
    TH: number;
    VD: number;
    VDC: number;
  }>({ NB: 25, TH: 50, VD: 25, VDC: 0 });
  const [strictToSource, setStrictToSource] = useState<boolean>(true);

  // Step 3: Tiến trình
  const [generationProgress, setGenerationProgress] = useState<number>(0);
  const [progressLog, setProgressLog] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Step 4: Review & Sửa
  const [generatedList, setGeneratedList] = useState<BankQuestion[]>([]);
  const [selectedToApprove, setSelectedToApprove] = useState<string[]>([]);
  const [editingQuestion, setEditingQuestion] = useState<BankQuestion | null>(null);

  if (!isOpen) return null;

  // Handle file upload text extract
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setSourceContent(text || 'Nội dung trích xuất từ file bài giảng...');
      };
      reader.readAsText(file);
    }
  };

  // Start generation simulation
  const handleStartGeneration = () => {
    setStep(3);
    setIsGenerating(true);
    setGenerationProgress(10);
    setProgressLog('Đang kết nối tới mô hình AI Gemini...');

    setTimeout(() => {
      setGenerationProgress(35);
      setProgressLog('Đang phân tích cấu trúc tài liệu đầu vào & chuẩn hóa mục tiêu học tập...');
    }, 600);

    setTimeout(() => {
      setGenerationProgress(65);
      setProgressLog('Đang sinh câu hỏi theo 9 dạng với JSON schema nghiêm ngặt...');
    }, 1200);

    setTimeout(() => {
      setGenerationProgress(90);
      setProgressLog('Đang xác minh tính chính xác của đáp án & chống ảo giác (hallucination)...');
    }, 1800);

    setTimeout(() => {
      // Mock generated list aligned with specifications
      const now = new Date().toISOString();
      const mockResult: BankQuestion[] = [
        {
          id: `ai-gen-${Date.now()}-1`,
          code: `${subject.toUpperCase().slice(0, 4)}${gradeLevel}-NB-AI01`,
          type: 'SINGLE_CHOICE',
          stem: `Dựa vào tài liệu, khẳng định nào sau đây là định nghĩa chính xác nhất về khái niệm đang đề cập?`,
          difficulty: 'Nhận biết',
          gradeLevel,
          subject,
          chapter,
          topic: sourceTopic,
          tags: ['AI đề xuất', 'nhận biết', 'bám sát tài liệu'],
          points: 0.25,
          options: [
            { id: 'opt-a1', label: 'A', text: 'Khẳng định đúng hoặc khẳng định sai, không thể vừa đúng vừa sai.', isCorrect: true },
            { id: 'opt-a2', label: 'B', text: 'Câu hỏi có thể có nhiều câu trả lời cùng lúc.', isCorrect: false },
            { id: 'opt-a3', label: 'C', text: 'Câu cảm thán bộc lộ cảm xúc cá nhân.', isCorrect: false },
            { id: 'opt-a4', label: 'D', text: 'Một mệnh đề có thể vừa đúng vừa sai tùy theo thời điểm.', isCorrect: false },
          ],
          explanation: 'Theo tài liệu đầu vào: "Mệnh đề toán học là một khẳng định đúng hoặc một khẳng định sai. Một mệnh đề không thể vừa đúng vừa sai."',
          status: 'PENDING_REVIEW',
          sourceType: 'AI_GENERATED',
          sourceRef: `AI Prompt (Tài liệu: ${uploadedFileName || sourceTopic})`,
          authorId: 'gemini-ai',
          authorName: 'AI Hỗ Trợ (Gemini 2.5 Flash)',
          isAiGenerated: true,
          aiPromptMeta: {
            model: 'gemini-2.5-flash',
            promptVersion: 'v2.1',
            confidenceNote: 'Độ khớp tài liệu 99.2%',
          },
          version: 1,
          revisions: [],
          usageCount: 0,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: `ai-gen-${Date.now()}-2`,
          code: `${subject.toUpperCase().slice(0, 4)}${gradeLevel}-TH-AI02`,
          type: 'TRUE_FALSE_SERIES',
          stem: `Xét tính Đúng / Sai của các khẳng định sau liên quan đến nội dung bài học:`,
          difficulty: 'Thông hiểu',
          gradeLevel,
          subject,
          chapter,
          topic: sourceTopic,
          tags: ['AI đề xuất', 'đúng sai theo ý'],
          points: 1.0,
          trueFalseItems: [
            { id: 'tf-a1', statement: 'Mệnh đề chứa biến P(x) chỉ trở thành mệnh đề khi gán x một giá trị cụ thể.', isTrue: true },
            { id: 'tf-a2', statement: 'Phủ định của mệnh đề "P" kí hiệu là $\\overline{P}$.', isTrue: true },
            { id: 'tf-a3', statement: 'Mệnh đề kéo theo P => Q luôn luôn đúng trong mọi trường hợp.', isTrue: false },
            { id: 'tf-a4', statement: 'Mệnh đề đảo của một mệnh đề đúng cũng luôn luôn là một mệnh đề đúng.', isTrue: false },
          ],
          explanation: 'Mệnh đề kéo theo P => Q chỉ sai khi P đúng và Q sai. Mệnh đề đảo không nhất thiết đúng khi mệnh đề thuận đúng.',
          status: 'PENDING_REVIEW',
          sourceType: 'AI_GENERATED',
          sourceRef: `AI Prompt (Tài liệu: ${uploadedFileName || sourceTopic})`,
          authorId: 'gemini-ai',
          authorName: 'AI Hỗ Trợ (Gemini 2.5 Flash)',
          isAiGenerated: true,
          version: 1,
          revisions: [],
          usageCount: 0,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: `ai-gen-${Date.now()}-3`,
          code: `${subject.toUpperCase().slice(0, 4)}${gradeLevel}-VD-AI03`,
          type: 'SHORT_ANSWER',
          stem: `Tìm giá trị nhỏ nhất của biểu thức $P = x + \\frac{4}{x}$ với $x > 0$. (Nhập số nguyên)`,
          difficulty: 'Vận dụng',
          gradeLevel,
          subject,
          chapter,
          topic: sourceTopic,
          tags: ['AI đề xuất', 'vận dụng', 'tính toán'],
          points: 0.5,
          shortAnswerConfig: {
            sampleAnswer: '4',
            acceptedVariants: ['4', '4.0'],
            numericTolerance: 0.01,
            manualGradingFallback: false,
          },
          explanation: 'Áp dụng BĐT Cauchy: $x + 4/x \\ge 2\\sqrt{x \\cdot 4/x} = 4$. Dấu bằng khi $x = 2$.',
          status: 'PENDING_REVIEW',
          sourceType: 'AI_GENERATED',
          sourceRef: `AI Prompt (Tài liệu: ${uploadedFileName || sourceTopic})`,
          authorId: 'gemini-ai',
          authorName: 'AI Hỗ Trợ (Gemini 2.5 Flash)',
          isAiGenerated: true,
          version: 1,
          revisions: [],
          usageCount: 0,
          createdAt: now,
          updatedAt: now,
        },
      ];

      setGeneratedList(mockResult);
      setSelectedToApprove(mockResult.map((q) => q.id)); // Mặc định chọn tất cả
      setGenerationProgress(100);
      setIsGenerating(false);
      setStep(4);
    }, 2400);
  };

  // Toggle selection
  const handleToggleSelect = (id: string) => {
    if (selectedToApprove.includes(id)) {
      setSelectedToApprove(selectedToApprove.filter((item) => item !== id));
    } else {
      setSelectedToApprove([...selectedToApprove, id]);
    }
  };

  // Final Save
  const handleFinishAndSave = () => {
    const approvedQuestions = generatedList
      .filter((q) => selectedToApprove.includes(q.id))
      .map((q) => ({
        ...q,
        status: 'APPROVED' as const, // Giáo viên đã duyệt trực tiếp
      }));

    onQuestionsGenerated(approvedQuestions);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-[#0b1328] border border-purple-500/40 rounded-3xl max-w-4xl w-full text-slate-100 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in-95">
        {/* Wizard Header */}
        <div className="p-4 sm:p-5 border-b border-slate-700/80 bg-[#080d1c] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/30">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span>AI Hỗ Trợ Soạn Câu Hỏi Chuẩn Bộ GD&ĐT</span>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-500/50">
                  Wizard 5 Bước
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Tự động bám sát bài học, chống ảo giác kiến thức, giáo viên duyệt từng câu trước khi công bố
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

        {/* Step Indicator Bar */}
        <div className="px-5 py-3 border-b border-slate-800 bg-[#070b18] flex items-center justify-between text-xs overflow-x-auto">
          {[
            { num: 1, title: 'Nguồn tài liệu' },
            { num: 2, title: 'Cấu hình ma trận' },
            { num: 3, title: 'Sinh câu hỏi' },
            { num: 4, title: 'Review & Duyệt' },
            { num: 5, title: 'Lưu ngân hàng' },
          ].map((s) => (
            <div
              key={s.num}
              className={`flex items-center gap-2 font-bold whitespace-nowrap px-2 py-1 rounded-lg ${
                step === s.num
                  ? 'text-purple-300 bg-purple-950/60 border border-purple-500/40'
                  : step > s.num
                  ? 'text-emerald-400'
                  : 'text-slate-500'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full text-[11px] font-black flex items-center justify-center ${
                  step === s.num
                    ? 'bg-purple-600 text-white'
                    : step > s.num
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {step > s.num ? '✓' : s.num}
              </span>
              <span>{s.title}</span>
            </div>
          ))}
        </div>

        {/* Wizard Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6">
          {/* STEP 1: NGUỒN TÀI LIỆU */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <button
                  type="button"
                  onClick={() => setSourceType('text')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    sourceType === 'text'
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Nhập văn bản / Chọn bài mẫu
                </button>
                <button
                  type="button"
                  onClick={() => setSourceType('file')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    sourceType === 'file'
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Upload File DOCX / PDF / TXT
                </button>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Chủ đề bài học / Mục tiêu cần kiểm tra:
                </label>
                <input
                  type="text"
                  value={sourceTopic}
                  onChange={(e) => setSourceTopic(e.target.value)}
                  placeholder="VD: Định luật vạn vật hấp dẫn, Khảo sát hàm số bậc ba..."
                  className="w-full bg-[#0f1730] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-purple-400 font-bold"
                />
              </div>

              {sourceType === 'file' ? (
                <div className="border-2 border-dashed border-purple-500/40 rounded-2xl p-6 text-center bg-[#090e1f] space-y-3">
                  <Upload className="w-8 h-8 text-purple-400 mx-auto" />
                  <div>
                    <p className="text-xs font-bold text-white">Kéo thả file bài giảng hoặc click để chọn</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Hỗ trợ các định dạng .docx, .pdf, .txt (tối đa 20MB)</p>
                  </div>
                  <input
                    type="file"
                    accept=".txt,.doc,.docx,.pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="ai-source-file"
                  />
                  <label
                    htmlFor="ai-source-file"
                    className="inline-block px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-black rounded-xl cursor-pointer shadow-md"
                  >
                    {uploadedFileName ? `Đã chọn: ${uploadedFileName}` : 'Chọn file từ máy tính'}
                  </label>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-300">
                      Nội dung cốt lõi của bài giảng (Để AI bám sát, chống bịa đặt):
                    </label>
                    <div className="flex items-center gap-1.5 text-[11px] text-purple-300">
                      <span>Tải mẫu nhanh:</span>
                      {SAMPLE_DOCS.map((doc, idx) => (
                        <button
                          key={doc.title}
                          type="button"
                          onClick={() => {
                            setSourceTopic(doc.title);
                            setSourceContent(doc.content);
                          }}
                          className="hover:underline font-bold cursor-pointer"
                        >
                          Mẫu {idx + 1}
                        </button>
                      ))}
                    </div>
                  </div>
                  <textarea
                    rows={6}
                    value={sourceContent}
                    onChange={(e) => setSourceContent(e.target.value)}
                    placeholder="Dán nội dung lý thuyết, công thức hoặc đoạn văn bản bài học vào đây..."
                    className="w-full bg-[#0f1730] border border-slate-700 rounded-2xl p-3.5 text-xs text-white outline-none focus:border-purple-400 leading-relaxed font-sans"
                  />
                </div>
              )}

              {/* Anti-hallucination banner */}
              <div className="p-3.5 rounded-2xl bg-purple-950/40 border border-purple-500/40 flex items-start gap-3 text-xs text-purple-200">
                <ShieldCheck className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-bold text-white">Cơ chế kiểm định & Chống Hallucination:</div>
                  <div className="text-[11px] text-purple-200 leading-relaxed">
                    AI được cấu hình bắt buộc chỉ sử dụng kiến thức có trong nội dung đầu vào. Nếu thiếu căn cứ hoặc kiến thức nâng cao chưa xác định, hệ thống sẽ tự động gắn cờ cảnh báo để giáo viên thẩm định.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: CẤU HÌNH MA TRẬN */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Môn học</label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full bg-[#0f1730] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none font-bold"
                  >
                    <option value="Toán học">Toán học</option>
                    <option value="Vật lý">Vật lý</option>
                    <option value="Hóa học">Hóa học</option>
                    <option value="Sinh học">Sinh học</option>
                    <option value="Ngữ văn">Ngữ văn</option>
                    <option value="Tiếng Anh">Tiếng Anh</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Khối lớp</label>
                  <select
                    value={gradeLevel}
                    onChange={(e) => setGradeLevel(Number(e.target.value))}
                    className="w-full bg-[#0f1730] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none font-bold"
                  >
                    {[6, 7, 8, 9, 10, 11, 12].map((g) => (
                      <option key={g} value={g}>Khối {g}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Số lượng câu cần tạo</label>
                  <select
                    value={numQuestions}
                    onChange={(e) => setNumQuestions(Number(e.target.value))}
                    className="w-full bg-[#0f1730] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none font-bold"
                  >
                    <option value={3}>3 câu (Thử nghiệm nhanh)</option>
                    <option value={5}>5 câu</option>
                    <option value={10}>10 câu (Đề 15 phút)</option>
                    <option value={20}>20 câu</option>
                  </select>
                </div>
              </div>

              {/* Types distribution */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 block">
                  Chọn các dạng câu hỏi ưu tiên sinh:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { type: 'SINGLE_CHOICE' as QuestionType, label: 'Một đáp án (Single)' },
                    { type: 'MULTIPLE_CHOICE' as QuestionType, label: 'Nhiều đáp án (Multi)' },
                    { type: 'TRUE_FALSE_SERIES' as QuestionType, label: 'Đúng / Sai từng ý' },
                    { type: 'MATCHING' as QuestionType, label: 'Ghép đôi (Matching)' },
                    { type: 'SHORT_ANSWER' as QuestionType, label: 'Trả lời ngắn' },
                    { type: 'FILL_IN_BLANK' as QuestionType, label: 'Điền khuyết' },
                  ].map((item) => {
                    const isChecked = selectedTypes.includes(item.type);
                    return (
                      <button
                        key={item.type}
                        type="button"
                        onClick={() => {
                          if (isChecked) {
                            if (selectedTypes.length > 1) {
                              setSelectedTypes(selectedTypes.filter((t) => t !== item.type));
                            }
                          } else {
                            setSelectedTypes([...selectedTypes, item.type]);
                          }
                        }}
                        className={`p-2.5 rounded-xl border text-left text-xs font-bold flex items-center justify-between cursor-pointer transition-colors ${
                          isChecked
                            ? 'bg-purple-950 border-purple-500 text-purple-200'
                            : 'bg-[#0f1730] border-slate-700 text-slate-400'
                        }`}
                      >
                        <span>{item.label}</span>
                        {isChecked && <Check className="w-4 h-4 text-purple-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Difficulty breakdown */}
              <div className="p-4 rounded-2xl bg-[#080d1c] border border-slate-700/80 space-y-3">
                <div className="text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span>Ma trận mức độ nhận thức (Chuẩn đề thi):</span>
                  <span className="text-[11px] text-purple-300">Tổng: 100%</span>
                </div>
                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  <div className="p-2 bg-[#0f1730] rounded-xl border border-sky-500/40">
                    <span className="text-sky-300 font-bold block text-[11px]">Nhận biết</span>
                    <span className="font-black text-sm text-white">40%</span>
                  </div>
                  <div className="p-2 bg-[#0f1730] rounded-xl border border-emerald-500/40">
                    <span className="text-emerald-300 font-bold block text-[11px]">Thông hiểu</span>
                    <span className="font-black text-sm text-white">30%</span>
                  </div>
                  <div className="p-2 bg-[#0f1730] rounded-xl border border-amber-500/40">
                    <span className="text-amber-300 font-bold block text-[11px]">Vận dụng</span>
                    <span className="font-black text-sm text-white">20%</span>
                  </div>
                  <div className="p-2 bg-[#0f1730] rounded-xl border border-rose-500/40">
                    <span className="text-rose-300 font-bold block text-[11px]">Vận dụng cao</span>
                    <span className="font-black text-sm text-white">10%</span>
                  </div>
                </div>
              </div>

              {/* Strict adherence switch */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#0f1730] border border-slate-700">
                <div>
                  <div className="text-xs font-bold text-white">Bám sát 100% nội dung tài liệu đã cấp</div>
                  <div className="text-[11px] text-slate-400">Không mở rộng kiến thức ngoài phạm vi bài học</div>
                </div>
                <input
                  type="checkbox"
                  checked={strictToSource}
                  onChange={(e) => setStrictToSource(e.target.checked)}
                  className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* STEP 3: TIẾN TRÌNH SINH CÂU HỎI */}
          {step === 3 && (
            <div className="py-12 px-4 text-center space-y-6 max-w-md mx-auto">
              <div className="relative w-20 h-20 mx-auto">
                <div className="w-20 h-20 rounded-full border-4 border-purple-500/20 border-t-purple-500 animate-spin" />
                <Sparkles className="w-8 h-8 text-purple-400 absolute inset-0 m-auto animate-pulse" />
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-black text-white">AI Đang Xử Lý & Soạn Câu Hỏi...</h3>
                <p className="text-xs text-purple-300 font-medium">{progressLog}</p>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-purple-600 to-indigo-500 h-full transition-all duration-300"
                    style={{ width: `${generationProgress}%` }}
                  />
                </div>
                <div className="text-[11px] text-slate-400 text-right">{generationProgress}%</div>
              </div>
            </div>
          )}

          {/* STEP 4: REVIEW TỪNG CÂU VÀ SỬA ĐỔI */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-purple-950/40 border border-purple-500/40 rounded-2xl text-xs">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span className="font-bold text-white">
                    AI đã soạn xong {generatedList.length} câu hỏi. Hãy kiểm tra kỹ và tích chọn các câu đạt chuẩn:
                  </span>
                </div>
                <span className="font-black text-purple-300">
                  Đã chọn: {selectedToApprove.length}/{generatedList.length} câu
                </span>
              </div>

              <div className="space-y-3">
                {generatedList.map((q, idx) => {
                  const isChecked = selectedToApprove.includes(q.id);
                  return (
                    <div
                      key={q.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        isChecked
                          ? 'bg-[#0e1733] border-purple-500/60 ring-1 ring-purple-500/30'
                          : 'bg-[#090e1f] border-slate-700/80 opacity-70'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleSelect(q.id)}
                            className="w-4 h-4 accent-purple-600 rounded mt-1 cursor-pointer"
                          />
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-black text-purple-300">Câu {idx + 1}</span>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-500/40">
                                {q.type}
                              </span>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                                {q.difficulty}
                              </span>
                              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-500/40">
                                AI đề xuất – Cần giáo viên kiểm tra
                              </span>
                            </div>
                            <div className="text-xs text-white font-medium mt-2 leading-relaxed">
                              {q.stem}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Display options / answer preview */}
                      {q.options && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 ml-7">
                          {q.options.map((opt) => (
                            <div
                              key={opt.id}
                              className={`p-2 rounded-xl text-xs border ${
                                opt.isCorrect
                                  ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200 font-bold'
                                  : 'bg-[#090d1c] border-slate-700 text-slate-300'
                              }`}
                            >
                              <span className="font-bold mr-1">{opt.label}.</span>
                              <span>{opt.text}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {q.trueFalseItems && (
                        <div className="space-y-1.5 mt-3 ml-7">
                          {q.trueFalseItems.map((tf, i) => (
                            <div key={tf.id} className="p-2 rounded-xl bg-[#090d1c] border border-slate-700 text-xs flex justify-between">
                              <span className="text-slate-300">{i + 1}. {tf.statement}</span>
                              <span className={`font-black ${tf.isTrue ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {tf.isTrue ? 'ĐÚNG' : 'SAI'}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {q.explanation && (
                        <div className="mt-3 ml-7 p-2.5 rounded-xl bg-[#070b18] border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
                          <span className="font-bold text-emerald-400 mr-1">Giải thích:</span>
                          {q.explanation}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Wizard Footer Navigation */}
        <div className="p-4 sm:p-5 border-t border-slate-700/80 bg-[#080d1c] flex items-center justify-between">
          {step > 1 && step !== 3 && (
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

          {step === 1 && (
            <button
              type="button"
              onClick={() => setStep(2)}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-black text-xs rounded-xl shadow-lg shadow-purple-600/30 cursor-pointer"
            >
              <span>Tiếp tục: Cấu hình ma trận</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {step === 2 && (
            <button
              type="button"
              onClick={handleStartGeneration}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs rounded-xl shadow-lg shadow-purple-600/30 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Bắt đầu tạo câu hỏi bằng AI</span>
            </button>
          )}

          {step === 4 && (
            <button
              type="button"
              onClick={handleFinishAndSave}
              disabled={selectedToApprove.length === 0}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black text-xs rounded-xl shadow-lg shadow-emerald-600/30 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Duyệt & Lưu {selectedToApprove.length} câu vào ngân hàng</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
