import {
  pgTable,
  uuid,
  text,
  timestamp,
  date,
  numeric,
  integer,
  boolean,
  jsonb,
  pgEnum,
} from "drizzle-orm/pg-core";
import { tenants } from "./tenants";
import { members } from "./members";

// --- ENUMS ---
export const attendanceStatusEnum = pgEnum("attendance_status", [
  "present",
  "absent",
  "late",
  "excused",
]);

export const studentStatusEnum = pgEnum("student_status", [
  "active",
  "inactive",
  "withdrawn",
  "transferred",
  "graduated",
  "dropout",
]);

export const examTypeEnum = pgEnum("exam_type", [
  "monthly_test",
  "term_exam",
  "oral_recitation",
  "written_exam",
  "final_exam",
]);

export const hifzEntryTypeEnum = pgEnum("hifz_entry_type", [
  "sabak",
  "sabaq_para",
  "dhor",
]);

export const subjectCategoryEnum = pgEnum("subject_category", [
  "quran_recitation",
  "tajweed",
  "hifz",
  "arabic",
  "hadith",
  "fiqh",
  "aqeedah",
  "islamic_history",
  "seerah",
  "dua",
]);

// --- ACADEMIC YEARS ---
export const academicYears = pgTable("academic_years", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  curriculumBoard: text("curriculum_board"),
  isCurrent: boolean("is_current").default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// --- TEACHERS ---
export const teachers = pgTable("teachers", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  memberId: uuid("member_id").references(() => members.id, { onDelete: "set null" }),
  fullName: text("full_name").notNull(),
  phone: text("phone"),
  qualifications: text("qualifications"),
  islamicQualifications: text("islamic_qualifications"),
  specializations: jsonb("specializations").default([]),
  salary: numeric("salary", { precision: 10, scale: 2 }),
  joinDate: date("join_date"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// --- SUBJECTS ---
export const subjects = pgTable("subjects", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  category: subjectCategoryEnum("category").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// --- CLASSES ---
export const classes = pgTable("classes", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  academicYearId: uuid("academic_year_id").references(() => academicYears.id),
  name: text("name").notNull(),
  level: integer("level").notNull(),
  section: text("section"),
  teacherId: uuid("teacher_id").references(() => teachers.id, { onDelete: "set null" }),
  room: text("room"),
  capacity: integer("capacity").default(40),
  currentStrength: integer("current_strength").default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// --- STUDENTS ---
export const students = pgTable("students", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  memberId: uuid("member_id").references(() => members.id, { onDelete: "set null" }),
  classId: uuid("class_id").references(() => classes.id, { onDelete: "set null" }),
  rollNumber: text("roll_number"),
  fullName: text("full_name").notNull(),
  dateOfBirth: date("date_of_birth"),
  parentMemberId: uuid("parent_member_id").references(() => members.id, { onDelete: "set null" }),
  parentPhone: text("parent_phone"),
  photoUrl: text("photo_url"),
  admissionDate: date("admission_date"),
  status: studentStatusEnum("status").default("active").notNull(),
  dropoutReason: text("dropout_reason"),
  previousInstitution: text("previous_institution"),
  healthInfo: text("health_info"),
  specialNeeds: text("special_needs"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// --- STUDENT ATTENDANCE ---
export const studentAttendance = pgTable("student_attendance", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  studentId: uuid("student_id")
    .notNull()
    .references(() => students.id, { onDelete: "cascade" }),
  classId: uuid("class_id").references(() => classes.id, { onDelete: "set null" }),
  date: date("date").notNull(),
  status: attendanceStatusEnum("status").notNull(),
  markedBy: uuid("marked_by").references(() => teachers.id, { onDelete: "set null" }),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// --- EXAMS ---
export const exams = pgTable("exams", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  classId: uuid("class_id").references(() => classes.id, { onDelete: "set null" }),
  subjectId: uuid("subject_id").references(() => subjects.id, { onDelete: "set null" }),
  type: examTypeEnum("type").notNull(),
  name: text("name").notNull(),
  date: date("date").notNull(),
  maxMarks: integer("max_marks").notNull(),
  passingMarks: integer("passing_marks"),
  academicYearId: uuid("academic_year_id").references(() => academicYears.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// --- EXAM RESULTS ---
export const examResults = pgTable("exam_results", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  examId: uuid("exam_id")
    .notNull()
    .references(() => exams.id, { onDelete: "cascade" }),
  studentId: uuid("student_id")
    .notNull()
    .references(() => students.id, { onDelete: "cascade" }),
  marksObtained: integer("marks_obtained"),
  grade: text("grade"),
  remarks: text("remarks"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// --- HIFZ PROGRESS ---
export const hifzProgress = pgTable("hifz_progress", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  studentId: uuid("student_id")
    .notNull()
    .references(() => students.id, { onDelete: "cascade" }),
  juz: integer("juz").notNull(),
  surah: text("surah"),
  ayahStart: integer("ayah_start"),
  ayahEnd: integer("ayah_end"),
  type: hifzEntryTypeEnum("type").notNull(),
  quality: integer("quality"),
  teacherNotes: text("teacher_notes"),
  date: date("date").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// --- HOMEWORK ---
export const homeworkAssignments = pgTable("homework_assignments", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  classId: uuid("class_id").references(() => classes.id, { onDelete: "cascade" }),
  subjectId: uuid("subject_id").references(() => subjects.id, { onDelete: "set null" }),
  teacherId: uuid("teacher_id").references(() => teachers.id, { onDelete: "set null" }),
  title: text("title").notNull(),
  description: text("description"),
  dueDate: date("due_date"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// --- TIMETABLES ---
export const timetables = pgTable("timetables", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  classId: uuid("class_id").references(() => classes.id, { onDelete: "cascade" }),
  day: text("day").notNull(),
  period: integer("period").notNull(),
  subjectId: uuid("subject_id").references(() => subjects.id, { onDelete: "set null" }),
  teacherId: uuid("teacher_id").references(() => teachers.id, { onDelete: "set null" }),
  startTime: text("start_time"),
  endTime: text("end_time"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// --- FEE STRUCTURES ---
export const feeStructures = pgTable("fee_structures", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  classId: uuid("class_id").references(() => classes.id, { onDelete: "cascade" }),
  feeType: text("fee_type").notNull(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  frequency: text("frequency").default("monthly"),
  isWaivable: boolean("is_waivable").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// --- FEE PAYMENTS ---
export const feePayments = pgTable("fee_payments", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  studentId: uuid("student_id")
    .notNull()
    .references(() => students.id, { onDelete: "cascade" }),
  feeStructureId: uuid("fee_structure_id").references(() => feeStructures.id, { onDelete: "set null" }),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  date: date("date").notNull(),
  receiptNumber: text("receipt_number"),
  waiverAmount: numeric("waiver_amount", { precision: 10, scale: 2 }).default("0").notNull(),
  waiverReason: text("waiver_reason"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
