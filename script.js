import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const SUPABASE_URL = 'https://ewhypwoqhsjplhcsiujb.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_gImXiiwh6hq6LATuipSbUw_CmzawS_Q'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

const statusEl = document.getElementById('status')
const callsBodyEl = document.getElementById('callsBody')
const totalCountEl = document.getElementById('totalCount')
const avgDurationEl = document.getElementById('avgDuration')
const avgScoreEl = document.getElementById('avgScore')
const correctCountEl = document.getElementById('correctCount')

const searchInputEl = document.getElementById('searchInput')
const dateFromEl = document.getElementById('dateFrom')
const dateToEl = document.getElementById('dateTo')
const correctFilterEl = document.getElementById('correctFilter')
const limitSelectEl = document.getElementById('limitSelect')
const loadBtnEl = document.getElementById('loadBtn')
const resetBtnEl = document.getElementById('resetBtn')
const callsTableEl = document.getElementById('callsTable')

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
  correctFilterEl.value = ''
  limitSelectEl.value = '50'
  loadCalls()
}

function formatDateTime(value) {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleString('uk-UA')
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

function toNumberOrNull(value) {
  if (value === null || value === undefined || value === '') return null
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

function normalizeCorrectValue(value) {
  if (value === true || value === 'true' || value === 1 || value === '1') return 1
  return 0
}

function renderCorrectBadge(value) {
  const normalized = normalizeCorrectValue(value)
  if (normalized === 1) {
    return '<span class="badge badge-yes">1</span>'
  }
  return '<span class="badge badge-no">0</span>'
}

function tryFormatJson(text) {
  if (!text) return ''
  if (typeof text !== 'string') {
    try {
      return JSON.stringify(text, null, 2)
    } catch {
      return String(text)
    }
  }

  try {
    const parsed = JSON.parse(text)
    return JSON.stringify(parsed, null, 2)
  } catch {
    return text
  }
}

function renderTable(rows) {
  if (!rows || rows.length === 0) {
    callsBodyEl.innerHTML = `
      <tr>
        <td colspan="13" class="empty">Немає даних</td>
      </tr>
    `
    return
  }

  callsBodyEl.innerHTML = rows.map(row => `
    <tr>
      <td>${escapeHtml(formatDateTime(row.created_on))}</td>
      <td>${escapeHtml(row.from_number ?? '')}</td>
      <td>${escapeHtml(row.to_number ?? '')}</td>
      <td>${escapeHtml(row.duration_seconds ?? '')}</td>
      <td>${escapeHtml(row.operator_score ?? '')}</td>
      <td>${renderCorrectBadge(row.is_correct)}</td>
      <td>${escapeHtml(row.case_category ?? '')}</td>
      <td>${escapeHtml(row.case_subcategory ?? '')}</td>
      <td>${escapeHtml(row.case_operation_code ?? '')}</td>
      <td>${escapeHtml(row.case_display ?? '')}</td>
      <td>${escapeHtml(row.queue_display ?? '')}</td>
      <td><div class="transcription">${escapeHtml(row.raw_transcription ?? '')}</div></td>
      <td><pre class="json-block">${escapeHtml(tryFormatJson(row.processed_transcription ?? ''))}</pre></td>
    </tr>
  `).join('')
}

function renderSummary(rows) {
  totalCountEl.textContent = rows.length

  const durations = rows
    .map(r => toNumberOrNull(r.duration_seconds))
    .filter(v => v !== null)

  const avgDuration = durations.length
    ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
    : 0

  avgDurationEl.textContent = `${avgDuration} сек`

  const scores = rows
    .map(r => toNumberOrNull(r.operator_score))
    .filter(v => v !== null)

  const avgScore = scores.length
    ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2)
    : '—'

  avgScoreEl.textContent = avgScore

  const correctCount = rows.filter(r => normalizeCorrectValue(r.is_correct) === 1).length
  correctCountEl.textContent = correctCount
}

function rowMatchesSearch(row, search) {
  const haystack = [
    row.from_number,
    row.to_number,
    row.case_category,
    row.case_subcategory,
    row.case_operation_code,
    row.case_display,
    row.queue_display,
    row.raw_transcription,
    row.processed_transcription,
    row.is_correct
  ]
    .map(v => (v ?? '').toString().toLowerCase())
    .join(' ')

  return haystack.includes(search)
}

async function loadCalls() {
  try {
    setStatus('Завантаження даних...')

    const limit = Number(limitSelectEl.value) || 50
    const search = searchInputEl.value.trim().toLowerCase()
    const dateFrom = dateFromEl.value
    const dateTo = dateToEl.value
    const correctFilter = correctFilterEl.value

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
        is_correct,
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

    if (correctFilter === '1' || correctFilter === '0') {
      query = query.eq('is_correct', Number(correctFilter))
    }

    const { data, error } = await query

    if (error) {
      throw error
    }

    let rows = data || []

    if (search) {
      rows = rows.filter(row => rowMatchesSearch(row, search))
    }

    renderTable(rows)
    renderSummary(rows)
    setStatus(`Завантажено записів: ${rows.length}`)

    setupResizableColumns()
  } catch (err) {
    console.error(err)
    renderTable([])
    renderSummary([])
    setStatus(`Помилка: ${err.message}`, true)
  }
}

function setupResizableColumns() {
  const headers = callsTableEl.querySelectorAll('thead th')

  headers.forEach((th) => {
    if (th.dataset.resizableReady === '1') return

    th.classList.add('resizable')
    th.dataset.resizableReady = '1'

    if (!th.style.width) {
      const currentWidth = th.offsetWidth
      th.style.width = `${Math.max(currentWidth, 120)}px`
    }

    const handle = document.createElement('span')
    handle.className = 'resize-handle'
    th.appendChild(handle)

    let startX = 0
    let startWidth = 0

    const onMouseMove = (e) => {
      const newWidth = startWidth + (e.clientX - startX)
      th.style.width = `${Math.max(newWidth, 80)}px`
    }

    const onMouseUp = () => {
      th.classList.remove('resizing')
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }

    handle.addEventListener('mousedown', (e) => {
      e.preventDefault()
      e.stopPropagation()
      startX = e.clientX
      startWidth = th.offsetWidth
      th.classList.add('resizing')
      document.addEventListener('mousemove', onMouseMove)
      document.addEventListener('mouseup', onMouseUp)
    })
  })
}

loadCalls()
