-- Salary Month (Rishad, 14 Nov 2026). Additive only: one nullable column on staff.
--
-- The Salary Month itself needs no new column: salary_payments has always stored the month a salary
-- is for in year + month, apart from paid_date (the day the money was paid). The grid, the dashboard
-- and the reports already read year + month, so every payment saved so far keeps showing in exactly
-- the month it shows today. No payment row is changed.
--
-- staff.inactive_from is the day someone was marked inactive. The salary popup refuses Salary Months
-- after that month and still allows the months before it. It is filled in from now on when an admin
-- taps "Mark inactive", and cleared on "Mark active".
--
-- Backfill: none on purpose. Staff who are inactive today keep inactive_from = NULL, which the app
-- treats exactly as it does today: no month is open for a new salary and nothing is counted as
-- pending. An admin can set the date on the Staff page (Edit) to pay months before they left.
--
-- Run in one transaction. Take a backup first (see RESULT.md).

BEGIN;

ALTER TABLE staff ADD COLUMN IF NOT EXISTS inactive_from date;

COMMIT;

-- Rollback (the app must first go back to the build before this one, which does not read the column):
-- BEGIN;
-- ALTER TABLE staff DROP COLUMN IF EXISTS inactive_from;
-- COMMIT;
