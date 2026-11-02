import React, { useState } from 'react';
import {
  ArrowLeft,
  School,
  Users,
  CheckSquare,
  BookOpen,
  BarChart3,
  Award,
  Calendar,
  FileText,
  UserPlus,
  Plus,
  Clock,
  Sparkles,
  Copy,
  Check,
  KeyRound,
} from 'lucide-react';
import { Classroom, Student } from '../../types';
import { storageService } from '../../services/storageService';
import { AttendanceWorkspace } from './AttendanceWorkspace';
import { StudentManagementView } from './StudentManagementView';
import { ClassroomTools } from './ClassroomTools';
import { TimetableWorkspace } from './TimetableWorkspace';
import { useNotification } from '../../contexts/NotificationContext';

interface ClassWorkspaceProps {
  classroom: Classroom;
  onBack: () => void;
}

export const ClassWorkspace: React.FC<ClassWorkspaceProps> = ({ classroom, onBack }) => {
  const { success } = useNotification();
  const [copiedCode, setCopiedCode] = useState(false);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'students' | 'attendance' | 'assignments' | 'grades' | 'tools' | 'schedule'
  >('overview');

  const students = storageService.getStudents().filter((s) => s.classId === classroom.id);
  const assignments = storageService.getAssignments().filter((a) => a.classId === classroom.id);
  const grades = storageService.getGrades(classroom.id);

  const handleCopyCode = () => {
    if (!classroom.joinCode) return;
    try {
      navigator.clipboard.writeText(classroom.joinCode);
      setCopiedCode(true);
      success(`Đã sao chép mã lớp: ${classroom.joinCode}`);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      success(`Đã sao chép mã lớp: ${classroom.joinCode}`);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Banner & Navigation (Bright Typography) */}
      <div className="bg-[#0b1326] rounded-2xl border border-slate-700/90 p-4 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 text-blue-300 hover:text-white hover:bg-[#16254e] rounded-xl transition-colors cursor-pointer border border-slate-700"
              title="Quay lại danh sách lớp"
            >
              <ArrowLeft className="w-5 h-5 text-blue-300" />
            </button>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-black text-white tracking-tight">{classroom.name}</h1>
                <span className="text-xs font-black px-2.5 py-0.5 rounded-md bg-[#182a5a] text-blue-200 border border-blue-400">
                  Khối {classroom.gradeLevel}
                </span>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#0e172e] border border-cyan-500/40 text-xs font-mono text-cyan-200">
                  <KeyRound className="w-3.5 h-3.5 text-amber-300" />
                  <span>Mã lớp: <strong className="text-white">{classroom.joinCode}</strong></span>
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="p-1 hover:bg-[#1a2d60] text-blue-300 hover:text-white rounded transition-colors cursor-pointer"
                    title="Sao chép mã lớp"
                  >
                    {copiedCode ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3 text-cyan-300 hover:text-white" />
                    )}
                  </button>
                </div>
              </div>
              <p className="text-xs text-slate-200 font-medium mt-0.5">
                Phòng: <strong className="text-white font-bold">{classroom.room}</strong> · Niên khóa: <strong className="text-white font-bold">{classroom.academicYear}</strong> · Sĩ số: <strong className="text-blue-300 font-extrabold">{students.length}</strong> học sinh
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('attendance')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black rounded-xl shadow-md transition-colors cursor-pointer shadow-blue-600/40"
            >
              Điểm danh nhanh
            </button>
          </div>
        </div>

        {/* Workspace Tabs (Bright & Bold) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-3 scrollbar-none">
          {[
            { id: 'overview', label: 'Tổng quan', icon: School },
            { id: 'schedule', label: 'Thời khóa biểu', icon: Calendar },
            { id: 'students', label: 'Học sinh', icon: Users, badge: students.length },
            { id: 'attendance', label: 'Điểm danh', icon: CheckSquare },
            { id: 'assignments', label: 'Bài tập', icon: BookOpen, badge: assignments.length },
            { id: 'grades', label: 'Sổ điểm', icon: BarChart3 },
            { id: 'tools', label: 'Công cụ chiếu', icon: Sparkles },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/40 ring-1 ring-blue-300'
                    : 'text-slate-200 hover:text-white hover:bg-[#16254e]'
                }`}
              >
                <Icon className="w-4 h-4 text-blue-300" />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span className={`text-[11px] px-1.5 py-0.2 rounded-full font-black ${
                    isActive ? 'bg-white text-blue-900' : 'bg-[#182958] text-blue-200 border border-blue-400/40'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="bg-[#0b1326] rounded-2xl p-4.5 border border-slate-700/90 shadow-lg">
              <div className="text-xs font-black text-slate-200 uppercase tracking-wide">Sĩ số hiện tại</div>
              <div className="text-3xl font-black text-white mt-1.5">{students.length} / {classroom.maxStudents}</div>
              <div className="text-xs text-emerald-300 font-bold mt-1">✓ Đã đủ hồ sơ học tập</div>
            </div>

            <div className="bg-[#0b1326] rounded-2xl p-4.5 border border-slate-700/90 shadow-lg">
              <div className="text-xs font-black text-slate-200 uppercase tracking-wide">Bài tập đang mở</div>
              <div className="text-3xl font-black text-blue-300 mt-1.5">{assignments.length} bài</div>
              <div className="text-xs text-blue-200 font-bold mt-1">Hạn nộp tuần này</div>
            </div>

            <div className="bg-[#0b1326] rounded-2xl p-4.5 border border-slate-700/90 shadow-lg">
              <div className="text-xs font-black text-slate-200 uppercase tracking-wide">Điểm trung bình lớp</div>
              <div className="text-3xl font-black text-purple-300 mt-1.5">8.5 / 10</div>
              <div className="text-xs text-purple-200 font-bold mt-1">Xếp loại: Khá - Giỏi</div>
            </div>
          </div>

          <div className="bg-[#0b1326] rounded-2xl p-5 border border-slate-700/90 shadow-lg space-y-3">
            <h3 className="font-black text-base text-white">Danh sách nhanh học sinh trong lớp {classroom.name}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {students.map((st) => (
                <div key={st.id} className="p-3 rounded-xl border border-slate-700 bg-[#0e1732] flex items-center justify-between text-xs hover:border-blue-400 transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-blue-300">{st.studentCode}</span>
                    <span className="font-black text-white text-[13px]">{st.fullName}</span>
                  </div>
                  <span className="text-slate-200 text-xs font-semibold">PH: <strong className="text-white">{st.parent.fatherOrMotherName}</strong></span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Students */}
      {activeTab === 'students' && (
        <StudentManagementView preselectedClassId={classroom.id} />
      )}

      {/* Tab: Attendance */}
      {activeTab === 'attendance' && (
        <AttendanceWorkspace initialClassId={classroom.id} />
      )}

      {/* Tab: Assignments */}
      {activeTab === 'assignments' && (
        <div className="bg-[#0b1326] rounded-2xl p-6 border border-slate-700/90 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-base text-white">Bài Tập Của Lớp {classroom.name}</h3>
          </div>
          <div className="space-y-3">
            {assignments.map((asg) => (
              <div key={asg.id} className="p-4 rounded-xl border border-slate-700 bg-[#0e1732] hover:border-blue-400 transition-colors">
                <div className="font-black text-white text-sm">{asg.title}</div>
                <div className="text-xs text-slate-100 font-medium mt-1">{asg.description}</div>
                <div className="text-xs text-slate-200 font-bold mt-2.5 flex items-center gap-4">
                  <span>Hạn nộp: <strong className="text-white">{asg.dueDate}</strong></span>
                  <span>Đã nộp: <strong className="text-blue-300">{asg.submittedCount}/{asg.totalStudents}</strong></span>
                  <span className="font-black text-emerald-300">Thang điểm: {asg.maxScore}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Grades */}
      {activeTab === 'grades' && (
        <div className="bg-[#0b1326] rounded-2xl p-6 border border-slate-700/90 shadow-lg space-y-4">
          <h3 className="font-black text-base text-white">Sổ Điểm Điện Tử - {classroom.name}</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#0e1732] text-white font-black border-b border-slate-700">
                <tr>
                  <th className="p-3">Học sinh</th>
                  <th className="p-3 text-center">Miệng</th>
                  <th className="p-3 text-center">15 Phút</th>
                  <th className="p-3 text-center">1 Tiết</th>
                  <th className="p-3 text-center">Giữa kỳ</th>
                  <th className="p-3 text-center">Cuối kỳ</th>
                  <th className="p-3 text-center font-black text-blue-300">ĐTB</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/80 bg-[#0b1326]">
                {grades.map((gr) => (
                  <tr key={gr.id} className="hover:bg-[#14224a]">
                    <td className="p-3 font-black text-white text-sm">{gr.studentName}</td>
                    <td className="p-3 text-center text-slate-100 font-bold">{gr.oralScore || '-'}</td>
                    <td className="p-3 text-center text-slate-100 font-bold">{gr.test15m || '-'}</td>
                    <td className="p-3 text-center text-slate-100 font-bold">{gr.test45m || '-'}</td>
                    <td className="p-3 text-center text-slate-100 font-bold">{gr.midTerm || '-'}</td>
                    <td className="p-3 text-center text-slate-100 font-bold">{gr.finalTerm || '-'}</td>
                    <td className="p-3 text-center font-black text-blue-300 text-sm">{gr.averageScore || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Tools */}
      {activeTab === 'tools' && (
        <ClassroomTools initialClassId={classroom.id} />
      )}

      {/* Tab: Schedule */}
      {activeTab === 'schedule' && (
        <TimetableWorkspace initialClassId={classroom.id} />
      )}
    </div>
  );
};
