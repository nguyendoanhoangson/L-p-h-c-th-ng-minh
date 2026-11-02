import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  Users,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  Save,
  Calendar,
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import { Classroom, Student, AttendanceRecord, AttendanceStatus } from '../../types';
import { storageService } from '../../services/storageService';
import { useNotification } from '../../contexts/NotificationContext';

interface AttendanceWorkspaceProps {
  initialClassId?: string;
}

export const AttendanceWorkspace: React.FC<AttendanceWorkspaceProps> = ({ initialClassId }) => {
  const { success, warning } = useNotification();
  const [classes, setClasses] = useState<Classroom[]>(storageService.getClasses());
  const [selectedClassId, setSelectedClassId] = useState<string>(
    initialClassId || (classes.length > 0 ? classes[0].id : '')
  );
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [period, setPeriod] = useState<number>(1);

  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceState, setAttendanceState] = useState<
    Record<string, { status: AttendanceStatus; reason?: string }>
  >({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    const allStudents = storageService.getStudents();
    const classStudents = allStudents.filter(
      (s) => s.classId === selectedClassId && s.status === 'STUDYING'
    );
    setStudents(classStudents);

    const existing = storageService.getAttendance(selectedClassId, date);
    const stateMap: Record<string, { status: AttendanceStatus; reason?: string }> = {};

    classStudents.forEach((st) => {
      const rec = existing.find((e) => e.studentId === st.id && e.period === period);
      if (rec) {
        stateMap[st.id] = { status: rec.status, reason: rec.reason || '' };
      } else {
        stateMap[st.id] = { status: 'PRESENT', reason: '' };
      }
    });

    setAttendanceState(stateMap);
    setHasUnsavedChanges(false);
  }, [selectedClassId, date, period]);

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setAttendanceState((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status,
      },
    }));
    setHasUnsavedChanges(true);
  };

  const handleReasonChange = (studentId: string, reason: string) => {
    setAttendanceState((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        reason,
      },
    }));
    setHasUnsavedChanges(true);
  };

  const handleMarkAllPresent = () => {
    const updated: Record<string, { status: AttendanceStatus; reason?: string }> = {};
    students.forEach((s) => {
      updated[s.id] = { status: 'PRESENT', reason: '' };
    });
    setAttendanceState(updated);
    setHasUnsavedChanges(true);
    success('Đã đánh dấu tất cả học sinh có mặt!');
  };

  const handleSaveAttendance = () => {
    const recordsToSave: AttendanceRecord[] = students.map((st) => {
      const current = attendanceState[st.id] || { status: 'PRESENT' };
      return {
        id: `att-${selectedClassId}-${st.id}-${date}-${period}`,
        classId: selectedClassId,
        studentId: st.id,
        studentName: st.fullName,
        date,
        period,
        status: current.status,
        reason: current.reason,
        recordedBy: 'Thầy Nguyễn Văn Hùng',
        updatedAt: new Date().toISOString(),
      };
    });

    storageService.saveAttendanceBatch(recordsToSave);
    setHasUnsavedChanges(false);
    success(`Đã lưu điểm danh thành công cho ${students.length} học sinh`);
  };

  const summary = {
    total: students.length,
    present: 0,
    excused: 0,
    unexcused: 0,
    late: 0,
    earlyLeave: 0,
  };

  Object.values(attendanceState).forEach((item) => {
    if (item.status === 'PRESENT') summary.present++;
    else if (item.status === 'EXCUSED_ABSENCE') summary.excused++;
    else if (item.status === 'UNEXCUSED_ABSENCE') summary.unexcused++;
    else if (item.status === 'LATE') summary.late++;
    else if (item.status === 'EARLY_LEAVE') summary.earlyLeave++;
  });

  const selectedClass = classes.find((c) => c.id === selectedClassId);

  return (
    <div className="space-y-4 pb-20">
      {/* Header (Bright Text) */}
      <div className="bg-[#0b1326] rounded-2xl border border-slate-700/90 p-4 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-blue-400" />
            <span>Sổ Điểm Danh Điện Tử</span>
          </h1>
          <p className="text-xs text-slate-200 font-medium mt-0.5">
            Điểm danh trực quan theo tiết, tổng hợp tự động và liên kết tức thời với Phụ huynh
          </p>
        </div>

        {/* Action: Mark all present */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleMarkAllPresent}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-black text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-md transition-colors cursor-pointer shadow-blue-600/30"
          >
            <Sparkles className="w-4 h-4 text-white" />
            <span>Đánh dấu tất cả Có mặt</span>
          </button>
        </div>
      </div>

      {/* Selectors Bar */}
      <div className="bg-[#0b1326] rounded-2xl border border-slate-700/90 p-4 shadow-lg grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-bold text-slate-100 mb-1">Chọn lớp học</label>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-[#0e172e] border border-slate-600 rounded-xl text-white font-bold focus:ring-2 focus:ring-blue-400 outline-none cursor-pointer"
          >
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id} className="bg-[#0b1326]">
                {cls.name} (Phòng: {cls.room})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-100 mb-1">Ngày điểm danh</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-[#0e172e] border border-slate-600 rounded-xl text-white font-bold focus:ring-2 focus:ring-blue-400 outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-100 mb-1">Tiết / Buổi học</label>
          <select
            value={period}
            onChange={(e) => setPeriod(Number(e.target.value))}
            className="w-full px-3 py-2 text-xs bg-[#0e172e] border border-slate-600 rounded-xl text-white font-bold focus:ring-2 focus:ring-blue-400 outline-none cursor-pointer"
          >
            <option value={1} className="bg-[#0b1326]">Tiết 1 (Sáng 07:15 - 08:00)</option>
            <option value={2} className="bg-[#0b1326]">Tiết 2 (Sáng 08:05 - 08:50)</option>
            <option value={3} className="bg-[#0b1326]">Tiết 3 (Sáng 09:05 - 09:50)</option>
            <option value={4} className="bg-[#0b1326]">Tiết 4 (Sáng 09:55 - 10:40)</option>
            <option value={5} className="bg-[#0b1326]">Tiết 5 (Sáng 10:45 - 11:30)</option>
            <option value={6} className="bg-[#0b1326]">Tiết 6 (Chiều 13:30 - 14:15)</option>
            <option value={7} className="bg-[#0b1326]">Tiết 7 (Chiều 14:20 - 15:05)</option>
          </select>
        </div>
      </div>

      {/* Summary KPI Cards (High Contrast Colors) */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-[#0e1732] rounded-xl p-3.5 border border-slate-700 text-center shadow-md">
          <div className="text-xs font-bold text-slate-200">Sĩ số lớp</div>
          <div className="text-2xl font-black text-white mt-1">{summary.total}</div>
        </div>
        <div className="bg-emerald-950 rounded-xl p-3.5 border border-emerald-500 text-center shadow-md">
          <div className="text-xs font-bold text-emerald-300">Có mặt</div>
          <div className="text-2xl font-black text-emerald-200 mt-1">{summary.present}</div>
        </div>
        <div className="bg-amber-950 rounded-xl p-3.5 border border-amber-500 text-center shadow-md">
          <div className="text-xs font-bold text-amber-300">Đi trễ</div>
          <div className="text-2xl font-black text-amber-200 mt-1">{summary.late}</div>
        </div>
        <div className="bg-blue-950 rounded-xl p-3.5 border border-blue-500 text-center shadow-md">
          <div className="text-xs font-bold text-blue-300">Nghỉ có phép</div>
          <div className="text-2xl font-black text-blue-200 mt-1">{summary.excused}</div>
        </div>
        <div className="bg-rose-950 rounded-xl p-3.5 border border-rose-500 text-center col-span-2 sm:col-span-1 shadow-md">
          <div className="text-xs font-bold text-rose-300">Vắng không phép</div>
          <div className="text-2xl font-black text-rose-200 mt-1">{summary.unexcused}</div>
        </div>
      </div>

      {/* Student Attendance List */}
      <div className="bg-[#0b1326] rounded-2xl border border-slate-700/90 overflow-hidden shadow-lg">
        <div className="p-3.5 bg-[#0e1732] border-b border-slate-700 text-xs font-black text-white flex items-center justify-between">
          <span className="text-sm">Danh sách điểm danh ({students.length} học sinh)</span>
          {hasUnsavedChanges && (
            <span className="text-amber-300 font-extrabold flex items-center gap-1.5 text-xs bg-amber-950 px-2 py-0.5 rounded-md border border-amber-500">
              <AlertTriangle className="w-4 h-4 text-amber-300" />
              Chưa lưu thay đổi!
            </span>
          )}
        </div>

        <div className="divide-y divide-slate-700/80">
          {students.map((st, idx) => {
            const current = attendanceState[st.id] || { status: 'PRESENT', reason: '' };
            return (
              <div
                key={st.id}
                className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#14224a] transition-colors"
              >
                {/* Info */}
                <div className="flex items-center gap-3 min-w-48">
                  <span className="text-xs font-black text-slate-300 w-5">{idx + 1}</span>
                  <div>
                    <div className="font-black text-white text-sm">{st.fullName}</div>
                    <div className="text-xs text-blue-300 font-semibold font-mono mt-0.5">
                      {st.studentCode} · PH: <strong className="text-slate-100">{st.parent.fatherOrMotherName}</strong> ({st.parent.phone})
                    </div>
                  </div>
                </div>

                {/* Status Toggle Buttons */}
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => handleStatusChange(st.id, 'PRESENT')}
                    className={`px-3 py-1.5 text-xs font-black rounded-lg border transition-all cursor-pointer ${
                      current.status === 'PRESENT'
                        ? 'bg-emerald-600 text-white border-emerald-400 shadow-md ring-1 ring-emerald-300'
                        : 'bg-[#0e172e] text-slate-200 border-slate-600 hover:text-white hover:bg-[#152347]'
                    }`}
                  >
                    Có mặt
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStatusChange(st.id, 'LATE')}
                    className={`px-3 py-1.5 text-xs font-black rounded-lg border transition-all cursor-pointer ${
                      current.status === 'LATE'
                        ? 'bg-amber-600 text-white border-amber-400 shadow-md ring-1 ring-amber-300'
                        : 'bg-[#0e172e] text-slate-200 border-slate-600 hover:text-white hover:bg-[#152347]'
                    }`}
                  >
                    Đi trễ
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStatusChange(st.id, 'EXCUSED_ABSENCE')}
                    className={`px-3 py-1.5 text-xs font-black rounded-lg border transition-all cursor-pointer ${
                      current.status === 'EXCUSED_ABSENCE'
                        ? 'bg-blue-600 text-white border-blue-400 shadow-md ring-1 ring-blue-300'
                        : 'bg-[#0e172e] text-slate-200 border-slate-600 hover:text-white hover:bg-[#152347]'
                    }`}
                  >
                    Có phép
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStatusChange(st.id, 'UNEXCUSED_ABSENCE')}
                    className={`px-3 py-1.5 text-xs font-black rounded-lg border transition-all cursor-pointer ${
                      current.status === 'UNEXCUSED_ABSENCE'
                        ? 'bg-rose-600 text-white border-rose-400 shadow-md ring-1 ring-rose-300'
                        : 'bg-[#0e172e] text-slate-200 border-slate-600 hover:text-white hover:bg-[#152347]'
                    }`}
                  >
                    Vắng K.phép
                  </button>
                </div>

                {/* Reason note */}
                <div className="w-full sm:w-60">
                  <input
                    type="text"
                    value={current.reason || ''}
                    onChange={(e) => handleReasonChange(st.id, e.target.value)}
                    placeholder="Ghi chú lý do (nếu có)..."
                    className="w-full px-3 py-1.5 text-xs bg-[#0e172e] border border-slate-600 rounded-lg text-white font-medium placeholder:text-slate-400 focus:ring-2 focus:ring-blue-400 outline-none"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sticky Bottom Save Bar */}
      <div className="fixed bottom-0 left-0 right-0 lg:left-64 bg-[#0a1022] border-t border-slate-700 px-6 py-3.5 flex items-center justify-between z-20 shadow-2xl">
        <div className="text-xs text-slate-100 font-bold">
          Lớp: <strong className="text-white font-black text-sm">{selectedClass?.name}</strong> · Tiết {period} · Ngày {date}
        </div>
        <button
          onClick={handleSaveAttendance}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black rounded-xl shadow-xl transition-all cursor-pointer active:scale-95 shadow-blue-600/40 ring-1 ring-blue-300"
        >
          <Save className="w-4 h-4 text-white" />
          <span>Lưu Điểm Danh Tiết Học</span>
        </button>
      </div>
    </div>
  );
};
