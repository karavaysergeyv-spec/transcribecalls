# Calls Dashboard

SQL:

```sql
create or replace view public.calls_view as
select
  t.created_on,
  t.from_number,
  t.to_number,
  t.duration_seconds,
  t.operator_score,
  t.case_category,
  t.case_subcategory,
  t.case_operation_code,
  t.case_display,
  t.queue_display,
  tt.raw_transcription,
  tt.processed_transcription
from public.calls t
join public.calls_transcription tt
  on t.id = tt.call_id;
