import React, { useState } from 'react';
import {
  Users,
  Baby,
  Award,
  CheckSquare,
  BookOpen,
  MessageSquare,
  Bell,
  Send,
  CheckCircle2,
  Phone,
  Home,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { storageService } from '../../services/storageService';
import { useNotification } from '../../contexts/NotificationContext';

export const ParentPortalView: React.FC = () => {
  const { activeChildId, setActiveChildId, parentChildren } = useAuth();
  const { success } = useNotification();
  const [activeTab, setActiveTab] = useState<'overview' | 'grades' | 'attendance' | 'messages'>('overview');
  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState<
    { sender: string; text: string; time: string; isTeacher?: boolean }[]
  >([
    {
      sender: 'Thầy Nguyễn Văn Hùng',
      text: 'Chào bác, tuần này em học tập rất tích cực và làm bài tập môn Toán đạt điểm 10.',
      time: '10:30 Hôm qua',
      isTeacher: true,
    },
    {
      sender: 'Bác Trần Văn Bình (Phụ huynh)',
      text: 'Dạ cảm ơn thầy nhiều, gia đình sẽ tiếp tục động viên cháu cố gắng!',
      time: '11:15 Hôm qua',
    },
  ]);

  const currentChild =
    parentChildren.find((c) => c.id === activeChildId) || parentChildren[0] || storageService.getStudents()[0];

  const grades = storageService.getGrades().filter((g) => g.studentId === currentChild.id);
  const attendance = storageService.getAttendance().filter((a) => a.studentId === currentChild.id);
  const assignments = storageService.getAssignments().filter((a) => a.classId === currentChild.classId);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    setMessages((prev) => [
      ...prev,
      {
        sender: 'Bác Trần Văn Bình (Phụ huynh)',
        text: messageText.trim(),
        time: 'Vừa xong',
      },
    ]);
    setMessageText('');
    success('Đã gửi tin nhắn trao đổi tới Giáo viên chủ nhiệm!');
  };

  return (
    <div className="space-y-4">
      {/* Top Banner with Child Switcher */}
      <div className="bg-gradient-to-r from-purple-900 via-slate-900 to-[#0b1328] rounded-3xl p-6 text-white shadow-xl border border-purple-500/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950 text-xs font-black mb-1.5 text-purple-200 border border-purple-400">
            <ShieldCheck className="w-4 h-4 text-purple-300" />
            <span>Cổng Thông Tin Phụ Huynh Học Sinh</span>
          </div>
          <h1 className="text-2xl font-black text-white">Chào Quý Phụ Huynh: Bác Trần Văn Bình</h1>
          <p className="text-xs text-slate-100 font-medium mt-0.5">
            Theo dõi sát sao tình hình rèn luyện và học tập của con em tại nhà trường
          </p>
        </div>

        {/* Child Switcher Component */}
        {parentChildren.length > 0 && (
          <div className="bg-[#080e1e] p-3 rounded-2xl border border-slate-700">
            <div className="text-xs font-black text-purple-300 mb-1.5 flex items-center gap-1.5">
              <Baby className="w-4 h-4 text-purple-300" />
              <span>Chuyển đổi theo dõi con ({parentChildren.length} con liên kết):</span>
            </div>
            <div className="flex items-center gap-2">
              {parentChildren.map((ch) => (
                <button
                  key={ch.id}
                  onClick={() => setActiveChildId(ch.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    currentChild.id === ch.id
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/40 ring-1 ring-purple-300'
                      : 'bg-[#121c38] text-slate-200 hover:text-white border border-slate-700'
                  }`}
                >
                  {ch.fullName} ({ch.className})
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Selected Child Info Strip */}
      <div className="bg-[#0b1326] rounded-2xl p-4 border border-slate-700/90 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {currentChild.avatar ? (
            <img src={currentChild.avatar} alt={currentChild.fullName} className="w-12 h-12 rounded-full object-cover ring-2 ring-purple-400" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-purple-600 text-white font-black flex items-center justify-center">
              {currentChild.fullName.charAt(0)}
            </div>
          )}
          <div>
            <div className="text-sm font-black text-white">
              Đang theo dõi em: <strong className="text-purple-300 text-base">{currentChild.fullName}</strong>
            </div>
            <div className="text-xs text-slate-200 font-semibold">
              Mã HS: <strong className="text-blue-300 font-bold">{currentChild.studentCode}</strong> · Lớp: <strong className="text-white font-bold">{currentChild.className}</strong> (Khối {currentChild.gradeLevel})
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-200 font-medium flex items-center gap-2">
          <span>Giáo viên chủ nhiệm: <strong className="text-white font-bold">Thầy Nguyễn Văn Hùng</strong></span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-700 pb-2">
        {[
          { id: 'overview', label: 'Tổng Quan Con Em', icon: Users },
          { id: 'grades', label: 'Bảng Điểm', icon: Award },
          { id: 'attendance', label: 'Chuyên Cần & Điểm Danh', icon: CheckSquare },
          { id: 'messages', label: 'Trao Đổi Với Giáo Viên', icon: MessageSquare },
        ].map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                isActive ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/40 ring-1 ring-purple-300' : 'text-slate-200 hover:text-white hover:bg-[#16254e]'
              }`}
            >
              <Icon className="w-4 h-4 text-purple-300" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="bg-[#0b1326] rounded-2xl p-4.5 border border-slate-700/90 shadow-lg">
              <span className="text-xs font-black text-slate-200 uppercase tracking-wide">Tỷ lệ chuyên cần</span>
              <div className="text-3xl font-black text-emerald-300 mt-1.5">100%</div>
              <div className="text-xs text-emerald-400 font-bold mt-1">Không vắng buổi nào</div>
            </div>

            <div className="bg-[#0b1326] rounded-2xl p-4.5 border border-slate-700/90 shadow-lg">
              <span className="text-xs font-black text-slate-200 uppercase tracking-wide">Điểm trung bình học kỳ</span>
              <div className="text-3xl font-black text-purple-300 mt-1.5">9.6 / 10</div>
              <div className="text-xs text-purple-200 font-bold mt-1">Xếp loại: Xuất sắc</div>
            </div>

            <div className="bg-[#0b1326] rounded-2xl p-4.5 border border-slate-700/90 shadow-lg">
              <span className="text-xs font-black text-slate-200 uppercase tracking-wide">Bài tập về nhà</span>
              <div className="text-3xl font-black text-blue-300 mt-1.5">Đã hoàn thành</div>
              <div className="text-xs text-blue-200 font-bold mt-1">Không có bài tồn đọng</div>
            </div>
          </div>

          <div className="bg-[#0b1326] rounded-2xl p-5 border border-slate-700/90 shadow-lg space-y-3">
            <h3 className="font-black text-base text-white">Nhận Xét Của Giáo Viên Chủ Nhiệm</h3>
            <div className="p-4 bg-[#080e1e] rounded-xl border border-slate-700 text-xs text-slate-100 font-medium leading-relaxed">
              "Em {currentChild.fullName} rất có ý thức học tập, ngoan ngoãn và luôn chuẩn bị bài chu đáo trước khi đến lớp. Em hòa đồng với bạn bè và thường xuyên hỗ trợ các bạn trong tổ giải bài tập khó."
              <div className="text-xs text-blue-300 font-extrabold mt-2.5">— Thầy Nguyễn Văn Hùng (Chủ nhiệm Lớp)</div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Grades */}
      {activeTab === 'grades' && (
        <div className="bg-[#0b1326] rounded-2xl p-5 border border-slate-700/90 shadow-lg space-y-4">
          <h3 className="font-black text-base text-white">Sổ Điểm Chi Tiết Của Em {currentChild.fullName}</h3>
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
                  <th className="p-3 text-center font-black text-purple-300">ĐTB</th>
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
                    <td className="p-3 text-center font-black text-purple-300 text-sm">{gr.averageScore}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Messages with Teacher */}
      {activeTab === 'messages' && (
        <div className="bg-[#0b1326] rounded-2xl p-5 border border-slate-700/90 shadow-lg space-y-4">
          <h3 className="font-black text-base text-white">Hộp Thoại Trao Đổi Phụ Huynh – Giáo Viên</h3>

          <div className="p-4 bg-[#080e1e] rounded-2xl border border-slate-700 min-h-60 max-h-80 overflow-y-auto space-y-3">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`p-3.5 rounded-2xl max-w-md text-xs leading-relaxed ${
                  m.isTeacher
                    ? 'bg-blue-950 border border-blue-500 text-white mr-auto'
                    : 'bg-purple-950 border border-purple-500 text-white ml-auto'
                }`}
              >
                <div className="font-black text-[12px] mb-1 text-blue-200">{m.sender}</div>
                <div className="text-slate-100 font-semibold">{m.text}</div>
                <div className="text-[10px] text-slate-300 mt-1.5 text-right font-medium">{m.time}</div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <input
              type="text"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Nhập nội dung trao đổi gửi tới giáo viên..."
              className="flex-1 px-4 py-2.5 text-xs bg-[#0e172e] border border-slate-600 rounded-xl text-white font-medium placeholder:text-slate-400 focus:ring-2 focus:ring-purple-400 outline-none"
            />
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-black rounded-xl shadow-lg transition-colors cursor-pointer shadow-purple-600/40"
            >
              <Send className="w-4 h-4 text-white" />
              <span>Gửi tin</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
