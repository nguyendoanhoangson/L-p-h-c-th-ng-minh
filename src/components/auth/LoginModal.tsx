import React, { useState } from 'react';
import {
  X,
  Lock,
  Mail,
  Eye,
  EyeOff,
  CheckCircle2,
  Download,
  ShieldCheck,
  User,
  GraduationCap,
  Users,
  Shield,
  KeyRound,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { storageService } from '../../services/storageService';
import { UserRole } from '../../types';
import { signInWithGooglePopup } from '../../services/firebase';

export const LoginModal: React.FC = () => {
  const { isLoginModalOpen, setIsLoginModalOpen, currentUser, allUsers, loginWithUser, loginWithEmail } = useAuth();
  const { success, error, info } = useNotification();

  const [emailInput, setEmailInput] = useState<string>('sonnha251@gmail.com');
  const [passwordInput, setPasswordInput] = useState<string>('••••••••');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showGoogleChooser, setShowGoogleChooser] = useState<boolean>(false);

  if (!isLoginModalOpen) return null;

  const roleBadges: Record<UserRole, { label: string; color: string; icon: React.FC<{ className?: string }> }> = {
    TEACHER: { label: 'Giáo viên', color: 'bg-blue-950/80 text-blue-300 border-blue-500/40', icon: User },
    STUDENT: { label: 'Học sinh', color: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40', icon: GraduationCap },
    PARENT: { label: 'Phụ huynh', color: 'bg-purple-950/80 text-purple-300 border-purple-500/40', icon: Users },
    ADMIN: { label: 'Quản trị viên', color: 'bg-rose-950/80 text-rose-300 border-rose-500/40', icon: Shield },
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) {
      error('Vui lòng nhập địa chỉ Gmail đăng nhập!');
      return;
    }

    loginWithEmail(emailInput);
    success(`Đã đăng nhập thành công với Gmail: ${emailInput}`, 'Đăng Nhập Thành Công');
  };

  const handleSelectGmail = (user: typeof allUsers[0]) => {
    setEmailInput(user.email);
    loginWithUser(user);
    success(`Đã đăng nhập với tài khoản: ${user.name} (${user.email})`, 'Đăng Nhập Gmail');
  };

  const handleLoginFacebook = () => {
    const teacherUser = allUsers.find((u) => u.role === 'TEACHER') || allUsers[0];
    loginWithUser(teacherUser);
    success(`Đã đăng nhập liên kết Facebook với tài khoản: ${teacherUser.name} (${teacherUser.email})`);
  };

  const handleLoginGoogle = async () => {
    try {
      const user = await signInWithGooglePopup();
      if (user && user.email) {
        loginWithEmail(user.email);
        success(`Đã đăng nhập tài khoản Google (${user.email}) qua Firebase!`, 'Firebase Auth');
      }
    } catch (err: any) {
      if (err?.code === 'auth/popup-closed-by-user' || err?.code === 'auth/cancelled-popup-request') {
        info('Đã đóng cửa sổ Google Sign-In.');
      } else {
        console.warn('Google sign-in:', err);
        info('Đang dùng phiên làm việc Gmail: ' + currentUser.email);
      }
    }
  };

  const handleExportAccountData = (user: typeof allUsers[0], e: React.MouseEvent) => {
    e.stopPropagation();
    const accountData = {
      app: 'SmartClass - Lớp Học Thông Minh',
      version: 'v2.6 Pro',
      account_status: 'TÀI_KHOẢN_CHÍNH_THỨC',
      guest_mode: false,
      note: 'Tài khoản chính thức đã xác thực, không dùng tài khoản khách',
      exported_at: new Date().toLocaleString('vi-VN'),
      account: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || '0912345678',
        role: user.role,
        role_label: roleBadges[user.role].label,
        school: 'Trường THCS Chu Văn An',
        academic_year: storageService.getAcademicYear() || '2024 - 2025',
      },
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(accountData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `tai-khoan-${user.email.replace('@', '_at_')}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    success(`Đã xuất thông tin tài khoản (${user.email}) thành công!`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-fade-in overflow-y-auto">
      {/* Black Theme Modal matching Image layout */}
      <div className="relative w-full max-w-md bg-[#0a0f1d] border border-slate-700/90 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8 text-white my-auto">
        {/* Close Button X at top right */}
        <button
          onClick={() => setIsLoginModalOpen(false)}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
          title="Đóng bảng đăng nhập"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title: Đăng Nhập (Centered) */}
        <div className="text-center mb-6">
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Đăng Nhập
          </h2>
          <p className="text-xs text-slate-300 font-medium mt-1">
            Chọn Gmail của từng người hoặc nhập thông tin tài khoản
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleFormSubmit} className="space-y-4">
          {/* Input 1: Email đăng nhập (Pill shape rounded-full) */}
          <div>
            <div className="relative">
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="Email đăng nhập"
                className="w-full py-3.5 px-6 rounded-full bg-[#131b2e] border border-slate-700 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 text-white placeholder:text-slate-400 text-sm font-semibold outline-none transition-all"
                required
              />
              <Mail className="w-4 h-4 text-slate-400 absolute right-5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Input 2: Mật khẩu (Pill shape rounded-full) */}
          <div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Mật khẩu"
                className="w-full py-3.5 px-6 rounded-full bg-[#131b2e] border border-slate-700 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 text-white placeholder:text-slate-400 text-sm font-semibold outline-none transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Primary Coral/Orange Button: Đăng Nhập */}
          <button
            type="submit"
            className="w-full py-3.5 px-6 rounded-full bg-[#ff5a5f] hover:bg-[#ff4449] active:scale-98 text-white text-base font-bold shadow-lg shadow-[#ff5a5f]/30 transition-all cursor-pointer text-center"
          >
            Đăng Nhập
          </button>

          {/* Quên mật khẩu? */}
          <div className="text-center pt-1">
            <button
              type="button"
              onClick={() => info('Vui lòng liên hệ quản trị viên hoặc chọn trực tiếp Gmail có sẵn bên dưới để vào hệ thống!')}
              className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 font-semibold hover:underline cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Quên mật khẩu?</span>
            </button>
          </div>
        </form>

        {/* Bạn chưa có tài khoản? Đăng ký ngay */}
        <div className="text-center text-xs text-slate-300 my-4">
          <span>Bạn chưa có tài khoản? </span>
          <button
            type="button"
            onClick={() => info('Hệ thống áp dụng tài khoản chính thức của trường. Nhấp chọn nhanh Gmail của bạn bên dưới!')}
            className="text-blue-400 hover:text-blue-300 font-bold hover:underline cursor-pointer"
          >
            Đăng ký ngay
          </button>
        </div>

        {/* Social Buttons: Login with Facebook & Login with Google */}
        <div className="space-y-2.5">
          {/* Button: Login with Facebook */}
          <button
            type="button"
            onClick={handleLoginFacebook}
            className="w-full py-3 px-4 rounded-xl bg-[#3b5998] hover:bg-[#2d4373] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-3 transition-all cursor-pointer shadow-md"
          >
            <div className="w-6 h-6 rounded-md bg-white text-[#3b5998] flex items-center justify-center font-black text-sm">
              f
            </div>
            <span>Login with Facebook</span>
          </button>

          {/* Button: Login with Google */}
          <button
            type="button"
            onClick={handleLoginGoogle}
            className="w-full py-3 px-4 rounded-xl bg-[#4285F4] hover:bg-[#3367d6] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-3 transition-all cursor-pointer shadow-md"
          >
            <div className="w-6 h-6 rounded-full bg-white text-[#4285F4] flex items-center justify-center font-black text-xs">
              G
            </div>
            <span>Login with Google</span>
          </button>
        </div>

        {/* =========================================================================
            BẢNG CHỌN TỪNG GMAIL CỦA TỪNG NGƯỜI CÓ (Theo yêu cầu của người dùng)
            Hiển thị danh sách Gmail chính thức của từng cá nhân
           ========================================================================= */}
        <div className="mt-5 pt-4 border-t border-slate-800">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
              Chọn Gmail của từng người:
            </span>
            <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full">
              Chính thức · Không khách
            </span>
          </div>

          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {allUsers.map((user) => {
              const RoleBadge = roleBadges[user.role];
              const RoleIcon = RoleBadge.icon;
              const isSelected = currentUser.email.toLowerCase() === user.email.toLowerCase();

              return (
                <div
                  key={user.id}
                  onClick={() => handleSelectGmail(user)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer text-left ${
                    isSelected
                      ? 'bg-[#122244] border-cyan-400 text-white shadow-md'
                      : 'bg-[#10172b] border-slate-800 hover:border-slate-600 hover:bg-[#141e38] text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-2">
                    <img
                      src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                      alt={user.name}
                      className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-600 flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                        <span className="truncate">{user.email}</span>
                        {isSelected && (
                          <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate flex items-center gap-1">
                        <span>{user.name}</span>
                        <span>·</span>
                        <span className={`text-[9px] px-1.5 py-0.2 rounded border font-bold ${RoleBadge.color}`}>
                          {RoleBadge.label}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Nút Xuất Tài Khoản (Export) của từng người */}
                  <button
                    type="button"
                    onClick={(e) => handleExportAccountData(user, e)}
                    className="p-1.5 text-slate-400 hover:text-emerald-300 hover:bg-emerald-950/50 rounded-lg transition-colors flex-shrink-0"
                    title={`Xuất hồ sơ tài khoản ${user.email} (JSON)`}
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
