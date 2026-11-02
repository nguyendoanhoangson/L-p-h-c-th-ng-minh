import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  FileSpreadsheet,
  Search,
  Filter,
  Edit2,
  Trash2,
  Phone,
  Home,
  UserCheck,
  ShieldAlert,
  Download,
  RefreshCw,
  Mail,
  GraduationCap,
  Copy,
  Check,
} from 'lucide-react';
import { Student, Classroom } from '../../types';
import { GRADE_LEVELS } from '../../data/mockData';
import { storageService } from '../../services/storageService';
import { StudentModal } from './StudentModal';
import { StudentImportModal } from './StudentImportModal';
import { StudentDeleteGuardModal } from './StudentDeleteGuardModal';
import { useNotification } from '../../contexts/NotificationContext';

interface StudentManagementViewProps {
  initialTab?: 'students' | 'parents';
  preselectedClassId?: string;
}

export const StudentManagementView: React.FC<StudentManagementViewProps> = ({
  initialTab = 'students',
  preselectedClassId,
}) => {
  const { success, error } = useNotification();
  const [activeTab, setActiveTab] = useState<'students' | 'parents'>(initialTab);

  const [students, setStudents] = useState<Student[]>(storageService.getStudents());
  const [classes, setClasses] = useState<Classroom[]>(storageService.getClasses());

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<number | 'ALL'>('ALL');
  const [selectedClassId, setSelectedClassId] = useState<string>(preselectedClassId || 'ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Delete guard modal
  const [deleteCandidate, setDeleteCandidate] = useState<Student | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopyCode = (code: string, label = 'mã') => {
    try {
      navigator.clipboard.writeText(code);
      setCopiedCode(code);
      success(`Đã sao chép ${label}: ${code}`);
      setTimeout(() => {
        setCopiedCode((prev) => (prev === code ? null : prev));
      }, 2000);
    } catch {
      success(`Đã sao chép ${label}: ${code}`);
    }
  };

  const refreshData = () => {
    setStudents(storageService.getStudents());
    setClasses(storageService.getClasses());
  };

  const filteredStudents = students.filter((s) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      s.fullName.toLowerCase().includes(q) ||
      s.studentCode.toLowerCase().includes(q) ||
      (s.parent?.fatherOrMotherName && s.parent.fatherOrMotherName.toLowerCase().includes(q)) ||
      (s.parent?.phone && s.parent.phone.includes(q));

    const matchesGrade = selectedGrade === 'ALL' || s.gradeLevel === selectedGrade;
    const matchesClass = selectedClassId === 'ALL' || s.classId === selectedClassId;
    const matchesStatus = selectedStatus === 'ALL' || s.status === selectedStatus;

    return matchesSearch && matchesGrade && matchesClass && matchesStatus;
  });

  const handleEditClick = (student: Student) => {
    setEditingStudent(student);
    setIsAddModalOpen(true);
  };

  const handleDeleteClick = (student: Student) => {
    setDeleteCandidate(student);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = (student: Student) => {
    const result = storageService.deleteStudent(student.id);
    if (result.success) {
      success(result.message);
      setIsDeleteModalOpen(false);
      setDeleteCandidate(null);
      refreshData();
    } else {
      error(result.message);
    }
  };

  const handleExportCSV = () => {
    const header = 'STT,Mã Học Sinh,Họ Và Tên,Ngày Sinh,Giới Tính,Lớp,Khối,Họ Tên Phụ Huynh,Số Điện Thoại,Địa Chỉ Thường Trú,Trạng Thái\n';
    const rows = filteredStudents
      .map(
        (s, idx) =>
          `${idx + 1},"${s.studentCode}","${s.fullName}","${s.dob}","${s.gender}","${s.className}",${s.gradeLevel},"${s.parent.fatherOrMotherName}","${s.parent.phone}","${s.parent.permanentAddress}","${s.status}"`
      )
      .join('\n');

    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `danh_sach_hoc_sinh_lop_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    success(`Đã xuất file dữ liệu ${filteredStudents.length} học sinh thành công`);
  };

  return (
    <div className="space-y-4">
      {/* Top Header (Bright Text) */}
      <div className="bg-[#0b1326] rounded-2xl border border-slate-700/90 p-4 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-400" />
            <span>Hồ Sơ Học Sinh & Phụ Huynh</span>
          </h1>
          <p className="text-xs text-slate-200 font-medium mt-0.5">
            Quản trị thông tin 360°, kết nối phụ huynh và quản lý dữ liệu học tập 12 khối
          </p>
        </div>

        {/* Both Adding Methods: "Thêm từng học sinh" & "Import Excel" */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setIsImportModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-black text-emerald-200 bg-emerald-950 border border-emerald-500 hover:bg-emerald-900 rounded-xl shadow-md transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
            <span>Import Excel / CSV</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setEditingStudent(null);
              setIsAddModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-black text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-md transition-colors cursor-pointer shadow-blue-600/40"
          >
            <UserPlus className="w-4 h-4" />
            <span>Thêm từng học sinh</span>
          </button>
        </div>
      </div>

      {/* 2 Tabs: "Danh sách học sinh" and "Thông tin phụ huynh" */}
      <div className="bg-[#0b1326] rounded-2xl border border-slate-700/90 shadow-lg overflow-hidden">
        <div className="px-4 pt-3 border-b border-slate-700 flex items-center justify-between bg-[#080d1e] flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('students')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-black border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'students'
                  ? 'border-blue-400 text-blue-300 bg-[#0e1732] rounded-t-lg'
                  : 'border-transparent text-slate-200 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4 text-blue-300 flex-shrink-0" />
              <span className="whitespace-nowrap">Danh Sách Học Sinh & Phụ Huynh ({filteredStudents.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('parents')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-black border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'parents'
                  ? 'border-blue-400 text-blue-300 bg-[#0e1732] rounded-t-lg'
                  : 'border-transparent text-slate-200 hover:text-white'
              }`}
            >
              <Phone className="w-4 h-4 text-emerald-300 flex-shrink-0" />
              <span className="whitespace-nowrap">Thông Tin Phụ Huynh ({filteredStudents.length})</span>
            </button>
          </div>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white hover:bg-[#152349] border border-slate-600 rounded-lg transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-blue-300" />
            <span>Xuất file Excel</span>
          </button>
        </div>

        {/* Filter Controls */}
        <div className="p-4 border-b border-slate-700/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-[#0b1326]">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-blue-300 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên, mã HS, SĐT phụ huynh..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#0e172e] border border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none text-white font-semibold placeholder:text-slate-300"
            />
          </div>

          {/* 12 Grades Filter */}
          <select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
            className="px-3 py-1.5 text-xs border border-slate-600 rounded-xl bg-[#0e172e] text-white focus:ring-2 focus:ring-blue-400 outline-none font-bold cursor-pointer"
          >
            <option value="ALL">Tất cả 12 khối</option>
            {GRADE_LEVELS.map((g) => (
              <option key={g.level} value={g.level} className="bg-[#0b1326] text-white">
                {g.name}
              </option>
            ))}
          </select>

          {/* Class Filter */}
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="px-3 py-1.5 text-xs border border-slate-600 rounded-xl bg-[#0e172e] text-white focus:ring-2 focus:ring-blue-400 outline-none font-bold cursor-pointer"
          >
            <option value="ALL">Tất cả lớp học</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id} className="bg-[#0b1326] text-white">
                {c.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-1.5 text-xs border border-slate-600 rounded-xl bg-[#0e172e] text-white focus:ring-2 focus:ring-blue-400 outline-none font-bold cursor-pointer"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="STUDYING">Đang theo học</option>
            <option value="TRANSFERRED">Chuyển trường</option>
            <option value="DROPPED">Thôi học / Nghỉ</option>
          </select>
        </div>

        {/* Tab 1: Danh Sách Học Sinh (Table with Bright Text) */}
        {activeTab === 'students' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0e1732] text-white font-black border-b border-slate-700 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-3 w-12 text-center">STT</th>
                  <th className="py-3.5 px-3">Mã HS</th>
                  <th className="py-3.5 px-3">Họ và Tên</th>
                  <th className="py-3.5 px-3">Ngày sinh</th>
                  <th className="py-3.5 px-3">Giới tính</th>
                  <th className="py-3.5 px-3">Lớp học</th>
                  <th className="py-3.5 px-3">Trạng thái</th>
                  <th className="py-3.5 px-3 text-center w-28">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/80">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-300 font-semibold">
                      Không tìm thấy học sinh nào phù hợp bộ lọc
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((st, idx) => (
                    <tr key={st.id} className="hover:bg-[#14224a] transition-colors">
                      <td className="py-3 px-3 text-center text-slate-200 font-extrabold">{idx + 1}</td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5 font-mono font-black text-blue-300">
                          <span>{st.studentCode}</span>
                          <button
                            type="button"
                            onClick={() => handleCopyCode(st.studentCode, 'mã học sinh')}
                            className="p-1 hover:bg-[#1a2d60] text-slate-300 hover:text-white rounded transition-colors cursor-pointer"
                            title="Sao chép mã học sinh"
                          >
                            {copiedCode === st.studentCode ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5 text-blue-300 hover:text-white" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          {st.avatar ? (
                            <img src={st.avatar} alt={st.fullName} className="w-8 h-8 rounded-full object-cover ring-2 ring-blue-500" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-xs shadow-xs">
                              {st.fullName.charAt(0)}
                            </div>
                          )}
                          <span className="font-black text-white text-[13px]">{st.fullName}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-slate-100 font-semibold">{st.dob}</td>
                      <td className="py-3 px-3 text-slate-100 font-semibold">{st.gender}</td>
                      <td className="py-3 px-3">
                        <span className="font-extrabold text-white">{st.className || 'Chưa gán'}</span>
                        <span className="text-[11px] text-blue-300 font-bold block">Khối {st.gradeLevel}</span>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-md text-xs font-black shadow-xs ${
                            st.status === 'STUDYING'
                              ? 'bg-emerald-950 text-emerald-200 border border-emerald-500'
                              : st.status === 'TRANSFERRED'
                              ? 'bg-amber-950 text-amber-200 border border-amber-500'
                              : 'bg-slate-800 text-slate-200 border border-slate-600'
                          }`}
                        >
                          {st.status === 'STUDYING' ? 'Đang học' : st.status === 'TRANSFERRED' ? 'Chuyển trường' : 'Thôi học'}
                        </span>
                      </td>

                      {/* THAO TÁC: Edit & Delete Icons */}
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEditClick(st)}
                            className="p-1.5 text-blue-300 hover:text-white hover:bg-blue-600 rounded-lg transition-colors cursor-pointer border border-slate-600"
                            title="Chỉnh sửa thông tin học sinh & phụ huynh"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDeleteClick(st)}
                            className="p-1.5 text-rose-300 hover:text-white hover:bg-rose-600 rounded-lg transition-colors cursor-pointer border border-slate-600"
                            title="Xóa học sinh (ràng buộc nghiệp vụ nghiêm ngặt)"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Thông Tin Phụ Huynh (Table with Bright Text) */}
        {activeTab === 'parents' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0e1732] text-white font-black border-b border-slate-700 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-3 w-12 text-center">STT</th>
                  <th className="py-3.5 px-3">Học sinh</th>
                  <th className="py-3.5 px-3">Lớp</th>
                  <th className="py-3.5 px-3">Họ tên Phụ huynh (Bố/Mẹ)</th>
                  <th className="py-3.5 px-3">Quan hệ</th>
                  <th className="py-3.5 px-3">Số điện thoại</th>
                  <th className="py-3.5 px-3">Email liên hệ</th>
                  <th className="py-3.5 px-3">Địa chỉ thường trú</th>
                  <th className="py-3.5 px-3 text-center w-20">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/80">
                {filteredStudents.map((st, idx) => (
                  <tr key={st.id} className="hover:bg-[#14224a] transition-colors">
                    <td className="py-3 px-3 text-center text-slate-200 font-extrabold">{idx + 1}</td>
                    <td className="py-3 px-3">
                      <div className="font-black text-white text-[13px]">{st.fullName}</div>
                      <div className="flex items-center gap-1 text-[11px] text-blue-300 font-bold font-mono">
                        <span>{st.studentCode}</span>
                        <button
                          type="button"
                          onClick={() => handleCopyCode(st.studentCode, 'mã học sinh')}
                          className="p-0.5 hover:bg-[#1a2d60] text-slate-400 hover:text-white rounded transition-colors cursor-pointer"
                          title="Sao chép mã học sinh"
                        >
                          {copiedCode === st.studentCode ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3 text-blue-300 hover:text-white" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-extrabold text-slate-100">{st.className}</td>
                    <td className="py-3 px-3 font-black text-blue-200 text-xs">
                      {st.parent?.fatherOrMotherName || 'Chưa cập nhật'}
                    </td>
                    <td className="py-3 px-3 text-slate-200 font-bold">
                      {st.parent?.relationship || 'Bố/Mẹ'}
                    </td>
                    <td className="py-3 px-3">
                      <a
                        href={`tel:${st.parent?.phone}`}
                        className="inline-flex items-center gap-1 font-black text-emerald-300 hover:text-emerald-200 hover:underline text-xs"
                      >
                        <Phone className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{st.parent?.phone}</span>
                      </a>
                    </td>
                    <td className="py-3 px-3 text-slate-200 font-medium">
                      {st.parent?.email ? (
                        <span className="text-slate-100 font-semibold">{st.parent.email}</span>
                      ) : (
                        <span className="text-slate-400 italic">Chưa có email</span>
                      )}
                    </td>
                    <td className="py-3 px-3 max-w-sm text-slate-100 font-medium leading-snug">
                      <div className="flex items-start gap-1.5">
                        <Home className="w-4 h-4 text-blue-300 flex-shrink-0 mt-0.5" />
                        <span className="break-words font-semibold text-slate-100">{st.parent?.permanentAddress || 'Chưa có địa chỉ'}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => handleEditClick(st)}
                        className="p-1.5 text-blue-300 hover:text-white hover:bg-blue-600 rounded-lg transition-colors cursor-pointer border border-slate-600"
                        title="Chỉnh sửa thông tin phụ huynh"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Student Modal */}
      <StudentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        initialStudent={editingStudent}
        defaultClassId={selectedClassId !== 'ALL' ? selectedClassId : undefined}
        onSaved={refreshData}
      />

      {/* Excel / CSV Import Modal */}
      <StudentImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImported={refreshData}
      />

      {/* Delete Guard Modal */}
      <StudentDeleteGuardModal
        student={deleteCandidate}
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeleteCandidate(null);
        }}
        onConfirmDelete={handleConfirmDelete}
        onOpenEdit={(st) => {
          setIsDeleteModalOpen(false);
          handleEditClick(st);
        }}
      />
    </div>
  );
};
