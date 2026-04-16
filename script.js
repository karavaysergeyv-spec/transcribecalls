const API_BASE = 'https://108.143.242.121'
const API_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYXBpX3VzZXIiLCJleHAiOjE3Nzg2NzM5NDB9.OaxjGNMyrQZGTCwFoaMzVFWSlVll4jR4xmVWJYzXX_A'

const statusEl = document.getElementById('status')
const callsBodyEl = document.getElementById('callsBody')
const totalCountEl = document.getElementById('totalCount')
const correctPercentEl = document.getElementById('correctPercent')

const searchInputEl = document.getElementById('searchInput')
const createdBySelectEl = document.getElementById('createdBySelect')
const fromCodeInputEl = document.getElementById('fromCodeInput')
const caseCategoryInputEl = document.getElementById('caseCategoryInput')
const caseSubcategoryInputEl = document.getElementById('caseSubcategoryInput')
const caseOperationCodeInputEl = document.getElementById('caseOperationCodeInput')
const caseDisplayInputEl = document.getElementById('caseDisplayInput')
const queueDisplayInputEl = document.getElementById('queueDisplayInput')
const totalScoreMinEl = document.getElementById('totalScoreMin')
const totalScoreMaxEl = document.getElementById('totalScoreMax')
const dateFromEl = document.getElementById('dateFrom')
const dateToEl = document.getElementById('dateTo')
const correctFilterEl = document.getElementById('correctFilter')
const limitSelectEl = document.getElementById('limitSelect')
const loadBtnEl = document.getElementById('loadBtn')
const resetBtnEl = document.getElementById('resetBtn')
const callsTableEl = document.getElementById('callsTable')
const tableWrapEl = document.getElementById('tableWrap')
const topScrollWrapEl = document.getElementById('topScrollWrap')
const topScrollInnerEl = document.getElementById('topScrollInner')

const modalOverlayEl = document.getElementById('modalOverlay')
const modalTitleEl = document.getElementById('modalTitle')
const modalMetaEl = document.getElementById('modalMeta')
const modalContentEl = document.getElementById('modalContent')
const closeModalBtnEl = document.getElementById('closeModalBtn')
const copyModalBtnEl = document.getElementById('copyModalBtn')

let currentModalText = ''
let operatorsLoaded = false
let scrollSyncLocked = false

loadBtnEl.addEventListener('click', loadCalls)
resetBtnEl.addEventListener('click', resetFilters)
closeModalBtnEl.addEventListener('click', closeModal)
copyModalBtnEl.addEventListener('click', copyModalText)

modalOverlayEl.addEventListener('click', (e) => {
  if (e.target === modalOverlayEl) closeModal()
})

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !modalOverlayEl.classList.contains('hidden')) {
    closeModal()
  }

  if (e.key === 'Enter' && document.activeElement?.tagName !== 'BUTTON') {
    loadCalls()
  }
})

window.addEventListener('resize', () => {
  requestAnimationFrame(syncTopScrollbar)
})

topScrollWrapEl.addEventListener('scroll', () => {
  if (scrollSyncLocked) return
  scrollSyncLocked = true
  tableWrapEl.scrollLeft = topScrollWrapEl.scrollLeft
  scrollSyncLocked = false
})

tableWrapEl.addEventListener('scroll', () => {
  if (scrollSyncLocked) return
  scrollSyncLocked = true
  topScrollWrapEl.scrollLeft = tableWrapEl.scrollLeft
  scrollSyncLocked = false
})

function setStatus(message, isError = false) {
  statusEl.textContent = message
  statusEl.style.color = isError ? '#b91c1c' : '#334155'
}

function resetFilters() {
  searchInputEl.value = ''
  createdBySelectEl.value = ''
  fromCodeInputEl.value = ''
  caseCategoryInputEl.value = ''
  caseSubcategoryInputEl.value = ''
  caseOperationCodeInputEl.value = ''
  caseDisplayInputEl.value = ''
  queueDisplayInputEl.value = ''
  totalScoreMinEl.value = ''
  totalScoreMaxEl.value = ''
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

function normalizeCorrectValue(value) {
  if (value === true || value === 'true' || value === 1 || value === '1') return 1
  return 0
}

function correctnessBadgeMeta(value) {
  const normalized = normalizeCorrectValue(value)
  return normalized === 1
    ? { label: 'Так', className: 'score-good' }
    : { label: 'Ні', className: 'score-bad' }
}

function renderCorrectnessCell(value) {
  const meta = correctnessBadgeMeta(value)
  return `<span class="score-value ${meta.className}">${meta.label}</span>`
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

function truncateText(text, maxLength = 280) {
  if (!text) return ''
  const s = String(text)
  if (s.length <= maxLength) return s
  return s.slice(0, maxLength) + '...'
}

function normalizePhoneForPrefix(phone) {
  const digits = String(phone ?? '').replace(/\D/g, '')
  if (!digits) return ''

  if (digits.startsWith('380') && digits.length >= 12) {
    return '0' + digits.slice(3)
  }

  return digits
}

function parseProcessed(processed) {
  if (processed === null || processed === undefined || processed === '') return null

  if (typeof processed === 'string') {
    try {
      return JSON.parse(processed)
    } catch {
      return null
    }
  }

  if (typeof processed === 'object') return processed

  return null
}

function extractTotalScore(processed) {
  const obj = parseProcessed(processed)
  if (!obj) return null

  const score = Number(obj.total_score)
  return Number.isFinite(score) ? score : null
}

function extractMaxScore(processed) {
  const obj = parseProcessed(processed)
  if (!obj) return null

  const score = Number(obj.max_score)
  return Number.isFinite(score) ? score : null
}

function getScoreRatio(totalScore, maxScore) {
  if (!Number.isFinite(totalScore) || !Number.isFinite(maxScore) || maxScore <= 0) {
    return null
  }

  return totalScore / maxScore
}

function renderTotalScoreCell(processed) {
  const totalScore = extractTotalScore(processed)
  const maxScore = extractMaxScore(processed)
  const ratio = getScoreRatio(totalScore, maxScore)

  if (totalScore === null) {
    return '<span class="score-value">—</span>'
  }

  const scoreClass = ratio !== null && ratio < 0.7 ? 'score-bad' : 'score-good'
  return `<span class="score-value ${scoreClass}">${escapeHtml(totalScore)}</span>`
}

function renderMaxScoreCell(processed) {
  const maxScore = extractMaxScore(processed)

  if (maxScore === null) {
    return '<span class="score-value">—</span>'
  }

  return `<span class="score-value">${escapeHtml(maxScore)}</span>`
}

function syncTopScrollbar() {
  const tableWidth = callsTableEl.scrollWidth
  const containerWidth = tableWrapEl.clientWidth

  topScrollInnerEl.style.width = `${tableWidth}px`

  if (tableWidth > containerWidth + 2) {
    topScrollWrapEl.classList.add('visible')
    topScrollWrapEl.scrollLeft = tableWrapEl.scrollLeft
  } else {
    topScrollWrapEl.classList.remove('visible')
    topScrollWrapEl.scrollLeft = 0
    tableWrapEl.scrollLeft = 0
  }
}

async function apiFetch(path, options = {}) {
  const headers = {
    'Authorization': `Bearer ${API_TOKEN}`,
    ...options.headers
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers
  })

  const text = await response.text()
  let payload = null

  try {
    payload = text ? JSON.parse(text) : null
  } catch {
    payload = text
  }

  if (!response.ok) {
    const message =
      payload && typeof payload === 'object' && payload.message
        ? payload.message
        : `HTTP ${response.status}`
    throw new Error(message)
  }

  return payload
}

function buildCallsViewQuery() {
  const params = new URLSearchParams()

  params.set(
    'select',
    [
      'created_on',
      'created_by',
      'from_number',
      'to_number',
      'operator_score',
      'case_category',
      'case_subcategory',
      'case_operation_code',
      'case_display',
      'queue_display',
      'is_correct',
      'raw_transcription',
      'processed_transcription'
    ].join(',')
  )

  params.set('order', 'created_on.desc')
  params.set('limit', String(Number(limitSelectEl.value) || 50))

  const createdByFilter = createdBySelectEl.value.trim()
  const caseCategoryFilter = caseCategoryInputEl.value.trim()
  const caseSubcategoryFilter = caseSubcategoryInputEl.value.trim()
  const caseOperationCodeFilter = caseOperationCodeInputEl.value.trim()
  const caseDisplayFilter = caseDisplayInputEl.value.trim()
  const queueDisplayFilter = queueDisplayInputEl.value.trim()
  const dateFrom = dateFromEl.value
  const dateTo = dateToEl.value
  const correctFilter = correctFilterEl.value

  if (dateFrom) {
    params.append('created_on', `gte.${dateFrom}T00:00:00`)
  }

  if (dateTo) {
    params.append('created_on', `lte.${dateTo}T23:59:59`)
  }

  if (correctFilter === '1' || correctFilter === '0') {
    params.set('is_correct', `eq.${Number(correctFilter)}`)
  }

  if (createdByFilter) {
    params.set('created_by', `eq.${createdByFilter}`)
  }

  if (caseCategoryFilter) {
    params.set('case_category', `ilike.*${caseCategoryFilter}*`)
  }

  if (caseSubcategoryFilter) {
    params.set('case_subcategory', `ilike.*${caseSubcategoryFilter}*`)
  }

  if (caseOperationCodeFilter) {
    params.set('case_operation_code', `ilike.*${caseOperationCodeFilter}*`)
  }

  if (caseDisplayFilter) {
    params.set('case_display', `ilike.*${caseDisplayFilter}*`)
  }

  if (queueDisplayFilter) {
    params.set('queue_display', `ilike.*${queueDisplayFilter}*`)
  }

  return `/calls_view?${params.toString()}`
}

async function loadCreatedByOptions() {
  try {
    const data = await apiFetch('/calls_view?select=created_by&order=created_by.asc&limit=1000')

    const uniqueOperators = [...new Set(
      (data || [])
        .map(item => (item.created_by ?? '').toString().trim())
        .filter(Boolean)
    )]

    const currentValue = createdBySelectEl.value

    createdBySelectEl.innerHTML =
      '<option value="">Усі оператори</option>' +
      uniqueOperators
        .map(name => `<option value="${escapeHtml(name)}">${escapeHtml(name)}</option>`)
        .join('')

    if (uniqueOperators.includes(currentValue)) {
      createdBySelectEl.value = currentValue
    }

    operatorsLoaded = true
  } catch (err) {
    console.error('Помилка завантаження операторів', err)
  }
}

function openModal(title, meta, content) {
  currentModalText = content || ''
  modalTitleEl.textContent = title
  modalMetaEl.textContent = meta || ''
  modalContentEl.textContent = content || ''
  modalOverlayEl.classList.remove('hidden')
  document.body.style.overflow = 'hidden'
}

function closeModal() {
  modalOverlayEl.classList.add('hidden')
  document.body.style.overflow = ''
}

async function copyModalText() {
  try {
    await navigator.clipboard.writeText(currentModalText || '')
    copyModalBtnEl.textContent = 'Скопійовано'
    setTimeout(() => {
      copyModalBtnEl.textContent = 'Копіювати'
    }, 1200)
  } catch {
    copyModalBtnEl.textContent = 'Не вдалося'
    setTimeout(() => {
      copyModalBtnEl.textContent = 'Копіювати'
    }, 1200)
  }
}

function renderTextCell(text, type, row) {
  const fullText = type === 'processed'
    ? tryFormatJson(text ?? '')
    : (text ?? '')

  const preview = truncateText(fullText, 280)
  const meta = `${formatDateTime(row.created_on)} | ${row.created_by ?? '—'} | ${row.from_number ?? ''} → ${row.to_number ?? ''}`

  return `
    <div class="transcription">${escapeHtml(preview)}</div>
    <button
      class="open-full-btn"
      data-open-modal="1"
      data-modal-title="${escapeHtml(type === 'processed' ? 'Processed transcription' : 'Raw transcription')}"
      data-modal-meta="${escapeHtml(meta)}"
      data-modal-content="${escapeHtml(fullText)}"
    >
      Відкрити повністю
    </button>
  `
}

function renderTable(rows) {
  if (!rows || rows.length === 0) {
    callsBodyEl.innerHTML = `
      <tr>
        <td colspan="14" class="empty">Немає даних</td>
      </tr>
    `
    bindModalButtons()
    requestAnimationFrame(syncTopScrollbar)
    return
  }

  callsBodyEl.innerHTML = rows.map(row => `
    <tr>
      <td>${escapeHtml(formatDateTime(row.created_on))}</td>
      <td>${escapeHtml(row.created_by ?? '')}</td>
      <td>${escapeHtml(row.from_number ?? '')}</td>
      <td>${escapeHtml(row.to_number ?? '')}</td>
      <td>${renderTotalScoreCell(row.processed_transcription)}</td>
      <td>${renderMaxScoreCell(row.processed_transcription)}</td>
      <td>${escapeHtml(row.case_category ?? '')}</td>
      <td>${escapeHtml(row.case_subcategory ?? '')}</td>
      <td>${escapeHtml(row.case_operation_code ?? '')}</td>
      <td>${escapeHtml(row.case_display ?? '')}</td>
      <td>${escapeHtml(row.queue_display ?? '')}</td>
      <td>${renderCorrectnessCell(row.is_correct)}</td>
      <td>${renderTextCell(row.raw_transcription, 'raw', row)}</td>
      <td>${renderTextCell(row.processed_transcription, 'processed', row)}</td>
    </tr>
  `).join('')

  bindModalButtons()
  requestAnimationFrame(syncTopScrollbar)
}

function bindModalButtons() {
  const buttons = callsBodyEl.querySelectorAll('[data-open-modal="1"]')
  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const title = btn.dataset.modalTitle || 'Деталі'
      const meta = btn.dataset.modalMeta || ''
      const content = btn.dataset.modalContent || ''
      const textarea = document.createElement('textarea')
      textarea.innerHTML = content
      openModal(title, meta, textarea.value)
    })
  })
}

function renderSummary(rows) {
  totalCountEl.textContent = rows.length

  const correctCount = rows.filter(r => normalizeCorrectValue(r.is_correct) === 1).length

  const percent = rows.length
    ? ((correctCount / rows.length) * 100).toFixed(1)
    : '0.0'

  const percentClass = Number(percent) >= 70 ? 'score-good' : 'score-bad'
  correctPercentEl.innerHTML = `<span class="score-value ${percentClass}">${percent}%</span>`
}

function rowMatchesSearch(row, search) {
  const haystack = [
    row.created_by,
    row.from_number,
    row.to_number,
    row.case_category,
    row.case_subcategory,
    row.case_operation_code,
    row.case_display,
    row.queue_display,
    row.raw_transcription,
    row.processed_transcription,
    row.is_correct,
    extractTotalScore(row.processed_transcription),
    extractMaxScore(row.processed_transcription)
  ]
    .map(v => (v ?? '').toString().toLowerCase())
    .join(' ')

  return haystack.includes(search)
}

async function loadCalls() {
  try {
    if (!operatorsLoaded) {
      await loadCreatedByOptions()
    }

    setStatus('Завантаження даних...')

    const search = searchInputEl.value.trim().toLowerCase()
    const fromCodeFilter = fromCodeInputEl.value.trim()
    const totalScoreMinRaw = totalScoreMinEl.value.trim()
    const totalScoreMaxRaw = totalScoreMaxEl.value.trim()

    const data = await apiFetch(buildCallsViewQuery())
    let rows = data || []

    if (fromCodeFilter) {
      rows = rows.filter(row => {
        const normalized = normalizePhoneForPrefix(row.from_number)
        return normalized.startsWith(fromCodeFilter)
      })
    }

    const minScore = totalScoreMinRaw === '' ? null : Number(totalScoreMinRaw)
    const maxScore = totalScoreMaxRaw === '' ? null : Number(totalScoreMaxRaw)

    if (minScore !== null && Number.isFinite(minScore)) {
      rows = rows.filter(row => {
        const score = extractTotalScore(row.processed_transcription)
        return score !== null && score >= minScore
      })
    }

    if (maxScore !== null && Number.isFinite(maxScore)) {
      rows = rows.filter(row => {
        const score = extractTotalScore(row.processed_transcription)
        return score !== null && score <= maxScore
      })
    }

    if (search) {
      rows = rows.filter(row => rowMatchesSearch(row, search))
    }

    renderTable(rows)
    renderSummary(rows)
    setStatus(`Завантажено записів: ${rows.length}`)

    setupResizableColumns()
    requestAnimationFrame(syncTopScrollbar)
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
      requestAnimationFrame(syncTopScrollbar)
    }

    const onMouseUp = () => {
      th.classList.remove('resizing')
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
      requestAnimationFrame(syncTopScrollbar)
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
