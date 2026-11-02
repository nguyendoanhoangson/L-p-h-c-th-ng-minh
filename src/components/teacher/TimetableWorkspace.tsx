import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Calendar,
  Edit3,
  Trash2,
  Undo2,
  Redo2,
  FileSpreadsheet,
  Download,
  Save,
  Plus,
  X,
  AlertTriangle,
  CheckCircle2,
  School,
  Users,
  MapPin,
  Clock,
  Printer,
  ChevronDown,
  Info,
  RotateCcw,
  Sparkles,
  Layers,
  ArrowRight,
  Check,
} from 'lucide-react';
import {
  TimetableData,
  TimetablePeriod,
  TimetableScheduleType,
  Classroom,
} from '../../types';
import {
  ALL_DAYS,
  DEFAULT_DAYS,
  DEFAULT_PERIODS,
  TIMETABLE_TEACHERS,
  TIMETABLE_ROOMS,
} from '../../data/mockData';
import { storageService } from '../../services/storageService';
import { useNotification } from '../../contexts/NotificationContext';

interface TimetableWorkspaceProps {
  initialClassId?: string;
  isReadOnlyMode?: boolean; // Used if student / parent view
  onBack?: () => void;
}

interface HistorySnapshot {
  days: string[];
  periods: TimetablePeriod[];
  cells: Record<string, string>;
}

export const TimetableWorkspace: React.FC<TimetableWorkspaceProps> = ({
  initialClassId,
  isReadOnlyMode = false,
  onBack,
}) => {
  const { success, error, info } = useNotification();

  // Active Schedule Type Tab: CLASS | TEACHER | ROOM
  const [scheduleType, setScheduleType] = useState<TimetableScheduleType>('CLASS');

  // Available options
  const [classesList, setClassesList] = useState<Classroom[]>([]);
  const [selectedTargetId, setSelectedTargetId] = useState<string>('');

  // Mode states
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isDeleteMode, setIsDeleteMode] = useState<boolean>(false);

  // Timetable Working Data
  const [currentTimetable, setCurrentTimetable] = useState<TimetableData | null>(null);
  const [draftDays, setDraftDays] = useState<string[]>([...DEFAULT_DAYS]);
  const [draftPeriods, setDraftPeriods] = useState<TimetablePeriod[]>([...DEFAULT_PERIODS]);
  const [draftCells, setDraftCells] = useState<Record<string, string>>({});

  // History for Undo / Redo
  const [undoStack, setUndoStack] = useState<HistorySnapshot[]>([]);
  const [redoStack, setRedoStack] = useState<HistorySnapshot[]>([]);

  // Modals
  const [isConfirmClearModalOpen, setIsConfirmClearModalOpen] = useState<boolean>(false);
  const [confirmDeletePeriod, setConfirmDeletePeriod] = useState<TimetablePeriod | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState<boolean>(false);

  // Import draft state
  const [importText, setImportText] = useState<string>('');
  const [importFileName, setImportFileName] = useState<string>('');

  // Editing cell time modal / input
  const [editingPeriodTime, setEditingPeriodTime] = useState<{ id: string; time: string } | null>(null);

  // Load initial classes list
  useEffect(() => {
    const cls = storageService.getClasses();
    setClassesList(cls);

    if (initialClassId) {
      setSelectedTargetId(initialClassId);
    } else if (cls.length > 0) {
      // Find 7A3 if available, or first class
      const class7A3 = cls.find((c) => c.name.includes('7A3') || c.id === 'cls-7a3');
      setSelectedTargetId(class7A3 ? class7A3.id : cls[0].id);
    }
  }, [initialClassId]);

  // When Schedule Type changes, update default selected target
  const handleScheduleTypeChange = (type: TimetableScheduleType) => {
    if (isEditing && hasUnsavedChanges()) {
      if (!window.confirm('Bạn có thay đổi chưa lưu trong thời khóa biểu hiện tại. Chuyển tab sẽ hủy bản nháp. Bạn có muốn tiếp tục?')) {
        return;
      }
    }

    setScheduleType(type);
    setIsEditing(false);
    setIsDeleteMode(false);
    setUndoStack([]);
    setRedoStack([]);

    if (type === 'CLASS') {
      const cls = storageService.getClasses();
      const class7A3 = cls.find((c) => c.name.includes('7A3') || c.id === 'cls-7a3');
      setSelectedTargetId(class7A3 ? class7A3.id : cls[0]?.id || '');
    } else if (type === 'TEACHER') {
      setSelectedTargetId(TIMETABLE_TEACHERS[0].id);
    } else if (type === 'ROOM') {
      setSelectedTargetId(TIMETABLE_ROOMS[0].id);
    }
  };

  // Get current target display name
  const currentTargetName = useMemo(() => {
    if (scheduleType === 'CLASS') {
      const c = classesList.find((item) => item.id === selectedTargetId);
      return c ? c.name : 'Lớp học';
    }
    if (scheduleType === 'TEACHER') {
      const t = TIMETABLE_TEACHERS.find((item) => item.id === selectedTargetId);
      return t ? `${t.name} (${t.subject})` : 'Giáo viên';
    }
    if (scheduleType === 'ROOM') {
      const r = TIMETABLE_ROOMS.find((item) => item.id === selectedTargetId);
      return r ? r.name : 'Phòng học';
    }
    return '';
  }, [scheduleType, selectedTargetId, classesList]);

  // Load timetable from storage whenever targetId or scheduleType changes
  useEffect(() => {
    if (!selectedTargetId) return;

    const data = storageService.getTimetable(scheduleType, selectedTargetId, currentTargetName);
    setCurrentTimetable(data);
    setDraftDays(data.days && data.days.length > 0 ? [...data.days] : [...DEFAULT_DAYS]);
    setDraftPeriods(data.periods && data.periods.length > 0 ? [...data.periods] : [...DEFAULT_PERIODS]);
    setDraftCells({ ...data.cells });
    setUndoStack([]);
    setRedoStack([]);
  }, [scheduleType, selectedTargetId, currentTargetName]);

  // Check if draft has changes compared to saved
  const hasUnsavedChanges = (): boolean => {
    if (!currentTimetable) return false;
    if (JSON.stringify(draftDays) !== JSON.stringify(currentTimetable.days)) return true;
    if (JSON.stringify(draftPeriods) !== JSON.stringify(currentTimetable.periods)) return true;
    if (JSON.stringify(draftCells) !== JSON.stringify(currentTimetable.cells)) return true;
    return false;
  };

  // Push snapshot to undo stack
  const pushSnapshot = (
    newDays = draftDays,
    newPeriods = draftPeriods,
    newCells = draftCells
  ) => {
    setUndoStack((prev) => [
      ...prev.slice(-30), // keep max 30 history states
      {
        days: [...draftDays],
        periods: [...draftPeriods],
        cells: { ...draftCells },
      },
    ]);
    setRedoStack([]);
  };

  // Undo action
  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const previous = undoStack[undoStack.length - 1];
    setUndoStack((prev) => prev.slice(0, prev.length - 1));
    setRedoStack((prev) => [
      ...prev,
      {
        days: [...draftDays],
        periods: [...draftPeriods],
        cells: { ...draftCells },
      },
    ]);

    setDraftDays(previous.days);
    setDraftPeriods(previous.periods);
    setDraftCells(previous.cells);
    info('Đã hoàn tác thao tác');
  };

  // Redo action
  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setRedoStack((prev) => prev.slice(0, prev.length - 1));
    setUndoStack((prev) => [
      ...prev,
      {
        days: [...draftDays],
        periods: [...draftPeriods],
        cells: { ...draftCells },
      },
    ]);

    setDraftDays(next.days);
    setDraftPeriods(next.periods);
    setDraftCells(next.cells);
    info('Đã làm lại thao tác');
  };

  // Keyboard shortcut support for Undo / Redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isEditing) return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) {
          e.preventDefault();
          handleRedo();
        } else {
          e.preventDefault();
          handleUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEditing, undoStack, redoStack, draftDays, draftPeriods, draftCells]);

  // Handle cell content change
  const handleCellChange = (periodId: string, day: string, value: string) => {
    const key = `${periodId}___${day}`;
    if (draftCells[key] === value) return;

    pushSnapshot(draftDays, draftPeriods, draftCells);
    setDraftCells((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Toggle Editing Mode
  const toggleEditMode = () => {
    if (isEditing) {
      // Switching off edit mode
      if (hasUnsavedChanges()) {
        if (window.confirm('Bạn có thay đổi chưa lưu. Bạn có muốn lưu trước khi đóng chỉnh sửa không?')) {
          handleSave();
          setIsEditing(false);
          setIsDeleteMode(false);
          return;
        }
      }
      setIsEditing(false);
      setIsDeleteMode(false);
    } else {
      setIsEditing(true);
      info('Đã bật chế độ chỉnh sửa trực tiếp. Nhấp vào ô để sửa nội dung.');
    }
  };

  // Save Timetable Changes
  const handleSave = () => {
    if (!currentTimetable) return;

    const updatedData: TimetableData = {
      ...currentTimetable,
      days: [...draftDays],
      periods: [...draftPeriods],
      cells: { ...draftCells },
      updatedAt: new Date().toISOString(),
    };

    storageService.saveTimetable(updatedData);
    setCurrentTimetable(updatedData);
    setUndoStack([]);
    setRedoStack([]);
    success(`Đã lưu thời khóa biểu ${currentTargetName} thành công!`);
  };

  // Cancel edit / reset to saved
  const handleCancelEdit = () => {
    if (!currentTimetable) return;
    if (hasUnsavedChanges()) {
      if (!window.confirm('Hủy bỏ tất cả thay đổi chưa lưu và quay lại bản đã lưu?')) {
        return;
      }
    }
    setDraftDays([...currentTimetable.days]);
    setDraftPeriods([...currentTimetable.periods]);
    setDraftCells({ ...currentTimetable.cells });
    setUndoStack([]);
    setRedoStack([]);
    setIsEditing(false);
    setIsDeleteMode(false);
    info('Đã hủy bỏ các thay đổi nháp');
  };

  // -------------------------------------------------------------
  // DAY COLUMNS: ADD / DELETE LOGIC
  // -------------------------------------------------------------

  // Add next day in chronological sequence
  const handleAddDay = () => {
    // If all 7 days exist, show exact requested message: "Lỗi: Tuần chỉ có 7 ngày."
    if (draftDays.length >= 7) {
      error('Lỗi: Tuần chỉ có 7 ngày.');
      return;
    }

    // Find the next missing day from ALL_DAYS sequence
    const nextMissingDay = ALL_DAYS.find((d) => !draftDays.includes(d));
    if (!nextMissingDay) {
      error('Lỗi: Tuần chỉ có 7 ngày.');
      return;
    }

    pushSnapshot();
    // Insert the day into correct chronological order
    const newDays = [...draftDays, nextMissingDay].sort(
      (a, b) => ALL_DAYS.indexOf(a) - ALL_DAYS.indexOf(b)
    );

    setDraftDays(newDays);
    success(`Đã thêm cột ${nextMissingDay} vào thời khóa biểu`);
  };

  // Delete day column
  const executeDeleteColumn = (dayToDelete: string) => {
    pushSnapshot();
    const newDays = draftDays.filter((d) => d !== dayToDelete);
    setDraftDays(newDays);

    // Clean up cells of that day
    const updatedCells = { ...draftCells };
    Object.keys(updatedCells).forEach((key) => {
      if (key.endsWith(`___${dayToDelete}`)) {
        delete updatedCells[key];
      }
    });
    setDraftCells(updatedCells);
    success(`Đã xóa cột ${dayToDelete}`);
  };

  // Clear all cell contents in timetable (Làm trống bảng an toàn)
  const handleClearAllCells = () => {
    pushSnapshot();
    setDraftCells({});
    setIsConfirmClearModalOpen(false);
    success('Đã làm trống toàn bộ nội dung thời khóa biểu');
  };

  // -------------------------------------------------------------
  // PERIODS (ROWS): ADD / DELETE LOGIC
  // -------------------------------------------------------------

  // Add new period
  const handleAddPeriod = () => {
    const nextNumber = draftPeriods.length + 1;
    let nextTime = '16:10 - 16:55';
    if (nextNumber === 6) nextTime = '13:30 - 14:15';
    else if (nextNumber === 7) nextTime = '14:20 - 15:05';
    else if (nextNumber === 8) nextTime = '15:20 - 16:05';
    else if (nextNumber > 8) {
      const hour = 16 + Math.floor((nextNumber - 8) * 0.8);
      nextTime = `${hour}:15 - ${hour + 1}:00`;
    }

    const newPeriod: TimetablePeriod = {
      id: `p${Date.now()}`,
      periodNumber: nextNumber,
      name: `Tiết ${nextNumber}`,
      timeRange: nextTime,
    };

    pushSnapshot();
    setDraftPeriods((prev) => [...prev, newPeriod]);
    success(`Đã thêm Tiết ${nextNumber} (${nextTime}) vào thời khóa biểu`);
  };

  // Delete period
  const executeDeletePeriod = (periodToDelete: TimetablePeriod) => {
    pushSnapshot();
    const newPeriods = draftPeriods
      .filter((p) => p.id !== periodToDelete.id)
      .map((p, idx) => ({
        ...p,
        periodNumber: idx + 1,
        name: `Tiết ${idx + 1}`,
      }));

    setDraftPeriods(newPeriods);

    // Clean up cells for that period
    const updatedCells = { ...draftCells };
    Object.keys(updatedCells).forEach((key) => {
      if (key.startsWith(`${periodToDelete.id}___`)) {
        delete updatedCells[key];
      }
    });
    setDraftCells(updatedCells);
    setConfirmDeletePeriod(null);
    success(`Đã xóa ${periodToDelete.name}`);
  };

  // Save edited time range for a period
  const handleSavePeriodTime = (periodId: string, newTime: string) => {
    pushSnapshot();
    setDraftPeriods((prev) =>
      prev.map((p) => (p.id === periodId ? { ...p, timeRange: newTime.trim() } : p))
    );
    setEditingPeriodTime(null);
    success('Đã cập nhật khung giờ tiết học');
  };

  // -------------------------------------------------------------
  // EXPORT LOGIC (CSV, PRINT / PDF)
  // -------------------------------------------------------------
  const handleExportCSV = () => {
    setIsExportMenuOpen(false);
    let csvContent = `Thời khóa biểu - ${currentTargetName}\n`;
    csvContent += `Niên khóa: ${storageService.getAcademicYear()}\n\n`;

    // Header row
    const headerRow = ['Tiết / Giờ', ...draftDays];
    csvContent += headerRow.map((cell) => `"${cell}"`).join(',') + '\n';

    // Rows
    draftPeriods.forEach((period) => {
      const row = [`${period.name} (${period.timeRange})`];
      draftDays.forEach((day) => {
        const val = draftCells[`${period.id}___${day}`] || '';
        row.push(val.replace(/\n/g, ' / '));
      });
      csvContent += row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(',') + '\n';
    });

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Thoi_Khoa_Bieu_${currentTargetName.replace(/\s+/g, '_')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    success('Đã xuất thời khóa biểu dạng file CSV thành công!');
  };

  const handlePrint = () => {
    setIsExportMenuOpen(false);
    window.print();
  };

  // -------------------------------------------------------------
  // IMPORT EXCEL / CSV LOGIC
  // -------------------------------------------------------------
  const handleApplyImport = () => {
    if (!importText.trim()) {
      error('Vui lòng dán nội dung bảng hoặc chọn file Excel/CSV');
      return;
    }

    try {
      pushSnapshot();
      const rows = importText
        .trim()
        .split('\n')
        .map((r) => r.split(/[\t,;]/).map((c) => c.trim().replace(/^"|"$/g, '')));

      if (rows.length < 2) {
        error('Dữ liệu không đủ số hàng (cần ít nhất 1 dòng tiêu đề và 1 dòng dữ liệu)');
        return;
      }

      // Check header days
      const header = rows[0];
      const parsedDays: string[] = [];
      for (let i = 1; i < header.length; i++) {
        const colName = header[i];
        if (colName) parsedDays.push(colName);
      }

      const newCells: Record<string, string> = { ...draftCells };
      const newPeriods: TimetablePeriod[] = [];

      for (let rIdx = 1; rIdx < rows.length; rIdx++) {
        const row = rows[rIdx];
        if (!row || row.length === 0) continue;

        const periodLabel = row[0] || `Tiết ${rIdx}`;
        const periodId = `p${rIdx}`;

        newPeriods.push({
          id: periodId,
          periodNumber: rIdx,
          name: `Tiết ${rIdx}`,
          timeRange: periodLabel.includes('(') ? periodLabel.split('(')[1].replace(')', '') : draftPeriods[rIdx - 1]?.timeRange || '07:15 - 08:00',
        });

        parsedDays.forEach((day, cIdx) => {
          const val = row[cIdx + 1] || '';
          if (val) {
            newCells[`${periodId}___${day}`] = val.replace(/\s*\/\s*/g, '\n');
          }
        });
      }

      if (parsedDays.length > 0) setDraftDays(parsedDays);
      if (newPeriods.length > 0) setDraftPeriods(newPeriods);
      setDraftCells(newCells);

      setIsImportModalOpen(false);
      setImportText('');
      setImportFileName('');
      success('Đã import thời khóa biểu thành công vào bản nháp! Nhấn "Lưu" để hoàn tất.');
    } catch (err) {
      error('Có lỗi xảy ra khi xử lý file import. Vui lòng kiểm tra định dạng.');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setImportText(content);
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-4 print:p-0">
      {/* =========================================================================
          TOP BAR & TABS: Lịch lớp học, Lịch giáo viên, Lịch phòng học & SELECTOR
          ========================================================================= */}
      <div className="bg-[#0b1326] rounded-2xl border border-cyan-500/30 p-4 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-[#060b17] rounded-xl border border-cyan-500/20 overflow-x-auto scrollbar-none">
            <button
              onClick={() => handleScheduleTypeChange('CLASS')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                scheduleType === 'CLASS'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30 font-black'
                  : 'text-slate-300 hover:text-white hover:bg-cyan-950/40'
              }`}
            >
              <School className="w-4 h-4" />
              <span>Lịch lớp học</span>
            </button>

            <button
              onClick={() => handleScheduleTypeChange('TEACHER')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                scheduleType === 'TEACHER'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30 font-black'
                  : 'text-slate-300 hover:text-white hover:bg-cyan-950/40'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Lịch giáo viên</span>
            </button>
          </div>

          {/* Selector Dropdown & Info */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-cyan-300">
                {scheduleType === 'CLASS' && 'Chọn lớp:'}
                {scheduleType === 'TEACHER' && 'Chọn giáo viên:'}
              </span>

              {scheduleType === 'CLASS' && (
                <select
                  value={selectedTargetId}
                  onChange={(e) => setSelectedTargetId(e.target.value)}
                  className="bg-[#070c1a] border border-cyan-500/40 text-white font-bold text-xs sm:text-sm rounded-xl px-3.5 py-2 focus:ring-2 focus:ring-cyan-400 focus:outline-none cursor-pointer"
                >
                  {classesList.map((cls) => (
                    <option key={cls.id} value={cls.id} className="bg-[#0b1326] text-white">
                      {cls.name} ({cls.room})
                    </option>
                  ))}
                </select>
              )}

              {scheduleType === 'TEACHER' && (
                <select
                  value={selectedTargetId}
                  onChange={(e) => setSelectedTargetId(e.target.value)}
                  className="bg-[#070c1a] border border-cyan-500/40 text-white font-bold text-xs sm:text-sm rounded-xl px-3.5 py-2 focus:ring-2 focus:ring-cyan-400 focus:outline-none cursor-pointer"
                >
                  {TIMETABLE_TEACHERS.map((t) => (
                    <option key={t.id} value={t.id} className="bg-[#0b1326] text-white">
                      {t.name} - {t.subject}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-300 bg-[#060b17] px-3 py-1.5 rounded-lg border border-slate-700">
              <Calendar className="w-3.5 h-3.5 text-cyan-400" />
              <span>Năm học: <strong className="text-cyan-200">{storageService.getAcademicYear()}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          TOOLBAR (Chỉnh sửa, Xóa, Hoàn tác, Làm lại, Import Excel, Xuất, Lưu)
          ========================================================================= */}
      <div className="bg-[#0b1326] rounded-2xl border border-cyan-500/30 p-3.5 shadow-xl print:hidden">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Left Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Chỉnh sửa */}
            {!isReadOnlyMode && (
              <button
                onClick={toggleEditMode}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-md ${
                  isEditing
                    ? 'bg-cyan-400 text-slate-950 ring-2 ring-cyan-200 shadow-cyan-400/40 font-black'
                    : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/20'
                }`}
                title="Bật/Tắt chế độ chỉnh sửa trực tiếp trên bảng"
              >
                <Edit3 className="w-4 h-4" />
                <span>{isEditing ? 'Đang chỉnh sửa' : 'Chỉnh sửa'}</span>
              </button>
            )}

            {/* Xóa nội dung thời khóa biểu */}
            {!isReadOnlyMode && (
              <button
                onClick={() => setIsConfirmClearModalOpen(true)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer border bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border-rose-500/50"
                title="Làm trống toàn bộ nội dung thời khóa biểu"
              >
                <Trash2 className="w-4 h-4" />
                <span>Xóa nội dung</span>
              </button>
            )}

            {/* Hoàn tác (Undo) */}
            <button
              onClick={handleUndo}
              disabled={undoStack.length === 0 || !isEditing}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all border ${
                undoStack.length > 0 && isEditing
                  ? 'bg-[#121f42] hover:bg-[#182a5a] text-cyan-200 border-cyan-500/40 cursor-pointer shadow-sm'
                  : 'bg-[#070c1a] text-slate-500 border-slate-800 cursor-not-allowed opacity-50'
              }`}
              title="Hoàn tác (Ctrl+Z)"
            >
              <Undo2 className="w-4 h-4" />
              <span>Hoàn tác</span>
            </button>

            {/* Làm lại (Redo) */}
            <button
              onClick={handleRedo}
              disabled={redoStack.length === 0 || !isEditing}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all border ${
                redoStack.length > 0 && isEditing
                  ? 'bg-[#121f42] hover:bg-[#182a5a] text-cyan-200 border-cyan-500/40 cursor-pointer shadow-sm'
                  : 'bg-[#070c1a] text-slate-500 border-slate-800 cursor-not-allowed opacity-50'
              }`}
              title="Làm lại (Ctrl+Y)"
            >
              <Redo2 className="w-4 h-4" />
              <span>Làm lại</span>
            </button>

            {/* Import Excel */}
            {!isReadOnlyMode && (
              <button
                onClick={() => setIsImportModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold bg-[#121f42] hover:bg-[#182a5a] text-slate-100 hover:text-white border border-cyan-500/30 transition-all cursor-pointer"
                title="Nhập dữ liệu thời khóa biểu từ file Excel hoặc CSV"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <span>Import Excel</span>
              </button>
            )}

            {/* Xuất thời khóa biểu */}
            <div className="relative">
              <button
                onClick={() => setIsExportMenuOpen((prev) => !prev)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-[#121f42] hover:bg-[#182a5a] text-slate-100 hover:text-white border border-cyan-500/30 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4 text-cyan-400" />
                <span>Xuất thời khóa biểu</span>
                <ChevronDown className="w-3.5 h-3.5 text-cyan-400" />
              </button>

              {isExportMenuOpen && (
                <div className="absolute left-0 mt-2 w-52 bg-[#090f21] border border-cyan-500/40 rounded-xl shadow-2xl py-1.5 z-40 backdrop-blur-md">
                  <button
                    onClick={handleExportCSV}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-slate-200 hover:text-white hover:bg-[#162754] text-left transition-colors cursor-pointer"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                    <span>Xuất file Excel / CSV</span>
                  </button>
                  <button
                    onClick={handlePrint}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-slate-200 hover:text-white hover:bg-[#162754] text-left transition-colors cursor-pointer"
                  >
                    <Printer className="w-4 h-4 text-cyan-400" />
                    <span>In / Xuất PDF</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Action Buttons (Lưu & Hủy) */}
          {isEditing && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleCancelEdit}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer border border-slate-700"
              >
                Hủy bỏ
              </button>

              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-black rounded-xl shadow-lg shadow-emerald-600/30 transition-all cursor-pointer ring-1 ring-emerald-300 animate-pulse-once"
              >
                <Save className="w-4 h-4" />
                <span>Lưu</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Dưới button Đang chỉnh sửa: Thay cho dòng hướng dẫn, đặt các nút Thêm tiết và Thêm ngày */}
      {isEditing && (
        <div className="bg-[#08152e] border border-cyan-500/40 px-4 py-2.5 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleAddPeriod}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black rounded-xl text-xs sm:text-sm transition-all cursor-pointer shadow-md shadow-cyan-500/20"
              title="Thêm một tiết học mới vào bảng"
            >
              <Plus className="w-4 h-4 text-slate-950" />
              <span>+ Thêm tiết</span>
            </button>

            <button
              onClick={handleAddDay}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs sm:text-sm transition-all cursor-pointer shadow-md shadow-emerald-500/20"
              title="Thêm một ngày mới vào thời khóa biểu"
            >
              <Plus className="w-4 h-4 text-slate-950" />
              <span>+ Thêm ngày</span>
            </button>
          </div>

          {hasUnsavedChanges() && (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              Có thay đổi chưa lưu - Nhấn "Lưu" để ghi chính thức
            </span>
          )}
        </div>
      )}

      {/* =========================================================================
          MAIN TIMETABLE GRID (Bảng Thời Khóa Biểu)
          Nền Dark Navy, Viền Cyan mảnh, Chữ sáng nổi bật
          ========================================================================= */}
      <div className="bg-[#0b1326] rounded-2xl border border-cyan-500/30 shadow-2xl overflow-hidden">
        {/* Printable Title Header */}
        <div className="p-4 border-b border-cyan-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-[#070c1a]">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-6 bg-cyan-400 rounded-full" />
            <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
              Thời khóa biểu: <span className="text-cyan-300">{currentTargetName}</span>
            </h2>
          </div>
          <div className="text-xs text-slate-300 font-medium">
            <span>Áp dụng từ: <strong className="text-white">Học kỳ 1 (Năm học {storageService.getAcademicYear()})</strong></span>
          </div>
        </div>

        {/* The Scrollable Responsive Table Container */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left min-w-[760px]">
            {/* Table Header: Days of the Week */}
            <thead>
              <tr className="bg-[#081229] border-b border-cyan-500/40 text-xs sm:text-sm text-cyan-200">
                {/* Column 1: Tiết / Giờ */}
                <th className="py-3 px-3.5 font-black uppercase tracking-wider w-[150px] border-r border-cyan-500/30 bg-[#060e22] text-center text-cyan-300">
                  Tiết / Giờ
                </th>

                {/* Day Columns */}
                {draftDays.map((day) => (
                  <th
                    key={day}
                    className="py-3 px-3 font-black text-center border-r border-cyan-500/30 last:border-r-0 relative group"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-white text-sm sm:text-base font-black tracking-tight">{day}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Table Body: Periods (Rows) */}
            <tbody className="divide-y divide-cyan-500/20 text-xs sm:text-sm">
              {draftPeriods.map((period, periodIdx) => (
                <tr
                  key={period.id}
                  className={`transition-colors ${
                    periodIdx % 2 === 0 ? 'bg-[#091124]' : 'bg-[#070d1c]'
                  } hover:bg-[#0d1a38]`}
                >
                  {/* Period Name & Time Range */}
                  <td className="py-2.5 px-3 border-r border-cyan-500/30 bg-[#060d1f] text-center w-[150px] align-middle">
                    <div className="flex flex-col items-center justify-center gap-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-black text-white text-sm">{period.name}</span>

                        {/* Delete period icon in delete mode or edit mode */}
                        {(isDeleteMode || isEditing) && (
                          <button
                            onClick={() => setConfirmDeletePeriod(period)}
                            className="p-1 text-rose-400 hover:text-white hover:bg-rose-600 rounded transition-colors cursor-pointer"
                            title={`Xóa ${period.name}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Time Range */}
                      {editingPeriodTime?.id === period.id ? (
                        <div className="flex items-center gap-1 mt-1">
                          <input
                            type="text"
                            defaultValue={period.timeRange}
                            className="w-24 text-[11px] bg-slate-900 border border-cyan-400 text-white rounded px-1 py-0.5 text-center font-bold"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleSavePeriodTime(period.id, (e.target as HTMLInputElement).value);
                              } else if (e.key === 'Escape') {
                                setEditingPeriodTime(null);
                              }
                            }}
                            onBlur={(e) => handleSavePeriodTime(period.id, e.target.value)}
                            autoFocus
                          />
                        </div>
                      ) : (
                        <div
                          onClick={() => {
                            if (isEditing) {
                              setEditingPeriodTime({ id: period.id, time: period.timeRange });
                            }
                          }}
                          className={`flex items-center justify-center gap-1 text-[11px] text-cyan-300 font-bold ${
                            isEditing ? 'cursor-pointer hover:underline hover:text-white' : ''
                          }`}
                          title={isEditing ? 'Nhấp để sửa khung giờ' : undefined}
                        >
                          <Clock className="w-3 h-3 text-cyan-400" />
                          <span>{period.timeRange}</span>
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Day Cells for this Period */}
                  {draftDays.map((day) => {
                    const cellKey = `${period.id}___${day}`;
                    const cellValue = draftCells[cellKey] || '';
                    const isEmpty = !cellValue.trim();

                    return (
                      <td
                        key={day}
                        className="py-2 px-2.5 border-r border-cyan-500/30 last:border-r-0 align-top transition-all"
                      >
                        {isEditing ? (
                          /* Direct Editing Mode with Auto-Expanding Textarea */
                          <div className="relative w-full h-full min-h-[58px]">
                            <textarea
                              value={cellValue}
                              placeholder="-trống-"
                              rows={Math.max(2, cellValue.split('\n').length)}
                              onChange={(e) => handleCellChange(period.id, day, e.target.value)}
                              className="w-full h-full min-h-[58px] p-1.5 bg-transparent text-white font-bold text-xs sm:text-sm rounded-lg border border-transparent focus:border-cyan-400 focus:bg-cyan-950/40 focus:ring-1 focus:ring-cyan-300 focus:outline-none transition-all placeholder:text-slate-500 placeholder:italic resize-none leading-relaxed"
                              style={{
                                whiteSpace: 'pre-wrap',
                              }}
                            />
                          </div>
                        ) : (
                          /* Read-Only Mode */
                          <div className="w-full min-h-[58px] p-2 rounded-lg flex flex-col justify-center">
                            {isEmpty ? (
                              <span className="text-slate-500 italic text-xs select-none">-trống-</span>
                            ) : (
                              <div className="text-white font-bold text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">
                                {cellValue}
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* =========================================================================
          MODAL: XÁC NHẬN LÀM TRỐNG NỘI DUNG THỜI KHÓA BIỂU
          ========================================================================= */}
      {isConfirmClearModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0c152d] border border-rose-500/60 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400 mb-4">
              <div className="p-3 bg-rose-950/60 rounded-xl border border-rose-600/50">
                <AlertTriangle className="w-6 h-6 text-rose-400" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Làm trống nội dung thời khóa biểu</h3>
                <p className="text-xs text-rose-300 font-medium">Hành động này có thể hoàn tác bằng nút Hoàn tác</p>
              </div>
            </div>

            <p className="text-sm text-slate-200 mb-6 leading-relaxed">
              Bạn có chắc chắn muốn làm trống các tiết học đã điền trong thời khóa biểu của{' '}
              <strong className="text-white text-base">"{currentTargetName}"</strong>? Các thứ trong tuần và các tiết học vẫn được giữ nguyên.
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setIsConfirmClearModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleClearAllCells}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-black rounded-xl shadow-lg shadow-rose-600/40 transition-colors cursor-pointer"
              >
                Xác nhận làm trống
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: CONFIRM DELETE PERIOD
          ========================================================================= */}
      {confirmDeletePeriod && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0c152d] border border-rose-500/60 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400 mb-4">
              <div className="p-3 bg-rose-950/60 rounded-xl border border-rose-600/50">
                <AlertTriangle className="w-6 h-6 text-rose-400" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Xác nhận xóa tiết học</h3>
                <p className="text-xs text-rose-300 font-medium">Xóa hàng tiết học trên tất cả các ngày</p>
              </div>
            </div>

            <p className="text-sm text-slate-200 mb-6 leading-relaxed">
              Bạn có chắc chắn muốn xóa <strong className="text-white text-base">"{confirmDeletePeriod.name}"</strong> (
              {confirmDeletePeriod.timeRange})? Mọi môn học thuộc tiết này trên các ngày sẽ bị xóa.
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setConfirmDeletePeriod(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                onClick={() => executeDeletePeriod(confirmDeletePeriod)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-black rounded-xl shadow-lg shadow-rose-600/40 transition-colors cursor-pointer"
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: IMPORT EXCEL / CSV
          ========================================================================= */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0c152d] border border-cyan-500/60 rounded-2xl p-6 max-w-2xl w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20">
              <div className="flex items-center gap-2.5">
                <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                <h3 className="text-lg font-black text-white">Import Thời khóa biểu từ Excel / CSV</h3>
              </div>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-slate-300 leading-relaxed">
                Tải lên file định dạng <strong>.csv</strong> hoặc sao chép và dán trực tiếp bảng từ Microsoft Excel / Google Sheets vào ô bên dưới. Dòng đầu tiên là tiêu đề các ngày (Thứ 2, Thứ 3, ...).
              </p>

              {/* Upload file input */}
              <div className="flex items-center gap-3 p-3 bg-[#070d1e] rounded-xl border border-dashed border-cyan-500/40">
                <input
                  type="file"
                  accept=".csv,.txt,.tsv"
                  onChange={handleFileUpload}
                  className="text-xs text-slate-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-cyan-600 file:text-white hover:file:bg-cyan-500 cursor-pointer"
                />
                {importFileName && (
                  <span className="text-xs text-emerald-300 font-bold">✓ {importFileName}</span>
                )}
              </div>

              {/* Textarea for pasting */}
              <div>
                <label className="block text-xs font-bold text-cyan-300 mb-1">
                  Hoặc dán nội dung bảng từ Excel vào đây:
                </label>
                <textarea
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder={`Tiết / Giờ\tThứ 2\tThứ 3\tThứ 4\tThứ 5\tThứ 6\nTiết 1 (07:15 - 08:00)\tChào cờ\tNgữ văn\tToán\tTiếng Anh\tToán\nTiết 2 (08:05 - 08:50)\tToán\tNgữ văn\tHóa học\tTiếng Anh\tKHTN`}
                  rows={8}
                  className="w-full p-3 bg-[#070c1a] border border-cyan-500/40 text-slate-100 font-mono text-xs rounded-xl focus:ring-2 focus:ring-cyan-400 focus:outline-none resize-none leading-relaxed"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-cyan-500/20">
              <button
                onClick={() => {
                  // sample template
                  const sample = `Tiết / Giờ\tThứ 2\tThứ 3\tThứ 4\tThứ 5\tThứ 6\nTiết 1 (07:15 - 08:00)\tChào cờ\tNgữ văn\tToán\tTiếng Anh\tToán\nTiết 2 (08:05 - 08:50)\tToán\tNgữ văn\tKHTN\tTiếng Anh\tKHTN\nTiết 3 (09:05 - 09:50)\tToán\tTiếng Anh\tKHTN\tToán\tLịch sử\nTiết 4 (09:55 - 10:40)\tNgữ văn\tKHTN\tĐịa lý\tNgữ văn\tMỹ thuật\nTiết 5 (10:45 - 11:30)\tTiếng Anh\tTin học\tCông nghệ\tÂm nhạc\tSinh hoạt lớp`;
                  setImportText(sample);
                }}
                className="text-xs text-cyan-400 hover:text-cyan-300 underline font-bold cursor-pointer"
              >
                Điền mẫu ví dụ
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsImportModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  onClick={handleApplyImport}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl shadow-lg shadow-emerald-600/40 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Áp dụng vào TKB</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
