import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// ===============================
// ВСТАВЬ СВОИ ДАННЫЕ ИЗ SUPABASE
// ===============================
const SUPABASE_URL = 'https://ewhypwoqhsjplhcsiujb.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_gImXiiwh6hq6LATuipSbUw_CmzawS_Q'
// ===============================

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

const statusEl = document.getElementById('status')
const callsBodyEl = document.getElementById('callsBody')
const totalCountEl = document.getElementById('totalCount')
const avgDurationEl = document.getElementById('avgDuration')
const avgScoreEl = document.getElementById('avgScore')

const searchInputEl = document.getElementById('searchInput')
const dateFromEl = document.getElementById('dateFrom')
const dateToEl = document.getElementById('dateTo')
const limitSelectEl = document.getElementById('limitSelect')
const loadBtnEl = document.getElementById('loadBtn')
const resetBtnEl = document.getElementById('resetBtn')

loadBtnEl.addEventListener('click', loadCalls)
resetBtnEl.addEventListener('click', resetFilters)

function setStatus(message, isError = false) {
  statusEl.textContent = message
  statusEl.style.color = isError ? '#b91c1c' : '#374151'
}

function resetFilters() {
  searchInputEl.value = ''
  dateFromEl.value = ''
  dateToEl.value = ''
  limitSelectEl.value = '50'
  loadCalls()
}

function formatDateTime(value) {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleString('ru-RU')
}

function escapeHtml(value) {
  if (value === null || value === undefined) return ''
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function truncateText(text, maxLength = 300) {
  if (!text) return ''
  return text.length > maxLength ? text.slice(0, maxLength) + '…' : text
}

function renderTable(rows) {
  if (!rows || rows.length === 0) {
    callsBodyEl.innerHTML = `
      <tr>
        <td colspan="12" class="empty">Нет данных</td>
      </tr>
    `
    return
  }

  callsBodyEl.innerHTML = rows.map(row => {
    return `
      <tr>
        <td>${escapeHtml(formatDateTime(row.created_on))}</td>
        <td>${escapeHtml(row.from_number)}</td>
        <td>${escapeHtml(row.to_number)}</td>
        <td>${escapeHtml(row.duration_seconds)}</td>
        <td>${escapeHtml(row.operator_score ?? '')}</td>
        <td>${escapeHtml(row.case_category ?? '')}</td>
        <td>${escapeHtml(row.case_subcategory ?? '')}</td>
        <td>${escapeHtml(row.case_operation_code ?? '')}</td>
        <td>${escapeHtml(row.case_display ?? '')}</td>
        <td>${escapeHtml(row.queue_display ?? '')}</td>
        <td>
          <div class="transcription">${escapeHtml(escapeHtml(row.raw_transcription ?? ''))}</div>
        </td>
        <td>
          <div class="transcription">${escapeHtml(escapeHtml(row.processed_transcription ?? ''))}</div>
        </td>
      </tr>
    `
  }).join('')
}

function renderSummary(rows) {
  totalCountEl.textContent = rows.length

  const durations = rows
    .map(r => Number(r.duration_seconds))
    .filter(v => Number.isFinite(v))

  const avgDuration = durations.length
    ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
    : 0

  avgDurationEl.textContent = `${avgDuration} сек`

  const scores = rows
    .map(r => Number(r.operator_score))
    .filter(v => Number.isFinite(v))

  const avgScore = scores.length
    ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2)
    : '—'

  avgScoreEl.textContent = avgScore
}

async function loadCalls() {
  try {
    setStatus('Загрузка данных...')

    const limit = Number(limitSelectEl.value) || 50
    const search = searchInputEl.value.trim()
    const dateFrom = dateFromEl.value
    const dateTo = dateToEl.value

    let query = supabase
      .from('calls_view')
      .select(`
        created_on,
        from_number,
        to_number,
        duration_seconds,
        operator_score,
        case_category,
        case_subcategory,
        case_operation_code,
        case_display,
        queue_display,
        raw_transcription,
        processed_transcription
      `)
      .order('created_on', { ascending: false })
      .limit(limit)

    if (dateFrom) {
      query = query.gte('created_on', `${dateFrom}T00:00:00`)
    }

    if (dateTo) {
      query = query.lte('created_on', `${dateTo}T23:59:59`)
    }

    const { data, error } = await query

    if (error) {
      throw error
    }

    let rows = data || []

    if (search) {
      const s = search.toLowerCase()
      rows = rows.filter(row => {
        return [
          row.from_number,
          row.to_number,
          row.case_category,
          row.case_subcategory,
          row.case_operation_code,
          row.case_display,
          row.queue_display,
          row.raw_transcription,
          row.processed_transcription
        ]
          .map(v => (v ?? '').toString().toLowerCase())
          .some(v => v.includes(s))
      })
    }

    renderTable(rows)
    renderSummary(rows)
    setStatus(`Загружено записей: ${rows.length}`)
  } catch (err) {
    console.error(err)
    renderTable([])
    renderSummary([])
    setStatus(`Ошибка: ${err.message}`, true)
  }
}

loadCalls()
