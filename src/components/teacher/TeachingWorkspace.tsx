import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  HelpCircle,
  FileCheck2,
  FolderArchive,
  Sparkles,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  Copy,
  Download,
  Trash2,
  Edit3,
  Send,
  Eye,
  FileText,
  Video,
  FileSpreadsheet,
  Check,
  X,
  UploadCloud,
  ChevronRight,
  School,
  Users,
} from 'lucide-react';
import { storageService } from '../../services/storageService';
import { useNotification } from '../../contexts/NotificationContext';
import { GRADE_LEVELS } from '../../data/mockData';
import { Assignment, Classroom } from '../../types';
import { QuestionBankWorkspace } from './questionBank/QuestionBankWorkspace';

export type TeachingTab =
  | 'question_bank'
  | 'assignments'
  | 'auto_grading'
  | 'resources'
  | 'ai_assistant';

interface TeachingWorkspaceProps {
  initialTab?: TeachingTab;
  onNavigate?: (screen: string) => void;
}

interface QuestionItem {
  id: string;
  subject: string;
  gradeLevel: number;
  difficulty: 'Nhận biết' | 'Thông hiểu' | 'Vận dụng' | 'Vận dụng cao';
  type: 'MULTIPLE_CHOICE' | 'ESSAY';
  content: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
}

interface DigitalResource {
  id: string;
  title: string;
  subject: string;
  gradeLevel: number;
  type: 'PDF' | 'PPT' | 'DOCX' | 'VIDEO';
  size: string;
  updatedAt: string;
  downloads: number;
}

export const TeachingWorkspace: React.FC<TeachingWorkspaceProps> = ({
  initialTab = 'question_bank',
}) => {
  const { success, info, warning } = useNotification();
  const [activeTab, setActiveTab] = useState<TeachingTab>(initialTab);
  const classes = storageService.getClasses();

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // -------------------------------------------------------------
  // TAB 1: NGÂN HÀNG CÂU HỎI
  // -------------------------------------------------------------
  const [questions, setQuestions] = useState<QuestionItem[]>([
    {
      id: 'q-1',
      subject: 'Toán học',
      gradeLevel: 7,
      difficulty: 'Nhận biết',
      type: 'MULTIPLE_CHOICE',
      content: 'Tập hợp các số hữu tỉ được kí hiệu bằng chữ cái nào sau đây?',
      options: ['A. N', 'B. Z', 'C. Q', 'D. R'],
      correctAnswer: 'C',
      explanation: 'Tập hợp các số hữu tỉ được kí hiệu là Q.',
    },
    {
      id: 'q-2',
      subject: 'Toán học',
      gradeLevel: 7,
      difficulty: 'Thông hiểu',
      type: 'MULTIPLE_CHOICE',
      content: 'Kết quả của phép tính (-2/3) + (1/6) là:',
      options: ['A. -1/2', 'B. -3/6', 'C. 1/2', 'D. -5/6'],
      correctAnswer: 'A',
      explanation: '(-2/3) + (1/6) = -4/6 + 1/6 = -3/6 = -1/2.',
    },
    {
      id: 'q-3',
      subject: 'Toán học',
      gradeLevel: 10,
      difficulty: 'Vận dụng',
      type: 'MULTIPLE_CHOICE',
      content: 'Tập xác định của hàm số y = √(x - 2) + 1/(x - 5) là:',
      options: ['A. [2; +∞) \\ {5}', 'B. (2; +∞)', 'C. [2; 5)', 'D. (5; +∞)'],
      correctAnswer: 'A',
      explanation: 'Điều kiện: x - 2 ≥ 0 và x - 5 ≠ 0 <=> x ≥ 2 và x ≠ 5.',
    },
    {
      id: 'q-4',
      subject: 'KHTN / Vật lý',
      gradeLevel: 7,
      difficulty: 'Nhận biết',
      type: 'MULTIPLE_CHOICE',
      content: 'Tốc độ chuyển động của một vật cho biết điều gì?',
      options: [
        'A. Vật chuyển động nhanh hay chậm',
        'B. Hướng chuyển động của vật',
        'C. Quãng đường vật đi được',
        'D. Thời gian chuyển động của vật',
      ],
      correctAnswer: 'A',
      explanation: 'Tốc độ cho biết mức độ nhanh hay chậm của chuyển động.',
    },
    {
      id: 'q-5',
      subject: 'Ngữ văn',
      gradeLevel: 7,
      difficulty: 'Thông hiểu',
      type: 'MULTIPLE_CHOICE',
      content: 'Phó từ là những từ chuyên đi kèm với:',
      options: [
        'A. Danh từ',
        'B. Động từ, tính từ',
        'C. Đại từ',
        'D. Số từ',
      ],
      correctAnswer: 'B',
      explanation: 'Phó từ đi kèm động từ, tính từ để bổ sung ý nghĩa.',
    },
  ]);

  const [questionSearch, setQuestionSearch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('ALL');
  const [selectedDifficulty, setSelectedDifficulty] = useState('ALL');
  const [isAddQuestionModal, setIsAddQuestionModal] = useState(false);

  // New question form state
  const [newQContent, setNewQContent] = useState('');
  const [newQSubject, setNewQSubject] = useState('Toán học');
  const [newQGrade, setNewQGrade] = useState(7);
  const [newQDiff, setNewQDiff] = useState<'Nhận biết' | 'Thông hiểu' | 'Vận dụng' | 'Vận dụng cao'>('Nhận biết');
  const [newQOptA, setNewQOptA] = useState('');
  const [newQOptB, setNewQOptB] = useState('');
  const [newQOptC, setNewQOptC] = useState('');
  const [newQOptD, setNewQOptD] = useState('');
  const [newQAns, setNewQAns] = useState('A');
  const [newQExp, setNewQExp] = useState('');

  const filteredQuestions = questions.filter((q) => {
    const matchSearch = q.content.toLowerCase().includes(questionSearch.toLowerCase());
    const matchSubj = selectedSubject === 'ALL' || q.subject === selectedSubject;
    const matchDiff = selectedDifficulty === 'ALL' || q.difficulty === selectedDifficulty;
    return matchSearch && matchSubj && matchDiff;
  });

  const handleSaveQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQContent.trim()) {
      warning('Vui lòng nhập nội dung câu hỏi');
      return;
    }
    const newQ: QuestionItem = {
      id: `q-${Date.now()}`,
      subject: newQSubject,
      gradeLevel: newQGrade,
      difficulty: newQDiff,
      type: 'MULTIPLE_CHOICE',
      content: newQContent.trim(),
      options: [
        `A. ${newQOptA.trim() || 'Lựa chọn A'}`,
        `B. ${newQOptB.trim() || 'Lựa chọn B'}`,
        `C. ${newQOptC.trim() || 'Lựa chọn C'}`,
        `D. ${newQOptD.trim() || 'Lựa chọn D'}`,
      ],
      correctAnswer: newQAns,
      explanation: newQExp.trim() || 'Đáp án đúng theo chương trình.',
    };
    setQuestions([newQ, ...questions]);
    setIsAddQuestionModal(false);
    // Reset form
    setNewQContent('');
    setNewQOptA('');
    setNewQOptB('');
    setNewQOptC('');
    setNewQOptD('');
    setNewQExp('');
    success('Đã thêm câu hỏi mới vào Ngân hàng câu hỏi!');
  };

  const handleDeleteQuestion = (id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
    success('Đã xóa câu hỏi khỏi ngân hàng thành công!');
  };

  const handleDeleteAssignment = (id: string) => {
    setAssignmentsList((prev) => prev.filter((a) => a.id !== id));
    success('Đã xóa bài tập thành công!');
  };

  const handleDeleteResource = (id: string) => {
    setResources((prev) => prev.filter((r) => r.id !== id));
    success('Đã xóa tài liệu số thành công!');
  };

  // -------------------------------------------------------------
  // TAB 2: GIAO BÀI TẬP
  // -------------------------------------------------------------
  const [assignmentsList, setAssignmentsList] = useState<Assignment[]>(storageService.getAssignments());
  const [isAddAssignmentModal, setIsAddAssignmentModal] = useState(false);
  const [newAssignTitle, setNewAssignTitle] = useState('');
  const [newAssignClass, setNewAssignClass] = useState(classes[0]?.id || '');
  const [newAssignSubject, setNewAssignSubject] = useState('Toán học');
  const [newAssignDue, setNewAssignDue] = useState('2026-10-25');
  const [newAssignDesc, setNewAssignDesc] = useState('');

  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssignTitle.trim()) {
      warning('Vui lòng nhập tiêu đề bài tập');
      return;
    }
    const targetCls = classes.find((c) => c.id === newAssignClass) || classes[0];
    const newAss: Assignment = {
      id: `ass-${Date.now()}`,
      title: newAssignTitle.trim(),
      description: newAssignDesc.trim() || 'Học sinh hoàn thành bài tập trước hạn nộp.',
      classId: targetCls.id,
      className: targetCls.name,
      subject: newAssignSubject,
      maxScore: 10,
      dueDate: newAssignDue,
      createdAt: new Date().toISOString().split('T')[0],
      status: 'PUBLISHED',
      submittedCount: 0,
      totalStudents: targetCls.studentCount || 36,
    };
    const updated = [newAss, ...assignmentsList];
    setAssignmentsList(updated);
    storageService.saveAssignment(newAss);
    setIsAddAssignmentModal(false);
    setNewAssignTitle('');
    setNewAssignDesc('');
    success(`Đã giao bài tập thành công cho lớp ${targetCls.name}!`);
  };

  // -------------------------------------------------------------
  // TAB 3: CHẤM BÀI TỰ ĐỘNG
  // -------------------------------------------------------------
  const [selectedAssignForGrading, setSelectedAssignForGrading] = useState<string>(
    assignmentsList[0]?.id || ''
  );
  const [autoGradedSubmissions, setAutoGradedSubmissions] = useState([
    {
      id: 'sub-1',
      studentName: 'Trần Quang Minh',
      studentCode: 'HS2024-1001',
      submittedAt: '18/10/2026 14:30',
      autoScore: 9.5,
      accuracy: '95%',
      aiFeedback: 'Bài làm xuất sắc, nắm chắc phương pháp giải hệ phương trình. Trình bày rõ ràng.',
      status: 'AUTO_GRADED',
    },
    {
      id: 'sub-2',
      studentName: 'Lê Hoàng Nam',
      studentCode: 'HS2024-1002',
      submittedAt: '18/10/2026 15:10',
      autoScore: 8.5,
      accuracy: '85%',
      aiFeedback: 'Đúng hầu hết các câu trắc nghiệm. Câu 4 tính nhầm dấu ở bước quy đồng mẫu số.',
      status: 'AUTO_GRADED',
    },
    {
      id: 'sub-3',
      studentName: 'Nguyễn Thị Thu Hà',
      studentCode: 'HS2024-1003',
      submittedAt: '18/10/2026 16:05',
      autoScore: 10.0,
      accuracy: '100%',
      aiFeedback: 'Điểm tuyệt đối! Lời giải logic và chính xác hoàn toàn.',
      status: 'AUTO_GRADED',
    },
    {
      id: 'sub-4',
      studentName: 'Vũ Đức Thịnh',
      studentCode: 'HS2024-1004',
      submittedAt: '18/10/2026 17:20',
      autoScore: 7.0,
      accuracy: '70%',
      aiFeedback: 'Cần ôn lại định nghĩa số hữu tỉ và các tính chất cơ bản của phép nhân.',
      status: 'AUTO_GRADED',
    },
  ]);

  const handleSyncToGradebook = () => {
    success('Đã đồng bộ kết quả chấm tự động vào Sổ điểm điện tử thành công!');
  };

  // -------------------------------------------------------------
  // TAB 4: TÀI LIỆU SỐ
  // -------------------------------------------------------------
  const [resources, setResources] = useState<DigitalResource[]>([
    {
      id: 'res-1',
      title: 'Giáo án điện tử: Chương 1 - Số hữu tỉ (Toán 7 KNTT)',
      subject: 'Toán học',
      gradeLevel: 7,
      type: 'PPT',
      size: '14.2 MB',
      updatedAt: '15/10/2026',
      downloads: 48,
    },
    {
      id: 'res-2',
      title: 'Đề cương ôn tập kiểm tra giữa kỳ 1 có đáp án chi tiết',
      subject: 'Toán học',
      gradeLevel: 7,
      type: 'PDF',
      size: '2.8 MB',
      updatedAt: '16/10/2026',
      downloads: 120,
    },
    {
      id: 'res-3',
      title: 'Kế hoạch bài dạy GDPT 2018 theo Công văn 5512 môn Vật lý 10',
      subject: 'KHTN / Vật lý',
      gradeLevel: 10,
      type: 'DOCX',
      size: '4.5 MB',
      updatedAt: '10/10/2026',
      downloads: 65,
    },
    {
      id: 'res-4',
      title: 'Video thí nghiệm: Sự nở vì nhiệt của chất lỏng và chất khí',
      subject: 'KHTN / Vật lý',
      gradeLevel: 7,
      type: 'VIDEO',
      size: '85 MB',
      updatedAt: '12/10/2026',
      downloads: 32,
    },
  ]);

  // -------------------------------------------------------------
  // TAB 5: AI HỖ TRỢ
  // -------------------------------------------------------------
  const [aiPromptTopic, setAiPromptTopic] = useState('Phép cộng và trừ số hữu tỉ - Khối 7');
  const [aiOutput, setAiOutput] = useState<string>('');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  const handleGenerateAiLessonPlan = () => {
    setIsGeneratingAi(true);
    setAiOutput('');
    setTimeout(() => {
      setAiOutput(`KẾ HOẠCH BÀI DẠY (CHUẨN CÔNG VĂN 5512/BGDĐT)
Chủ đề: ${aiPromptTopic}

I. MỤC TIÊU DẠY HỌC:
1. Kiến thức:
- Học sinh hiểu và áp dụng được quy tắc cộng, trừ hai số hữu tỉ.
- Vận dụng được tính chất giao hoán, kết hợp của phép cộng để tính nhanh.
2. Năng lực:
- Năng lực tư duy và lập luận toán học.
- Năng lực giải quyết vấn đề toán học thực tiễn.
3. Phẩm chất:
- Chăm chỉ, cẩn thận, yêu thích khám phá khoa học.

II. TIẾN TRÌNH DẠY HỌC (4 BƯỚC):
- Hoạt động 1 (Khởi động - 5 phút): Trò chơi tiếp sức "Ai nhanh hơn" về quy đồng mẫu số phân số.
- Hoạt động 2 (Hình thành kiến thức - 15 phút): Hướng dẫn viết số hữu tỉ dưới dạng phân số có mẫu dương, sau đó thực hiện cộng/trừ.
- Hoạt động 3 (Luyện tập - 15 phút): Giải bài tập trắc nghiệm và tự luận trên bảng tương tác.
- Hoạt động 4 (Vận dụng - 10 phút): Bài toán tính toán chênh lệch nhiệt độ trong thực tế.`);
      setIsGeneratingAi(false);
      success('AI đã soạn xong giáo án bài giảng!');
    }, 800);
  };

  const handleGenerateAiQuiz = () => {
    setIsGeneratingAi(true);
    setAiOutput('');
    setTimeout(() => {
      setAiOutput(`BỘ CÂU HỎI TRẮC NGHIỆM TỰ ĐỘNG SINH TỪ AI
Chủ đề: ${aiPromptTopic}

Câu 1 [Nhận biết]: Muốn cộng hai số hữu tỉ cùng mẫu dương, ta:
A. Cộng các tử số với nhau và giữ nguyên mẫu số. (*)
B. Cộng cả tử số và mẫu số với nhau.
C. Nhân các tử số với nhau.
D. Trừ các tử số với nhau.
-> Đáp án: A. Giải thích: Quy tắc cộng hai phân số cùng mẫu.

Câu 2 [Thông hiểu]: Giá trị của biểu thức 1/3 + (-2/5) bằng:
A. -1/15 (*)
B. 1/15
C. -1/2
D. 3/8
-> Đáp án: A. Giải thích: 5/15 + (-6/15) = -1/15.

Câu 3 [Vận dụng]: Tìm số hữu tỉ x biết x - 1/4 = 3/2:
A. x = 7/4 (*)
B. x = 5/4
C. x = -5/4
D. x = 1/2
-> Đáp án: A. Giải thích: x = 3/2 + 1/4 = 6/4 + 1/4 = 7/4.`);
      setIsGeneratingAi(false);
      success('AI đã tạo 3 câu hỏi trắc nghiệm chất lượng cao!');
    }, 700);
  };

  if (activeTab === 'question_bank') {
    return <QuestionBankWorkspace />;
  }

  return (
    <div className="space-y-4">
      {/* Top Header for "DẠY & HỌC" other tabs */}
      <div className="bg-[#0b1326] rounded-2xl border border-cyan-500/30 p-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-6 bg-cyan-400 rounded-full" />
            <h1 className="text-xl font-black text-white tracking-tight">
              {activeTab === 'assignments' && 'Giao Bài Tập Cho Lớp'}
              {activeTab === 'auto_grading' && 'Chấm Bài Tự Động Bằng AI'}
              {activeTab === 'resources' && 'Kho Học Liệu & Tài Liệu Số'}
              {activeTab === 'ai_assistant' && 'AI Hỗ Trợ Giáo Viên'}
            </h1>
          </div>
          <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-cyan-950 text-cyan-300 border border-cyan-500/40">
            Dạy & Học
          </span>
        </div>
      </div>

      {/* =========================================================================
          TAB 2: GIAO BÀI TẬP
          ========================================================================= */}
      {activeTab === 'assignments' && (
        <div className="bg-[#0b1326] rounded-2xl border border-cyan-500/30 p-4 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-cyan-500/20">
            <div>
              <h2 className="text-base font-black text-white">Danh Sách Bài Tập Đã Giao</h2>
              <p className="text-xs text-slate-300">Giao bài tập về nhà và theo dõi tiến độ nộp bài của học sinh</p>
            </div>
            <button
              onClick={() => setIsAddAssignmentModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs rounded-xl shadow-md cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Giao bài tập mới</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {assignmentsList.map((ass) => (
              <div
                key={ass.id}
                className="bg-[#070e22] rounded-xl border border-cyan-500/20 p-4 space-y-3 hover:border-cyan-400/50 transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[11px] font-black px-2 py-0.5 rounded bg-blue-950 text-blue-200 border border-blue-500/40">
                      {ass.className}
                    </span>
                    <h3 className="text-sm font-bold text-white mt-1.5">{ass.title}</h3>
                    <p className="text-xs text-slate-300 line-clamp-2 mt-0.5">{ass.description}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] px-2 py-0.5 rounded font-black bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                      {ass.status}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteAssignment(ass.id)}
                      className="p-1 text-rose-400 hover:text-white hover:bg-rose-600 rounded transition-colors cursor-pointer"
                      title="Xóa bài tập này"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span>Đã nộp bài:</span>
                    <strong className="text-cyan-300">
                      {ass.submittedCount} / {ass.totalStudents} học sinh
                    </strong>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full"
                      style={{
                        width: `${Math.round((ass.submittedCount / (ass.totalStudents || 1)) * 100)}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                  <span className="text-slate-400">Hạn nộp: <strong className="text-rose-300">{ass.dueDate}</strong></span>
                  <button
                    onClick={() => {
                      setSelectedAssignForGrading(ass.id);
                      setActiveTab('auto_grading');
                    }}
                    className="text-cyan-400 hover:text-cyan-200 font-bold underline cursor-pointer"
                  >
                    Chấm bài tự động →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: CHẤM BÀI TỰ ĐỘNG
          ========================================================================= */}
      {activeTab === 'auto_grading' && (
        <div className="bg-[#0b1326] rounded-2xl border border-cyan-500/30 p-4 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-cyan-500/20">
            <div>
              <h2 className="text-base font-black text-white">Chấm Điểm & Nhận Xét Tự Động Bằng AI</h2>
              <p className="text-xs text-slate-300">Hệ thống tự động so khớp đáp án, chấm điểm thang 10 và viết nhận xét chi tiết</p>
            </div>
            <button
              onClick={handleSyncToGradebook}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-md cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Đồng bộ vào Sổ điểm</span>
            </button>
          </div>

          {/* Submissions Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#060e22] text-cyan-200 border-b border-cyan-500/30">
                  <th className="p-3 font-bold">Mã HS</th>
                  <th className="p-3 font-bold">Họ và tên</th>
                  <th className="p-3 font-bold">Thời gian nộp</th>
                  <th className="p-3 font-bold text-center">Độ chính xác</th>
                  <th className="p-3 font-bold text-center text-cyan-300">Điểm tự động</th>
                  <th className="p-3 font-bold">Nhận xét từ AI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 bg-[#070e22]">
                {autoGradedSubmissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-[#0c183a] transition-colors">
                    <td className="p-3 font-mono text-slate-300">{sub.studentCode}</td>
                    <td className="p-3 font-black text-white">{sub.studentName}</td>
                    <td className="p-3 text-slate-300">{sub.submittedAt}</td>
                    <td className="p-3 text-center font-bold text-emerald-300">{sub.accuracy}</td>
                    <td className="p-3 text-center font-black text-white text-sm bg-cyan-950/40">
                      {sub.autoScore.toFixed(1)} / 10
                    </td>
                    <td className="p-3 text-slate-200 font-medium">{sub.aiFeedback}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: TÀI LIỆU SỐ
          ========================================================================= */}
      {activeTab === 'resources' && (
        <div className="bg-[#0b1326] rounded-2xl border border-cyan-500/30 p-4 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-cyan-500/20">
            <div>
              <h2 className="text-base font-black text-white">Kho Học Liệu & Tài Liệu Số</h2>
              <p className="text-xs text-slate-300">Lưu trữ giáo án, slide bài giảng, đề cương và video hỗ trợ giảng dạy</p>
            </div>
            <button
              onClick={() => info('Tính năng tải lên tài liệu mới đã sẵn sàng')}
              className="flex items-center gap-1.5 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs rounded-xl shadow-md cursor-pointer"
            >
              <UploadCloud className="w-4 h-4" />
              <span>+ Tải lên tài liệu mới</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {resources.map((res) => (
              <div
                key={res.id}
                className="p-4 bg-[#070e22] rounded-xl border border-cyan-500/20 hover:border-cyan-400/50 transition-all flex items-start justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-cyan-950 border border-cyan-500/30 text-cyan-300 mt-0.5">
                    {res.type === 'VIDEO' ? <Video className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{res.title}</h3>
                    <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-slate-400">
                      <span>Môn: <strong className="text-slate-200">{res.subject}</strong></span>
                      <span>·</span>
                      <span>Khối: <strong className="text-slate-200">{res.gradeLevel}</strong></span>
                      <span>·</span>
                      <span>Dung lượng: <strong className="text-slate-200">{res.size}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => success(`Bắt đầu tải về: ${res.title}`)}
                    className="p-2 bg-[#121f42] hover:bg-[#1a2c5a] text-cyan-300 hover:text-white rounded-xl border border-cyan-500/30 cursor-pointer transition-colors"
                    title="Tải về tài liệu"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteResource(res.id)}
                    className="p-2 bg-rose-950/40 hover:bg-rose-900 text-rose-300 hover:text-white rounded-xl border border-rose-500/30 cursor-pointer transition-colors"
                    title="Xóa tài liệu này"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 5: AI HỖ TRỢ
          ========================================================================= */}
      {activeTab === 'ai_assistant' && (
        <div className="bg-[#0b1326] rounded-2xl border border-cyan-500/30 p-4 shadow-xl space-y-4">
          <div className="pb-3 border-b border-cyan-500/20">
            <h2 className="text-base font-black text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cyan-300" />
              <span>AI HỖ TRỢ GIÁO VIÊN THÔNG MINH</span>
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Tự động hóa soạn giáo án 5512, tạo đề kiểm tra, sinh câu hỏi trắc nghiệm và nhận xét học sinh
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Input & Prompt Prompts */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-cyan-300 mb-1">
                  Chủ đề bài giảng / Bài học:
                </label>
                <input
                  type="text"
                  value={aiPromptTopic}
                  onChange={(e) => setAiPromptTopic(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#070c1a] border border-cyan-500/40 rounded-xl text-white outline-none focus:ring-2 focus:ring-cyan-400 font-semibold"
                />
              </div>

              <div className="space-y-2">
                <button
                  onClick={handleGenerateAiLessonPlan}
                  disabled={isGeneratingAi}
                  className="w-full py-2.5 px-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Soạn giáo án 5512 tự động</span>
                </button>

                <button
                  onClick={handleGenerateAiQuiz}
                  disabled={isGeneratingAi}
                  className="w-full py-2.5 px-3 bg-[#0e1b38] hover:bg-[#162750] text-cyan-200 border border-cyan-500/40 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <HelpCircle className="w-4 h-4" />
                  <span>Sinh 3 câu hỏi trắc nghiệm vào ngân hàng</span>
                </button>
              </div>
            </div>

            {/* AI Output Window */}
            <div className="lg:col-span-2 bg-[#070d1e] rounded-xl border border-cyan-500/40 p-4 space-y-2 flex flex-col justify-between min-h-[280px]">
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-xs font-bold text-cyan-300">Kết quả sinh từ AI:</span>
                  {aiOutput && (
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(aiOutput);
                        success('Đã sao chép nội dung vào Clipboard!');
                      }}
                      className="flex items-center gap-1 text-[11px] text-cyan-400 hover:underline cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Sao chép</span>
                    </button>
                  )}
                </div>

                <div className="pt-2 text-xs text-slate-100 whitespace-pre-wrap font-sans leading-relaxed">
                  {isGeneratingAi ? (
                    <div className="flex items-center gap-2 text-cyan-400 py-8 justify-center animate-pulse">
                      <Sparkles className="w-5 h-5 animate-spin" />
                      <span>AI đang phân tích chương trình học và biên soạn...</span>
                    </div>
                  ) : aiOutput ? (
                    aiOutput
                  ) : (
                    <span className="text-slate-500 italic">
                      Nhấn vào các nút chức năng bên trái để AI bắt đầu sinh giáo án hoặc câu hỏi trắc nghiệm tự động.
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD QUESTION */}
      {isAddQuestionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0c152d] border border-cyan-500/60 rounded-2xl p-6 max-w-xl w-full shadow-2xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-cyan-500/20">
              <h3 className="text-base font-black text-white">Thêm câu hỏi mới vào Ngân hàng</h3>
              <button
                onClick={() => setIsAddQuestionModal(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuestion} className="space-y-3 text-xs">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Môn học:</label>
                  <select
                    value={newQSubject}
                    onChange={(e) => setNewQSubject(e.target.value)}
                    className="w-full p-2 bg-[#070c1a] border border-cyan-500/40 text-white rounded-lg outline-none font-bold"
                  >
                    <option value="Toán học">Toán học</option>
                    <option value="KHTN / Vật lý">KHTN / Vật lý</option>
                    <option value="Ngữ văn">Ngữ văn</option>
                    <option value="Tiếng Anh">Tiếng Anh</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Khối:</label>
                  <select
                    value={newQGrade}
                    onChange={(e) => setNewQGrade(Number(e.target.value))}
                    className="w-full p-2 bg-[#070c1a] border border-cyan-500/40 text-white rounded-lg outline-none font-bold"
                  >
                    {GRADE_LEVELS.map((g) => (
                      <option key={g.level} value={g.level}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Mức độ:</label>
                  <select
                    value={newQDiff}
                    onChange={(e) => setNewQDiff(e.target.value as any)}
                    className="w-full p-2 bg-[#070c1a] border border-cyan-500/40 text-white rounded-lg outline-none font-bold"
                  >
                    <option value="Nhận biết">Nhận biết</option>
                    <option value="Thông hiểu">Thông hiểu</option>
                    <option value="Vận dụng">Vận dụng</option>
                    <option value="Vận dụng cao">Vận dụng cao</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Nội dung câu hỏi:</label>
                <textarea
                  value={newQContent}
                  onChange={(e) => setNewQContent(e.target.value)}
                  placeholder="Nhập câu hỏi..."
                  rows={3}
                  className="w-full p-2 bg-[#070c1a] border border-cyan-500/40 text-white rounded-lg outline-none resize-none font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-bold mb-0.5">Lựa chọn A:</label>
                  <input
                    type="text"
                    value={newQOptA}
                    onChange={(e) => setNewQOptA(e.target.value)}
                    className="w-full p-1.5 bg-[#070c1a] border border-cyan-500/40 text-white rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-0.5">Lựa chọn B:</label>
                  <input
                    type="text"
                    value={newQOptB}
                    onChange={(e) => setNewQOptB(e.target.value)}
                    className="w-full p-1.5 bg-[#070c1a] border border-cyan-500/40 text-white rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-0.5">Lựa chọn C:</label>
                  <input
                    type="text"
                    value={newQOptC}
                    onChange={(e) => setNewQOptC(e.target.value)}
                    className="w-full p-1.5 bg-[#070c1a] border border-cyan-500/40 text-white rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-0.5">Lựa chọn D:</label>
                  <input
                    type="text"
                    value={newQOptD}
                    onChange={(e) => setNewQOptD(e.target.value)}
                    className="w-full p-1.5 bg-[#070c1a] border border-cyan-500/40 text-white rounded-lg outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Đáp án đúng:</label>
                  <select
                    value={newQAns}
                    onChange={(e) => setNewQAns(e.target.value)}
                    className="w-full p-2 bg-[#070c1a] border border-emerald-500/50 text-emerald-300 font-black rounded-lg outline-none"
                  >
                    <option value="A">Đáp án A</option>
                    <option value="B">Đáp án B</option>
                    <option value="C">Đáp án C</option>
                    <option value="D">Đáp án D</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Giải thích:</label>
                  <input
                    type="text"
                    value={newQExp}
                    onChange={(e) => setNewQExp(e.target.value)}
                    placeholder="Giải thích ngắn gọn..."
                    className="w-full p-2 bg-[#070c1a] border border-cyan-500/40 text-white rounded-lg outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddQuestionModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl font-black cursor-pointer shadow-md"
                >
                  Lưu vào Ngân hàng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD ASSIGNMENT */}
      {isAddAssignmentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0c152d] border border-cyan-500/60 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-cyan-500/20">
              <h3 className="text-base font-black text-white">Giao bài tập mới</h3>
              <button
                onClick={() => setIsAddAssignmentModal(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAssignment} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Tiêu đề bài tập:</label>
                <input
                  type="text"
                  value={newAssignTitle}
                  onChange={(e) => setNewAssignTitle(e.target.value)}
                  placeholder="Ví dụ: Luyện tập phép cộng trừ số hữu tỉ..."
                  className="w-full p-2 bg-[#070c1a] border border-cyan-500/40 text-white rounded-lg outline-none font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Giao cho lớp:</label>
                  <select
                    value={newAssignClass}
                    onChange={(e) => setNewAssignClass(e.target.value)}
                    className="w-full p-2 bg-[#070c1a] border border-cyan-500/40 text-white rounded-lg outline-none font-bold"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Hạn nộp bài:</label>
                  <input
                    type="date"
                    value={newAssignDue}
                    onChange={(e) => setNewAssignDue(e.target.value)}
                    className="w-full p-2 bg-[#070c1a] border border-cyan-500/40 text-white rounded-lg outline-none font-bold"
                  >
                  </input>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Mô tả & Hướng dẫn:</label>
                <textarea
                  value={newAssignDesc}
                  onChange={(e) => setNewAssignDesc(e.target.value)}
                  placeholder="Yêu cầu học sinh nộp bài trước hạn..."
                  rows={3}
                  className="w-full p-2 bg-[#070c1a] border border-cyan-500/40 text-white rounded-lg outline-none resize-none font-semibold"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddAssignmentModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl font-black cursor-pointer shadow-md"
                >
                  Phát hành bài tập
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
