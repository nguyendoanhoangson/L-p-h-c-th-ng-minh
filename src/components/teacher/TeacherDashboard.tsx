import React from 'react';
import {
  Users,
  CheckSquare,
  Clock,
  BookOpen,
  Award,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Calendar,
  School,
  TrendingUp,
} from 'lucide-react';
import { Classroom, Student } from '../../types';
import { storageService } from '../../services/storageService';

interface TeacherDashboardProps {
  onNavigate: (screen: string) => void;
  onSelectClassWorkspace: (cls: Classroom) => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  onNavigate,
  onSelectClassWorkspace,
}) => {
  const classes = storageService.getClasses();
  const students = storageService.getStudents();
  const assignments = storageService.getAssignments();
  const auditLogs = storageService.getAuditLogs();

  const totalStudents = students.filter((s) => s.status === 'STUDYING').length;

  return (
    <div className="space-y-5">
      {/* Welcome Banner (Vivid Navy Dark Gradient) */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 rounded-3xl p-6 text-white shadow-xl border border-blue-500/40 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/25 text-blue-200 text-xs font-bold backdrop-blur-xs mb-3 border border-blue-400/40">
            <Sparkles className="w-4 h-4 text-blue-300" />
            <span>Hệ thống Quản lý Lớp học Thông minh 2024 - 2025</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight leading-tight text-white">
            Xin chào, Thầy Nguyễn Văn Hùng!
          </h1>
          <p className="text-blue-100 text-xs mt-1.5 leading-relaxed font-medium">
            Hôm nay thầy có 2 lớp học cần điểm danh và 28 bài tập hình học cần chấm điểm. Chúc thầy một ngày giảng dạy tràn đầy năng lượng!
          </p>

          <div className="flex items-center gap-3 mt-4 flex-wrap">
            <button
              onClick={() => onNavigate('teacher_attendance')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs rounded-xl transition-colors shadow-lg shadow-blue-600/40 cursor-pointer ring-1 ring-blue-300"
            >
              Điểm danh ngay hôm nay
            </button>
            <button
              onClick={() => onNavigate('teacher_schedule')}
              className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs rounded-xl transition-colors shadow-lg shadow-cyan-500/30 cursor-pointer ring-1 ring-cyan-200"
            >
              Xem Thời khóa biểu
            </button>
            <button
              onClick={() => onNavigate('teacher_tools_wheel')}
              className="px-4 py-2 bg-[#121c38] hover:bg-[#192750] border border-blue-400/40 text-blue-200 font-bold text-xs rounded-xl transition-colors cursor-pointer"
            >
              Mở vòng quay may mắn
            </button>
          </div>
        </div>

        {/* Decorative circle */}
        <div className="absolute right-0 bottom-0 translate-x-10 translate-y-10 w-64 h-64 rounded-full bg-blue-500/20 pointer-events-none blur-2xl" />
      </div>

      {/* KPI Stats Grid (4 mục trên 1 dòng, số đưa lên cùng dòng theo ý kiến Hình 2) */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-[#0b1326] rounded-2xl p-3 border border-slate-700/90 shadow-lg min-w-0">
          <div className="flex items-center justify-between text-slate-200">
            <span className="text-xs font-bold text-slate-200 truncate whitespace-nowrap">Tổng học sinh</span>
            <div className="flex items-center gap-1.5">
              <span className="text-xl sm:text-2xl font-black text-white whitespace-nowrap">{totalStudents}</span>
              <Users className="w-4 h-4 text-blue-300 shrink-0 ml-1" />
            </div>
          </div>
          <div className="text-[11px] text-blue-200 font-semibold mt-1 truncate whitespace-nowrap">Đang học trong 4 lớp</div>
        </div>

        <div className="bg-[#0b1326] rounded-2xl p-3 border border-slate-700/90 shadow-lg min-w-0">
          <div className="flex items-center justify-between text-slate-200">
            <span className="text-xs font-bold text-slate-200 truncate whitespace-nowrap">Có mặt hôm nay</span>
            <div className="flex items-center gap-1.5">
              <span className="text-xl sm:text-2xl font-black text-emerald-300 whitespace-nowrap">97.4%</span>
              <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0 ml-1" />
            </div>
          </div>
          <div className="text-[11px] text-emerald-400 font-bold mt-1 truncate whitespace-nowrap">Chuyên cần xuất sắc</div>
        </div>

        <div className="bg-[#0b1326] rounded-2xl p-3 border border-slate-700/90 shadow-lg min-w-0">
          <div className="flex items-center justify-between text-slate-200">
            <span className="text-xs font-bold text-slate-200 truncate whitespace-nowrap">Bài tập đã giao</span>
            <div className="flex items-center gap-1.5">
              <span className="text-xl sm:text-2xl font-black text-white whitespace-nowrap">{assignments.length}</span>
              <BookOpen className="w-4 h-4 text-purple-400 shrink-0 ml-1" />
            </div>
          </div>
          <div className="text-[11px] text-purple-300 font-semibold mt-1 truncate whitespace-nowrap">63 bài đã nộp chờ chấm</div>
        </div>

        <div className="bg-[#0b1326] rounded-2xl p-3 border border-slate-700/90 shadow-lg min-w-0">
          <div className="flex items-center justify-between text-slate-200">
            <span className="text-xs font-bold text-slate-200 truncate whitespace-nowrap">Cảnh báo nề nếp</span>
            <div className="flex items-center gap-1.5">
              <span className="text-xl sm:text-2xl font-black text-amber-300 whitespace-nowrap">2</span>
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 ml-1" />
            </div>
          </div>
          <div className="text-[11px] text-amber-200 font-semibold mt-1 truncate whitespace-nowrap">1 đi trễ, 1 nghỉ phép</div>
        </div>
      </div>

      {/* Classes Overview List (Bright Contrast) */}
      <div className="bg-[#0b1326] rounded-2xl p-5 border border-slate-700/90 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-black text-white">Các Lớp Phụ Trách ({classes.length})</h2>
            <p className="text-xs text-slate-200 font-medium">Click vào lớp để mở không gian làm việc chi tiết</p>
          </div>
          <button
            onClick={() => onNavigate('teacher_classes')}
            className="text-xs font-black text-blue-300 hover:text-white flex items-center gap-1 cursor-pointer"
          >
            <span>Xem tất cả lớp</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {classes.map((cls) => (
            <div
              key={cls.id}
              onClick={() => onSelectClassWorkspace(cls)}
              className="p-4 rounded-xl border border-slate-700 bg-[#0e1732] hover:border-blue-400 hover:bg-[#131f45] transition-all cursor-pointer flex items-center justify-between shadow-md"
            >
              <div>
                <div className="font-black text-white text-sm">{cls.name}</div>
                <div className="text-xs text-slate-200 font-medium mt-0.5">
                  Khối {cls.gradeLevel} · {cls.room} · <strong className="text-blue-200">{cls.studentCount}</strong> Học sinh
                </div>
              </div>
              <button className="px-3.5 py-1.5 text-xs font-black text-white bg-blue-600 border border-blue-400 rounded-lg shadow-md hover:bg-blue-500">
                Chi tiết
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Activity Timeline (Bright Contrast) */}
      <div className="bg-[#0b1326] rounded-2xl p-5 border border-slate-700/90 shadow-lg space-y-3">
        <h3 className="font-black text-sm text-white">Hoạt Động & Nhật Ký Gần Đây (Audit Logs)</h3>
        <div className="space-y-2">
          {auditLogs.slice(0, 4).map((log) => (
            <div key={log.id} className="p-3 rounded-xl bg-[#0e1732] border border-slate-700 flex items-center justify-between text-xs">
              <div>
                <span className="font-black text-blue-300">{log.action}</span>:{' '}
                <span className="text-slate-100 font-medium">{log.details}</span>
              </div>
              <span className="text-xs text-slate-300 font-mono flex-shrink-0 font-semibold">{log.timestamp}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
