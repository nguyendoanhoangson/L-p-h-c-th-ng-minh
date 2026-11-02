import React from 'react';
import { Monitor, ChevronRight, Home, Sparkles, Folder, Calendar, BookOpen, Users, HelpCircle, FileText, FileCheck2, BarChart3, Award, AlertTriangle, Layers, RotateCw } from 'lucide-react';
import { UserRole } from '../../types';

interface BreadcrumbsBarProps {
  currentRole: UserRole;
  activeScreen: string;
  onNavigate: (screen: string) => void;
  selectedClassName?: string;
  subItemLabel?: string;
}

export const BreadcrumbsBar: React.FC<BreadcrumbsBarProps> = ({
  currentRole,
  activeScreen,
  onNavigate,
  selectedClassName,
  subItemLabel,
}) => {
  // Screen metadata mapping
  const screenMeta: Record<
    string,
    { moduleName: string; moduleIcon: React.FC<{ className?: string }>; screenName: string; defaultScreen: string }
  > = {
    teacher_dashboard: { moduleName: 'Tổng Quan', moduleIcon: Home, screenName: 'Bảng điều khiển', defaultScreen: 'teacher_dashboard' },
    teacher_classes: { moduleName: 'Lớp Học', moduleIcon: BookOpen, screenName: 'Lớp của tôi', defaultScreen: 'teacher_classes' },
    teacher_classes_workspace: { moduleName: 'Lớp Học', moduleIcon: BookOpen, screenName: selectedClassName || 'Không gian lớp học', defaultScreen: 'teacher_classes' },
    teacher_students: { moduleName: 'Lớp Học', moduleIcon: Users, screenName: 'Học sinh & phụ huynh', defaultScreen: 'teacher_students' },
    teacher_students_parents: { moduleName: 'Lớp Học', moduleIcon: Users, screenName: 'Học sinh & phụ huynh', defaultScreen: 'teacher_students' },
    teacher_attendance: { moduleName: 'Lớp Học', moduleIcon: Calendar, screenName: 'Điểm danh lớp', defaultScreen: 'teacher_attendance' },
    teacher_schedule: { moduleName: 'Lớp Học', moduleIcon: Calendar, screenName: 'Thời khóa biểu', defaultScreen: 'teacher_schedule' },
    teacher_lucky_wheel: { moduleName: 'Lớp Học', moduleIcon: RotateCw, screenName: 'Vòng quay may mắn', defaultScreen: 'teacher_lucky_wheel' },
    
    teacher_question_bank: { moduleName: 'Dạy & Học', moduleIcon: HelpCircle, screenName: 'Ngân hàng câu hỏi thông minh', defaultScreen: 'teacher_question_bank' },
    teacher_assignments: { moduleName: 'Dạy & Học', moduleIcon: FileText, screenName: 'Giao bài tập', defaultScreen: 'teacher_assignments' },
    teacher_auto_grading: { moduleName: 'Dạy & Học', moduleIcon: FileCheck2, screenName: 'Chấm bài tự động', defaultScreen: 'teacher_auto_grading' },
    teacher_resources: { moduleName: 'Dạy & Học', moduleIcon: Folder, screenName: 'Tài liệu số', defaultScreen: 'teacher_resources' },
    teacher_ai: { moduleName: 'Dạy & Học', moduleIcon: Sparkles, screenName: 'AI Hỗ trợ', defaultScreen: 'teacher_ai' },
    
    teacher_grades: { moduleName: 'Theo Dõi & Đánh Giá', moduleIcon: BarChart3, screenName: 'Sổ điểm điện tử', defaultScreen: 'teacher_grades' },
    teacher_attendance_analytics: { moduleName: 'Theo Dõi & Đánh Giá', moduleIcon: Users, screenName: 'Chuyên cần', defaultScreen: 'teacher_attendance_analytics' },
    teacher_behavior: { moduleName: 'Theo Dõi & Đánh Giá', moduleIcon: Award, screenName: 'Hành vi & Nề nếp', defaultScreen: 'teacher_behavior' },
    teacher_alerts: { moduleName: 'Theo Dõi & Đánh Giá', moduleIcon: AlertTriangle, screenName: 'Cảnh báo thông minh', defaultScreen: 'teacher_alerts' },

    teacher_tools_wheel: { moduleName: 'Công Cụ Lớp Học', moduleIcon: Layers, screenName: 'Vòng quay may mắn', defaultScreen: 'teacher_tools_wheel' },
    teacher_tools_random: { moduleName: 'Công Cụ Lớp Học', moduleIcon: Layers, screenName: 'Gọi học sinh ngẫu nhiên', defaultScreen: 'teacher_tools_wheel' },
    teacher_tools_groups: { moduleName: 'Công Cụ Lớp Học', moduleIcon: Layers, screenName: 'Chia nhóm tự động', defaultScreen: 'teacher_tools_wheel' },
    teacher_tools_timer: { moduleName: 'Công Cụ Lớp Học', moduleIcon: Layers, screenName: 'Đồng hồ đếm ngược', defaultScreen: 'teacher_tools_wheel' },
    teacher_tools_quick_quiz: { moduleName: 'Công Cụ Lớp Học', moduleIcon: Layers, screenName: 'Quiz nhanh máy chiếu', defaultScreen: 'teacher_tools_wheel' },

    // Student screens
    student_dashboard: { moduleName: 'Cổng Học Sinh', moduleIcon: Home, screenName: 'Trang chủ & Nhiệm vụ', defaultScreen: 'student_dashboard' },
    student_schedule: { moduleName: 'Cổng Học Sinh', moduleIcon: Calendar, screenName: 'Thời khóa biểu cá nhân', defaultScreen: 'student_schedule' },
    student_assignments: { moduleName: 'Cổng Học Sinh', moduleIcon: FileText, screenName: 'Bài tập cần nộp', defaultScreen: 'student_assignments' },
    student_quizzes: { moduleName: 'Cổng Học Sinh', moduleIcon: HelpCircle, screenName: 'Làm bài kiểm tra', defaultScreen: 'student_quizzes' },
    student_grades: { moduleName: 'Cổng Học Sinh', moduleIcon: BarChart3, screenName: 'Sổ điểm cá nhân', defaultScreen: 'student_grades' },
    student_attendance: { moduleName: 'Cổng Học Sinh', moduleIcon: Users, screenName: 'Chuyên cần cá nhân', defaultScreen: 'student_attendance' },

    // Parent screens
    parent_dashboard: { moduleName: 'Cổng Phụ Huynh', moduleIcon: Home, screenName: 'Tổng quan học tập', defaultScreen: 'parent_dashboard' },
    parent_grades: { moduleName: 'Cổng Phụ Huynh', moduleIcon: BarChart3, screenName: 'Sổ điểm của con', defaultScreen: 'parent_dashboard' },
    parent_attendance: { moduleName: 'Cổng Phụ Huynh', moduleIcon: Users, screenName: 'Điểm danh & Chuyên cần', defaultScreen: 'parent_dashboard' },
    parent_schedule: { moduleName: 'Cổng Phụ Huynh', moduleIcon: Calendar, screenName: 'Thời khóa biểu của con', defaultScreen: 'parent_schedule' },

    // Admin screens
    admin_dashboard: { moduleName: 'Quản Trị Viên', moduleIcon: Home, screenName: 'Bảng điều khiển hệ thống', defaultScreen: 'admin_dashboard' },
    admin_schedule: { moduleName: 'Quản Trị Viên', moduleIcon: Calendar, screenName: 'Quản lý Thời khóa biểu toàn trường', defaultScreen: 'admin_schedule' },
  };

  const current = screenMeta[activeScreen] || {
    moduleName: 'Smart Class',
    moduleIcon: Monitor,
    screenName: activeScreen,
    defaultScreen: 'teacher_dashboard',
  };

  const homeScreen =
    currentRole === 'TEACHER'
      ? 'teacher_dashboard'
      : currentRole === 'STUDENT'
      ? 'student_dashboard'
      : currentRole === 'PARENT'
      ? 'parent_dashboard'
      : 'admin_dashboard';

  return (
    <div className="w-full bg-[#080e22] border-b border-slate-700/80 px-3 sm:px-4 py-1.5 sm:py-2 flex items-center gap-1.5 text-xs text-slate-300 font-medium overflow-x-auto scrollbar-none flex-nowrap select-none shadow-xs">
      {/* PC / Monitor Root Icon (Giống hệt Hình 4: [Monitor icon] > This PC > OS (C:) > ...) */}
      <button
        onClick={() => onNavigate(homeScreen)}
        className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[#0e1836] hover:bg-[#162754] text-cyan-300 hover:text-white transition-all cursor-pointer font-bold border border-cyan-500/30 whitespace-nowrap"
        title="Nhấp để về trang chủ"
      >
        <Monitor className="w-3.5 h-3.5 text-cyan-400" />
        <span>Hệ Thống</span>
      </button>

      <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />

      {/* Module Level */}
      <button
        onClick={() => onNavigate(current.defaultScreen)}
        className="px-2 py-1 rounded-lg hover:bg-[#142042] text-slate-200 hover:text-white transition-colors cursor-pointer font-bold whitespace-nowrap"
        title={`Xem mục ${current.moduleName}`}
      >
        <span>{current.moduleName}</span>
      </button>

      <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />

      {/* Current Screen Level */}
      <span className="px-2 py-1 rounded-lg bg-cyan-950/70 border border-cyan-400/40 text-cyan-200 font-black whitespace-nowrap shadow-xs">
        {current.screenName}
      </span>

      {/* Optional deeper sub-item or selected class */}
      {subItemLabel && (
        <>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="px-2 py-1 rounded-lg bg-blue-950/70 border border-blue-400/30 text-blue-200 font-bold whitespace-nowrap">
            {subItemLabel}
          </span>
        </>
      )}
    </div>
  );
};
