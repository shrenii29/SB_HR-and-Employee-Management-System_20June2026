-- ============================================================
--  HR & Employee Management System — Database Schema
-- ============================================================

CREATE DATABASE IF NOT EXISTS hr_management;
USE hr_management;

-- ─────────────────────────────────────────────
-- 1. USERS  (authentication anchor)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            INT           PRIMARY KEY AUTO_INCREMENT,
  email         VARCHAR(255)  UNIQUE NOT NULL,
  password      VARCHAR(255)  NOT NULL,
  role          ENUM('admin','employee') NOT NULL DEFAULT 'employee',
  is_active     BOOLEAN       NOT NULL DEFAULT TRUE,
  refresh_token TEXT,
  created_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role  (role)
);

-- ─────────────────────────────────────────────
-- 2. DEPARTMENTS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS departments (
  id          INT          PRIMARY KEY AUTO_INCREMENT,
  name        VARCHAR(150) NOT NULL UNIQUE,
  description TEXT,
  created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ─────────────────────────────────────────────
-- 3. EMPLOYEES
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS employees (
  id                        INT           PRIMARY KEY AUTO_INCREMENT,
  user_id                   INT           NOT NULL UNIQUE,
  employee_code             VARCHAR(20)   NOT NULL UNIQUE,
  first_name                VARCHAR(100)  NOT NULL,
  last_name                 VARCHAR(100)  NOT NULL,
  phone                     VARCHAR(20),
  department_id             INT,
  designation               VARCHAR(100),
  date_of_joining           DATE,
  date_of_birth             DATE,
  gender                    ENUM('male','female','other'),
  address                   TEXT,
  city                      VARCHAR(100),
  state                     VARCHAR(100),
  pincode                   VARCHAR(10),
  emergency_contact_name    VARCHAR(100),
  emergency_contact_phone   VARCHAR(20),
  emergency_contact_relation VARCHAR(60),
  profile_image             VARCHAR(500),
  created_at                TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at                TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id)       REFERENCES users(id)       ON DELETE CASCADE,
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
  INDEX idx_emp_user   (user_id),
  INDEX idx_emp_dept   (department_id),
  INDEX idx_emp_code   (employee_code)
);

-- ─────────────────────────────────────────────
-- 4. LEAVE TYPES
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS leave_types (
  id           INT          PRIMARY KEY AUTO_INCREMENT,
  name         VARCHAR(100) NOT NULL UNIQUE,
  days_allowed INT          NOT NULL DEFAULT 0,
  created_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ─────────────────────────────────────────────
-- 5. LEAVE REQUESTS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS leave_requests (
  id             INT          PRIMARY KEY AUTO_INCREMENT,
  employee_id    INT          NOT NULL,
  leave_type_id  INT          NOT NULL,
  start_date     DATE         NOT NULL,
  end_date       DATE         NOT NULL,
  total_days     INT          NOT NULL DEFAULT 1,
  reason         TEXT         NOT NULL,
  status         ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  admin_comment  TEXT,
  reviewed_by    INT,
  reviewed_at    TIMESTAMP    NULL,
  created_at     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id)   REFERENCES employees(id)  ON DELETE CASCADE,
  FOREIGN KEY (leave_type_id) REFERENCES leave_types(id),
  FOREIGN KEY (reviewed_by)   REFERENCES users(id)      ON DELETE SET NULL,
  INDEX idx_leave_emp    (employee_id),
  INDEX idx_leave_status (status)
);

-- ─────────────────────────────────────────────
-- 6. ATTENDANCE
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS attendance (
  id          INT     PRIMARY KEY AUTO_INCREMENT,
  employee_id INT     NOT NULL,
  date        DATE    NOT NULL,
  check_in    TIME,
  check_out   TIME,
  status      ENUM('present','absent','late','half_day','on_leave') NOT NULL DEFAULT 'present',
  notes       TEXT,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_attendance (employee_id, date),
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  INDEX idx_att_date (date),
  INDEX idx_att_emp  (employee_id)
);

-- ─────────────────────────────────────────────
-- 7. PAYROLL
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payroll (
  id                   INT            PRIMARY KEY AUTO_INCREMENT,
  employee_id          INT            NOT NULL,
  month                TINYINT        NOT NULL COMMENT '1-12',
  year                 SMALLINT       NOT NULL,
  basic_salary         DECIMAL(12,2)  NOT NULL DEFAULT 0,
  hra                  DECIMAL(12,2)  NOT NULL DEFAULT 0,
  transport_allowance  DECIMAL(12,2)  NOT NULL DEFAULT 0,
  other_allowances     DECIMAL(12,2)  NOT NULL DEFAULT 0,
  tax_deduction        DECIMAL(12,2)  NOT NULL DEFAULT 0,
  pf_deduction         DECIMAL(12,2)  NOT NULL DEFAULT 0,
  other_deductions     DECIMAL(12,2)  NOT NULL DEFAULT 0,
  net_salary           DECIMAL(12,2)  NOT NULL DEFAULT 0,
  status               ENUM('pending','processed','paid') NOT NULL DEFAULT 'pending',
  payment_date         DATE,
  notes                TEXT,
  created_at           TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at           TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_payroll (employee_id, month, year),
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  INDEX idx_pay_emp  (employee_id),
  INDEX idx_pay_year (year, month)
);

-- ============================================================
--  SEED DATA
-- ============================================================

-- Departments
INSERT INTO departments (name, description) VALUES
  ('Engineering',        'Software development and infrastructure'),
  ('Human Resources',    'People operations, hiring, culture'),
  ('Finance',            'Accounting, payroll, budgeting'),
  ('Marketing',          'Brand, campaigns, content'),
  ('Operations',         'Facilities, supply chain, logistics');

-- Leave types
INSERT INTO leave_types (name, days_allowed) VALUES
  ('Casual Leave',     12),
  ('Sick Leave',       10),
  ('Earned Leave',     15),
  ('Maternity Leave', 180),
  ('Paternity Leave',   5),
  ('Unpaid Leave',      0);

-- Admin user  (password: Admin@123)
-- bcrypt hash generated outside; replace with your own at runtime
INSERT INTO users (email, password, role) VALUES
  ('admin@hrms.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');

-- Admin employee profile
INSERT INTO employees
  (user_id, employee_code, first_name, last_name, phone, department_id,
   designation, date_of_joining, gender)
VALUES
  (1, 'EMP001', 'Admin', 'User', '9999999999', 2,
   'HR Manager', '2022-01-01', 'other');