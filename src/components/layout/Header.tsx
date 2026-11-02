import React, { useState } from 'react';
import {
  Menu,
  Search,
  Bell,
  User,
  Shield,
  GraduationCap,
  Users,
  ChevronDown,
  Sparkles,
  Baby,
  X,
  Download,
  ShieldCheck,
  Copy,
  Check,
  FileText,
  Mail,
} from 'lucide-react';
import { UserRole } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { EditableYear } from '../common/EditableYear';
import { storageService } from '../../services/storageService';

interface HeaderProps {
  onOpenMobileSidebar: () => void;
  onQuickAction?: (action: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileSidebar, onQuickAction }) => {
  const { currentUser, currentRole, switchRole, activeChildId, setActiveChildId, parentChildren, setIsLoginModalOpen } = useAuth();
  const { success } = useNotification();
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [copiedAccount, setCopiedAccount] = useState(false);

  const handleExportAccount = () => {
    const accountData = {
      app: 'SmartClass - Lớp Học Thông Minh',
      version: 'v2.6 Pro',
      account_status: 'TÀI_KHOẢN_CHÍNH_THỨC',
      guest_mode: false,
      note: 'Tài khoản chính thức đã xác thực, không dùng tài khoản khách',
      exported_at: new Date().toLocaleString('vi-VN'),
      account: {
        id: currentUser.id,
        name: currentUser.name,
        email: currentUser.email,
        phone: currentUser.phone || '0912345678',
        role: currentRole,
        role_label: roleLabels[currentRole].label,
        school: 'Trường THCS Chu Văn An',
        academic_year: storageService.getAcademicYear() || '2024 - 2025',
      },
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(accountData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `tai-khoan-chinh-thuc-${currentUser.id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    success(
      `Đã xuất thông tin tài khoản chính thức (${currentUser.name}) thành công. Hệ thống áp dụng tài khoản chính thức, không dùng tài khoản khách.`,
      'Xuất tài khoản'
    );
  };

  const handleCopyAccountInfo = () => {
    const text = `Tài khoản chính thức: ${currentUser.name} | Vai trò: ${roleLabels[currentRole].label} | Email: ${currentUser.email} | SĐT: ${currentUser.phone || '0912345678'} | Trường THCS Chu Văn An (Không dùng tài khoản khách)`;
    navigator.clipboard.writeText(text);
    setCopiedAccount(true);
    success('Đã sao chép thông tin tài khoản chính thức vào clipboard!');
    setTimeout(() => setCopiedAccount(false), 2000);
  };

  const announcements = storageService.getAnnouncements();

  const roleLabels: Record<UserRole, { label: string; icon: React.FC<{ className?: string }>; color: string }> = {
    ADMIN: { label: 'Quản trị viên', icon: Shield, color: 'text-rose-300 bg-rose-950 border-rose-600' },
    TEACHER: { label: 'Giáo viên', icon: User, color: 'text-blue-200 bg-blue-950 border-blue-500' },
    STUDENT: { label: 'Học sinh', icon: GraduationCap, color: 'text-emerald-200 bg-emerald-950 border-emerald-500' },
    PARENT: { label: 'Phụ huynh', icon: Users, color: 'text-purple-200 bg-purple-950 border-purple-500' },
  };

  const CurrentRoleIcon = roleLabels[currentRole].icon;

  return (
    <header className="h-14 sm:h-16 bg-[#0a1022]/95 backdrop-blur-md border-b border-slate-700/80 px-3 sm:px-4 flex items-center justify-between sticky top-0 z-30 shadow-lg">
      {/* Left: Mobile hamburger & Search & Year */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          onClick={onOpenMobileSidebar}
          className="p-1.5 sm:p-2 rounded-xl text-white hover:bg-[#16254e] lg:hidden cursor-pointer flex-shrink-0"
          aria-label="Mở menu"
        >
          <Menu className="w-5 h-5 text-white" />
        </button>

        {/* Academic Year Editable Button */}
        <EditableYear />

        {/* Global Search - Compact width */}
        <div className="relative hidden xl:block w-44 2xl:w-56 flex-shrink-0">
          <Search className="w-3.5 h-3.5 text-blue-300 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm kiếm..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#0f1730] hover:bg-[#152349] focus:bg-[#0f1730] border border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all text-white font-medium placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Right Controls: Parent Child Switcher + Role Switcher + Notif + User */}
      <div className="flex items-center gap-2.5">
        {/* Child switcher if role is PARENT */}
        {currentRole === 'PARENT' && parentChildren.length > 0 && (
          <div className="flex items-center gap-1.5 bg-purple-950 border border-purple-500 rounded-xl px-2.5 py-1 text-xs">
            <Baby className="w-3.5 h-3.5 text-purple-300" />
            <span className="font-bold text-white hidden sm:inline">Con:</span>
            <select
              value={activeChildId || ''}
              onChange={(e) => setActiveChildId(e.target.value)}
              className="bg-transparent font-extrabold text-white outline-none cursor-pointer text-xs"
            >
              {parentChildren.map((ch) => (
                <option key={ch.id} value={ch.id} className="bg-[#0b1224] text-white font-bold">
                  {ch.fullName} ({ch.className})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Quick Role Switcher Pill */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-black transition-all cursor-pointer ${
              roleLabels[currentRole].color
            } shadow-md hover:brightness-125`}
            title="Chuyển đổi vai trò để kiểm thử 4 cổng"
          >
            <CurrentRoleIcon className="w-4 h-4" />
            <span className="text-white font-bold">{roleLabels[currentRole].label}</span>
            <ChevronDown className="w-3.5 h-3.5 text-white opacity-90" />
          </button>

          {showRoleMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowRoleMenu(false)}
              />
              <div className="absolute right-0 mt-2 w-52 bg-[#0c1429] rounded-2xl shadow-2xl border border-slate-600 p-2 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="text-[11px] font-black text-slate-300 uppercase tracking-wider px-2 py-1">
                  Chọn vai trò thử nghiệm:
                </div>
                {(['TEACHER', 'STUDENT', 'PARENT', 'ADMIN'] as UserRole[]).map((r) => {
                  const ItemIcon = roleLabels[r].icon;
                  const isSelected = currentRole === r;
                  return (
                    <button
                      key={r}
                      onClick={() => {
                        switchRole(r);
                        setShowRoleMenu(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                        isSelected ? 'bg-blue-600 text-white shadow-md' : 'text-slate-100 hover:bg-[#16254e] hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <ItemIcon className="w-4 h-4 text-blue-300" />
                        <span>{roleLabels[r].label}</span>
                      </div>
                      {isSelected && <span className="text-[10px] text-blue-200 font-extrabold">Đang bật</span>}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            className="p-2 text-white hover:text-blue-300 hover:bg-[#16254e] rounded-xl transition-colors relative cursor-pointer"
            aria-label="Thông báo"
          >
            <Bell className="w-4 h-4 text-white" />
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 absolute top-1.5 right-1.5 ring-2 ring-[#0a1022]" />
          </button>

          {showNotifMenu && (
            <>
              {/* Click outside backdrop to close */}
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowNotifMenu(false)}
              />
              <div className="absolute right-0 mt-2 w-80 bg-[#0c1429] rounded-2xl shadow-2xl border border-slate-600 p-3 z-50 animate-in fade-in">
                <div className="flex items-center justify-between pb-2 border-b border-slate-700 text-xs font-black text-white">
                  <span>Thông Báo Gần Đây</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-blue-300 font-bold hover:underline cursor-pointer">Đánh dấu đã đọc</span>
                    <button
                      type="button"
                      onClick={() => setShowNotifMenu(false)}
                      className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#16254e] transition-colors cursor-pointer"
                      title="Đóng thông báo"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="py-2 space-y-2 max-h-64 overflow-y-auto">
                  {announcements.map((a) => (
                    <div key={a.id} className="p-2 rounded-xl hover:bg-[#16254e] transition-colors text-xs border border-slate-800">
                      <div className="font-bold text-white leading-snug">{a.title}</div>
                      <div className="text-[11px] text-slate-200 mt-0.5 line-clamp-2">{a.content}</div>
                      <div className="text-[10px] text-blue-300 font-semibold mt-1">{a.authorName} · {a.createdAt}</div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Direct Export Account Button (Không dùng tài khoản khách) */}
        <button
          onClick={handleExportAccount}
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-emerald-500/60 bg-emerald-950/70 hover:bg-emerald-900/90 text-emerald-200 text-xs font-bold transition-all shadow-md shadow-emerald-950/40 cursor-pointer whitespace-nowrap hover:scale-102 active:scale-98"
          title="Xuất hồ sơ tài khoản chính thức (Không dùng tài khoản khách)"
        >
          <Download className="w-3.5 h-3.5 text-emerald-400" />
          <span>Xuất tài khoản</span>
        </button>

        {/* Quick Select Gmail Dialog Trigger */}
        <button
          onClick={() => setIsLoginModalOpen(true)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-cyan-500/50 bg-[#0c1833] hover:bg-[#132349] text-cyan-300 text-xs font-bold transition-all shadow-md cursor-pointer whitespace-nowrap"
          title="Chọn Gmail của từng người (Mở bảng đăng nhập)"
        >
          <Mail className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden md:inline">Chọn Gmail</span>
        </button>

        {/* User Profile Trigger Button */}
        <button
          onClick={() => setShowAccountModal(true)}
          className="flex items-center gap-2 pl-2 border-l border-slate-700 hover:bg-[#142042] p-1 rounded-xl transition-colors cursor-pointer text-left flex-shrink-0"
          title="Xem thông tin và xuất tài khoản chính thức"
        >
          <img
            src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
            alt={currentUser.name}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover ring-2 ring-blue-500 flex-shrink-0"
          />
          <div className="hidden sm:block text-left min-w-0">
            <div className="text-xs font-black text-white leading-tight truncate max-w-20 md:max-w-28 lg:max-w-36">
              {currentUser.name}
            </div>
            <div className="text-[10px] text-slate-300 font-medium truncate max-w-24 md:max-w-32 hidden lg:block">
              {currentUser.email}
            </div>
          </div>
        </button>
      </div>

      {/* Modal: Hồ sơ Tài khoản chính thức (Export tài khoản & Xác nhận Không dùng tài khoản khách) */}
      {showAccountModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fade-in">
          <div className="bg-[#0b1429] border border-blue-500/50 rounded-2xl p-5 max-w-md w-full shadow-2xl relative text-slate-100">
            <button
              onClick={() => setShowAccountModal(false)}
              className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#16254e] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-blue-600/20 border border-blue-500/40 text-blue-400">
                <ShieldCheck className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">Tài khoản chính thức</h3>
                <span className="inline-block text-[11px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-500/40 px-2 py-0.5 rounded-full mt-0.5">
                  ✓ Đã kích hoạt · Không dùng tài khoản khách
                </span>
              </div>
            </div>

            <div className="bg-[#070d1e] rounded-xl border border-slate-700/80 p-3.5 space-y-2.5 mb-4 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-slate-400">Họ và tên:</span>
                <span className="font-black text-white">{currentUser.name}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-slate-400">Vai trò:</span>
                <span className="font-bold text-cyan-300">{roleLabels[currentRole].label}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-slate-400">Email:</span>
                <span className="font-semibold text-slate-200">{currentUser.email}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-slate-400">Số điện thoại:</span>
                <span className="font-semibold text-slate-200">{currentUser.phone || '0912345678'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Cơ sở trường:</span>
                <span className="font-bold text-slate-200">Trường THCS Chu Văn An</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={handleExportAccount}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Export tài khoản (JSON)</span>
              </button>

              <button
                onClick={handleCopyAccountInfo}
                className="flex items-center justify-center gap-2 py-2.5 px-3 bg-[#121f42] hover:bg-[#182a5a] text-slate-200 hover:text-white font-bold text-xs rounded-xl border border-blue-500/40 transition-all cursor-pointer"
              >
                {copiedAccount ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-cyan-400" />}
                <span>{copiedAccount ? 'Đã chép' : 'Sao chép'}</span>
              </button>
            </div>

            <button
              onClick={() => {
                setShowAccountModal(false);
                setIsLoginModalOpen(true);
              }}
              className="w-full mt-2.5 flex items-center justify-center gap-2 py-2.5 px-3 bg-[#0d162d] hover:bg-[#142347] text-cyan-300 font-bold text-xs rounded-xl border border-cyan-500/40 transition-all cursor-pointer"
            >
              <Mail className="w-4 h-4 text-cyan-400" />
              <span>Đổi tài khoản / Mở bảng chọn Gmail</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
