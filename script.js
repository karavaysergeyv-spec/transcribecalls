import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const SUPABASE_URL = 'https://ewhypwoqhsjplhcsiujb.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_gImXiiwh6hq6LATuipSbUw_CmzawS_Q'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

const callsBodyEl = document.getElementById('callsBody')
const statusEl = document.getElementById('status')

const totalCountEl = document.getElementById('totalCount')
const avgDurationEl = document.getElementById('avgDuration')
const avgScoreEl = document.getElementById('avgScore')
const viewedCountEl = document.getElementById('viewedCount')

const limitSelectEl = document.getElementById('limitSelect')
const loadBtnEl = document.getElementById('loadBtn')

loadBtnEl.addEventListener('click', loadCalls)

function formatDateTime(value) {
  const d = new Date(value)
  return d.toLocaleString('uk-UA')
}

function prettyJSON(text) {
  try {
    const obj = JSON.parse(text)
    return JSON.stringify(obj, null, 2)
  } catch {
    return text
  }
}

function renderTable(rows) {

  if (!rows.length) {
    callsBodyEl.innerHTML = `
      <tr>
        <td colspan="13">Немає даних</td>
      </tr>`
    return
  }

  callsBodyEl.innerHTML = rows.map(row => `
<tr>

<td>${formatDateTime(row.created_on)}</td>
<td>${row.from_number}</td>
<td>${row.to_number}</td>

<td>${row.duration_seconds}</td>
<td>${row.operator_score ?? ""}</td>

<td>${row.calls_view == 1 ? "Так" : "Ні"}</td>

<td>${row.case_category ?? ""}</td>
<td>${row.case_subcategory ?? ""}</td>
<td>${row.case_operation_code ?? ""}</td>
<td>${row.case_display ?? ""}</td>
<td>${row.queue_display ?? ""}</td>

<td><pre>${row.raw_transcription ?? ""}</pre></td>

<td><pre>${prettyJSON(row.processed_transcription ?? "")}</pre></td>

</tr>
`).join("")
}

function renderSummary(rows) {

  totalCountEl.textContent = rows.length

  const durations = rows.map(r => r.duration_seconds).filter(Boolean)
  const scores = rows.map(r => r.operator_score).filter(Boolean)

  const avgDuration = durations.length
    ? Math.round(durations.reduce((a,b)=>a+b,0)/durations.length)
    : 0

  const avgScore = scores.length
    ? (scores.reduce((a,b)=>a+b,0)/scores.length).toFixed(2)
    : 0

  avgDurationEl.textContent = avgDuration + " сек"
  avgScoreEl.textContent = avgScore

  viewedCountEl.textContent =
    rows.filter(r => r.calls_view == 1).length
}

async function loadCalls() {

  statusEl.innerText = "Завантаження..."

  const limit = Number(limitSelectEl.value)

  const { data, error } = await supabase
    .from('calls_view')
    .select(`
      created_on,
      from_number,
      to_number,
      duration_seconds,
      operator_score,
      calls_view,
      case_category,
      case_subcategory,
      case_operation_code,
      case_display,
      queue_display,
      raw_transcription,
      processed_transcription
    `)
    .order('created_on', { ascending:false })
    .limit(limit)

  if (error) {
    statusEl.innerText = error.message
    return
  }

  renderTable(data)
  renderSummary(data)

  statusEl.innerText = "Завантажено: " + data.length
}

loadCalls()
