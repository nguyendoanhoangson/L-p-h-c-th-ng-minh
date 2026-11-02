import {
  Classroom,
  Student,
  AttendanceRecord,
  Assignment,
  Quiz,
  GradeItem,
  BehaviorRecord,
  Announcement,
  AuditLog,
  TimetableData,
  TimetableScheduleType,
} from '../types';
import {
  INITIAL_ACADEMIC_YEAR,
  INITIAL_CLASSES,
  INITIAL_STUDENTS,
  INITIAL_ATTENDANCE,
  INITIAL_ASSIGNMENTS,
  INITIAL_QUIZZES,
  INITIAL_GRADES,
  INITIAL_BEHAVIORS,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_AUDIT_LOGS,
  INITIAL_TIMETABLES,
  DEFAULT_DAYS,
  DEFAULT_PERIODS,
} from '../data/mockData';

const STORAGE_KEYS = {
  ACADEMIC_YEAR: 'smartclass_academic_year',
  CLASSES: 'smartclass_classes',
  STUDENTS: 'smartclass_students',
  ATTENDANCE: 'smartclass_attendance',
  ASSIGNMENTS: 'smartclass_assignments',
  QUIZZES: 'smartclass_quizzes',
  GRADES: 'smartclass_grades',
  BEHAVIORS: 'smartclass_behaviors',
  ANNOUNCEMENTS: 'smartclass_announcements',
  AUDIT_LOGS: 'smartclass_audit_logs',
  TIMETABLES: 'smartclass_timetables',
};


// Helper for local storage with fallback
function getStored<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw);
  } catch {
    return defaultValue;
  }
}

function setStored<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn('Storage save failed:', err);
  }
}

export const storageService = {
  // ACADEMIC YEAR
  getAcademicYear(): string {
    return getStored(STORAGE_KEYS.ACADEMIC_YEAR, INITIAL_ACADEMIC_YEAR);
  },
  saveAcademicYear(year: string): void {
    setStored(STORAGE_KEYS.ACADEMIC_YEAR, year.trim());
    this.addAuditLog('CẬP NHẬT NĂM HỌC', `Đổi năm học thành công: ${year}`);
  },

  // CLASSES
  getClasses(): Classroom[] {
    return getStored(STORAGE_KEYS.CLASSES, INITIAL_CLASSES);
  },
  saveClass(classroom: Classroom): void {
    const classes = this.getClasses();
    const index = classes.findIndex((c) => c.id === classroom.id);
    if (index >= 0) {
      classes[index] = classroom;
      this.addAuditLog('CẬP NHẬT LỚP HỌC', `Cập nhật thông tin lớp: ${classroom.name}`);
    } else {
      classes.unshift(classroom);
      this.addAuditLog('TẠO LỚP HỌC MỚI', `Tạo lớp mới: ${classroom.name} (Khối ${classroom.gradeLevel})`);
    }
    setStored(STORAGE_KEYS.CLASSES, classes);
  },
  deleteClass(classId: string, force = true): { success: boolean; message: string } {
    const classes = this.getClasses();
    const target = classes.find((c) => c.id === classId);
    if (!target) {
      return { success: false, message: 'Không tìm thấy lớp học cần xóa' };
    }

    const students = this.getStudents();
    const hasStudents = students.some((s) => s.classId === classId && s.status === 'STUDYING');
    if (hasStudents && !force) {
      return {
        success: false,
        message: 'Không thể xóa lớp học này vì hiện tại vẫn còn học sinh đang theo học!',
      };
    }

    // Unassign students from deleted class or clean up
    const updatedStudents = students.map((s) =>
      s.classId === classId ? { ...s, classId: '', className: 'Chưa xếp lớp' } : s
    );
    setStored(STORAGE_KEYS.STUDENTS, updatedStudents);

    const remainingClasses = classes.filter((c) => c.id !== classId);
    setStored(STORAGE_KEYS.CLASSES, remainingClasses);
    this.addAuditLog('XÓA LỚP HỌC', `Đã xóa lớp học: ${target.name} (ID: ${classId})`);
    return { success: true, message: `Đã xóa lớp học "${target.name}" thành công` };
  },

  // STUDENTS
  getStudents(): Student[] {
    return getStored(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
  },
  saveStudent(student: Student): void {
    const students = this.getStudents();
    const index = students.findIndex((s) => s.id === student.id);
    if (index >= 0) {
      students[index] = student;
      this.addAuditLog('CẬP NHẬT HỌC SINH', `Cập nhật thông tin học sinh: ${student.fullName} (${student.studentCode})`);
    } else {
      students.unshift(student);
      this.addAuditLog('THÊM HỌC SINH MỚI', `Thêm mới học sinh: ${student.fullName} (${student.studentCode})`);
    }
    setStored(STORAGE_KEYS.STUDENTS, students);
  },
  bulkImportStudents(newStudents: Student[]): number {
    const current = this.getStudents();
    const updated = [...newStudents, ...current];
    setStored(STORAGE_KEYS.STUDENTS, updated);
    this.addAuditLog('IMPORT HỌC SINH', `Import thành công ${newStudents.length} học sinh từ file Excel/CSV`);
    return newStudents.length;
  },

  /**
   * Delete Student
   */
  canDeleteStudent(_student: Student): { canDelete: boolean; reason?: string } {
    return { canDelete: true };
  },

  deleteStudent(studentId: string): { success: boolean; message: string } {
    const student = this.getStudents().find((s) => s.id === studentId);
    if (!student) {
      return { success: false, message: 'Không tìm thấy hồ sơ học sinh!' };
    }

    const students = this.getStudents().filter((s) => s.id !== studentId);
    setStored(STORAGE_KEYS.STUDENTS, students);
    this.addAuditLog('XÓA HỌC SINH', `Đã xóa học sinh: ${student.fullName} (${student.studentCode})`);
    return { success: true, message: `Đã xóa học sinh ${student.fullName} thành công.` };
  },

  // ATTENDANCE
  getAttendance(classId?: string, date?: string): AttendanceRecord[] {
    const list = getStored(STORAGE_KEYS.ATTENDANCE, INITIAL_ATTENDANCE);
    return list.filter((a) => {
      if (classId && a.classId !== classId) return false;
      if (date && a.date !== date) return false;
      return true;
    });
  },
  saveAttendanceBatch(records: AttendanceRecord[]): void {
    const current = getStored<AttendanceRecord[]>(STORAGE_KEYS.ATTENDANCE, INITIAL_ATTENDANCE);
    const map = new Map<string, AttendanceRecord>();
    current.forEach((r) => map.set(`${r.classId}-${r.studentId}-${r.date}-${r.period}`, r));
    records.forEach((r) => map.set(`${r.classId}-${r.studentId}-${r.date}-${r.period}`, r));
    const merged = Array.from(map.values());
    setStored(STORAGE_KEYS.ATTENDANCE, merged);
    this.addAuditLog('LƯU ĐIỂM DANH', `Đã lưu điểm danh cho ${records.length} học sinh`);
  },

  // ASSIGNMENTS
  getAssignments(): Assignment[] {
    return getStored(STORAGE_KEYS.ASSIGNMENTS, INITIAL_ASSIGNMENTS);
  },
  saveAssignment(assignment: Assignment): void {
    const list = this.getAssignments();
    const index = list.findIndex((a) => a.id === assignment.id);
    if (index >= 0) {
      list[index] = assignment;
    } else {
      list.unshift(assignment);
    }
    setStored(STORAGE_KEYS.ASSIGNMENTS, list);
    this.addAuditLog('LƯU BÀI TẬP', `Bài tập: ${assignment.title}`);
  },

  // QUIZZES
  getQuizzes(): Quiz[] {
    return getStored(STORAGE_KEYS.QUIZZES, INITIAL_QUIZZES);
  },
  saveQuiz(quiz: Quiz): void {
    const list = this.getQuizzes();
    const idx = list.findIndex((q) => q.id === quiz.id);
    if (idx >= 0) {
      list[idx] = quiz;
    } else {
      list.unshift(quiz);
    }
    setStored(STORAGE_KEYS.QUIZZES, list);
    this.addAuditLog('LƯU ĐỀ KIỂM TRA', `Đề kiểm tra: ${quiz.title}`);
  },
  saveQuizzes(quizzes: Quiz[]): void {
    setStored(STORAGE_KEYS.QUIZZES, quizzes);
  },

  // GRADES
  getGrades(classId?: string): GradeItem[] {
    const list = getStored<GradeItem[]>(STORAGE_KEYS.GRADES, INITIAL_GRADES);
    if (!classId) return list;
    return list.filter((g) => g.classId === classId);
  },
  saveGrade(grade: GradeItem): void {
    const list = getStored<GradeItem[]>(STORAGE_KEYS.GRADES, INITIAL_GRADES);
    const index = list.findIndex((g) => g.studentId === grade.studentId && g.subject === grade.subject);
    if (index >= 0) {
      list[index] = grade;
    } else {
      list.push(grade);
    }
    setStored(STORAGE_KEYS.GRADES, list);
    this.addAuditLog('CẬP NHẬT ĐIỂM', `Cập nhật điểm môn ${grade.subject} cho ${grade.studentName}`);
  },

  // BEHAVIORS
  getBehaviors(): BehaviorRecord[] {
    return getStored(STORAGE_KEYS.BEHAVIORS, INITIAL_BEHAVIORS);
  },
  addBehavior(rec: BehaviorRecord): void {
    const list = this.getBehaviors();
    list.unshift(rec);
    setStored(STORAGE_KEYS.BEHAVIORS, list);
  },

  // ANNOUNCEMENTS
  getAnnouncements(): Announcement[] {
    return getStored(STORAGE_KEYS.ANNOUNCEMENTS, INITIAL_ANNOUNCEMENTS);
  },
  addAnnouncement(ann: Announcement): void {
    const list = this.getAnnouncements();
    list.unshift(ann);
    setStored(STORAGE_KEYS.ANNOUNCEMENTS, list);
  },

  // AUDIT LOGS
  getAuditLogs(): AuditLog[] {
    return getStored(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
  },
  addAuditLog(action: string, details: string, userName = 'Thầy Nguyễn Văn Hùng'): void {
    const logs = this.getAuditLogs();
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      userId: 'usr-current',
      userName,
      action,
      details,
      timestamp: new Date().toLocaleString('vi-VN'),
    };
    logs.unshift(newLog);
    setStored(STORAGE_KEYS.AUDIT_LOGS, logs.slice(0, 100)); // retain last 100
  },

  // TIMETABLES
  getTimetables(): Record<string, TimetableData> {
    return getStored(STORAGE_KEYS.TIMETABLES, INITIAL_TIMETABLES);
  },
  getTimetable(type: TimetableScheduleType, targetId: string, targetName?: string): TimetableData {
    const all = this.getTimetables();
    const key = `${type}_${targetId}`;
    if (all[key]) {
      return all[key];
    }
    const newTimetable: TimetableData = {
      id: key,
      type,
      targetId,
      targetName: targetName || targetId,
      days: [...DEFAULT_DAYS],
      periods: [...DEFAULT_PERIODS],
      cells: {},
      updatedAt: new Date().toISOString(),
    };
    all[key] = newTimetable;
    setStored(STORAGE_KEYS.TIMETABLES, all);
    return newTimetable;
  },
  saveTimetable(timetable: TimetableData): void {
    const all = this.getTimetables();
    timetable.updatedAt = new Date().toISOString();
    all[timetable.id] = timetable;
    setStored(STORAGE_KEYS.TIMETABLES, all);
    this.addAuditLog('CẬP NHẬT THỜI KHÓA BIỂU', `Cập nhật thời khóa biểu cho ${timetable.targetName}`);
  },

  // Reset to initial seed
  resetAllToSeed(): void {
    localStorage.clear();
    setStored(STORAGE_KEYS.ACADEMIC_YEAR, INITIAL_ACADEMIC_YEAR);
    setStored(STORAGE_KEYS.CLASSES, INITIAL_CLASSES);
    setStored(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
    setStored(STORAGE_KEYS.ATTENDANCE, INITIAL_ATTENDANCE);
    setStored(STORAGE_KEYS.ASSIGNMENTS, INITIAL_ASSIGNMENTS);
    setStored(STORAGE_KEYS.QUIZZES, INITIAL_QUIZZES);
    setStored(STORAGE_KEYS.GRADES, INITIAL_GRADES);
    setStored(STORAGE_KEYS.BEHAVIORS, INITIAL_BEHAVIORS);
    setStored(STORAGE_KEYS.ANNOUNCEMENTS, INITIAL_ANNOUNCEMENTS);
    setStored(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
    setStored(STORAGE_KEYS.TIMETABLES, INITIAL_TIMETABLES);
  },
};

