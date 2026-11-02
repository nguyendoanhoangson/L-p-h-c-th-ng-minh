import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  School,
  Users,
  Calendar,
  CheckSquare,
  BookOpen,
  Award,
  Sparkles,
  BarChart3,
  Bell,
  Settings,
  HelpCircle,
  Clock,
  Layers,
  Wrench,
  ShieldAlert,
  GraduationCap,
  MessageSquare,
  ShieldCheck,
  FolderOpen,
  Folder,
  FileText,
  FileCheck2,
  FolderArchive,
  AlertTriangle,
  RotateCw,
  Home,
  CheckCircle,
  FileCheck,
} from 'lucide-react';
import { UserRole } from '../../types';

export interface NavItem {
  id: string;
  label: string;
  icon?: React.FC<{ className?: string }>;
  iconColor?: string;
  badge?: string | number;
}

export interface NavModule {
  id: string;
  label: string;
  icon: React.FC<{ className?: string }>;
  subItems: NavItem[];
}

interface SidebarProps {
  currentRole: UserRole;
  activeScreen: string;
  onNavigate: (screenId: string) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRole,
  activeScreen,
  onNavigate,
  isOpenMobile,
  onCloseMobile,
}) => {
  const [openModules, setOpenModules] = useState<Record<string, boolean>>({
    classes_module: true,
    students_module: true,
    teaching_module: true,
    tracking_module: false,
    tools_module: false,
    admin_module: true,
    student_portal_module: true,
    parent_portal_module: true,
  });

  const toggleModule = (moduleId: string) => {
    setOpenModules((prev) => ({
      ...prev,
      [moduleId]: !prev[moduleId],
    }));
  };

  const expandAll = () => {
    setOpenModules({
      classes_module: true,
      students_module: true,
      teaching_module: true,
      tracking_module: true,
      tools_module: true,
      admin_module: true,
      student_portal_module: true,
      parent_portal_module: true,
    });
  };

  const collapseAll = () => {
    setOpenModules({});
  };

  // TEACHER MODULES (Sắp xếp chuẩn theo Hình 1 với Icon sắc màu nổi bật)
  const teacherModules: NavModule[] = [
    {
      id: 'classes_module',
      label: 'Lớp Học',
      icon: School,
      subItems: [
        { id: 'teacher_classes', label: 'Lớp của tôi', icon: BookOpen, iconColor: 'text-sky-400' },
        { id: 'teacher_students', label: 'Học sinh & phụ huynh', icon: Users, iconColor: 'text-emerald-400' },
        { id: 'teacher_attendance', label: 'Điểm danh', icon: CheckSquare, iconColor: 'text-amber-400' },
        { id: 'teacher_schedule', label: 'Thời khóa biểu', icon: Calendar, iconColor: 'text-violet-400' },
        { id: 'teacher_lucky_wheel', label: 'Vòng quay may mắn', icon: RotateCw, iconColor: 'text-pink-400' },
      ],
    },
    {
      id: 'teaching_module',
      label: 'Dạy & Học',
      icon: BookOpen,
      subItems: [
        { id: 'teacher_question_bank', label: 'Ngân hàng câu hỏi', icon: HelpCircle, iconColor: 'text-cyan-400' },
        { id: 'teacher_assignments', label: 'Giao bài tập', icon: FileText, iconColor: 'text-orange-400', badge: 4 },
        { id: 'teacher_auto_grading', label: 'Chấm bài tự động', icon: FileCheck2, iconColor: 'text-teal-400' },
        { id: 'teacher_resources', label: 'Tài liệu số', icon: FolderArchive, iconColor: 'text-indigo-400' },
        { id: 'teacher_ai', label: 'AI Hỗ trợ', icon: Sparkles, iconColor: 'text-amber-300' },
      ],
    },
    {
      id: 'tracking_module',
      label: 'Theo Dõi & Đánh Giá',
      icon: BarChart3,
      subItems: [
        { id: 'teacher_grades', label: 'Sổ điểm điện tử', icon: BarChart3, iconColor: 'text-blue-400' },
        { id: 'teacher_attendance_analytics', label: 'Chuyên cần', icon: Users, iconColor: 'text-rose-400' },
        { id: 'teacher_behavior', label: 'Hành vi & Nề nếp', icon: Award, iconColor: 'text-yellow-400' },
        { id: 'teacher_alerts', label: 'Cảnh báo thông minh', icon: AlertTriangle, iconColor: 'text-red-400', badge: 3 },
      ],
    },
  ];

  // STUDENT MODULES
  const studentModules: NavModule[] = [
    {
      id: 'student_portal_module',
      label: 'Cổng Học Sinh',
      icon: GraduationCap,
      subItems: [
        { id: 'student_dashboard', label: 'Trang chủ & Nhiệm vụ', icon: Home, iconColor: 'text-sky-400' },
        { id: 'student_schedule', label: 'Thời khóa biểu cá nhân', icon: Calendar, iconColor: 'text-violet-400' },
        { id: 'student_assignments', label: 'Bài tập cần nộp', icon: FileText, iconColor: 'text-orange-400' },
        { id: 'student_quizzes', label: 'Làm bài kiểm tra', icon: CheckSquare, iconColor: 'text-emerald-400' },
        { id: 'student_grades', label: 'Kết quả & Sổ điểm', icon: BarChart3, iconColor: 'text-blue-400' },
        { id: 'student_attendance', label: 'Chuyên cần của tôi', icon: Users, iconColor: 'text-teal-400' },
        { id: 'student_achievements', label: 'Thành tích & Huy hiệu', icon: Award, iconColor: 'text-yellow-400' },
      ],
    },
  ];

  // PARENT MODULES
  const parentModules: NavModule[] = [
    {
      id: 'parent_portal_module',
      label: 'Cổng Phụ Huynh',
      icon: Users,
      subItems: [
        { id: 'parent_dashboard', label: 'Tổng quan theo dõi con', icon: Home, iconColor: 'text-purple-400' },
        { id: 'parent_schedule', label: 'Thời khóa biểu của con', icon: Calendar, iconColor: 'text-violet-400' },
        { id: 'parent_grades', label: 'Sổ điểm & Học tập', icon: BarChart3, iconColor: 'text-blue-400' },
        { id: 'parent_attendance', label: 'Điểm danh & Chuyên cần', icon: CheckSquare, iconColor: 'text-emerald-400' },
        { id: 'parent_assignments', label: 'Bài tập về nhà của con', icon: FileText, iconColor: 'text-amber-400' },
        { id: 'parent_comments', label: 'Nhận xét từ giáo viên', icon: Award, iconColor: 'text-pink-400' },
        { id: 'parent_messages', label: 'Trao đổi với giáo viên', icon: MessageSquare, iconColor: 'text-teal-400' },
      ],
    },
  ];

  // ADMIN MODULES
  const adminModules: NavModule[] = [
    {
      id: 'admin_module',
      label: 'Quản Trị Hệ Thống',
      icon: ShieldCheck,
      subItems: [
        { id: 'admin_dashboard', label: 'Dashboard quản trị', icon: BarChart3, iconColor: 'text-rose-400' },
        { id: 'admin_schools', label: 'Cơ sở & Niên khóa', icon: School, iconColor: 'text-sky-400' },
        { id: 'admin_grades_12', label: 'Cấu hình 12 Khối học', icon: Layers, iconColor: 'text-amber-400' },
        { id: 'admin_classes', label: 'Quản lý toàn bộ lớp', icon: BookOpen, iconColor: 'text-indigo-400' },
        { id: 'admin_users', label: 'Phân quyền & Tài khoản', icon: Users, iconColor: 'text-emerald-400' },
        { id: 'admin_audit', label: 'Nhật ký hoạt động (Audit)', icon: ShieldCheck, iconColor: 'text-cyan-400' },
      ],
    },
  ];

  const currentModules =
    currentRole === 'TEACHER'
      ? teacherModules
      : currentRole === 'STUDENT'
      ? studentModules
      : currentRole === 'PARENT'
      ? parentModules
      : adminModules;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/80 z-40 lg:hidden backdrop-blur-xs"
        />
      )}

      {/* Main Sidebar: Navy Dark with High Contrast Bright Typography - Compact w-64 */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-40 w-64 bg-[#0a1022] border-r border-slate-700/80 flex flex-col transition-transform duration-200 ease-in-out ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="h-14 sm:h-16 border-b border-slate-700/80 px-3.5 flex items-center justify-between bg-[#080d1c] flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center font-bold shadow-md shadow-blue-500/30 flex-shrink-0">
              <School className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <div className="font-black text-xs sm:text-sm tracking-tight text-white leading-none truncate">
                SMART CLASS
              </div>
              <div className="text-[9px] text-blue-300 font-bold tracking-wider uppercase mt-1 truncate">
                Lớp Học Thông Minh
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Modules */}
        <nav className="flex-1 overflow-y-auto p-2.5 space-y-1.5">
          {/* Dashboard Button */}
          <button
            onClick={() => {
              onNavigate(
                currentRole === 'TEACHER'
                  ? 'teacher_dashboard'
                  : currentRole === 'STUDENT'
                  ? 'student_dashboard'
                  : currentRole === 'PARENT'
                  ? 'parent_dashboard'
                  : 'admin_dashboard'
              );
              onCloseMobile();
            }}
            className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeScreen.includes('dashboard')
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/40 font-extrabold ring-1 ring-blue-400'
                : 'text-slate-100 hover:bg-[#142042] hover:text-white'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span className="tracking-wide truncate">Tổng Quan (Dashboard)</span>
          </button>

          {/* Module List (Chuẩn theo phong cách Hình 1) */}
          {currentModules.map((module) => {
            const isOpen = openModules[module.id] ?? true;
            const hasActiveSub = module.subItems.some((s) => s.id === activeScreen);

            return (
              <div key={module.id} className="space-y-0.5 mb-1.5">
                {/* Module Category Title */}
                <button
                  type="button"
                  onClick={() => toggleModule(module.id)}
                  className="w-full flex items-center justify-between px-2 py-1 text-[11px] font-black uppercase tracking-wider text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer select-none"
                  title={isOpen ? 'Click để đóng nhóm này' : 'Click để mở nhóm này'}
                >
                  <span className="truncate">{module.label}</span>

                  <div className="flex items-center gap-1 text-cyan-400 flex-shrink-0">
                    <span className="text-[11px] font-black">({module.subItems.length})</span>
                    {isOpen ? (
                      <ChevronDown className="w-3.5 h-3.5 transition-transform flex-shrink-0" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 transition-transform flex-shrink-0" />
                    )}
                  </div>
                </button>

                {/* Sub-screens */}
                {isOpen && (
                  <div className="space-y-0.5">
                    {module.subItems.map((sub) => {
                      const isActive = activeScreen === sub.id;
                      const SubIcon = sub.icon;
                      return (
                        <button
                          key={sub.id}
                          onClick={() => {
                            onNavigate(sub.id);
                            onCloseMobile();
                          }}
                          className={`w-full flex items-center justify-between text-left px-2.5 py-1.5 rounded-xl text-xs transition-all cursor-pointer ${
                            isActive
                              ? 'bg-[#0088cc] text-white font-black shadow-md shadow-cyan-500/30'
                              : 'text-slate-100 font-semibold hover:text-white hover:bg-[#121c38]'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-1">
                            {SubIcon && (
                              <SubIcon
                                className={`w-3.5 h-3.5 flex-shrink-0 transition-transform ${
                                  isActive ? 'text-white' : sub.iconColor || 'text-cyan-400'
                                }`}
                              />
                            )}
                            <span className="truncate whitespace-nowrap text-xs font-semibold tracking-tight">{sub.label}</span>
                          </div>

                          <div className="flex items-center gap-1 flex-shrink-0">
                            {sub.badge !== undefined && (
                              <span className="min-w-4 h-4 px-1 rounded-full text-[10px] font-black bg-white text-rose-600 flex items-center justify-center shadow-xs">
                                {sub.badge}
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </aside>
    </>
  );
};
