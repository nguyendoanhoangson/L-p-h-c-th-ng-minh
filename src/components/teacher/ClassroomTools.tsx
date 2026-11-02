import React, { useState, useEffect, useRef } from 'react';
import {
  Wrench,
  RotateCw,
  Shuffle,
  Users,
  Timer,
  Play,
  Pause,
  RotateCcw,
  Maximize2,
  Minimize2,
  Sparkles,
  Trophy,
  Bell,
  HelpCircle,
  Download,
  Copy,
  Check,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Classroom, Student } from '../../types';
import { storageService } from '../../services/storageService';
import { useNotification } from '../../contexts/NotificationContext';

interface ClassroomToolsProps {
  initialTool?: 'wheel' | 'random' | 'groups' | 'timer' | 'quick-quiz';
  initialClassId?: string;
}

export const ClassroomTools: React.FC<ClassroomToolsProps> = ({
  initialTool = 'wheel',
  initialClassId,
}) => {
  const { success, warning } = useNotification();
  const [activeTool, setActiveTool] = useState(initialTool);
  const [classes, setClasses] = useState<Classroom[]>(storageService.getClasses());
  const [selectedClassId, setSelectedClassId] = useState<string>(
    initialClassId || (classes.length > 0 ? classes[0].id : '')
  );
  const [students, setStudents] = useState<Student[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    if (initialTool) {
      setActiveTool(initialTool);
    }
  }, [initialTool]);

  const handleCopyCode = (code: string) => {
    try {
      navigator.clipboard.writeText(code);
      setCopiedCode(code);
      success(`Đã sao chép mã học sinh: ${code}`);
      setTimeout(() => setCopiedCode((prev) => (prev === code ? null : prev)), 2000);
    } catch {
      success(`Đã sao chép mã học sinh: ${code}`);
    }
  };

  const handleExportClassList = () => {
    const cls = classes.find((c) => c.id === selectedClassId) || classes[0];
    if (students.length === 0) {
      warning('Lớp học này hiện chưa có học sinh để xuất danh sách');
      return;
    }
    const header = 'STT,Mã Học Sinh,Họ Và Tên,Ngày Sinh,Giới Tính,Lớp,Trạng Thái\n';
    const rows = students
      .map(
        (s, idx) =>
          `${idx + 1},"${s.studentCode}","${s.fullName}","${s.dob || ''}","${s.gender || ''}","${cls?.name || s.className}","${s.status}"`
      )
      .join('\n');

    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `danh_sach_${cls?.name.replace(/\s+/g, '_') || 'lop'}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    success(`Đã xuất danh sách lớp ${cls?.name || ''} (${students.length} học sinh)`);
  };

  // Wheel state
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [wheelWinner, setWheelWinner] = useState<string | null>(null);
  const [wheelRotation, setWheelRotation] = useState(0);

  // Random Student state
  const [randomWinner, setRandomWinner] = useState<Student | null>(null);
  const [isPicking, setIsPicking] = useState(false);
  const [pickedHistory, setPickedHistory] = useState<Student[]>([]);

  // Group maker state
  const [groupCount, setGroupCount] = useState<number>(4);
  const [generatedGroups, setGeneratedGroups] = useState<{ id: number; name: string; members: Student[] }[]>([]);

  // Timer state
  const [timerSeconds, setTimerSeconds] = useState<number>(300);
  const [initialTimerSeconds, setInitialTimerSeconds] = useState<number>(300);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  useEffect(() => {
    const all = storageService.getStudents();
    const classStudents = all.filter((s) => s.classId === selectedClassId && s.status === 'STUDYING');
    setStudents(classStudents);
  }, [selectedClassId]);

  // TIMER EFFECT
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            try {
              confetti();
            } catch {}
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  // LUCKY WHEEL CANVAS DRAWING
  useEffect(() => {
    if (activeTool !== 'wheel') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const radius = width / 2 - 10;
    const cx = width / 2;
    const cy = height / 2;

    ctx.clearRect(0, 0, width, height);

    const count = students.length || 1;
    const arc = (2 * Math.PI) / count;
    const colors = ['#2563EB', '#7C3AED', '#0D9488', '#EA580C', '#E11D48', '#0284C7', '#16A34A'];

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate((wheelRotation * Math.PI) / 180);

    for (let i = 0; i < count; i++) {
      const angle = i * arc;
      ctx.beginPath();
      ctx.fillStyle = colors[i % colors.length];
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, angle, angle + arc);
      ctx.lineTo(0, 0);
      ctx.fill();
      ctx.stroke();

      // Text
      ctx.save();
      ctx.rotate(angle + arc / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 12px Inter, sans-serif';
      const label = students[i] ? students[i].fullName : `HS ${i + 1}`;
      ctx.fillText(label, radius - 15, 4);
      ctx.restore();
    }
    ctx.restore();

    // Center pin
    ctx.beginPath();
    ctx.arc(cx, cy, 20, 0, 2 * Math.PI);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#0F172A';
    ctx.stroke();
  }, [activeTool, students, wheelRotation]);

  const spinWheel = () => {
    if (isSpinning || students.length === 0) return;
    setIsSpinning(true);
    setWheelWinner(null);

    const randomDeg = Math.floor(2000 + Math.random() * 2000);
    const finalRot = wheelRotation + randomDeg;
    setWheelRotation(finalRot);

    setTimeout(() => {
      setIsSpinning(false);
      const count = students.length;
      const arc = 360 / count;
      const normalized = (360 - ((finalRot + 90) % 360)) % 360;
      const winnerIndex = Math.floor(normalized / arc) % count;
      const winner = students[winnerIndex];
      if (winner) {
        setWheelWinner(winner.fullName);
        try {
          confetti({ particleCount: 80, spread: 60 });
        } catch {}
      }
    }, 3000);
  };

  const pickRandomStudent = () => {
    if (students.length === 0 || isPicking) return;
    setIsPicking(true);
    setRandomWinner(null);

    let count = 0;
    const interval = setInterval(() => {
      const randIdx = Math.floor(Math.random() * students.length);
      setRandomWinner(students[randIdx]);
      count++;
      if (count > 20) {
        clearInterval(interval);
        setIsPicking(false);
        const finalWinner = students[Math.floor(Math.random() * students.length)];
        setRandomWinner(finalWinner);
        setPickedHistory((prev) => [finalWinner, ...prev.slice(0, 9)]);
        try {
          confetti({ particleCount: 70, spread: 50 });
        } catch {}
      }
    }, 80);
  };

  const generateGroups = () => {
    if (students.length === 0) return;
    const shuffled = [...students].sort(() => Math.random() - 0.5);
    const groups: { id: number; name: string; members: Student[] }[] = Array.from(
      { length: groupCount },
      (_, i) => ({
        id: i + 1,
        name: `Nhóm ${i + 1}`,
        members: [],
      })
    );

    shuffled.forEach((student, index) => {
      groups[index % groupCount].members.push(student);
    });

    setGeneratedGroups(groups);
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`space-y-4 ${isFullscreen ? 'fixed inset-0 z-50 bg-[#090e1c] text-white p-6 overflow-y-auto' : ''}`}>
      {/* Top Header (Navy Dark) */}
      <div className="bg-[#0b1326] rounded-2xl border border-slate-800 p-4 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            <Wrench className="w-6 h-6 text-blue-400" />
            <span>
              {activeTool === 'wheel' && 'Vòng Quay May Mắn'}
              {activeTool === 'random' && 'Gọi Học Sinh Ngẫu Nhiên'}
              {activeTool === 'groups' && 'Chia Nhóm Tự Động'}
              {activeTool === 'timer' && 'Đồng Hồ Đếm Ngược'}
              {activeTool === 'quick-quiz' && 'Quiz Nhanh Máy Chiếu'}
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Dành cho giáo viên chiếu máy chiếu trong giờ học
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Class Select */}
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl font-medium border border-slate-700/80 outline-none cursor-pointer bg-[#0e172e] text-white font-bold"
          >
            {classes.map((c) => (
              <option key={c.id} value={c.id} className="bg-[#0b1326]">
                {c.name} ({c.studentCount} HS)
              </option>
            ))}
          </select>

          {/* Fullscreen Projector Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-md shadow-blue-600/30"
            title="Bật/Tắt chế độ toàn màn hình cho máy chiếu"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            <span className="hidden sm:inline">{isFullscreen ? 'Thu nhỏ' : 'Máy chiếu'}</span>
          </button>
        </div>
      </div>

      {/* TOOL 1: LUCKY WHEEL */}
      {activeTool === 'wheel' && (
        <div className="p-6 rounded-2xl border border-slate-800 bg-[#0b1326] text-center space-y-6 shadow-md">
          <div className="relative inline-block">
            {/* Top Indicator Arrow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10 w-0 h-0 border-x-8 border-x-transparent border-t-16 border-t-rose-500 drop-shadow-md" />
            <canvas
              ref={canvasRef}
              width={340}
              height={340}
              className="max-w-full rounded-full transition-all duration-3000 ease-out"
              style={{
                transform: `rotate(${wheelRotation}deg)`,
                transition: isSpinning ? 'transform 3s cubic-bezier(0.15, 0.9, 0.25, 1)' : 'none',
              }}
            />
          </div>

          <div>
            {wheelWinner ? (
              <div className="inline-block p-4 bg-emerald-950/60 border border-emerald-800/80 rounded-2xl text-emerald-200 animate-bounce">
                <div className="text-xs font-bold uppercase tracking-wider text-emerald-400">Người trúng thưởng / Lên bảng:</div>
                <div className="text-2xl font-black mt-1 text-white">🎉 {wheelWinner} 🎉</div>
              </div>
            ) : (
              <div className="text-xs text-slate-400">
                Lớp có {students.length} học sinh. Nhấn nút bên dưới để quay!
              </div>
            )}
          </div>

          <div className="flex items-center justify-center gap-3 flex-wrap">
            <button
              onClick={spinWheel}
              disabled={isSpinning || students.length === 0}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-black rounded-2xl shadow-xl shadow-blue-600/30 transition-all cursor-pointer active:scale-95"
            >
              {isSpinning ? 'Đang quay...' : 'QUAY NGAY 🎯'}
            </button>

            <button
              type="button"
              onClick={handleExportClassList}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#121f42] hover:bg-[#1a2d60] border border-cyan-500/40 text-cyan-200 hover:text-white text-xs font-black rounded-2xl shadow-lg transition-all cursor-pointer active:scale-95"
              title="Xuất danh sách học sinh lớp đang quay sang file Excel/CSV"
            >
              <Download className="w-4 h-4 text-cyan-400" />
              <span>Xuất danh sách lớp ({students.length} HS)</span>
            </button>
          </div>
        </div>
      )}

      {/* TOOL 2: RANDOM STUDENT */}
      {activeTool === 'random' && (
        <div className="p-6 rounded-2xl border border-slate-800 bg-[#0b1326] space-y-6 text-center shadow-md">
          <div className="max-w-md mx-auto py-8 px-6 rounded-3xl border-2 border-dashed border-blue-500/40 bg-[#080e1e] min-h-48 flex flex-col items-center justify-center">
            {randomWinner ? (
              <div className="space-y-2 animate-in zoom-in-90">
                <div className="w-16 h-16 rounded-full bg-blue-600 text-white font-black text-xl flex items-center justify-center mx-auto shadow-lg shadow-blue-600/40">
                  {randomWinner.fullName.charAt(0)}
                </div>
                <div className="text-2xl font-black text-white">{randomWinner.fullName}</div>
                <div className="text-xs text-blue-400 font-medium flex items-center justify-center gap-1.5">
                  <span>Mã: {randomWinner.studentCode}</span>
                  <button
                    type="button"
                    onClick={() => handleCopyCode(randomWinner.studentCode)}
                    className="p-1 hover:bg-[#1a2d60] text-blue-300 hover:text-white rounded transition-colors cursor-pointer"
                    title="Sao chép mã học sinh"
                  >
                    {copiedCode === randomWinner.studentCode ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <span>· STT: {randomWinner.rollNumber || '1'}</span>
                </div>
              </div>
            ) : (
              <div className="text-slate-400 text-sm font-medium">
                Nhấn nút bên dưới để gọi 1 bạn học sinh ngẫu nhiên
              </div>
            )}
          </div>

          <button
            onClick={pickRandomStudent}
            disabled={isPicking || students.length === 0}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-black rounded-2xl shadow-xl shadow-blue-600/30 transition-all cursor-pointer active:scale-95"
          >
            {isPicking ? 'Đang chọn...' : 'GỌI NGẪU NHIÊN 🎲'}
          </button>

          {/* History */}
          {pickedHistory.length > 0 && (
            <div className="text-left pt-4 border-t border-slate-800 max-w-xl mx-auto">
              <span className="text-xs font-bold text-slate-400 uppercase">Lịch sử lượt gọi vừa rồi:</span>
              <div className="flex flex-wrap gap-2 mt-2">
                {pickedHistory.map((h, i) => (
                  <span key={i} className="px-2.5 py-1 bg-[#121c38] rounded-lg text-xs font-semibold text-slate-200 border border-slate-700/60">
                    {h.fullName}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TOOL 3: GROUP MAKER */}
      {activeTool === 'groups' && (
        <div className="p-6 rounded-2xl border border-slate-800 bg-[#0b1326] space-y-6 shadow-md">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-300">Số lượng nhóm cần chia:</span>
              <input
                type="number"
                min="2"
                max="10"
                value={groupCount}
                onChange={(e) => setGroupCount(Number(e.target.value))}
                className="w-16 px-2.5 py-1 text-xs font-bold bg-[#080e1e] border border-slate-700 rounded-lg text-center text-white"
              />
            </div>
            <button
              onClick={generateGroups}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-md transition-colors cursor-pointer"
            >
              Chia nhóm ngẫu nhiên
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {generatedGroups.map((grp) => (
              <div key={grp.id} className="bg-[#080e1e] rounded-xl p-3 border border-slate-800 space-y-2">
                <div className="font-bold text-xs text-blue-400 flex items-center justify-between border-b pb-1.5 border-slate-800">
                  <span>{grp.name}</span>
                  <span className="text-slate-400 font-normal">{grp.members.length} HS</span>
                </div>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {grp.members.map((m, idx) => (
                    <div key={m.id} className="text-xs text-slate-200 font-medium">
                      {idx + 1}. {m.fullName}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TOOL 4: TIMER */}
      {activeTool === 'timer' && (
        <div className="p-8 rounded-2xl border border-slate-800 bg-[#0b1326] text-center space-y-6 shadow-md">
          <div className="text-7xl font-black font-mono tracking-tight text-blue-400 drop-shadow-md">
            {formatTimer(timerSeconds)}
          </div>

          <div className="flex items-center justify-center gap-2">
            {[60, 180, 300, 600, 900].map((s) => (
              <button
                key={s}
                onClick={() => {
                  setTimerSeconds(s);
                  setInitialTimerSeconds(s);
                  setIsTimerRunning(false);
                }}
                className="px-3 py-1 bg-[#121c38] hover:bg-[#192750] rounded-lg text-xs font-semibold text-slate-300 border border-slate-700/60 cursor-pointer"
              >
                {Math.floor(s / 60)} phút
              </button>
            ))}
          </div>

          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer"
            >
              {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isTimerRunning ? 'Tạm dừng' : 'Bắt đầu đếm'}</span>
            </button>

            <button
              onClick={() => {
                setIsTimerRunning(false);
                setTimerSeconds(initialTimerSeconds);
              }}
              className="p-2.5 text-slate-400 hover:bg-slate-800 border border-slate-700/80 rounded-xl cursor-pointer"
              title="Đặt lại thời gian"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
