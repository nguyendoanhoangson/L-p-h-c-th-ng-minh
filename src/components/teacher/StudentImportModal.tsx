import React, { useState } from 'react';
import { X, FileSpreadsheet, Download, Upload, CheckCircle2, AlertCircle, Users } from 'lucide-react';
import { Student, Classroom } from '../../types';
import { storageService } from '../../services/storageService';
import { useNotification } from '../../contexts/NotificationContext';

interface StudentImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImported: () => void;
  currentClass?: Classroom | null;
}

export const StudentImportModal: React.FC<StudentImportModalProps> = ({
  isOpen,
  onClose,
  onImported,
  currentClass,
}) => {
  const { success, error } = useNotification();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [fileName, setFileName] = useState<string>('');
  const [parsedStudents, setParsedStudents] = useState<Student[]>([]);

  if (!isOpen) return null;

  const handleSimulatedFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const baseCode = Math.floor(1000 + Math.random() * 9000);
    const mockImportedList: Student[] = [
      {
        id: `stu-imp-${Date.now()}-1`,
        studentCode: `HS2024-${baseCode + 1}`,
        fullName: 'Ngô Thanh Tùng',
        dob: '2008-04-18',
        gender: 'Nam',
        classId: currentClass?.id || 'cls-10a1',
        className: currentClass?.name || '10A1 - Chuyên Toán',
        gradeLevel: currentClass?.gradeLevel || 10,
        rollNumber: 6,
        teamNumber: 3,
        status: 'STUDYING',
        parent: {
          fatherOrMotherName: 'Ngô Văn Sơn',
          phone: '0978665544',
          email: 'son.ngo@gmail.com',
          permanentAddress: 'Số 12 phố Huế, Hàng Bài, Hoàn Kiếm, Hà Nội',
          relationship: 'Bố',
        },
        createdAt: new Date().toISOString().split('T')[0],
      },
      {
        id: `stu-imp-${Date.now()}-2`,
        studentCode: `HS2024-${baseCode + 2}`,
        fullName: 'Trịnh Hoàng Yến',
        dob: '2008-09-02',
        gender: 'Nữ',
        classId: currentClass?.id || 'cls-10a1',
        className: currentClass?.name || '10A1 - Chuyên Toán',
        gradeLevel: currentClass?.gradeLevel || 10,
        rollNumber: 7,
        teamNumber: 4,
        status: 'STUDYING',
        parent: {
          fatherOrMotherName: 'Trịnh Quốc Toản',
          phone: '0912443322',
          email: 'toan.trinh@gmail.com',
          permanentAddress: 'Căn 504 Tòa NO4 Hoàng Đạo Thúy, Cầu Giấy, Hà Nội',
          relationship: 'Bố',
        },
        createdAt: new Date().toISOString().split('T')[0],
      },
      {
        id: `stu-imp-${Date.now()}-3`,
        studentCode: `HS2024-${baseCode + 3}`,
        fullName: 'Bùi Gia Huy',
        dob: '2008-02-14',
        gender: 'Nam',
        classId: currentClass?.id || 'cls-10a1',
        className: currentClass?.name || '10A1 - Chuyên Toán',
        gradeLevel: currentClass?.gradeLevel || 10,
        rollNumber: 8,
        teamNumber: 4,
        status: 'STUDYING',
        parent: {
          fatherOrMotherName: 'Bùi Thị Lan',
          phone: '0989332211',
          email: 'lan.bui@gmail.com',
          permanentAddress: 'Số 88 Phố Chùa Láng, Láng Thượng, Đống Đa, Hà Nội',
          relationship: 'Mẹ',
        },
        createdAt: new Date().toISOString().split('T')[0],
      },
    ];

    setParsedStudents(mockImportedList);
    setStep(2);
  };

  const handleDownloadTemplate = () => {
    const csvContent =
      'STT,MaHocSinh,HoVaTen,NgaySinh,GioiTinh,TenBoMe,SDTPhuHuynh,EmailPhuHuynh,DiaChiThuongTru,MoiQuanHe\n' +
      '1,HS2024-1006,Nguyen Van An,2008-06-15,Nam,Nguyen Van Binh,0912345678,binh@gmail.com,So 10 Pho Hue Ha Noi,Bo\n' +
      '2,HS2024-1007,Tran Thi Mai,2008-08-20,Nu,Tran Quoc Bao,0987654321,bao@gmail.com,So 25 Kim Ma Ba Dinh Ha Noi,Bo';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'smartclass_danh_sach_hoc_sinh_mau.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    success('Đã tải xuống file mẫu danh sách học sinh (.csv)');
  };

  const handleConfirmImport = () => {
    if (parsedStudents.length === 0) {
      error('Không có dữ liệu hợp lệ để import!');
      return;
    }

    const count = storageService.bulkImportStudents(parsedStudents);
    success(`Import thành công ${count} học sinh vào hệ thống!`);
    onImported();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-[#0c1429] rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-700/80 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-[#080d1b]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Import Danh Sách Học Sinh từ Excel / CSV</h2>
              <p className="text-xs text-slate-400">
                Thêm nhanh hàng loạt học sinh và thông tin phụ huynh vào lớp
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Step indicator */}
          <div className="flex items-center justify-between border-b pb-4 border-slate-800">
            <div className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  step === 1 ? 'bg-blue-600 text-white' : 'bg-emerald-600 text-white'
                }`}
              >
                1
              </div>
              <span className="text-xs font-semibold text-slate-200">Tải mẫu & Chọn file</span>
            </div>
            <div className="w-12 h-0.5 bg-slate-800" />
            <div className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  step === 2 ? 'bg-blue-600 text-white' : step > 2 ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                2
              </div>
              <span className="text-xs font-semibold text-slate-200">Xem trước & Kiểm tra</span>
            </div>
            <div className="w-12 h-0.5 bg-slate-800" />
            <div className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  step === 3 ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                3
              </div>
              <span className="text-xs font-semibold text-slate-200">Hoàn tất</span>
            </div>
          </div>

          {step === 1 && (
            <div className="space-y-6">
              {/* Template block */}
              <div className="p-4 bg-[#111c38] rounded-xl border border-blue-900/60 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-blue-200">1. Tải về file mẫu Excel chuẩn</h4>
                  <p className="text-xs text-blue-300/80 mt-0.5">
                    File mẫu bao gồm các cột: Mã HS, Họ tên, Ngày sinh, Giới tính, Tên bố mẹ, SĐT, Email, Địa chỉ thường trú.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-blue-300 bg-[#0c142b] border border-blue-700/80 rounded-xl shadow-xs hover:bg-[#152349] transition-colors cursor-pointer flex-shrink-0"
                >
                  <Download className="w-4 h-4" />
                  <span>Tải file mẫu (.CSV)</span>
                </button>
              </div>

              {/* Upload area */}
              <div className="border-2 border-dashed border-slate-700 hover:border-blue-500 rounded-2xl p-8 text-center transition-colors bg-[#080e1e]">
                <div className="mx-auto w-12 h-12 rounded-full bg-blue-950 text-blue-400 flex items-center justify-center mb-3 border border-blue-800/80">
                  <Upload className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-semibold text-slate-200 mb-1">
                  2. Kéo thả file Excel hoặc Click để chọn file từ máy
                </h4>
                <p className="text-xs text-slate-400 mb-4">Hỗ trợ định dạng .xlsx, .xls, .csv (tối đa 500 học sinh/lần)</p>

                <label className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-md cursor-pointer transition-colors">
                  <Upload className="w-4 h-4" />
                  <span>Chọn file từ thiết bị</span>
                  <input
                    type="file"
                    accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                    onChange={handleSimulatedFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-emerald-950/60 border border-emerald-800/80 p-3 rounded-xl">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <div>
                    <span className="text-xs font-semibold text-emerald-200">
                      File: <strong>{fileName}</strong>
                    </span>
                    <span className="text-xs text-emerald-300/80 block">
                      Đã đọc được {parsedStudents.length} học sinh hợp lệ. Không có lỗi cấu trúc cột.
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs text-slate-400 hover:text-white underline cursor-pointer"
                >
                  Chọn lại file
                </button>
              </div>

              <div className="border border-slate-800 rounded-xl overflow-hidden max-h-60 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#080d1c] text-slate-300 font-semibold sticky top-0 border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3">Mã HS</th>
                      <th className="py-2.5 px-3">Họ và Tên</th>
                      <th className="py-2.5 px-3">Ngày sinh</th>
                      <th className="py-2.5 px-3">Phụ huynh</th>
                      <th className="py-2.5 px-3">SĐT PH</th>
                      <th className="py-2.5 px-3">Địa chỉ thường trú</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 bg-[#0b1328]">
                    {parsedStudents.map((st, idx) => (
                      <tr key={idx} className="hover:bg-[#121c3a]">
                        <td className="py-2 px-3 font-mono font-medium text-blue-400">{st.studentCode}</td>
                        <td className="py-2 px-3 font-semibold text-white">{st.fullName}</td>
                        <td className="py-2 px-3 text-slate-300">{st.dob}</td>
                        <td className="py-2 px-3 text-slate-300 font-medium">{st.parent.fatherOrMotherName}</td>
                        <td className="py-2 px-3 text-slate-400">{st.parent.phone}</td>
                        <td className="py-2 px-3 text-slate-400 max-w-xs truncate">{st.parent.permanentAddress}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#080d1b] border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            Hủy
          </button>
          {step === 2 && (
            <button
              type="button"
              onClick={handleConfirmImport}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-md transition-colors cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Xác nhận Import {parsedStudents.length} học sinh</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
