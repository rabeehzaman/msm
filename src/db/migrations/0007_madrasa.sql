-- Additive only: nullable columns on students and fee_payments, and one unique index.
-- Pre-checked: student_attendance has no rows, so the index cannot conflict.

ALTER TABLE students ADD COLUMN admission_number text;
ALTER TABLE students ADD COLUMN gender text;
ALTER TABLE students ADD COLUMN guardian_name text;
ALTER TABLE students ADD COLUMN house_address text;
ALTER TABLE students ADD COLUMN photo_path text;

ALTER TABLE fee_payments ADD COLUMN account_id uuid REFERENCES cash_accounts(id) ON DELETE RESTRICT;
ALTER TABLE fee_payments ADD COLUMN note text;
ALTER TABLE fee_payments ADD COLUMN created_by uuid;
ALTER TABLE fee_payments ADD COLUMN updated_by uuid;

-- One mark per student per day, so saving a register twice cannot double-count.
CREATE UNIQUE INDEX student_attendance_student_date_key ON student_attendance (student_id, date);
