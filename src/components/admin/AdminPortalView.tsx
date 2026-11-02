import React, { useState } from 'react';
import {
  ShieldCheck,
  School,
  Users,
  Database,
  History,
  Settings,
  Layers,
  Calendar,
  CheckCircle2,
  RefreshCw,
  HardDriveDownload,
  AlertTriangle,
} from 'lucide-react';
import { GRADE_LEVELS, DEMO_USERS } from '../../data/mockData';
import { storageService } from '../../services/storageService';
import { useNotification } from '../../contexts/NotificationContext';
import { EditableYear } from '../common/EditableYear';

export const AdminPortalView: React.FC = () => {
  const { success, warning } = useNotification();
  const [activeTab, setActiveTab] = useState<'overview' | 'grades12' | 'users' | 'audit' | 'backup'>('overview');

  const classes = storageService.getClasses();
  const students = storageService.getStudents();
  const auditLogs = storageService.getAuditLogs();

  const handleResetData = () => {
    if (window.confirm('CẢNH BÁO: Thao tác này sẽ đặt lại toàn bộ cơ sở dữ liệu về bản demo gốc ban đầu. Bạn có chắc chắn?')) {
      storageService.resetAllToSeed();
      success('Đã khôi phục dữ liệu hệ thống về mẫu ban đầu thành công!');
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  const handleBackupExport = () => {
    const backupObj = {
      academicYear: storageService.getAcademicYear(),
      classes: storageService.getClasses(),
      students: storageService.getStudents(),
      attendance: storageService.getAttendance(),
      grades: storageService.getGrades(),
      auditLogs: storageService.getAuditLogs(),
      timestamp: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(backupObj, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `smartclass_full_backup_${Date.now()}.json`;
    link.click();
    success('Đã xuất file sao lưu JSON an toàn cho toàn bộ hệ thống!');
  };

  return (
    <div className="space-y-4">
      {/* Admin Banner (Bright Typography) */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-[#0b1328] rounded-3xl p-6 text-white shadow-xl border border-blue-500/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-950 text-rose-300 text-xs font-black mb-1.5 border border-rose-500">
            <ShieldCheck className="w-4 h-4 text-rose-300" />
            <span>Khu Vực Quản Trị Hệ Thống Cấp Cao (Root Admin)</span>
          </div>
          <h1 className="text-2xl font-black text-white">Trung Tâm Quản Trị SMART CLASS</h1>
          <p className="text-xs text-slate-100 font-medium mt-0.5">
            Cấu hình niên khóa, quản trị 12 khối học, người dùng và nhật ký an toàn
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleBackupExport}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black rounded-xl shadow-md transition-colors cursor-pointer"
          >
            <HardDriveDownload className="w-4 h-4 text-white" />
            <span>Sao lưu dữ liệu</span>
          </button>
          <button
            onClick={handleResetData}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-950 hover:bg-rose-900 text-rose-200 border border-rose-500 text-xs font-black rounded-xl transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Khôi phục mẫu</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-700 pb-2">
        {[
          { id: 'overview', label: 'Dashboard Hệ Thống', icon: School },
          { id: 'grades12', label: 'Cấu Hình 12 Khối Học', icon: Layers },
          { id: 'users', label: 'Tài Khoản & Phân Quyền', icon: Users },
          { id: 'audit', label: 'Nhật Ký Hoạt Động (Audit)', icon: History },
        ].map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/40 ring-1 ring-blue-300' : 'text-slate-200 hover:text-white hover:bg-[#16254e]'
              }`}
            >
              <Icon className="w-4 h-4 text-blue-300" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="bg-[#0b1326] rounded-2xl p-4.5 border border-slate-700/90 shadow-lg">
              <span className="text-xs font-black text-slate-200 uppercase tracking-wide">Tổng lớp học</span>
              <div className="text-3xl font-black text-white mt-1.5">{classes.length}</div>
              <div className="text-xs text-blue-300 font-bold mt-1">Phủ kín 12 khối</div>
            </div>

            <div className="bg-[#0b1326] rounded-2xl p-4.5 border border-slate-700/90 shadow-lg">
              <span className="text-xs font-black text-slate-200 uppercase tracking-wide">Tổng học sinh</span>
              <div className="text-3xl font-black text-white mt-1.5">{students.length}</div>
              <div className="text-xs text-emerald-300 font-bold mt-1">Đã đồng bộ hồ sơ PH</div>
            </div>

            <div className="bg-[#0b1326] rounded-2xl p-4.5 border border-slate-700/90 shadow-lg">
              <span className="text-xs font-black text-slate-200 uppercase tracking-wide">Người dùng hệ thống</span>
              <div className="text-3xl font-black text-white mt-1.5">4 vai trò</div>
              <div className="text-xs text-slate-200 font-bold mt-1">Admin, GV, HS, PH</div>
            </div>

            <div className="bg-[#0b1326] rounded-2xl p-4.5 border border-slate-700/90 shadow-lg">
              <span className="text-xs font-black text-slate-200 uppercase tracking-wide">Audit logs</span>
              <div className="text-3xl font-black text-purple-300 mt-1.5">{auditLogs.length}</div>
              <div className="text-xs text-purple-200 font-bold mt-1">Lưu vết an toàn</div>
            </div>
          </div>

          <div className="bg-[#0b1326] rounded-2xl p-5 border border-slate-700/90 shadow-lg">
            <h3 className="font-black text-base text-white mb-2.5">Thông Tin Trường Học & Niên Khóa</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 bg-[#080e1e] border border-slate-700 rounded-xl space-y-1">
                <span className="text-slate-300 font-bold">Tên cơ sở:</span>
                <p className="font-black text-white text-base">Trường THPT Chuyên Smart Class Hà Nội</p>
              </div>
              <div className="p-3.5 bg-[#080e1e] border border-slate-700 rounded-xl space-y-1">
                <span className="text-slate-300 font-bold">Niên khóa đang hoạt động:</span>
                <div className="pt-0.5">
                  <EditableYear />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: 12 Grade Levels */}
      {activeTab === 'grades12' && (
        <div className="bg-[#0b1326] rounded-2xl p-5 border border-slate-700/90 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-black text-base text-white">Danh Mục 12 Khối Học Toàn Trường</h3>
              <p className="text-xs text-slate-200 font-medium">Hỗ trợ đầy đủ từ Khối 1 đến Khối 12 (Tiểu học, THCS, THPT)</p>
            </div>
            <span className="text-xs font-black px-3.5 py-1 bg-blue-950 text-blue-200 border border-blue-400 rounded-lg">
              12/12 Khối hoạt động
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
            {GRADE_LEVELS.map((g) => {
              const countInGrade = classes.filter((c) => c.gradeLevel === g.level).length;
              return (
                <div key={g.level} className="p-4 rounded-xl border border-slate-700 bg-[#0e1732] flex items-center justify-between shadow-xs">
                  <div>
                    <div className="font-black text-sm text-white">{g.name}</div>
                    <div className="text-xs text-blue-200 font-semibold mt-0.5">{g.description}</div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black px-2.5 py-1 bg-[#182a5a] border border-blue-400/50 rounded-md text-blue-200 shadow-xs">
                      {countInGrade} Lớp học
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab: Users */}
      {activeTab === 'users' && (
        <div className="bg-[#0b1326] rounded-2xl p-5 border border-slate-700/90 shadow-lg space-y-4">
          <h3 className="font-black text-base text-white">Danh Sách Tài Khoản Người Dùng Mẫu</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#0e1732] text-white font-black border-b border-slate-700">
                <tr>
                  <th className="p-3">Họ và Tên</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Vai trò</th>
                  <th className="p-3">Số điện thoại</th>
                  <th className="p-3">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/80 bg-[#0b1326]">
                {DEMO_USERS.map((u) => (
                  <tr key={u.id} className="hover:bg-[#14224a]">
                    <td className="p-3 font-black text-white text-sm">{u.name}</td>
                    <td className="p-3 font-mono font-bold text-slate-100">{u.email}</td>
                    <td className="p-3">
                      <span className="font-black text-blue-300 text-xs px-2 py-0.5 rounded-md bg-[#182a5a] border border-blue-500">{u.role}</span>
                    </td>
                    <td className="p-3 text-slate-100 font-semibold">{u.phone}</td>
                    <td className="p-3 text-emerald-300 font-black">Đang kích hoạt</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Audit */}
      {activeTab === 'audit' && (
        <div className="bg-[#0b1326] rounded-2xl p-5 border border-slate-700/90 shadow-lg space-y-4">
          <h3 className="font-black text-base text-white">Nhật Ký An Toàn Hệ Thống (Audit Logs)</h3>
          <div className="divide-y divide-slate-700/80">
            {auditLogs.map((log) => (
              <div key={log.id} className="py-3 flex items-center justify-between text-xs hover:bg-[#121c38]/50 px-2 rounded-lg transition-colors">
                <div>
                  <span className="font-black text-white">{log.userName}</span>:{' '}
                  <span className="font-black text-blue-300">[{log.action}]</span>{' '}
                  <span className="text-slate-100 font-medium">{log.details}</span>
                </div>
                <span className="text-slate-300 font-mono text-xs font-semibold">{log.timestamp}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
