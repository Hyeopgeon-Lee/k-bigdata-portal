-- SQLD numbering is cumulative across years (e.g. rounds 60-63 in 2026).
alter table public.certification_exam_schedules
 drop constraint if exists certification_exam_schedules_exam_round_check;
alter table public.certification_exam_schedules
 add constraint certification_exam_schedules_exam_round_check
 check (exam_round between 1 and 200);
