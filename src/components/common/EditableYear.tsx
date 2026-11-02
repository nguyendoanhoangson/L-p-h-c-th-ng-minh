import React, { useState, useEffect, useRef } from 'react';
import { Edit2, Check, X, Calendar } from 'lucide-react';
import { storageService } from '../../services/storageService';
import { useNotification } from '../../contexts/NotificationContext';

interface EditableYearProps {
  onYearChange?: (newYear: string) => void;
  className?: string;
}

export const EditableYear: React.FC<EditableYearProps> = ({ onYearChange, className = '' }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [year, setYear] = useState('');
  const [tempYear, setTempYear] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const { success, error } = useNotification();

  useEffect(() => {
    const current = storageService.getAcademicYear();
    setYear(current);
    setTempYear(current);
  }, []);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    const trimmed = tempYear.trim();
    if (!trimmed) {
      error('Năm học không được để trống!');
      return;
    }
    storageService.saveAcademicYear(trimmed);
    setYear(trimmed);
    setIsEditing(false);
    success(`Đã cập nhật năm học: ${trimmed}`);
    onYearChange?.(trimmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      setTempYear(year);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <div className={`inline-flex items-center gap-1.5 bg-[#0e1938] border-2 border-blue-400 rounded-lg px-2.5 py-1 shadow-lg ring-2 ring-blue-500/40 ${className}`}>
        <Calendar className="w-4 h-4 text-blue-300 flex-shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={tempYear}
          onChange={(e) => setTempYear(e.target.value)}
          onKeyDown={handleKeyDown}
          className="text-xs font-black text-white outline-none w-28 bg-transparent"
          placeholder="VD: 2024 - 2025"
        />
        <button
          onClick={handleSave}
          title="Nhấn Enter để lưu"
          className="p-1 text-emerald-300 hover:text-white hover:bg-emerald-900 rounded transition-colors"
        >
          <Check className="w-4 h-4" />
        </button>
        <button
          onClick={() => {
            setTempYear(year);
            setIsEditing(false);
          }}
          title="Hủy (Esc)"
          className="p-1 text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setIsEditing(true)}
      title="Click để chỉnh sửa năm học (Nhấn Enter để lưu)"
      className={`group inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-600 bg-[#0e1938] hover:border-blue-400 hover:bg-[#152554] text-white transition-all text-xs font-bold cursor-pointer shadow-md ${className}`}
    >
      <Calendar className="w-4 h-4 text-blue-300 group-hover:scale-110 transition-transform" />
      <span className="text-slate-100">Năm học: <strong className="text-blue-200 font-black tracking-wide ml-0.5">{year}</strong></span>
      <Edit2 className="w-3.5 h-3.5 text-blue-300 transition-colors ml-0.5 opacity-90 group-hover:opacity-100" />
    </button>
  );
};
