import {
  BankQuestion,
  QuestionFilterState,
  QuestionBankKPIs,
  QuestionStatus,
  QuestionType,
  DifficultyLevel,
} from '../types/questionBank';
import { storageService } from './storageService';
import { Quiz } from '../types';

const STORAGE_KEY = 'smartclass_bank_questions_v2';

// Initial realistic seed questions covering all 9 question types
export const INITIAL_BANK_QUESTIONS: BankQuestion[] = [
  // 1. SINGLE_CHOICE (Một đáp án đúng)
  {
    id: 'qb-1',
    code: 'TOAN10-NB-001',
    type: 'SINGLE_CHOICE',
    stem: 'Cho mệnh đề P: "Với mọi số thực x, x² + 1 > 0". Mệnh đề phủ định của P là:',
    difficulty: 'Nhận biết',
    gradeLevel: 10,
    subject: 'Toán học',
    chapter: 'Chương 1: Mệnh đề & Tập hợp',
    lesson: 'Bài 1: Mệnh đề',
    topic: 'Mệnh đề phủ định',
    tags: ['mệnh đề', 'toán 10', 'logic'],
    points: 0.25,
    options: [
      { id: 'opt-1', label: 'A', text: 'Tồn tại số thực x sao cho x² + 1 ≤ 0', isCorrect: true },
      { id: 'opt-2', label: 'B', text: 'Với mọi số thực x, x² + 1 ≤ 0', isCorrect: false },
      { id: 'opt-3', label: 'C', text: 'Tồn tại số thực x sao cho x² + 1 < 0', isCorrect: false },
      { id: 'opt-4', label: 'D', text: 'Với mọi số x không thuộc tập số thực, x² + 1 > 0', isCorrect: false },
    ],
    explanation: 'Phủ định của mệnh đề "Với mọi" (ký hiệu ∀) là "Tồn tại" (ký hiệu ∃), và phủ định của dấu ">" là "≤". Do đó mệnh đề phủ định chính xác là: "Tồn tại số thực x sao cho x² + 1 ≤ 0".',
    status: 'APPROVED',
    sourceType: 'MANUAL',
    sourceRef: 'SGK Toán 10 Kết Nối Tri Thức',
    authorId: 'tch-01',
    authorName: 'Thầy Nguyễn Văn Hùng',
    version: 1,
    revisions: [
      {
        version: 1,
        updatedAt: '2024-09-01T08:00:00Z',
        updatedBy: 'Thầy Nguyễn Văn Hùng',
        changeNote: 'Khởi tạo câu hỏi ban đầu',
        snapshotStem: 'Cho mệnh đề P: "Với mọi số thực x, x² + 1 > 0"...',
      },
    ],
    usageCount: 4,
    createdAt: '2024-09-01T08:00:00Z',
    updatedAt: '2024-09-01T08:00:00Z',
  },

  // 2. MULTIPLE_CHOICE (Nhiều đáp án đúng)
  {
    id: 'qb-2',
    code: 'LY10-TH-002',
    type: 'MULTIPLE_CHOICE',
    stem: 'Những đại lượng nào sau đây là đại lượng vectơ trong chuyển động cơ học? (Chọn tất cả các đáp án đúng)',
    difficulty: 'Thông hiểu',
    gradeLevel: 10,
    subject: 'Vật lý',
    chapter: 'Chương 2: Động học',
    lesson: 'Bài 4: Vận tốc & Độ dịch chuyển',
    topic: 'Vectơ trong cơ học',
    tags: ['vectơ', 'vận tốc', 'gia tốc'],
    points: 0.5,
    gradingRule: 'PARTIAL_CREDIT',
    options: [
      { id: 'opt-21', label: 'A', text: 'Vận tốc tức thời v (có hướng)', isCorrect: true },
      { id: 'opt-22', label: 'B', text: 'Độ dịch chuyển d (có hướng)', isCorrect: true },
      { id: 'opt-23', label: 'C', text: 'Quãng đường đi được s', isCorrect: false },
      { id: 'opt-24', label: 'D', text: 'Gia tốc a (có hướng)', isCorrect: true },
      { id: 'opt-25', label: 'E', text: 'Thời gian chuyển động t', isCorrect: false },
    ],
    explanation: 'Vận tốc tức thời, độ dịch chuyển và gia tốc có hướng nên là đại lượng vectơ. Quãng đường và thời gian là đại lượng vô hướng.',
    status: 'APPROVED',
    sourceType: 'MANUAL',
    sourceRef: 'Đề kiểm tra học kỳ I Chuyên Hà Nội - Amsterdam',
    authorId: 'tch-01',
    authorName: 'Thầy Nguyễn Văn Hùng',
    version: 1,
    revisions: [],
    usageCount: 3,
    createdAt: '2024-09-10T09:30:00Z',
    updatedAt: '2024-09-10T09:30:00Z',
  },

  // 3. TRUE_FALSE_SERIES (Đúng/Sai từng mệnh đề độc lập)
  {
    id: 'qb-3',
    code: 'HOA10-VD-003',
    type: 'TRUE_FALSE_SERIES',
    stem: 'Cho cấu hình electron nguyên tử của nguyên tố X là 1s² 2s² 2p⁶ 3s² 3p⁵. Xét tính đúng/sai của các mệnh đề sau:',
    difficulty: 'Vận dụng',
    gradeLevel: 10,
    subject: 'Hóa học',
    chapter: 'Chương 1: Cấu tạo nguyên tử',
    lesson: 'Bài 6: Vỏ nguyên tử',
    topic: 'Cấu hình electron',
    tags: ['hóa 10', 'electron', 'phi kim'],
    points: 1.0,
    trueFalseItems: [
      {
        id: 'tf-1',
        statement: 'Nguyên tố X có số hiệu nguyên tử Z = 17 (thuộc ô số 17).',
        isTrue: true,
        explanation: 'Tổng số electron = 2 + 2 + 6 + 2 + 5 = 17 => Z = 17.',
      },
      {
        id: 'tf-2',
        statement: 'Lớp ngoài cùng của nguyên tử X có 5 electron.',
        isTrue: false,
        explanation: 'Lớp ngoài cùng là lớp 3 có 3s² 3p⁵ tổng cộng 7 electron.',
      },
      {
        id: 'tf-3',
        statement: 'X là một phi kim điển hình (nguyên tố Clo).',
        isTrue: true,
        explanation: 'Có 7 electron lớp ngoài cùng nên là phi kim điển hình nhóm Halogen.',
      },
      {
        id: 'tf-4',
        statement: 'Hợp chất khí với hiđro của X có công thức XH3.',
        isTrue: false,
        explanation: 'Hóa trị với H là 8 - 7 = 1, công thức là HX (HCl).',
      },
    ],
    explanation: 'Cần xác định đúng số electron từng lớp và suy ra vị trí trong bảng tuần hoàn.',
    status: 'APPROVED',
    sourceType: 'MANUAL',
    sourceRef: 'Ngân hàng chuẩn đề thi Bộ GD&ĐT 2025',
    authorId: 'tch-01',
    authorName: 'Thầy Nguyễn Văn Hùng',
    version: 1,
    revisions: [],
    usageCount: 6,
    createdAt: '2024-09-15T14:15:00Z',
    updatedAt: '2024-09-15T14:15:00Z',
  },

  // 4. MATCHING (Ghép đôi 2 cột)
  {
    id: 'qb-4',
    code: 'SINH10-TH-004',
    type: 'MATCHING',
    stem: 'Hãy nối mỗi bào quan ở Cột A với chức năng tương ứng ở Cột B trong tế bào nhân thực:',
    difficulty: 'Thông hiểu',
    gradeLevel: 10,
    subject: 'Sinh học',
    chapter: 'Chương 2: Cấu trúc tế bào',
    lesson: 'Bài 8: Tế bào nhân thực',
    topic: 'Bào quan tế bào',
    tags: ['sinh 10', 'ti thể', 'ribosome'],
    points: 1.0,
    matchingItems: [
      { id: 'm-1', leftText: '1. Ti thể', rightText: 'a. "Nhà máy" tổng hợp protein', correctMatchId: 'm-3' },
      { id: 'm-2', leftText: '2. Lục lạp', rightText: 'b. Hô hấp tế bào, tạo ATP', correctMatchId: 'm-1' },
      { id: 'm-3', leftText: '3. Ribosome', rightText: 'c. Quang hợp chuyển đổi năng lượng mặt trời', correctMatchId: 'm-2' },
      { id: 'm-4', leftText: '4. Bộ máy Golgi', rightText: 'd. Sửa đổi, đóng gói và phân phối sản phẩm', correctMatchId: 'm-4' },
    ],
    explanation: 'Ghép cặp đúng: 1-b (Ti thể - hô hấp tạo ATP); 2-c (Lục lạp - quang hợp); 3-a (Ribosome - tổng hợp protein); 4-d (Golgi - đóng gói sản phẩm).',
    status: 'APPROVED',
    sourceType: 'MANUAL',
    authorId: 'tch-01',
    authorName: 'Thầy Nguyễn Văn Hùng',
    version: 1,
    revisions: [],
    usageCount: 2,
    createdAt: '2024-09-18T10:00:00Z',
    updatedAt: '2024-09-18T10:00:00Z',
  },

  // 5. ORDERING (Sắp xếp thứ tự logic)
  {
    id: 'qb-5',
    code: 'VAN10-TH-005',
    type: 'ORDERING',
    stem: 'Sắp xếp các bước thực hiện một bài văn nghị luận xã hội theo đúng tiến trình chuẩn:',
    difficulty: 'Thông hiểu',
    gradeLevel: 10,
    subject: 'Ngữ văn',
    chapter: 'Kỹ năng làm văn',
    lesson: 'Nghị luận xã hội',
    topic: 'Cấu trúc bài viết nghị luận',
    tags: ['ngữ văn', 'nghị luận xã hội', 'kỹ năng viết'],
    points: 0.75,
    orderingItems: [
      { id: 'ord-1', text: '1. Giải thích khái niệm, tư tưởng đạo lý hoặc hiện tượng đời sống', correctOrder: 1 },
      { id: 'ord-2', text: '2. Bàn luận, phân tích các khía cạnh đúng - sai và nêu dẫn chứng', correctOrder: 2 },
      { id: 'ord-3', text: '3. Mở rộng vấn đề, phản biện quan điểm trái chiều', correctOrder: 3 },
      { id: 'ord-4', text: '4. Rút ra bài học nhận thức và hành động cho bản thân', correctOrder: 4 },
    ],
    explanation: 'Trình tự lập luận chuẩn: Giải thích -> Bàn luận & Dẫn chứng -> Mở rộng & Phản biện -> Bài học nhận thức & hành động.',
    status: 'APPROVED',
    sourceType: 'MANUAL',
    authorId: 'tch-01',
    authorName: 'Thầy Nguyễn Văn Hùng',
    version: 1,
    revisions: [],
    usageCount: 1,
    createdAt: '2024-09-20T16:00:00Z',
    updatedAt: '2024-09-20T16:00:00Z',
  },

  // 6. FILL_IN_BLANK (Điền khuyết)
  {
    id: 'qb-6',
    code: 'ENG10-NB-006',
    type: 'FILL_IN_BLANK',
    stem: 'Complete the sentences with the correct form of the verbs in brackets:\n"If the weather [blank_1] (be) good tomorrow, we [blank_2] (go) camping in Ba Vi National Park."',
    difficulty: 'Nhận biết',
    gradeLevel: 10,
    subject: 'Tiếng Anh',
    chapter: 'Unit 4: For A Better Community',
    lesson: 'Language Focus',
    topic: 'Conditional Sentences Type 1',
    tags: ['english', 'conditional type 1', 'grammar'],
    points: 0.5,
    blankItems: [
      { id: 'blk-1', blankIndex: 1, acceptableAnswers: ['is', 'Is'], caseSensitive: false },
      { id: 'blk-2', blankIndex: 2, acceptableAnswers: ['will go', "'ll go", 'can go'], caseSensitive: false },
    ],
    explanation: 'Câu điều kiện loại 1: If + S + V(hiện tại đơn), S + will + V-nguyên thể. Chủ ngữ the weather số ít nên dùng "is".',
    status: 'APPROVED',
    sourceType: 'MANUAL',
    authorId: 'tch-01',
    authorName: 'Thầy Nguyễn Văn Hùng',
    version: 1,
    revisions: [],
    usageCount: 5,
    createdAt: '2024-09-22T08:20:00Z',
    updatedAt: '2024-09-22T08:20:00Z',
  },

  // 7. SHORT_ANSWER (Trả lời ngắn có dung sai)
  {
    id: 'qb-7',
    code: 'TOAN10-VDC-007',
    type: 'SHORT_ANSWER',
    stem: 'Tính giá trị nhỏ nhất của hàm số f(x) = x + 9/x trên khoảng (0; +vô cùng). (Chỉ nhập kết quả dưới dạng số thập phân hoặc nguyên)',
    difficulty: 'Vận dụng cao',
    gradeLevel: 10,
    subject: 'Toán học',
    chapter: 'Chương 3: Bất đẳng thức',
    lesson: 'Bất đẳng thức Cauchy',
    topic: 'Tìm min/max bằng BĐT',
    tags: ['bất đẳng thức', 'min max', 'toán 10'],
    points: 1.0,
    shortAnswerConfig: {
      sampleAnswer: '6',
      acceptedVariants: ['6', '6.0', '6,0'],
      numericTolerance: 0.01,
      unit: '',
      manualGradingFallback: true,
    },
    explanation: 'Áp dụng bất đẳng thức Cauchy cho 2 số dương x và 9/x: x + 9/x ≥ 2·√(x · 9/x) = 2 · 3 = 6. Dấu "=" xảy ra khi x = 3. Giá trị nhỏ nhất là 6.',
    status: 'APPROVED',
    sourceType: 'MANUAL',
    authorId: 'tch-01',
    authorName: 'Thầy Nguyễn Văn Hùng',
    version: 1,
    revisions: [],
    usageCount: 2,
    createdAt: '2024-09-25T11:00:00Z',
    updatedAt: '2024-09-25T11:00:00Z',
  },

  // 8. ESSAY (Tự luận với Rubric thang điểm)
  {
    id: 'qb-8',
    code: 'VAN10-VD-008',
    type: 'ESSAY',
    stem: 'Viết đoạn văn ngắn (khoảng 200 chữ) trình bày suy nghĩ của em về ý nghĩa của tính tự lập đối với học sinh trung học phổ thông hiện nay.',
    difficulty: 'Vận dụng',
    gradeLevel: 10,
    subject: 'Ngữ văn',
    chapter: 'Làm văn nghị luận',
    lesson: 'Nghị luận về một tư tưởng đạo lý',
    topic: 'Tính tự lập trong học tập',
    tags: ['tự lập', 'nghị luận 200 chữ', 'văn học'],
    points: 2.0,
    essayConfig: {
      maxScore: 2.0,
      rubric: [
        {
          id: 'rb-1',
          criterion: 'Hình thức & Cấu trúc đoạn văn',
          maxPoints: 0.25,
          description: 'Đảm bảo dung lượng khoảng 200 chữ, đúng cấu trúc đoạn văn, không gạch đầu dòng.',
        },
        {
          id: 'rb-2',
          criterion: 'Xác định đúng vấn đề nghị luận',
          maxPoints: 0.25,
          description: 'Ý nghĩa to lớn của tính tự lập trong cuộc sống của học sinh THPT.',
        },
        {
          id: 'rb-3',
          criterion: 'Nội dung lập luận & Dẫn chứng thuyết phục',
          maxPoints: 1.0,
          description: 'Nêu được vai trò: rèn bản lĩnh, làm chủ cuộc sống, tự giác học tập; có dẫn chứng sinh động.',
        },
        {
          id: 'rb-4',
          criterion: 'Chính tả, dùng từ & Sáng tạo',
          maxPoints: 0.5,
          description: 'Diễn đạt lưu loát, giàu cảm xúc, có suy nghĩ sâu sắc và bài học hành động thiết thực.',
        },
      ],
      referenceAnswer: 'Gợi ý: Tự lập là khả năng tự quyết định, tự chịu trách nhiệm và hoàn thành công việc mà không dựa dẫm. Với học sinh THPT, tự lập giúp rèn luyện tư duy độc lập, vượt qua cám dỗ, chủ động định hướng nghề nghiệp tương lai.',
      gradingTips: 'Giáo viên linh hoạt đánh giá dẫn chứng thực tế của học sinh. Khuyến khích góc nhìn cá nhân sáng tạo.',
    },
    explanation: 'Chấm theo thang điểm Rubric 4 tiêu chí rõ ràng, không phụ thuộc vào độ dài cơ học.',
    status: 'APPROVED',
    sourceType: 'MANUAL',
    authorId: 'tch-01',
    authorName: 'Thầy Nguyễn Văn Hùng',
    version: 1,
    revisions: [],
    usageCount: 4,
    createdAt: '2024-09-28T15:30:00Z',
    updatedAt: '2024-09-28T15:30:00Z',
  },

  // 9. PASSAGE_BASED (Đoạn văn tình huống + các câu con)
  {
    id: 'qb-9',
    code: 'ENG10-VD-009',
    type: 'PASSAGE_BASED',
    stem: 'Đọc đoạn văn sau và trả lời các câu hỏi phụ bên dưới:',
    difficulty: 'Thông hiểu',
    gradeLevel: 10,
    subject: 'Tiếng Anh',
    chapter: 'Unit 5: Inventions',
    lesson: 'Reading Comprehension',
    topic: 'Artificial Intelligence in Everyday Life',
    tags: ['reading', 'inventions', 'AI'],
    points: 1.5,
    passageStimulus: {
      title: 'The Rise of Artificial Intelligence in Classrooms',
      text: 'Artificial Intelligence (AI) is transforming modern education at an unprecedented pace. From personalized learning algorithms to automated grading systems, AI tools are helping educators save valuable administrative time. However, educators emphasize that AI can never fully replace human teachers. Empathy, moral guidance, and inspiring mentorship remain uniquely human qualities that machines cannot replicate.',
      imageUrl: '',
    },
    subQuestions: [
      {
        id: 'sub-1',
        type: 'SINGLE_CHOICE',
        stem: 'What is the main topic of the passage?',
        difficulty: 'Thông hiểu',
        points: 0.5,
        options: [
          { id: 's1-a', label: 'A', text: 'How AI replaces human teachers completely', isCorrect: false },
          { id: 's1-b', label: 'B', text: 'The benefits and human limitations of AI in education', isCorrect: true },
          { id: 's1-c', label: 'C', text: 'The history of automated grading machines', isCorrect: false },
          { id: 's1-d', label: 'D', text: 'Why students should avoid using technology', isCorrect: false },
        ],
        explanation: 'The passage highlights both benefits (saving time) and irreplaceable human values.',
      },
      {
        id: 'sub-2',
        type: 'SINGLE_CHOICE',
        stem: 'According to the passage, which quality can machines NOT replicate?',
        difficulty: 'Nhận biết',
        points: 0.5,
        options: [
          { id: 's2-a', label: 'A', text: 'Automating calculations', isCorrect: false },
          { id: 's2-b', label: 'B', text: 'Personalizing algorithm results', isCorrect: false },
          { id: 's2-c', label: 'C', text: 'Empathy and inspiring mentorship', isCorrect: true },
          { id: 's2-d', label: 'D', text: 'Data storage capacity', isCorrect: false },
        ],
        explanation: 'Line 4-5 clearly states: "Empathy, moral guidance, and inspiring mentorship remain uniquely human qualities".',
      },
      {
        id: 'sub-3',
        type: 'FILL_IN_BLANK',
        stem: 'The word "unprecedented" in line 1 is closest in meaning to [blank_1].',
        difficulty: 'Vận dụng',
        points: 0.5,
        blankItems: [
          { id: 's3-b1', blankIndex: 1, acceptableAnswers: ['never seen before', 'extraordinary', 'unmatched', 'chưa từng có'], caseSensitive: false },
        ],
        explanation: '"Unprecedented" means never done or known before.',
      },
    ],
    explanation: 'Bài đọc hiểu kiểm tra kỹ năng đọc quét (skimming), tìm chi tiết (scanning) và suy luận ngữ cảnh.',
    status: 'APPROVED',
    sourceType: 'MANUAL',
    authorId: 'tch-01',
    authorName: 'Thầy Nguyễn Văn Hùng',
    version: 1,
    revisions: [],
    usageCount: 3,
    createdAt: '2024-10-02T13:40:00Z',
    updatedAt: '2024-10-02T13:40:00Z',
  },

  // 10. AI GENERATED (Ví dụ câu sinh từ AI đang chờ duyệt)
  {
    id: 'qb-10',
    code: 'TOAN11-TH-010',
    type: 'SINGLE_CHOICE',
    stem: 'Nghiệm của phương trình lượng giác sin(x) = 1/2 trong khoảng [0; 2π) là:',
    difficulty: 'Thông hiểu',
    gradeLevel: 11,
    subject: 'Toán học',
    chapter: 'Chương 1: Hàm số lượng giác',
    lesson: 'Bài 2: Phương trình lượng giác cơ bản',
    topic: 'Phương trình sin x = a',
    tags: ['lượng giác', 'toán 11', 'nghiệm phương trình'],
    points: 0.25,
    options: [
      { id: 'opt-101', label: 'A', text: 'x = π/6 và x = 5π/6', isCorrect: true },
      { id: 'opt-102', label: 'B', text: 'x = π/3 và x = 2π/3', isCorrect: false },
      { id: 'opt-103', label: 'C', text: 'x = π/6 và x = -π/6', isCorrect: false },
      { id: 'opt-104', label: 'D', text: 'x = 7π/6 và x = 11π/6', isCorrect: false },
    ],
    explanation: 'sin(x) = 1/2 có các nghiệm x = π/6 + k2π hoặc x = 5π/6 + k2π. Trong khoảng [0; 2π) có 2 nghiệm: π/6 và 5π/6.',
    status: 'PENDING_REVIEW',
    sourceType: 'AI_GENERATED',
    sourceRef: 'Gemini 2.5 Flash Prompt (Chương 1 Lượng giác)',
    authorId: 'tch-01',
    authorName: 'AI Hỗ Trợ Soạn Bài',
    isAiGenerated: true,
    aiPromptMeta: {
      model: 'gemini-2.5-flash',
      promptVersion: 'v1.4',
      confidenceNote: 'Bám sát SGK Toán 11 mới, độ tin cậy 98%',
    },
    version: 1,
    revisions: [],
    usageCount: 0,
    createdAt: '2024-10-18T09:12:00Z',
    updatedAt: '2024-10-18T09:12:00Z',
  },

  // 11. DRAFT (Câu bản nháp)
  {
    id: 'qb-11',
    code: 'LY11-VD-011',
    type: 'SINGLE_CHOICE',
    stem: 'Một điện tích điểm q = 2 × 10⁻⁶ C đặt tại điểm M trong điện trường chịu tác dụng lực F = 4 × 10⁻³ N. Cường độ điện trường tại M là:',
    difficulty: 'Vận dụng',
    gradeLevel: 11,
    subject: 'Vật lý',
    chapter: 'Chương 1: Điện tích - Điện trường',
    lesson: 'Bài 3: Điện trường',
    topic: 'Cường độ điện trường',
    tags: ['vật lý 11', 'điện trường'],
    points: 0.5,
    options: [
      { id: 'opt-111', label: 'A', text: '2000 V/m', isCorrect: true },
      { id: 'opt-112', label: 'B', text: '1000 V/m', isCorrect: false },
      { id: 'opt-113', label: 'C', text: '4000 V/m', isCorrect: false },
      { id: 'opt-114', label: 'D', text: '8000 V/m', isCorrect: false },
    ],
    explanation: 'Cường độ điện trường E = F / q = (4 × 10⁻³) / (2 × 10⁻⁶) = 2000 V/m.',
    status: 'DRAFT',
    sourceType: 'MANUAL',
    authorId: 'tch-01',
    authorName: 'Thầy Nguyễn Văn Hùng',
    version: 1,
    revisions: [],
    usageCount: 0,
    createdAt: '2024-10-19T11:20:00Z',
    updatedAt: '2024-10-19T11:20:00Z',
  },
];

function cleanQuestionMath(text: string): string {
  if (!text) return '';
  return text
    .replace(/Cho mệnh đề \$P\$: "\$\\forall x \\in \\mathbb\{R\}, x\^2 \+ 1 > 0\$"\. Mệnh đề phủ định \$\\overline\{P\}\$ của \$P\$ là:/g, 'Cho mệnh đề P: "Với mọi số thực x, x² + 1 > 0". Mệnh đề phủ định của P là:')
    .replace(/Cho mệnh đề \$P\$: "\$\\forall x \\in \\mathbb\{R\}, x\^2 \+ 1 > 0\$"\. Mệnh đề phủ định của \$P\$ là:/g, 'Cho mệnh đề P: "Với mọi số thực x, x² + 1 > 0". Mệnh đề phủ định của P là:')
    .replace(/\$\\exists x \\in \\mathbb\{R\}, x\^2 \+ 1 \\le 0\$/g, 'Tồn tại số thực x sao cho x² + 1 ≤ 0')
    .replace(/\$\\forall x \\in \\mathbb\{R\}, x\^2 \+ 1 \\le 0\$/g, 'Với mọi số thực x, x² + 1 ≤ 0')
    .replace(/\$\\exists x \\in \\mathbb\{R\}, x\^2 \+ 1 < 0\$/g, 'Tồn tại số thực x sao cho x² + 1 < 0')
    .replace(/\$\\forall x \\notin \\mathbb\{R\}, x\^2 \+ 1 > 0\$/g, 'Với mọi số x không thuộc tập số thực, x² + 1 > 0')
    .replace(/Phủ định của mệnh đề chứa lượng từ \$\\forall\$ là \$\\exists\$, và phủ định của dấu > là \$\\le\$\./g, 'Phủ định của mệnh đề "Với mọi" (ký hiệu ∀) là "Tồn tại" (ký hiệu ∃), và phủ định của dấu ">" là "≤". Do đó mệnh đề phủ định chính xác là: "Tồn tại số thực x sao cho x² + 1 ≤ 0".')
    .replace(/Vận tốc tức thời \$\\vec\{v\}\$/g, 'Vận tốc tức thời v (có hướng)')
    .replace(/Độ dịch chuyển \$\\vec\{d\}\$/g, 'Độ dịch chuyển d (có hướng)')
    .replace(/Gia tốc \$\\vec\{a\}\$/g, 'Gia tốc a (có hướng)')
    .replace(/Quãng đường đi được \$s\$/g, 'Quãng đường đi được s')
    .replace(/Thời gian chuyển động \$t\$/g, 'Thời gian chuyển động t')
    .replace(/\$1s\^2 2s\^2 2p\^6 3s\^2 3p\^5\$/g, '1s² 2s² 2p⁶ 3s² 3p⁵')
    .replace(/\$Z = 17\$/g, 'Z = 17')
    .replace(/\$3s\^2 3p\^5\$/g, '3s² 3p⁵')
    .replace(/\$XH_3\$/g, 'XH3')
    .replace(/\$8 - 7 = 1\$/g, '8 - 7 = 1')
    .replace(/\$HX\$/g, 'HX')
    .replace(/\$f\(x\) = x \+ \\frac\{9\}\{x\}\$/g, 'f(x) = x + 9/x')
    .replace(/\$\\frac\{9\}\{x\}\$/g, '9/x')
    .replace(/\\ge 2\\sqrt\{x \\cdot \\frac\{9\}\{x\}\} = 2 \\cdot 3 = 6/g, '≥ 2·√(x · 9/x) = 2 · 3 = 6')
    .replace(/\$\\sin x = \\frac\{1\}\{2\}\$/g, 'sin(x) = 1/2')
    .replace(/\$x = \\frac\{\\pi\}\{6\} và x = \\frac\{5\\pi\}\{6\}\$/g, 'x = π/6 và x = 5π/6')
    .replace(/\$x = \\frac\{\\pi\}\{3\} và x = \\frac\{2\\pi\}\{3\}\$/g, 'x = π/3 và x = 2π/3')
    .replace(/\$x = \\frac\{\\pi\}\{6\} và x = -\\frac\{\\pi\}\{6\}\$/g, 'x = π/6 và x = -π/6')
    .replace(/\$x = \\frac\{7\\pi\}\{6\} và x = \\frac\{11\\pi\}\{6\}\$/g, 'x = 7π/6 và x = 11π/6')
    .replace(/\$2000\\text\{ V\/m\}\$/g, '2000 V/m')
    .replace(/\$1000\\text\{ V\/m\}\$/g, '1000 V/m')
    .replace(/\$4000\\text\{ V\/m\}\$/g, '4000 V/m')
    .replace(/\$8000\\text\{ V\/m\}\$/g, '8000 V/m')
    .replace(/\$q = 2 \\times 10\^\{-6\}\\text\{ C\}\$/g, 'q = 2 × 10⁻⁶ C')
    .replace(/\$F = 4 \\times 10\^\{-3\}\\text\{ N\}\$/g, 'F = 4 × 10⁻³ N')
    .replace(/\$([^\$]+)\$/g, '$1');
}

class QuestionBankService {
  private getStored(): BankQuestion[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_BANK_QUESTIONS));
        return INITIAL_BANK_QUESTIONS;
      }
      const parsed: BankQuestion[] = JSON.parse(raw);
      // Auto-sanitize any raw LaTeX so user sees normal readable text immediately
      let modified = false;
      const sanitized = parsed.map((q) => {
        let changed = false;
        let stem = q.stem;
        let explanation = q.explanation;
        if (stem && (stem.includes('$') || stem.includes('\\forall'))) {
          stem = cleanQuestionMath(stem);
          changed = true;
        }
        if (explanation && (explanation.includes('$') || explanation.includes('\\forall'))) {
          explanation = cleanQuestionMath(explanation);
          changed = true;
        }
        const options = q.options?.map((opt) => {
          if (opt.text && (opt.text.includes('$') || opt.text.includes('\\exists') || opt.text.includes('\\forall'))) {
            changed = true;
            return { ...opt, text: cleanQuestionMath(opt.text) };
          }
          return opt;
        });
        const trueFalseItems = q.trueFalseItems?.map((tf) => {
          if (tf.statement && (tf.statement.includes('$') || tf.statement.includes('\\'))) {
            changed = true;
            return {
              ...tf,
              statement: cleanQuestionMath(tf.statement),
              explanation: tf.explanation ? cleanQuestionMath(tf.explanation) : undefined,
            };
          }
          return tf;
        });
        if (changed) modified = true;
        return {
          ...q,
          stem,
          explanation,
          options,
          trueFalseItems,
        };
      });
      if (modified) {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
        } catch {
          // ignore
        }
      }
      return sanitized;
    } catch {
      return INITIAL_BANK_QUESTIONS;
    }
  }

  private save(items: BankQuestion[]) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Error saving question bank:', e);
    }
  }

  // Get all active questions (excluding soft-deleted)
  getAll(filters?: Partial<QuestionFilterState>): BankQuestion[] {
    const list = this.getStored().filter((q) => !q.isDeleted);
    if (!filters) return list;

    return list.filter((q) => {
      if (filters.search) {
        const term = filters.search.toLowerCase().trim();
        const matchesStem = q.stem.toLowerCase().includes(term);
        const matchesCode = q.code.toLowerCase().includes(term);
        const matchesTopic = q.topic?.toLowerCase().includes(term) ?? false;
        const matchesTags = q.tags.some((t) => t.toLowerCase().includes(term));
        if (!matchesStem && !matchesCode && !matchesTopic && !matchesTags) return false;
      }

      if (filters.gradeLevel && filters.gradeLevel !== 'ALL' && q.gradeLevel !== filters.gradeLevel) {
        return false;
      }

      if (filters.subject && filters.subject !== 'ALL' && q.subject !== filters.subject) {
        return false;
      }

      if (filters.type && filters.type !== 'ALL' && q.type !== filters.type) {
        return false;
      }

      if (filters.difficulty && filters.difficulty !== 'ALL' && q.difficulty !== filters.difficulty) {
        return false;
      }

      if (filters.status && filters.status !== 'ALL' && q.status !== filters.status) {
        return false;
      }

      if (filters.sourceType && filters.sourceType !== 'ALL' && q.sourceType !== filters.sourceType) {
        return false;
      }

      return true;
    });
  }

  getById(id: string): BankQuestion | undefined {
    return this.getStored().find((q) => q.id === id && !q.isDeleted);
  }

  getKPIs(): QuestionBankKPIs {
    const questions = this.getStored().filter((q) => !q.isDeleted);
    const kpis: QuestionBankKPIs = {
      total: questions.length,
      approved: questions.filter((q) => q.status === 'APPROVED').length,
      pendingReview: questions.filter((q) => q.status === 'PENDING_REVIEW').length,
      draft: questions.filter((q) => q.status === 'DRAFT').length,
      rejectedOrNeedFix: questions.filter((q) => q.status === 'REJECTED' || q.status === 'ARCHIVED').length,
      aiSuggested: questions.filter((q) => q.isAiGenerated).length,
      byDifficulty: {
        'Nhận biết': questions.filter((q) => q.difficulty === 'Nhận biết').length,
        'Thông hiểu': questions.filter((q) => q.difficulty === 'Thông hiểu').length,
        'Vận dụng': questions.filter((q) => q.difficulty === 'Vận dụng').length,
        'Vận dụng cao': questions.filter((q) => q.difficulty === 'Vận dụng cao').length,
      },
      byType: {
        SINGLE_CHOICE: questions.filter((q) => q.type === 'SINGLE_CHOICE').length,
        MULTIPLE_CHOICE: questions.filter((q) => q.type === 'MULTIPLE_CHOICE').length,
        TRUE_FALSE_SERIES: questions.filter((q) => q.type === 'TRUE_FALSE_SERIES').length,
        MATCHING: questions.filter((q) => q.type === 'MATCHING').length,
        ORDERING: questions.filter((q) => q.type === 'ORDERING').length,
        FILL_IN_BLANK: questions.filter((q) => q.type === 'FILL_IN_BLANK').length,
        SHORT_ANSWER: questions.filter((q) => q.type === 'SHORT_ANSWER').length,
        ESSAY: questions.filter((q) => q.type === 'ESSAY').length,
        PASSAGE_BASED: questions.filter((q) => q.type === 'PASSAGE_BASED').length,
      },
    };
    return kpis;
  }

  // Duplicate check using stem normalization
  findDuplicates(stem: string, excludeId?: string): BankQuestion[] {
    const normalized = stem.toLowerCase().replace(/[^a-z0-9àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/g, '');
    if (normalized.length < 10) return [];

    return this.getStored().filter((q) => {
      if (excludeId && q.id === excludeId) return false;
      if (q.isDeleted) return false;
      const targetNorm = q.stem.toLowerCase().replace(/[^a-z0-9àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/g, '');
      return targetNorm === normalized || targetNorm.includes(normalized) || normalized.includes(targetNorm);
    });
  }

  // Generate automated code
  generateCode(subject: string, gradeLevel: number, difficulty: DifficultyLevel): string {
    const subCodeMap: Record<string, string> = {
      'Toán học': 'TOAN',
      'Vật lý': 'LY',
      'Hóa học': 'HOA',
      'Sinh học': 'SINH',
      'Ngữ văn': 'VAN',
      'Tiếng Anh': 'ENG',
      'Lịch sử': 'SU',
      'Địa lý': 'DIA',
      'Tin học': 'TIN',
      'GDCD': 'GDCD',
    };
    const diffCodeMap: Record<DifficultyLevel, string> = {
      'Nhận biết': 'NB',
      'Thông hiểu': 'TH',
      'Vận dụng': 'VD',
      'Vận dụng cao': 'VDC',
    };
    const prefix = `${subCodeMap[subject] || 'CH'}${gradeLevel}-${diffCodeMap[difficulty] || 'NB'}`;
    const randomNum = Math.floor(100 + Math.random() * 900);
    return `${prefix}-${randomNum}`;
  }

  create(question: Omit<BankQuestion, 'id' | 'createdAt' | 'updatedAt' | 'version' | 'revisions' | 'usageCount'>): BankQuestion {
    const items = this.getStored();
    const now = new Date().toISOString();
    const newQuestion: BankQuestion = {
      ...question,
      id: `qb-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      code: question.code || this.generateCode(question.subject, question.gradeLevel, question.difficulty),
      version: 1,
      revisions: [
        {
          version: 1,
          updatedAt: now,
          updatedBy: question.authorName || 'Giáo viên',
          changeNote: 'Tạo mới câu hỏi',
          snapshotStem: question.stem.substring(0, 100),
        },
      ],
      usageCount: 0,
      createdAt: now,
      updatedAt: now,
    };

    items.unshift(newQuestion);
    this.save(items);
    return newQuestion;
  }

  update(id: string, updates: Partial<BankQuestion>, changeNote = 'Chỉnh sửa nội dung'): BankQuestion | null {
    const items = this.getStored();
    const index = items.findIndex((q) => q.id === id);
    if (index === -1) return null;

    const current = items[index];
    const now = new Date().toISOString();
    const nextVersion = (current.version || 1) + 1;

    const newRevision = {
      version: nextVersion,
      updatedAt: now,
      updatedBy: updates.authorName || current.authorName || 'Giáo viên',
      changeNote,
      snapshotStem: (updates.stem || current.stem).substring(0, 100),
    };

    const updated: BankQuestion = {
      ...current,
      ...updates,
      version: nextVersion,
      revisions: [newRevision, ...(current.revisions || [])],
      updatedAt: now,
    };

    items[index] = updated;
    this.save(items);
    return updated;
  }

  duplicate(id: string): BankQuestion | null {
    const current = this.getById(id);
    if (!current) return null;

    const now = new Date().toISOString();
    const cloned: BankQuestion = {
      ...current,
      id: `qb-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      code: `${current.code}-COPY`,
      stem: `${current.stem} (Bản sao)`,
      status: 'DRAFT',
      version: 1,
      usageCount: 0,
      revisions: [
        {
          version: 1,
          updatedAt: now,
          updatedBy: current.authorName,
          changeNote: `Sao chép từ câu ${current.code}`,
          snapshotStem: current.stem.substring(0, 100),
        },
      ],
      createdAt: now,
      updatedAt: now,
    };

    const items = this.getStored();
    items.unshift(cloned);
    this.save(items);
    return cloned;
  }

  updateStatus(id: string, status: QuestionStatus): boolean {
    return !!this.update(id, { status }, `Cập nhật trạng thái thành ${status}`);
  }

  bulkUpdateStatus(ids: string[], status: QuestionStatus): number {
    let count = 0;
    ids.forEach((id) => {
      if (this.updateStatus(id, status)) count++;
    });
    return count;
  }

  softDelete(id: string): boolean {
    const items = this.getStored();
    const index = items.findIndex((q) => q.id === id);
    if (index === -1) return false;
    items[index].isDeleted = true;
    items[index].updatedAt = new Date().toISOString();
    this.save(items);
    return true;
  }

  bulkDelete(ids: string[]): number {
    let count = 0;
    ids.forEach((id) => {
      if (this.softDelete(id)) count++;
    });
    return count;
  }

  // Connection with Quiz creation
  createQuizFromQuestions(
    questionIds: string[],
    quizTitle: string,
    classId: string,
    durationMinutes: number,
    subject?: string
  ): Quiz {
    const questions = this.getStored().filter((q) => questionIds.includes(q.id));
    const classes = storageService.getClasses();
    const targetClass = classes.find((c) => c.id === classId) || classes[0];

    // Increment usage count on original questions
    questions.forEach((q) => {
      this.update(q.id, { usageCount: (q.usageCount || 0) + 1 }, `Được đưa vào đề: ${quizTitle}`);
    });

    // Create snapshot questions for the quiz
    const quizQuestions = questions.map((q, idx) => {
      let options: string[] = [];
      let correctAnswer: string | number = '';

      if (q.type === 'SINGLE_CHOICE' || q.type === 'MULTIPLE_CHOICE') {
        options = q.options?.map((o) => `${o.label}. ${o.text}`) || [];
        const correct = q.options?.find((o) => o.isCorrect);
        correctAnswer = correct ? `${correct.label}. ${correct.text}` : options[0] || '';
      } else if (q.type === 'TRUE_FALSE_SERIES') {
        options = q.trueFalseItems?.map((tf) => `${tf.statement} -> [${tf.isTrue ? 'Đúng' : 'Sai'}]`) || ['Đúng', 'Sai'];
        correctAnswer = 'Đáp án theo từng mệnh đề';
      } else if (q.type === 'MATCHING') {
        options = q.matchingItems?.map((m) => `${m.leftText} <-> ${m.rightText}`) || [];
        correctAnswer = 'Khớp đôi tương ứng';
      } else if (q.type === 'SHORT_ANSWER') {
        options = [];
        correctAnswer = q.shortAnswerConfig?.sampleAnswer || '';
      } else {
        options = [];
        correctAnswer = 'Chấm theo hướng dẫn Rubric';
      }

      return {
        id: `quiz-q-${idx + 1}-${q.id}`,
        content: q.stem,
        type: (q.type === 'SINGLE_CHOICE' || q.type === 'MULTIPLE_CHOICE' ? 'MULTIPLE_CHOICE' : q.type === 'TRUE_FALSE_SERIES' ? 'TRUE_FALSE' : 'SHORT_ANSWER') as any,
        options,
        correctAnswer,
        points: q.points || 1,
        explanation: q.explanation,
      };
    });

    const newQuiz: Quiz = {
      id: `quiz-${Date.now()}`,
      title: quizTitle,
      subject: subject || questions[0]?.subject || targetClass.subject || 'Toán học',
      gradeLevel: targetClass.gradeLevel,
      classId: targetClass.id,
      durationMinutes,
      status: 'OPEN',
      totalQuestions: quizQuestions.length,
      questions: quizQuestions,
    };

    const currentQuizzes = storageService.getQuizzes();
    storageService.saveQuizzes([newQuiz, ...currentQuizzes]);
    return newQuiz;
  }
}

export const questionBankService = new QuestionBankService();
