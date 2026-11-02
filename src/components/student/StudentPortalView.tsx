import React, { useState } from 'react';
import {
  GraduationCap,
  Calendar,
  BookOpen,
  Award,
  CheckCircle2,
  Clock,
  Send,
  FileText,
  User,
  ShieldCheck,
} from 'lucide-react';
import { storageService } from '../../services/storageService';
import { useNotification } from '../../contexts/NotificationContext';

export const StudentPortalView: React.FC = () => {
  const { success } = useNotification();
  const [activeTab, setActiveTab] = useState<'assignments' | 'quizzes' | 'grades' | 'profile'>('assignments');
  const [submittedTasks, setSubmittedTasks] = useState<Record<string, string>>({});
  const [submissionText, setSubmissionText] = useState('');
  const [activeQuizAnswer, setActiveQuizAnswer] = useState<Record<string, string>>({});

  const student = storageService.getStudents()[0];
  const assignments = storageService.getAssignments();
  const quizzes = storageService.getQuizzes();
  const grades = storageService.getGrades().filter((g) => g.studentId === student.id);

  const handleSubmitAssignment = (asgId: string) => {
    if (!submissionText.trim()) return;
    setSubmittedTasks((prev) => ({ ...prev, [asgId]: submissionText }));
    setSubmissionText('');
    success('Đã nộp bài tập thành công cho giáo viên!');
  };

  return (
    <div className="space-y-4">
      {/* Student Hero Header */}
      <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-[#0b1328] rounded-3xl p-6 text-white shadow-xl border border-emerald-500/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={student.avatar || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150'}
            alt={student.fullName}
            className="w-16 h-16 rounded-full object-cover ring-4 ring-emerald-400"
          />
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950 text-xs font-black mb-1.5 text-emerald-300 border border-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>Cổng Học Sinh Chính Thức</span>
            </div>
            <h1 className="text-2xl font-black text-white">{student.fullName}</h1>
            <p className="text-xs text-slate-100 font-semibold mt-0.5">
              Mã HS: <strong className="text-emerald-300 font-extrabold">{student.studentCode}</strong> · Lớp: <strong className="text-white font-extrabold">{student.className}</strong> (Khối {student.gradeLevel})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-[#080e1e] p-3 rounded-2xl border border-slate-700">
          <div className="text-center px-3.5 border-r border-slate-700">
            <div className="text-xs uppercase text-slate-200 font-bold">Chuyên cần</div>
            <div className="text-xl font-black text-emerald-300 mt-0.5">100%</div>
          </div>
          <div className="text-center px-3.5">
            <div className="text-xs uppercase text-slate-200 font-bold">ĐTB Học kỳ</div>
            <div className="text-xl font-black text-amber-300 mt-0.5">9.6</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-700 pb-2">
        {[
          { id: 'assignments', label: 'Bài Tập Cần Làm', icon: BookOpen },
          { id: 'quizzes', label: 'Bài Kiểm Tra / Quiz', icon: CheckCircle2 },
          { id: 'grades', label: 'Kết Quả & Sổ Điểm', icon: Award },
          { id: 'profile', label: 'Hồ Sơ Của Tôi', icon: User },
        ].map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                isActive ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/40' : 'text-slate-200 hover:text-white hover:bg-[#16254e]'
              }`}
            >
              <Icon className="w-4 h-4 text-emerald-300" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab: Assignments */}
      {activeTab === 'assignments' && (
        <div className="space-y-3">
          {assignments.map((asg) => {
            const isDone = Boolean(submittedTasks[asg.id]);
            return (
              <div key={asg.id} className="bg-[#0b1326] rounded-2xl p-5 border border-slate-700/90 shadow-lg space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-xs font-black text-emerald-200 bg-emerald-950 px-3 py-1 rounded-md border border-emerald-500">
                      {asg.subject}
                    </span>
                    <h3 className="text-base font-black text-white mt-2">{asg.title}</h3>
                    <p className="text-xs text-slate-100 font-medium mt-1 leading-relaxed">{asg.description}</p>
                  </div>
                  <span className="text-xs font-bold text-slate-200 whitespace-nowrap bg-[#0e172e] px-2.5 py-1 rounded-md border border-slate-700">
                    Hạn nộp: {asg.dueDate}
                  </span>
                </div>

                {isDone ? (
                  <div className="p-3 bg-emerald-950 border border-emerald-500 rounded-xl text-xs text-emerald-200 font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-300 flex-shrink-0" />
                    <span>Em đã nộp bài thành công vào lúc 14:30. Đang chờ giáo viên chấm điểm!</span>
                  </div>
                ) : (
                  <div className="pt-2 border-t border-slate-700 space-y-2">
                    <label className="block text-xs font-black text-white">Soạn câu trả lời / Bài làm:</label>
                    <textarea
                      rows={3}
                      value={submissionText}
                      onChange={(e) => setSubmissionText(e.target.value)}
                      placeholder="Nhập nội dung bài làm hoặc dán link tài liệu bài giải..."
                      className="w-full p-3 text-xs bg-[#080e1e] border border-slate-600 rounded-xl text-white font-medium placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-400 outline-none resize-none"
                    />
                    <button
                      onClick={() => handleSubmitAssignment(asg.id)}
                      className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl shadow-md transition-colors cursor-pointer shadow-emerald-600/40"
                    >
                      <Send className="w-4 h-4 text-white" />
                      <span>Nộp bài cho thầy</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Tab: Quizzes */}
      {activeTab === 'quizzes' && (
        <div className="space-y-4">
          {quizzes.map((quiz) => (
            <div key={quiz.id} className="bg-[#0b1326] rounded-2xl p-5 border border-slate-700/90 shadow-lg space-y-4">
              <div className="flex items-center justify-between border-b pb-3 border-slate-700">
                <div>
                  <h3 className="font-black text-base text-white">{quiz.title}</h3>
                  <p className="text-xs text-slate-200 font-medium">Môn: <strong className="text-blue-300">{quiz.subject}</strong> · Thời gian: <strong className="text-white">{quiz.durationMinutes}</strong> phút</p>
                </div>
                <span className="text-xs font-black px-3 py-1 bg-blue-950 text-blue-200 border border-blue-400 rounded-lg">Đang mở</span>
              </div>

              <div className="space-y-4">
                {quiz.questions.map((q, idx) => (
                  <div key={q.id} className="p-4 rounded-xl bg-[#080e1e] border border-slate-700 space-y-2.5">
                    <div className="text-xs font-black text-white leading-relaxed">
                      Câu {idx + 1}: {q.content}
                    </div>
                    {q.options && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        {q.options.map((opt, oIdx) => (
                          <label
                            key={oIdx}
                            className={`flex items-center gap-2.5 p-2.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                              activeQuizAnswer[q.id] === opt
                                ? 'bg-emerald-950 border-emerald-400 text-white font-black'
                                : 'bg-[#0c1429] border-slate-700 text-slate-200 font-semibold hover:bg-[#131e3d]'
                            }`}
                          >
                            <input
                              type="radio"
                              name={q.id}
                              checked={activeQuizAnswer[q.id] === opt}
                              onChange={() => setActiveQuizAnswer((prev) => ({ ...prev, [q.id]: opt }))}
                              className="accent-emerald-400 w-4 h-4"
                            />
                            <span>{opt}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <button
                onClick={() => success('Đã nộp bài kiểm tra trắc nghiệm thành công! Hệ thống đã tự động chấm.')}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl shadow-lg transition-colors cursor-pointer shadow-emerald-600/40"
              >
                Nộp bài trắc nghiệm
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Tab: Grades */}
      {activeTab === 'grades' && (
        <div className="bg-[#0b1326] rounded-2xl p-5 border border-slate-700/90 shadow-lg space-y-4">
          <h3 className="font-black text-base text-white">Bảng Điểm Cá Nhân Học Kỳ 1</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#0e1732] text-white font-black border-b border-slate-700">
                <tr>
                  <th className="p-3">Môn học</th>
                  <th className="p-3 text-center">Miệng</th>
                  <th className="p-3 text-center">15 Phút</th>
                  <th className="p-3 text-center">1 Tiết</th>
                  <th className="p-3 text-center">Giữa kỳ</th>
                  <th className="p-3 text-center">Cuối kỳ</th>
                  <th className="p-3 text-center font-black text-emerald-300">Điểm TB</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/80 bg-[#0b1326]">
                {grades.map((gr) => (
                  <tr key={gr.id} className="hover:bg-[#14224a]">
                    <td className="p-3 font-black text-white text-sm">{gr.subject}</td>
                    <td className="p-3 text-center text-slate-100 font-bold">{gr.oralScore}</td>
                    <td className="p-3 text-center text-slate-100 font-bold">{gr.test15m}</td>
                    <td className="p-3 text-center text-slate-100 font-bold">{gr.test45m}</td>
                    <td className="p-3 text-center text-slate-100 font-bold">{gr.midTerm}</td>
                    <td className="p-3 text-center text-slate-100 font-bold">{gr.finalTerm}</td>
                    <td className="p-3 text-center font-black text-emerald-300 text-sm">{gr.averageScore}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Profile */}
      {activeTab === 'profile' && (
        <div className="bg-[#0b1326] rounded-2xl p-6 border border-slate-700/90 shadow-lg space-y-4">
          <h3 className="font-black text-base text-white">Hồ Sơ Cá Nhân & Gia Đình</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 bg-[#080e1e] border border-slate-700 rounded-xl space-y-1">
              <span className="text-slate-300 font-bold">Họ và tên:</span>
              <p className="font-black text-white text-base">{student.fullName}</p>
            </div>
            <div className="p-3.5 bg-[#080e1e] border border-slate-700 rounded-xl space-y-1">
              <span className="text-slate-300 font-bold">Ngày sinh:</span>
              <p className="font-black text-white text-base">{student.dob}</p>
            </div>
            <div className="p-3.5 bg-[#080e1e] border border-slate-700 rounded-xl space-y-1">
              <span className="text-slate-300 font-bold">Phụ huynh liên hệ:</span>
              <p className="font-black text-white text-base">{student.parent.fatherOrMotherName} ({student.parent.phone})</p>
            </div>
            <div className="p-3.5 bg-[#080e1e] border border-slate-700 rounded-xl space-y-1">
              <span className="text-slate-300 font-bold">Địa chỉ thường trú:</span>
              <p className="font-semibold text-slate-100 text-sm leading-relaxed">{student.parent.permanentAddress}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
