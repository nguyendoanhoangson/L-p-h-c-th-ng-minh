import React, { useState } from 'react';
import {
  X,
  FileCheck2,
  Clock,
  School,
  CheckCircle2,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { BankQuestion } from '../../../types/questionBank';
import { Classroom } from '../../../types';
import { questionBankService } from '../../../services/questionBankService';

interface CreateQuizFromQuestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedQuestions: BankQuestion[];
  classes: Classroom[];
  onQuizCreated: (quizId: string) => void;
}

export const CreateQuizFromQuestionsModal: React.FC<CreateQuizFromQuestionsModalProps> = ({
  isOpen,
  onClose,
  selectedQuestions,
  classes,
  onQuizCreated,
}) => {
  const [title, setTitle] = useState<string>(
    `Đề kiểm tra nhanh từ Ngân hàng câu hỏi (${new Date().toLocaleDateString('vi-VN')})`
  );
  const [classId, setClassId] = useState<string>(classes[0]?.id || '');
  const [duration, setDuration] = useState<number>(15);
  const [shuffle, setShuffle] = useState<boolean>(true);

  if (!isOpen) return null;

  const totalPoints = selectedQuestions.reduce((sum, q) => sum + (q.points || 0.25), 0);

  const handleCreate = () => {
    if (!title.trim() || !classId) return;

    const newQuiz = questionBankService.createQuizFromQuestions(
      selectedQuestions.map((q) => q.id),
      title,
      classId,
      duration,
      selectedQuestions[0]?.subject
    );

    onQuizCreated(newQuiz.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-[#0b1328] border border-cyan-500/40 rounded-3xl max-w-lg w-full text-slate-100 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-700/80 bg-[#080d1c] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-600/30 border border-cyan-500/50 flex items-center justify-center text-cyan-300">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-white">Tạo Đề Thi / Quiz Từ Câu Đã Chọn</h2>
              <p className="text-xs text-slate-400">
                Tạo bản snapshot độc lập cho đề thi để đảm bảo tính toàn vẹn đề thi đã phát hành
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

        {/* Body */}
        <div className="p-5 space-y-4 text-xs">
          {/* Summary Box */}
          <div className="p-3.5 rounded-2xl bg-[#090f22] border border-cyan-500/30 flex items-center justify-between">
            <div>
              <span className="text-slate-400 block text-[11px]">Số câu hỏi đã chọn:</span>
              <span className="text-lg font-black text-cyan-300">{selectedQuestions.length} câu</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Tổng điểm dự kiến:</span>
              <span className="text-lg font-black text-white">{totalPoints.toFixed(2)}đ</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Môn học:</span>
              <span className="text-xs font-bold text-slate-200">{selectedQuestions[0]?.subject || 'Toán học'}</span>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="font-bold text-slate-300 block mb-1">Tên bài kiểm tra / Đề thi:</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#0f1730] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none font-bold focus:border-cyan-400"
            />
          </div>

          {/* Class selection */}
          <div>
            <label className="font-bold text-slate-300 block mb-1">Giao cho lớp học:</label>
            <select
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
              className="w-full bg-[#0f1730] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none font-bold cursor-pointer"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.studentCount} học sinh) - Khối {c.gradeLevel}
                </option>
              ))}
            </select>
          </div>

          {/* Duration */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-300 block mb-1">Thời gian làm bài (Phút):</label>
              <select
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full bg-[#0f1730] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none font-bold"
              >
                <option value={10}>10 phút (Kiểm tra 10p)</option>
                <option value={15}>15 phút (Kiểm tra 15p)</option>
                <option value={45}>45 phút (Kiểm tra 1 tiết)</option>
                <option value={90}>90 phút (Thi học kỳ)</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-300 block mb-1">Đảo câu & Phương án:</label>
              <label className="flex items-center gap-2 mt-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={shuffle}
                  onChange={(e) => setShuffle(e.target.checked)}
                  className="w-4 h-4 accent-cyan-500 rounded"
                />
                <span className="text-slate-300 font-medium">Xáo trộn ngẫu nhiên</span>
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-700/80 bg-[#080d1c] flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white cursor-pointer"
          >
            Hủy bỏ
          </button>

          <button
            type="button"
            onClick={handleCreate}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-cyan-500/30 cursor-pointer transition-all active:scale-95"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Phát hành đề thi ngay</span>
          </button>
        </div>
      </div>
    </div>
  );
};
