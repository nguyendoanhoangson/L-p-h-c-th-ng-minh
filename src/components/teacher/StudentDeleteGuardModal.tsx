import React from 'react';
import { AlertTriangle, ShieldAlert, X, Trash2, Edit3 } from 'lucide-react';
import { Student } from '../../types';

interface StudentDeleteGuardModalProps {
  student: Student | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmDelete: (student: Student) => void;
  onOpenEdit: (student: Student) => void;
}

export const StudentDeleteGuardModal: React.FC<StudentDeleteGuardModalProps> = ({
  student,
  isOpen,
  onClose,
  onConfirmDelete,
  onOpenEdit,
}) => {
  if (!isOpen || !student) return null;

  const isRestricted = student.status === 'STUDYING' && Boolean(student.classId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#0c1429] rounded-2xl max-w-lg w-full shadow-2xl border border-slate-700/80 overflow-hidden">
        {/* Header */}
        <div className={`px-6 py-4 flex items-center justify-between border-b ${
          isRestricted ? 'bg-amber-950/40 border-amber-900/60' : 'bg-rose-950/40 border-rose-900/60'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${isRestricted ? 'bg-amber-900/60 text-amber-400' : 'bg-rose-900/60 text-rose-400'}`}>
              {isRestricted ? <ShieldAlert className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-semibold text-white text-base">
                {isRestricted ? 'Cảnh báo ràng buộc nghiệp vụ' : 'Xác nhận xóa học sinh'}
              </h3>
              <p className="text-xs text-slate-400">Mã HS: {student.studentCode}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3 p-3 bg-[#080e1e] rounded-xl border border-slate-800">
            {student.avatar ? (
              <img src={student.avatar} alt={student.fullName} className="w-12 h-12 rounded-full object-cover ring-1 ring-slate-700" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-blue-900/60 text-blue-300 flex items-center justify-center font-bold">
                {student.fullName.charAt(0)}
              </div>
            )}
            <div>
              <div className="font-semibold text-white">{student.fullName}</div>
              <div className="text-xs text-slate-400">
                Lớp: <span className="font-medium text-slate-200">{student.className || 'Chưa gán lớp'}</span> · Trạng thái: {' '}
                <span className={`font-medium ${
                  student.status === 'STUDYING' ? 'text-emerald-400' : 'text-slate-400'
                }`}>
                  {student.status === 'STUDYING' ? 'Đang theo học' : student.status === 'TRANSFERRED' ? 'Đã chuyển trường' : 'Thôi học'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-rose-950/40 rounded-xl p-4 border border-rose-900/60 text-rose-200 text-sm space-y-2">
            <p className="font-semibold text-white">
              Bạn có chắc chắn muốn xóa học sinh <strong className="text-rose-300">{student.fullName}</strong> ({student.studentCode})?
            </p>
            <p className="text-xs text-rose-200/90 leading-relaxed">
              {isRestricted
                ? `Học sinh đang theo học tại lớp ${student.className}. Xóa học sinh sẽ loại bỏ hồ sơ khỏi lớp học và sổ điểm.`
                : 'Toàn bộ hồ sơ cá nhân và thông tin phụ huynh của học sinh này sẽ bị loại bỏ khỏi danh sách.'}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#080d1b] border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-300 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            Hủy bỏ
          </button>

          {isRestricted && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenEdit(student);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-blue-200 hover:text-white bg-blue-950 hover:bg-blue-900 border border-blue-600 rounded-xl transition-colors cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5 text-blue-300" />
              <span>Chỉnh sửa hồ sơ</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => onConfirmDelete(student)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-black text-white bg-rose-600 hover:bg-rose-500 rounded-xl shadow-lg shadow-rose-600/30 transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4 text-white" />
            <span>Xác nhận xóa</span>
          </button>
        </div>
      </div>
    </div>
  );
};
