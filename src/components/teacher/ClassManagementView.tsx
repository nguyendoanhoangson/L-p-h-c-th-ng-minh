import React, { useState } from 'react';
import {
  School,
  Plus,
  Search,
  Filter,
  Sparkles,
  BookOpen,
  ArrowRight,
  RefreshCw,
  FolderPlus,
  Trash2,
  AlertTriangle,
  X,
  FileSpreadsheet,
} from 'lucide-react';
import { Classroom } from '../../types';
import { GRADE_LEVELS } from '../../data/mockData';
import { storageService } from '../../services/storageService';
import { ClassCardCompact } from './ClassCardCompact';
import { ClassModal } from './ClassModal';
import { ClassImportModal } from './ClassImportModal';
import { useNotification } from '../../contexts/NotificationContext';

interface ClassManagementViewProps {
  onSelectClassWorkspace: (classroom: Classroom) => void;
}

export const ClassManagementView: React.FC<ClassManagementViewProps> = ({
  onSelectClassWorkspace,
}) => {
  const { success, warning } = useNotification();
  const [classes, setClasses] = useState<Classroom[]>(storageService.getClasses());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<number | 'ALL'>('ALL');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<Classroom | null>(null);
  const [deletingClass, setDeletingClass] = useState<Classroom | null>(null);

  const refreshClasses = () => {
    setClasses(storageService.getClasses());
  };

  const filteredClasses = classes.filter((cls) => {
    const matchesSearch =
      cls.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (cls.room && cls.room.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesGrade = selectedGrade === 'ALL' || cls.gradeLevel === selectedGrade;
    return matchesSearch && matchesGrade;
  });

  const handleOpenEdit = (cls: Classroom) => {
    setEditingClass(cls);
    setIsModalOpen(true);
  };

  const handleOpenCreateModal = () => {
    setEditingClass(null);
    setIsModalOpen(true);
  };

  const handleDeleteClass = (cls: Classroom) => {
    setDeletingClass(cls);
  };

  const handleConfirmDeleteClass = () => {
    if (!deletingClass) return;
    const res = storageService.deleteClass(deletingClass.id, true);
    if (res.success) {
      success(res.message);
      setDeletingClass(null);
      refreshClasses();
    } else {
      warning(res.message);
    }
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Page Header (Bright, Vivid, Compact) */}
      <div className="bg-[#0b1326] rounded-2xl border border-slate-700/90 p-3.5 sm:p-4 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-2 truncate">
            <School className="w-5 h-5 text-blue-400 flex-shrink-0" />
            <span className="truncate">Quản Lý Lớp Học</span>
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-300 font-medium mt-0.5 truncate">
            Không gian điều hành lớp học dành cho giáo viên và cố vấn học tập
          </p>
        </div>

        {/* Classes Count Badge & Action Buttons (Thêm mới lớp & Import lớp học) */}
        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          <div className="px-2.5 py-1 text-xs font-black rounded-xl bg-blue-600/20 text-blue-300 border border-blue-500/30 whitespace-nowrap">
            Lớp của tôi ({classes.length})
          </div>

          <button
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-black rounded-xl text-cyan-200 bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/50 transition-all cursor-pointer shadow-md shadow-cyan-950/40 whitespace-nowrap"
            title="Import danh sách lớp học từ Excel, CSV hoặc văn bản"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-cyan-400" />
            <span>Import lớp học</span>
          </button>

          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-black rounded-xl text-white bg-blue-600 hover:bg-blue-500 transition-all cursor-pointer shadow-md shadow-blue-600/40 whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm mới lớp</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-[#0b1326] rounded-2xl border border-slate-700/90 p-4 shadow-lg space-y-3">
        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-700">
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-blue-300 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm theo tên lớp, phòng học..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#0e172e] border border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none text-white font-semibold placeholder:text-slate-300"
              />
            </div>

            {/* 12 Grade selector filter */}
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
          </div>

          <div className="text-xs text-slate-200 font-semibold flex items-center gap-2 self-end sm:self-auto">
            <span>Hiển thị: <strong className="text-white font-black">{filteredClasses.length}</strong> lớp</span>
            <button
              onClick={refreshClasses}
              className="p-1 text-blue-300 hover:text-white rounded-lg hover:bg-[#152349] transition-colors"
              title="Tải lại danh sách"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Compact Classes List */}
        {filteredClasses.length === 0 ? (
          <div className="py-12 text-center text-slate-300 space-y-3">
            <School className="w-10 h-10 mx-auto text-blue-400" />
            <div className="text-base font-bold text-white">Chưa tìm thấy lớp học phù hợp</div>
            <p className="text-xs text-slate-300">Hãy thử tìm với từ khóa khác hoặc chọn khối học khác.</p>
            <button
              onClick={handleOpenCreateModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tạo lớp đầu tiên</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {filteredClasses.map((classroom) => (
              <ClassCardCompact
                key={classroom.id}
                classroom={classroom}
                onSelect={(cls) => onSelectClassWorkspace(cls)}
                onEdit={(cls) => handleOpenEdit(cls)}
                onDelete={(cls) => handleDeleteClass(cls)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Class Modal */}
      <ClassModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialClass={editingClass}
        onSaved={refreshClasses}
      />

      {/* Class Import Modal */}
      <ClassImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImported={refreshClasses}
      />

      {/* Delete Class Confirmation Modal */}
      {deletingClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in">
          <div className="bg-[#0c152d] border border-rose-500/60 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400 mb-4">
              <div className="p-3 bg-rose-950/60 rounded-xl border border-rose-600/50">
                <AlertTriangle className="w-6 h-6 text-rose-400" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Xác nhận xóa lớp học</h3>
                <p className="text-xs text-rose-300 font-medium">Hành động này sẽ xóa lớp khỏi hệ thống</p>
              </div>
            </div>

            <p className="text-sm text-slate-200 mb-6 leading-relaxed">
              Bạn có chắc chắn muốn xóa lớp học <strong className="text-white text-base">"{deletingClass.name}"</strong> ({deletingClass.room || 'Phòng học'})?
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeletingClass(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteClass}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-black rounded-xl shadow-lg shadow-rose-600/40 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4 text-white" />
                <span>Xác nhận xóa</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
