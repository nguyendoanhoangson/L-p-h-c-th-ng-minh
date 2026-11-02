// Data models and specifications for Smart Question Bank Module (Ngân Hàng Câu Hỏi Thông Minh)

export type QuestionType =
  | 'SINGLE_CHOICE'       // (1) Một đáp án: >= 2 lựa chọn, đúng chính xác 1
  | 'MULTIPLE_CHOICE'     // (2) Nhiều đáp án: >= 2 lựa chọn, ít nhất 1 đúng
  | 'TRUE_FALSE_SERIES'   // (3) Đúng/Sai theo từng ý: nhiều mệnh đề độc lập
  | 'MATCHING'            // (4) Ghép đôi: hai tập mục cột A và cột B
  | 'ORDERING'            // (5) Sắp xếp: các phần tử và thứ tự đúng
  | 'FILL_IN_BLANK'       // (6) Điền khuyết: 1 hoặc nhiều ô trống [blank]
  | 'SHORT_ANSWER'        // (7) Trả lời ngắn: đáp án mẫu, biến thể, dung sai số
  | 'ESSAY'               // (8) Tự luận: rubric, thang điểm, đáp án tham khảo
  | 'PASSAGE_BASED';      // (9) Theo đoạn văn/tình huống: bài đọc/hình ảnh + nhiều câu hỏi con

export type DifficultyLevel =
  | 'Nhận biết'
  | 'Thông hiểu'
  | 'Vận dụng'
  | 'Vận dụng cao';

export type QuestionStatus =
  | 'DRAFT'           // Bản nháp
  | 'PENDING_REVIEW'  // Chờ duyệt
  | 'APPROVED'        // Đã duyệt
  | 'REJECTED'        // Từ chối / Cần sửa
  | 'ARCHIVED';       // Lưu trữ

export type SourceType =
  | 'MANUAL'          // Tạo thủ công bởi giáo viên
  | 'AI_GENERATED'    // Sinh bằng AI (Gemini)
  | 'IMPORT_EXCEL'    // Nhập từ file Excel
  | 'IMPORT_WORD'     // Nhập từ file Word
  | 'IMPORT_JSON'     // Nhập từ JSON chuẩn
  | 'SHARED_BANK';    // Được chia sẻ từ tổ chuyên môn

// 1. Single Choice & 2. Multiple Choice Option
export interface ChoiceOption {
  id: string;
  label: string;      // 'A', 'B', 'C', 'D'
  text: string;       // Rich text/math
  isCorrect: boolean;
}

// 3. True/False Statement
export interface TrueFalseStatement {
  id: string;
  statement: string;
  isTrue: boolean;
  explanation?: string;
}

// 4. Matching Item Pair
export interface MatchingItem {
  id: string;
  leftText: string;   // Cột A
  rightText: string;  // Cột B
  correctMatchId: string; // Khớp với id bên phải
}

// 5. Ordering Item
export interface OrderingItem {
  id: string;
  text: string;
  correctOrder: number; // 1, 2, 3...
}

// 6. Fill in Blank
export interface BlankItem {
  id: string;
  blankIndex: number; // [1], [2]
  acceptableAnswers: string[]; // ['H2O', 'nước', 'nuoc']
  caseSensitive?: boolean;
}

// 7. Short Answer
export interface ShortAnswerConfig {
  sampleAnswer: string;
  acceptedVariants: string[];
  numericTolerance?: number; // Ví dụ ± 0.05
  unit?: string;             // Ví dụ: 'm/s', 'kg'
  manualGradingFallback: boolean;
}

// 8. Essay Rubric Criteria
export interface EssayRubricCriterion {
  id: string;
  criterion: string;
  maxPoints: number;
  description: string;
}

export interface EssayConfig {
  rubric: EssayRubricCriterion[];
  referenceAnswer: string;
  gradingTips?: string;
  maxScore: number;
}

// 9. Passage Sub-Question (can be one of types 1-8)
export interface SubQuestion {
  id: string;
  type: QuestionType;
  stem: string;
  difficulty: DifficultyLevel;
  points: number;
  options?: ChoiceOption[];
  trueFalseItems?: TrueFalseStatement[];
  matchingItems?: MatchingItem[];
  orderingItems?: OrderingItem[];
  blankItems?: BlankItem[];
  shortAnswerConfig?: ShortAnswerConfig;
  essayConfig?: EssayConfig;
  correctAnswer?: string | string[];
  explanation?: string;
}

// Revision History
export interface QuestionRevision {
  version: number;
  updatedAt: string;
  updatedBy: string;
  changeNote: string;
  snapshotStem: string;
}

// Main Question Item
export interface BankQuestion {
  id: string;
  code: string;               // Mã câu hỏi: e.g., 'TOAN10-NB-001'
  type: QuestionType;
  stem: string;               // Nội dung câu hỏi (chấp nhận LaTeX/công thức/ảnh)
  difficulty: DifficultyLevel;
  gradeLevel: number;         // 1 - 12
  subject: string;            // 'Toán học', 'Ngữ văn', 'Tiếng Anh', 'Vật lý',...
  chapter?: string;           // Chương 1, Chương 2
  lesson?: string;            // Bài 1, Bài 2
  topic?: string;             // Chủ đề
  tags: string[];             // ['bđt', 'hàm số', 'học kỳ 1']
  points: number;             // Điểm mặc định
  explanation?: string;       // Lời giải / giải thích chi tiết
  
  // Specific payloads according to type:
  options?: ChoiceOption[];
  gradingRule?: 'ALL_OR_NOTHING' | 'PARTIAL_CREDIT'; // Cho Multiple Choice
  trueFalseItems?: TrueFalseStatement[];
  matchingItems?: MatchingItem[];
  orderingItems?: OrderingItem[];
  blankItems?: BlankItem[];
  shortAnswerConfig?: ShortAnswerConfig;
  essayConfig?: EssayConfig;

  // Passage/Stimulus data (for type 9)
  passageStimulus?: {
    title: string;
    text: string;
    imageUrl?: string;
  };
  subQuestions?: SubQuestion[];

  // Metadata & Audit
  status: QuestionStatus;
  sourceType: SourceType;
  sourceRef?: string;         // 'Đề thi THPT 2024', 'Sách giáo khoa Kết Nối Tri Thức'
  authorId: string;
  authorName: string;
  schoolId?: string;
  version: number;
  revisions: QuestionRevision[];
  usageCount: number;         // Số lần được đưa vào đề thi/bài tập
  isAiGenerated?: boolean;
  aiPromptMeta?: {
    model: string;
    promptVersion: string;
    confidenceNote?: string;
  };
  createdAt: string;
  updatedAt: string;
  isDeleted?: boolean;        // Soft delete
}

// Filter State
export interface QuestionFilterState {
  search: string;
  gradeLevel: number | 'ALL';
  subject: string;
  type: QuestionType | 'ALL';
  difficulty: DifficultyLevel | 'ALL';
  status: QuestionStatus | 'ALL';
  sourceType: SourceType | 'ALL';
  chapter: string;
  topic: string;
  author: string;
  dateRange: 'ALL' | 'TODAY' | 'WEEK' | 'MONTH';
}

// KPI Statistics
export interface QuestionBankKPIs {
  total: number;
  approved: number;
  pendingReview: number;
  draft: number;
  rejectedOrNeedFix: number;
  aiSuggested: number;
  byDifficulty: Record<DifficultyLevel, number>;
  byType: Record<QuestionType, number>;
}

// AI Generation Wizard Input
export interface AiGenerationConfig {
  sourceText: string;
  sourceFileName?: string;
  gradeLevel: number;
  subject: string;
  chapter: string;
  lesson: string;
  topic: string;
  totalQuestions: number;
  typeDistribution: {
    type: QuestionType;
    count: number;
  }[];
  difficultyDistribution: {
    difficulty: DifficultyLevel;
    percentage: number;
  }[];
  language: 'vi' | 'en';
  strictToSource: boolean;
  additionalPrompt?: string;
}

// Export Options
export interface QuestionExportOptions {
  format: 'DOCX' | 'XLSX' | 'PDF' | 'JSON';
  scope: 'ALL_FILTERED' | 'SELECTED_ONLY';
  includeAnswers: boolean;
  includeExplanations: boolean;
  answersAtEnd: boolean;       // Đáp án ở cuối tài liệu (dạng phiếu đáp án)
  groupBy: 'NONE' | 'SUBJECT' | 'DIFFICULTY' | 'TOPIC';
  headerSchoolName: string;
  headerExamTitle: string;
  paperSize: 'A4';
  shuffleOptions: boolean;
}
