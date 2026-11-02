-- ==============================================================================
-- SMART CLASS - QUẢN LÝ LỚP HỌC THÔNG MINH
-- Database Schema: PostgreSQL / Supabase with Row Level Security (RLS)
-- Designed for 4 Roles: ADMIN, TEACHER, STUDENT, PARENT
-- Multi-Tenant & 12 Grade Levels Architecture
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. SCHOOLS / ORGANIZATIONS
CREATE TABLE IF NOT EXISTS schools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(100),
    principal_name VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PROFILES & ROLES
CREATE TYPE user_role AS ENUM ('ADMIN', 'TEACHER', 'STUDENT', 'PARENT');

CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY, -- references auth.users(id)
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    email VARCHAR(100) UNIQUE NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    role user_role NOT NULL DEFAULT 'STUDENT',
    avatar_url TEXT,
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ACADEMIC YEARS
CREATE TABLE IF NOT EXISTS academic_years (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL, -- e.g. "2024 - 2025"
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_current BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. 12 GRADE LEVELS (KHỐI 1 - KHỐI 12)
CREATE TABLE IF NOT EXISTS grade_levels (
    id SERIAL PRIMARY KEY,
    level INTEGER UNIQUE NOT NULL CHECK (level BETWEEN 1 AND 12),
    name VARCHAR(50) NOT NULL,
    description TEXT
);

INSERT INTO grade_levels (level, name, description) VALUES
(1, 'Khối 1', 'Tiểu học - Lớp 1'),
(2, 'Khối 2', 'Tiểu học - Lớp 2'),
(3, 'Khối 3', 'Tiểu học - Lớp 3'),
(4, 'Khối 4', 'Tiểu học - Lớp 4'),
(5, 'Khối 5', 'Tiểu học - Lớp 5'),
(6, 'Khối 6', 'THCS - Lớp 6'),
(7, 'Khối 7', 'THCS - Lớp 7'),
(8, 'Khối 8', 'THCS - Lớp 8'),
(9, 'Khối 9', 'THCS - Lớp 9'),
(10, 'Khối 10', 'THPT - Lớp 10'),
(11, 'Khối 11', 'THPT - Lớp 11'),
(12, 'Khối 12', 'THPT - Lớp 12')
ON CONFLICT (level) DO NOTHING;

-- 6. SUBJECTS
CREATE TABLE IF NOT EXISTS subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    code VARCHAR(30) NOT NULL,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. CLASSES
CREATE TABLE IF NOT EXISTS classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    academic_year_id UUID REFERENCES academic_years(id) ON DELETE RESTRICT,
    grade_level INTEGER NOT NULL CHECK (grade_level BETWEEN 1 AND 12),
    name VARCHAR(100) NOT NULL,
    room VARCHAR(50),
    homeroom_teacher_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    color_theme VARCHAR(50) DEFAULT '#2563EB',
    join_code VARCHAR(20) UNIQUE,
    status VARCHAR(20) DEFAULT 'ACTIVE', -- ACTIVE, ARCHIVED
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. STUDENTS & PARENT INFORMATION
CREATE TYPE student_status AS ENUM ('STUDYING', 'SUSPENDED', 'TRANSFERRED', 'DROPPED');

CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    student_code VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender VARCHAR(10) CHECK (gender IN ('Nam', 'Nữ')),
    class_id UUID REFERENCES classes(id) ON DELETE RESTRICT, -- RESTRICT: Cannot delete if student assigned to active class
    roll_number INTEGER,
    team_number INTEGER,
    status student_status DEFAULT 'STUDYING',
    -- Parent Details directly linked or in parent table
    parent_name VARCHAR(150) NOT NULL,
    parent_phone VARCHAR(20) NOT NULL,
    parent_email VARCHAR(100),
    parent_address TEXT NOT NULL,
    parent_relationship VARCHAR(50) DEFAULT 'Bố/Mẹ',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. PARENT ACCOUNT LINK
CREATE TABLE IF NOT EXISTS student_parents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    parent_profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    relationship VARCHAR(50),
    is_primary BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id, parent_profile_id)
);

-- 10. ATTENDANCE SESSIONS & RECORDS
CREATE TYPE attendance_status AS ENUM ('PRESENT', 'EXCUSED_ABSENCE', 'UNEXCUSED_ABSENCE', 'LATE', 'EARLY_LEAVE');

CREATE TABLE IF NOT EXISTS attendance_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    attendance_date DATE NOT NULL,
    period INTEGER DEFAULT 1,
    status attendance_status NOT NULL DEFAULT 'PRESENT',
    reason TEXT,
    recorded_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (class_id, student_id, attendance_date, period)
);

-- 11. ASSIGNMENTS & SUBMISSIONS
CREATE TABLE IF NOT EXISTS assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    teacher_id UUID NOT NULL REFERENCES profiles(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    subject VARCHAR(100) NOT NULL,
    max_score NUMERIC(5,2) DEFAULT 10.0,
    due_date TIMESTAMPTZ NOT NULL,
    status VARCHAR(20) DEFAULT 'PUBLISHED',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    content TEXT,
    attachment_urls TEXT[],
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    score NUMERIC(5,2),
    feedback TEXT,
    status VARCHAR(30) DEFAULT 'SUBMITTED', -- SUBMITTED, LATE, GRADED, RESUBMIT_REQUIRED
    graded_by UUID REFERENCES profiles(id),
    graded_at TIMESTAMPTZ
);

-- 12. GRADES (GRADEBOOK)
CREATE TABLE IF NOT EXISTS grades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    subject VARCHAR(100) NOT NULL,
    semester VARCHAR(10) DEFAULT 'HK1',
    oral_score NUMERIC(4,2),
    test_15m NUMERIC(4,2),
    test_45m NUMERIC(4,2),
    mid_term NUMERIC(4,2),
    final_term NUMERIC(4,2),
    average_score NUMERIC(4,2),
    updated_by UUID REFERENCES profiles(id),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (student_id, class_id, subject, semester)
);

-- 13. AUDIT LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id),
    user_name VARCHAR(150),
    action VARCHAR(100) NOT NULL,
    details TEXT,
    ip_address VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE grades ENABLE ROW LEVEL SECURITY;

-- ADMIN: Full Access
CREATE POLICY admin_all ON profiles FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN')
);

-- TEACHER: Access Classes taught & students in those classes
CREATE POLICY teacher_classes ON classes FOR ALL USING (
    homeroom_teacher_id = auth.uid() OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN')
);

CREATE POLICY teacher_students ON students FOR ALL USING (
    EXISTS (
        SELECT 1 FROM classes 
        WHERE classes.id = students.class_id AND (classes.homeroom_teacher_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'))
    )
);

-- PARENT: Only access linked children
CREATE POLICY parent_students ON students FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM student_parents 
        WHERE student_parents.student_id = students.id AND student_parents.parent_profile_id = auth.uid()
    )
);

-- STUDENT: Only access self
CREATE POLICY student_self ON students FOR SELECT USING (
    profile_id = auth.uid()
);
