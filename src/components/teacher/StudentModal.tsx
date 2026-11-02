import React, { useState, useEffect } from 'react';
import { X, User, Users, ArrowRight, Save, ShieldCheck } from 'lucide-react';
import { Student, Classroom } from '../../types';
import { GRADE_LEVELS } from '../../data/mockData';
import { storageService } from '../../services/storageService';
import { useNotification } from '../../contexts/NotificationContext';

interface StudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  initialStudent?: Student | null;
  defaultClassId?: string;
}

export const StudentModal: React.FC<StudentModalProps> = ({
  isOpen,
  onClose,
  onSaved,
  initialStudent,
  defaultClassId,
}) => {
  const { success, error } = useNotification();
  const [activeTab, setActiveTab] = useState<'student' | 'parent'>('student');
  const [classes, setClasses] = useState<Classroom[]>([]);

  // Tab 1: Student info
  const [studentCode, setStudentCode] = useState('');
  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('2008-01-01');
  const [gender, setGender] = useState<'Nam' | 'Nữ'>('Nam');
  const [classId, setClassId] = useState('');
  const [gradeLevel, setGradeLevel] = useState<number>(10);
  const [rollNumber, setRollNumber] = useState<number>(1);
  const [teamNumber, setTeamNumber] = useState<number>(1);
  const [status, setStatus] = useState<Student['status']>('STUDYING');
  const [avatar, setAvatar] = useState('');
  const [notes, setNotes] = useState('');

  // Tab 2: Parent info
  const [fatherOrMotherName, setFatherOrMotherName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [relationship, setRelationship] = useState<'Bố' | 'Mẹ' | 'Người giám hộ'>('Bố');
  const [permanentAddress, setPermanentAddress] = useState('');
  const [parentNote, setParentNote] = useState('');

  useEffect(() => {
    const cls = storageService.getClasses();
    setClasses(cls);

    if (initialStudent) {
      setStudentCode(initialStudent.studentCode);
      setFullName(initialStudent.fullName);
      setDob(initialStudent.dob);
      setGender(initialStudent.gender);
      setClassId(initialStudent.classId || '');
      setGradeLevel(initialStudent.gradeLevel || 10);
      setRollNumber(initialStudent.rollNumber || 1);
      setTeamNumber(initialStudent.teamNumber || 1);
      setStatus(initialStudent.status || 'STUDYING');
      setAvatar(initialStudent.avatar || '');
      setNotes(initialStudent.notes || '');

      setFatherOrMotherName(initialStudent.parent?.fatherOrMotherName || '');
      setParentPhone(initialStudent.parent?.phone || '');
      setParentEmail(initialStudent.parent?.email || '');
      setRelationship(initialStudent.parent?.relationship || 'Bố');
      setPermanentAddress(initialStudent.parent?.permanentAddress || '');
      setParentNote(initialStudent.parent?.note || '');
    } else {
      const currentYear = new Date().getFullYear();
      const randomCode = `HS${currentYear}-${Math.floor(1000 + Math.random() * 9000)}`;
      setStudentCode(randomCode);
      setFullName('');
      setDob('2008-01-01');
      setGender('Nam');
      const targetClassId = defaultClassId || (cls.length > 0 ? cls[0].id : '');
      setClassId(targetClassId);
      const selClass = cls.find((c) => c.id === targetClassId);
      setGradeLevel(selClass ? selClass.gradeLevel : 10);
      setRollNumber(1);
      setTeamNumber(1);
      setStatus('STUDYING');
      setAvatar('');
      setNotes('');

      setFatherOrMotherName('');
      setParentPhone('');
      setParentEmail('');
      setRelationship('Bố');
      setPermanentAddress('');
      setParentNote('');
    }
    setActiveTab('student');
  }, [initialStudent, defaultClassId, isOpen]);

  const handleClassChange = (newClassId: string) => {
    setClassId(newClassId);
    const sel = classes.find((c) => c.id === newClassId);
    if (sel) {
      setGradeLevel(sel.gradeLevel);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) {
      setActiveTab('student');
      error('Vui lòng nhập họ và tên học sinh!');
      return;
    }

    if (!fatherOrMotherName.trim() || !parentPhone.trim()) {
      setActiveTab('parent');
      error('Vui lòng nhập tên Bố/Mẹ và số điện thoại liên hệ phụ huynh!');
      return;
    }

    const selClass = classes.find((c) => c.id === classId);

    const studentData: Student = {
      id: initialStudent ? initialStudent.id : `stu-${Date.now()}`,
      studentCode: studentCode.trim(),
      fullName: fullName.trim(),
      dob,
      gender,
      classId: classId || '',
      className: selClass ? selClass.name : 'Chưa xếp lớp',
      gradeLevel,
      rollNumber,
      teamNumber,
      avatar: avatar.trim() || undefined,
      status,
      parent: {
        fatherOrMotherName: fatherOrMotherName.trim(),
        phone: parentPhone.trim(),
        email: parentEmail.trim() || undefined,
        permanentAddress: permanentAddress.trim(),
        relationship,
        note: parentNote.trim() || undefined,
      },
      notes: notes.trim(),
      createdAt: initialStudent ? initialStudent.createdAt : new Date().toISOString().split('T')[0],
    };

    storageService.saveStudent(studentData);
    success(
      initialStudent
        ? `Đã cập nhật thông tin học sinh: ${studentData.fullName}`
        : `Đã thêm mới học sinh: ${studentData.fullName}`
    );
    onSaved();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-[#0c1429] rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-600 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-700 flex items-center justify-between bg-[#080d1b]">
          <div>
            <h2 className="text-lg font-black text-white">
              {initialStudent ? 'Chỉnh Sửa Hồ Sơ Học Sinh' : 'Thêm Học Sinh Mới'}
            </h2>
            <p className="text-xs text-slate-200 font-medium">
              Quản lý hồ sơ cá nhân và thông tin phụ huynh học sinh
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2 Tabs Segmented Control */}
        <div className="px-6 pt-4 pb-1 border-b border-slate-700 bg-[#0c1429] flex items-center gap-3">
          <button
            type="button"
            onClick={() => setActiveTab('student')}
            className={`flex items-center gap-2 pb-3 px-3 text-sm font-black border-b-2 transition-all cursor-pointer ${
              activeTab === 'student'
                ? 'border-blue-400 text-blue-300'
                : 'border-transparent text-slate-200 hover:text-white'
            }`}
          >
            <User className="w-4 h-4 text-blue-400" />
            <span>Thông tin học sinh</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('parent')}
            className={`flex items-center gap-2 pb-3 px-3 text-sm font-black border-b-2 transition-all cursor-pointer ${
              activeTab === 'parent'
                ? 'border-blue-400 text-blue-300'
                : 'border-transparent text-slate-200 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4 text-emerald-400" />
            <span>Thông tin phụ huynh</span>
            {(!fatherOrMotherName || !parentPhone) && (
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" title="Chưa điền đủ thông tin phụ huynh" />
            )}
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {activeTab === 'student' ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-white mb-1">
                    Mã học sinh <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={studentCode}
                    onChange={(e) => setStudentCode(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-[#080e1e] border border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none text-white font-bold placeholder:text-slate-400"
                    placeholder="VD: HS2024-1001"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-white mb-1">
                    Họ và tên học sinh <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-[#080e1e] border border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none text-white font-bold placeholder:text-slate-400"
                    placeholder="VD: Trần Quang Minh"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-black text-white mb-1">
                    Ngày sinh <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-[#080e1e] border border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-white mb-1">Giới tính</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as 'Nam' | 'Nữ')}
                    className="w-full px-3 py-2 text-sm bg-[#080e1e] border border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none text-white font-bold cursor-pointer"
                  >
                    <option value="Nam" className="bg-[#0c1429]">Nam</option>
                    <option value="Nữ" className="bg-[#0c1429]">Nữ</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black text-white mb-1">
                    Khối học (1 - 12) <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={gradeLevel}
                    onChange={(e) => setGradeLevel(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm bg-[#080e1e] border border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none text-white font-bold cursor-pointer"
                  >
                    {GRADE_LEVELS.map((g) => (
                      <option key={g.level} value={g.level} className="bg-[#0c1429]">
                        {g.name} ({g.description})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-black text-white mb-1">Lớp học</label>
                  <select
                    value={classId}
                    onChange={(e) => handleClassChange(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-[#080e1e] border border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none text-white font-bold cursor-pointer"
                  >
                    <option value="" className="bg-[#0c1429]">-- Chưa xếp lớp --</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.id} className="bg-[#0c1429]">
                        {c.name} (Khối {c.gradeLevel})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black text-white mb-1">Số thứ tự (STT)</label>
                  <input
                    type="number"
                    min="1"
                    value={rollNumber}
                    onChange={(e) => setRollNumber(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm bg-[#080e1e] border border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-white mb-1">Tổ học tập</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={teamNumber}
                    onChange={(e) => setTeamNumber(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm bg-[#080e1e] border border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none text-white font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-white mb-1">Trạng thái học tập</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as Student['status'])}
                    className="w-full px-3 py-2 text-sm bg-[#080e1e] border border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none text-white font-black cursor-pointer"
                  >
                    <option value="STUDYING" className="bg-[#0c1429]">Đang theo học (Bình thường)</option>
                    <option value="SUSPENDED" className="bg-[#0c1429]">Bảo lưu kết quả</option>
                    <option value="TRANSFERRED" className="bg-[#0c1429]">Chuyển trường</option>
                    <option value="DROPPED" className="bg-[#0c1429]">Thôi học / Nghỉ học</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black text-white mb-1">Link Ảnh đại diện (Avatar)</label>
                  <input
                    type="url"
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-[#080e1e] border border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none text-white placeholder:text-slate-400"
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-white mb-1">Ghi chú học tập / Sở trường</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-[#080e1e] border border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none resize-none text-white placeholder:text-slate-400 font-medium"
                  placeholder="Ghi chú về năng khiếu, học lực, sức khỏe..."
                />
              </div>

              {/* Hyperlink jumping to Parent tab */}
              <div className="pt-3 border-t border-slate-700 flex items-center justify-between bg-[#152349] p-3 rounded-xl border border-blue-500/50">
                <div className="text-xs text-white font-medium">
                  <span className="font-extrabold text-blue-200">Bước tiếp theo:</span> Hãy hoàn thiện thông tin liên hệ của phụ huynh để liên kết tài khoản.
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('parent')}
                  className="inline-flex items-center gap-1.5 text-xs font-black text-blue-300 hover:text-white underline hover:no-underline transition-colors cursor-pointer"
                >
                  <span>Chuyển sang tab Thông tin phụ huynh</span>
                  <ArrowRight className="w-4 h-4 text-blue-300" />
                </button>
              </div>
            </div>
          ) : (
            /* TAB 2: PARENT INFO */
            <div className="space-y-4">
              <div className="p-3 bg-amber-950/70 rounded-xl border border-amber-500 text-xs text-amber-100 flex items-start gap-2.5">
                <ShieldCheck className="w-5 h-5 text-amber-300 flex-shrink-0 mt-0.5" />
                <div className="font-semibold leading-relaxed">
                  Thông tin phụ huynh được dùng để cấp tài khoản Cổng Phụ Huynh, gửi thông báo khẩn cấp, điểm số và nhận xét rèn luyện của học sinh.
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-white mb-1">
                    Họ và tên Bố / Mẹ <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={fatherOrMotherName}
                    onChange={(e) => setFatherOrMotherName(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-[#080e1e] border border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none text-white font-bold placeholder:text-slate-400"
                    placeholder="VD: Trần Văn Bình"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-white mb-1">
                    Mối quan hệ <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={relationship}
                    onChange={(e) => setRelationship(e.target.value as any)}
                    className="w-full px-3 py-2 text-sm bg-[#080e1e] border border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none text-white font-bold cursor-pointer"
                  >
                    <option value="Bố" className="bg-[#0c1429]">Bố</option>
                    <option value="Mẹ" className="bg-[#0c1429]">Mẹ</option>
                    <option value="Người giám hộ" className="bg-[#0c1429]">Người giám hộ</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-white mb-1">
                    Số điện thoại phụ huynh <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={parentPhone}
                    onChange={(e) => setParentPhone(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-[#080e1e] border border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none text-white font-bold placeholder:text-slate-400"
                    placeholder="VD: 0903456789"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-white mb-1">
                    Email phụ huynh (nhận thông báo)
                  </label>
                  <input
                    type="email"
                    value={parentEmail}
                    onChange={(e) => setParentEmail(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-[#080e1e] border border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none text-white font-bold placeholder:text-slate-400"
                    placeholder="VD: phuhuynh@gmail.com"
                  />
                </div>
              </div>

              {/* Extended permanent address input */}
              <div>
                <label className="block text-xs font-black text-white mb-1">
                  Địa chỉ thường trú / Hộ khẩu <span className="text-rose-400">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={permanentAddress}
                  onChange={(e) => setPermanentAddress(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-[#080e1e] border border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none resize-none leading-relaxed text-white font-semibold placeholder:text-slate-400"
                  placeholder="Nhập chi tiết: Số nhà, ngõ/ngách, đường, thôn/tổ dân phố, phường/xã, quận/huyện, tỉnh/thành phố..."
                />
                <span className="text-xs text-blue-200 font-medium mt-1 block">
                  Ô nhập địa chỉ mở rộng giúp phụ huynh/nhà trường ghi nhận đầy đủ địa chỉ thường trú chính xác.
                </span>
              </div>

              <div>
                <label className="block text-xs font-black text-white mb-1">Ghi chú liên hệ gia đình</label>
                <input
                  type="text"
                  value={parentNote}
                  onChange={(e) => setParentNote(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-[#080e1e] border border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none text-white font-medium placeholder:text-slate-400"
                  placeholder="Thời gian thuận tiện liên hệ, người đón con khi tan trường..."
                />
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="pt-4 border-t border-slate-700 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-bold text-slate-200 hover:text-white hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-black text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-lg transition-colors cursor-pointer shadow-blue-600/40"
            >
              <Save className="w-4 h-4" />
              <span>{initialStudent ? 'Lưu thay đổi' : 'Thêm học sinh'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
