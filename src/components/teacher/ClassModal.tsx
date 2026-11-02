import React, { useState, useEffect } from 'react';
import { X, Save, Layers, BookOpen, Users, MapPin } from 'lucide-react';
import { Classroom } from '../../types';
import { GRADE_LEVELS } from '../../data/mockData';
import { storageService } from '../../services/storageService';
import { useNotification } from '../../contexts/NotificationContext';

interface ClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  initialClass?: Classroom | null;
}

export const ClassModal: React.FC<ClassModalProps> = ({
  isOpen,
  onClose,
  onSaved,
  initialClass,
}) => {
  const { success, error } = useNotification();

  const [name, setName] = useState('');
  const [gradeLevel, setGradeLevel] = useState<number>(10);
  const [academicYear, setAcademicYear] = useState('2024 - 2025');
  const [room, setRoom] = useState('');
  const [teacherName, setTeacherName] = useState('Thầy Nguyễn Văn Hùng');
  const [subject, setSubject] = useState('Toán học');
  const [maxStudents, setMaxStudents] = useState<number>(40);
  const [colorTheme, setColorTheme] = useState('#2563EB');
  const [description, setDescription] = useState('');

  // Critical fix: Keep old class name when editing
  useEffect(() => {
    const currentYear = storageService.getAcademicYear();
    if (initialClass) {
      setName(initialClass.name || '');
      setGradeLevel(initialClass.gradeLevel || 10);
      setAcademicYear(initialClass.academicYear || currentYear);
      setRoom(initialClass.room || '');
      setTeacherName(initialClass.teacherName || 'Thầy Nguyễn Văn Hùng');
      setSubject(initialClass.subject || 'Toán học');
      setMaxStudents(initialClass.maxStudents || 40);
      setColorTheme(initialClass.colorTheme || '#2563EB');
      setDescription(initialClass.description || '');
    } else {
      setName('');
      setGradeLevel(10);
      setAcademicYear(currentYear);
      setRoom('Phòng A.201');
      setTeacherName('Thầy Nguyễn Văn Hùng');
      setSubject('Toán học');
      setMaxStudents(40);
      setColorTheme('#2563EB');
      setDescription('');
    }
  }, [initialClass, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      error('Vui lòng nhập tên lớp học!');
      return;
    }

    const payload: Classroom = {
      id: initialClass ? initialClass.id : `cls-${Date.now()}`,
      name: name.trim(),
      gradeLevel,
      academicYear,
      room: room.trim() || 'Phòng học đa năng',
      teacherId: initialClass?.teacherId || 'usr-teacher-1',
      teacherName: teacherName.trim(),
      studentCount: initialClass?.studentCount || 0,
      maxStudents,
      subject: subject.trim(),
      colorTheme,
      joinCode: initialClass?.joinCode || `CLS${Math.floor(100 + Math.random() * 900)}`,
      status: initialClass?.status || 'ACTIVE',
      description: description.trim(),
    };

    storageService.saveClass(payload);
    success(
      initialClass
        ? `Đã cập nhật lớp học "${payload.name}" thành công!`
        : `Đã tạo mới lớp học "${payload.name}" thành công!`
    );
    onSaved();
    onClose();
  };

  const THEME_COLORS = [
    { name: 'Xanh dương', color: '#2563EB' },
    { name: 'Tím hoa cà', color: '#7C3AED' },
    { name: 'Xanh lục ngọc', color: '#0D9488' },
    { name: 'Cam đất', color: '#EA580C' },
    { name: 'Đỏ mận', color: '#E11D48' },
    { name: 'Xanh chàm', color: '#4F46E5' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-[#0c1429] rounded-2xl max-w-lg w-full shadow-2xl border border-slate-600 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-700 flex items-center justify-between bg-[#080d1b]">
          <div>
            <h2 className="text-lg font-black text-white">
              {initialClass ? 'Chỉnh Sửa Lớp Học' : 'Thêm Lớp Học Mới'}
            </h2>
            <p className="text-xs text-slate-200 font-medium">
              {initialClass ? `Đang chỉnh sửa lớp: ${initialClass.name}` : 'Tạo lớp và phân bổ học sinh'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          <div>
            <label className="block text-xs font-black text-white mb-1">
              Tên lớp học <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-[#080e1e] border border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none font-bold text-white placeholder:text-slate-400"
              placeholder="VD: 10A1 - Chuyên Toán"
            />
            {initialClass && (
              <span className="text-xs text-blue-300 font-bold mt-1.5 block">
                ✓ Đã giữ lại tên lớp cũ để chỉnh sửa: <strong className="text-white underline">{initialClass.name}</strong>
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-white mb-1">
                Khối học (1 đến 12) <span className="text-rose-400">*</span>
              </label>
              <select
                value={gradeLevel}
                onChange={(e) => setGradeLevel(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm bg-[#080e1e] border border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none text-white font-bold cursor-pointer"
              >
                {GRADE_LEVELS.map((g) => (
                  <option key={g.level} value={g.level} className="bg-[#0c1429] text-white">
                    {g.name} ({g.description})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-black text-white mb-1">
                Niên khóa / Năm học
              </label>
              <input
                type="text"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-[#080e1e] border border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none text-white font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-white mb-1">
                Phòng học
              </label>
              <input
                type="text"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-[#080e1e] border border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none text-white font-bold"
                placeholder="VD: Phòng A.204"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-white mb-1">
                Sĩ số tối đa
              </label>
              <input
                type="number"
                min="1"
                max="80"
                value={maxStudents}
                onChange={(e) => setMaxStudents(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm bg-[#080e1e] border border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none text-white font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-white mb-1">
              Môn học phụ trách / Bộ môn
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-[#080e1e] border border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none text-white font-bold"
              placeholder="VD: Toán học, Tin học, Ngữ văn..."
            />
          </div>

          {/* Theme Color */}
          <div>
            <label className="block text-xs font-black text-white mb-1.5">
              Màu đại diện lớp
            </label>
            <div className="flex items-center gap-2">
              {THEME_COLORS.map((th) => (
                <button
                  type="button"
                  key={th.color}
                  onClick={() => setColorTheme(th.color)}
                  className={`w-7 h-7 rounded-full transition-transform cursor-pointer border-2 ${
                    colorTheme === th.color ? 'scale-115 border-white ring-2 ring-blue-400' : 'border-transparent hover:scale-105'
                  }`}
                  style={{ backgroundColor: th.color }}
                  title={th.name}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-white mb-1">
              Mô tả ngắn về lớp học
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-[#080e1e] border border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none resize-none text-white font-medium placeholder:text-slate-400"
              placeholder="Ghi chú về mục tiêu, chương trình học..."
            />
          </div>

          {/* Buttons */}
          <div className="pt-3 border-t border-slate-700 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-200 hover:text-white hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-black text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-lg transition-colors cursor-pointer shadow-blue-600/40"
            >
              <Save className="w-4 h-4" />
              <span>{initialClass ? 'Lưu cập nhật' : 'Tạo lớp'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
