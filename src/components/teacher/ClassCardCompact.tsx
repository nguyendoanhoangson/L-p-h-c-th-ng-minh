import React, { useState } from 'react';
import { Users, MapPin, Edit3, Trash2, ArrowRight, BookOpen, KeyRound, Copy, Check } from 'lucide-react';
import { Classroom } from '../../types';

interface ClassCardCompactProps {
  classroom: Classroom;
  onSelect: (classroom: Classroom) => void;
  onEdit: (classroom: Classroom) => void;
  onDelete: (classroom: Classroom) => void;
}

export const ClassCardCompact: React.FC<ClassCardCompactProps> = ({
  classroom,
  onSelect,
  onEdit,
  onDelete,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!classroom.joinCode) return;
    try {
      navigator.clipboard.writeText(classroom.joinCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(true);
    }
  };
  return (
    <div
      className="group bg-[#0e1732] rounded-xl border border-slate-700/90 hover:border-blue-400 hover:bg-[#131f45] hover:shadow-xl hover:shadow-blue-950/40 transition-all p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative overflow-hidden"
    >
      {/* Accent strip */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1.5"
        style={{ backgroundColor: classroom.colorTheme || '#2563EB' }}
      />

      {/* Main Info - High Contrast Bright Typography */}
      <div className="pl-2 flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="font-black text-white text-sm hover:text-blue-300 transition-colors cursor-pointer truncate tracking-tight"
            onClick={() => onSelect(classroom)}
          >
            {classroom.name}
          </span>
          <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-md bg-[#182a5a] text-blue-200 border border-blue-500/50 shadow-xs">
            Khối {classroom.gradeLevel}
          </span>
          {classroom.subject && (
            <span className="text-[11px] text-slate-200 font-bold hidden md:inline">
              · {classroom.subject}
            </span>
          )}
        </div>

        {/* Compact Metadata Row (Bright & Clear) */}
        <div className="flex items-center gap-3.5 text-xs text-slate-200 mt-1 flex-wrap font-medium">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-blue-300 flex-shrink-0" />
            <span className="text-slate-100 font-semibold">{classroom.room || 'Phòng học'}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-blue-300 flex-shrink-0" />
            <span>
              Sĩ số: <strong className="text-white font-extrabold">{classroom.studentCount}</strong>/<span className="text-slate-300 font-bold">{classroom.maxStudents}</span> HS
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-slate-300 font-mono">
            <KeyRound className="w-3.5 h-3.5 text-amber-300 flex-shrink-0" />
            <span className="text-slate-200 font-semibold">Mã: {classroom.joinCode}</span>
            <button
              type="button"
              onClick={handleCopyCode}
              className="p-1 hover:bg-[#1a2d60] text-blue-300 hover:text-white rounded transition-colors cursor-pointer"
              title="Sao chép mã lớp"
            >
              {copied ? (
                <Check className="w-3 h-3 text-emerald-400" />
              ) : (
                <Copy className="w-3 h-3 text-blue-300 hover:text-white" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="pl-2 sm:pl-0 flex items-center gap-2 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-700/80 justify-end flex-shrink-0">
        <button
          onClick={() => onSelect(classroom)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-black transition-all cursor-pointer shadow-md shadow-blue-600/30 ring-1 ring-blue-400"
          title="Vào không gian làm việc của lớp"
        >
          <span>Vào lớp</span>
          <ArrowRight className="w-3.5 h-3.5 text-white" />
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(classroom);
          }}
          className="p-1.5 text-blue-200 hover:text-white hover:bg-[#1a2d60] rounded-lg transition-colors cursor-pointer border border-slate-700"
          title="Chỉnh sửa lớp (giữ lại tên cũ)"
        >
          <Edit3 className="w-4 h-4 text-blue-300" />
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(classroom);
          }}
          className="p-1.5 text-rose-300 hover:text-white hover:bg-rose-900/60 rounded-lg transition-colors cursor-pointer border border-slate-700"
          title="Xóa lớp học"
        >
          <Trash2 className="w-4 h-4 text-rose-400" />
        </button>
      </div>
    </div>
  );
};
