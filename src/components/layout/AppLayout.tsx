import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { BreadcrumbsBar } from './BreadcrumbsBar';
import { Classroom } from '../../types';
import { storageService } from '../../services/storageService';

// Teacher Screens
import { TeacherDashboard } from '../teacher/TeacherDashboard';
import { ClassManagementView } from '../teacher/ClassManagementView';
import { ClassWorkspace } from '../teacher/ClassWorkspace';
import { StudentManagementView } from '../teacher/StudentManagementView';
import { AttendanceWorkspace } from '../teacher/AttendanceWorkspace';
import { ClassroomTools } from '../teacher/ClassroomTools';
import { TimetableWorkspace } from '../teacher/TimetableWorkspace';
import { TeachingWorkspace } from '../teacher/TeachingWorkspace';

// Student Portal
import { StudentPortalView } from '../student/StudentPortalView';

// Parent Portal
import { ParentPortalView } from '../parent/ParentPortalView';

// Admin Portal
import { AdminPortalView } from '../admin/AdminPortalView';

// Auth Login Modal
import { LoginModal } from '../auth/LoginModal';

export const AppLayout: React.FC = () => {
  const { currentRole } = useAuth();
  const [activeScreen, setActiveScreen] = useState<string>('teacher_dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [currentSelectedClass, setCurrentSelectedClass] = useState<Classroom | null>(null);

  // When role changes, set reasonable default screen
  React.useEffect(() => {
    if (currentRole === 'TEACHER') setActiveScreen('teacher_dashboard');
    else if (currentRole === 'STUDENT') setActiveScreen('student_dashboard');
    else if (currentRole === 'PARENT') setActiveScreen('parent_dashboard');
    else if (currentRole === 'ADMIN') setActiveScreen('admin_dashboard');
  }, [currentRole]);

  // Handle entering a class workspace
  const handleSelectClassWorkspace = (cls: Classroom) => {
    setCurrentSelectedClass(cls);
    setActiveScreen('teacher_classes_workspace');
  };

  const renderCurrentScreen = () => {
    // TEACHER SCREENS
    if (currentRole === 'TEACHER') {
      if (activeScreen === 'teacher_dashboard') {
        return (
          <TeacherDashboard
            onNavigate={(screen) => setActiveScreen(screen)}
            onSelectClassWorkspace={handleSelectClassWorkspace}
          />
        );
      }

      if (activeScreen === 'teacher_classes') {
        return (
          <ClassManagementView
            onSelectClassWorkspace={handleSelectClassWorkspace}
          />
        );
      }

      if (activeScreen === 'teacher_classes_workspace') {
        const cls = currentSelectedClass || storageService.getClasses()[0];
        return (
          <ClassWorkspace
            classroom={cls}
            onBack={() => setActiveScreen('teacher_classes')}
          />
        );
      }

      if (activeScreen === 'teacher_students') {
        return <StudentManagementView initialTab="students" />;
      }

      if (activeScreen === 'teacher_students_parents') {
        return <StudentManagementView initialTab="parents" />;
      }

      if (activeScreen === 'teacher_attendance' || activeScreen === 'teacher_attendance_analytics') {
        return <AttendanceWorkspace initialClassId={currentSelectedClass?.id} />;
      }

      if (activeScreen === 'teacher_schedule') {
        return (
          <TimetableWorkspace
            initialClassId={currentSelectedClass?.id}
            onBack={() => setActiveScreen('teacher_dashboard')}
          />
        );
      }

      if (
        activeScreen === 'teacher_question_bank' ||
        activeScreen === 'teacher_assignments' ||
        activeScreen === 'teacher_auto_grading' ||
        activeScreen === 'teacher_resources' ||
        activeScreen === 'teacher_ai'
      ) {
        const tabMap: Record<string, any> = {
          teacher_question_bank: 'question_bank',
          teacher_assignments: 'assignments',
          teacher_auto_grading: 'auto_grading',
          teacher_resources: 'resources',
          teacher_ai: 'ai_assistant',
        };
        return <TeachingWorkspace initialTab={tabMap[activeScreen] || 'question_bank'} />;
      }

      if (
        activeScreen === 'teacher_lucky_wheel' ||
        activeScreen === 'teacher_tools_wheel' ||
        activeScreen === 'teacher_tools_random' ||
        activeScreen === 'teacher_tools_groups' ||
        activeScreen === 'teacher_tools_timer' ||
        activeScreen === 'teacher_tools_quick_quiz'
      ) {
        const toolMap: Record<string, 'wheel' | 'random' | 'groups' | 'timer' | 'quick-quiz'> = {
          teacher_lucky_wheel: 'wheel',
          teacher_tools_wheel: 'wheel',
          teacher_tools_random: 'random',
          teacher_tools_groups: 'groups',
          teacher_tools_timer: 'timer',
          teacher_tools_quick_quiz: 'quick-quiz',
        };
        return (
          <ClassroomTools
            initialTool={toolMap[activeScreen] || 'wheel'}
            initialClassId={currentSelectedClass?.id}
          />
        );
      }

      // Default fallback for any other sub-screens
      const firstClass = currentSelectedClass || storageService.getClasses()[0];
      return (
        <ClassWorkspace
          classroom={firstClass}
          onBack={() => setActiveScreen('teacher_dashboard')}
        />
      );
    }

    // STUDENT PORTAL
    if (currentRole === 'STUDENT') {
      if (activeScreen === 'student_schedule') {
        return <TimetableWorkspace isReadOnlyMode={true} />;
      }
      return <StudentPortalView />;
    }

    // PARENT PORTAL
    if (currentRole === 'PARENT') {
      if (activeScreen === 'parent_schedule') {
        return <TimetableWorkspace isReadOnlyMode={true} />;
      }
      return <ParentPortalView />;
    }

    // ADMIN PORTAL
    if (currentRole === 'ADMIN') {
      if (activeScreen === 'admin_schedule') {
        return <TimetableWorkspace isReadOnlyMode={false} />;
      }
      return <AdminPortalView />;
    }

    return null;
  };

  return (
    <div className="min-h-screen flex bg-[#090e1c] text-slate-100 font-[Inter,sans-serif]">
      {/* Collapsible Sidebar with Open/Close submodules */}
      <Sidebar
        currentRole={currentRole}
        activeScreen={activeScreen}
        onNavigate={(screenId) => {
          setActiveScreen(screenId);
        }}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        <Header
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onQuickAction={(action) => setActiveScreen(action)}
        />

        {/* Breadcrumbs Path Bar (Dòng chỉ dẫn đường dẫn giống Hình 4 dưới dòng Năm học) */}
        <BreadcrumbsBar
          currentRole={currentRole}
          activeScreen={activeScreen}
          onNavigate={(screen) => setActiveScreen(screen)}
          selectedClassName={currentSelectedClass?.name}
        />

        <main className="flex-1 p-3 sm:p-4 md:p-5 max-w-7xl w-full mx-auto min-w-0 overflow-x-hidden">
          {renderCurrentScreen()}
        </main>
      </div>

      {/* Gmail Login Modal (Hiện khi bắt đầu chương trình hoặc khi đổi tài khoản) */}
      <LoginModal />
    </div>
  );
};
