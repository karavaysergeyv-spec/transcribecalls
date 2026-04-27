const API_BASE = 'https://108.143.242.121'
const API_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYXBpX3VzZXIiLCJleHAiOjE3Nzg2NzM5NDB9.OaxjGNMyrQZGTCwFoaMzVFWSlVll4jR4xmVWJYzXX_A'

const PANEL_CONFIG = {
  calls: {
    view: 'calls_view',
    title: 'Панель дзвінків',
    subtitle: 'Call Quality Dashboard',
    description: 'Транскрібація Creatio · контроль якості · аналітика операторів',
    searchPlaceholder: 'Номер, оператор, категорія, черга, транскрипція',
    firstTextTitle: 'Raw транскрібація',
    secondTextTitle: 'Результат',
    textType: 'транскрібація',
    showFromCode: true,
    endpointMode: 'calls',
    columns: [
      { title: 'Дата', render: row => escapeHtml(formatDateTime(getValue(row, ['created_on', 'created_at', 'date']))) },
      { title: 'Оператор', render: row => escapeHtml(getValue(row, ['created_by', 'operator', 'operator_name', 'agent_name'])) },
      { title: 'Звідки', render: row => escapeHtml(getValue(row, ['from_number', 'caller_id', 'client_phone', 'phone'])) },
      { title: 'Куди', render: row => escapeHtml(getValue(row, ['to_number', 'called_id', 'queue_number'])) },
      { title: 'Total score', render: row => renderTotalScoreCell(getProcessedValue(row)) },
      { title: 'Max score', render: row => renderMaxScoreCell(getProcessedValue(row)) },
      { title: 'Категорія', render: row => escapeHtml(getValue(row, ['case_category', 'category'])) },
      { title: 'Підкатегорія', render: row => escapeHtml(getValue(row, ['case_subcategory', 'subcategory', 'case_sub_category'])) },
      { title: 'Код операції', render: row => escapeHtml(getValue(row, ['case_operation_code', 'operation_code'])) },
      { title: 'Кейс', render: row => escapeHtml(getValue(row, ['case_display', 'case_name', 'case'])) },
      { title: 'Черга', render: row => escapeHtml(getValue(row, ['queue_display', 'queue', 'queue_name'])) },
      { title: 'Коректність', render: row => renderCorrectnessCell(getValue(row, ['is_correct', 'correct'])) },
      { title: 'Raw транскрібація', render: row => renderTextCell(getRawValue(row), 'raw', row) },
      { title: 'Результат', render: row => renderTextCell(getProcessedValue(row), 'processed', row) }
    ]
  },
  chats: {
    view: 'chats_view',
    title: 'Панель чатів',
    subtitle: 'Chat Quality Dashboard',
    description: 'Чати Creatio · контроль якості · аналітика чатів',
    searchPlaceholder: 'Контакт, канал, категорія, сервіс, текст чату',
    firstTextTitle: 'Оригінальний діалог',
    secondTextTitle: 'Аналіз чату',
    textType: 'чат',
    showFromCode: false,
    endpointMode: 'generic',
    columns: [
      { title: 'Дата', render: row => escapeHtml(formatDateTime(getValue(row, ['created_on']))) },
      { title: 'Контакт', render: row => escapeHtml(getValue(row, ['contact'])) },
      { title: 'Канал', render: row => escapeHtml(getValue(row, ['channel'])) },
      { title: 'Total score', render: row => renderTotalScoreCell(getProcessedValue(row)) },
      { title: 'Max score', render: row => renderMaxScoreCell(getProcessedValue(row)) },
      { title: 'Категорія', render: row => escapeHtml(getValue(row, ['case_category'])) },
      { title: 'Підкатегорія', render: row => escapeHtml(getValue(row, ['case_subcategory'])) },
      { title: 'Код операції', render: row => escapeHtml(getValue(row, ['case_operation_code'])) },
      { title: 'Сервіс', render: row => escapeHtml(getValue(row, ['case_service'])) },
      { title: 'Коректність', render: row => renderCorrectnessCell(getValue(row, ['is_correct']), getProcessedValue(row)) },
      { title: 'Raw діалог', render: row => renderTextCell(getRawValue(row), 'raw', row) },
      { title: 'Результат', render: row => renderTextCell(getProcessedValue(row), 'processed', row) }
    ]
  }
}

const els = {
  status: document.getElementById('status'),
  tableBody: document.getElementById('tableBody'),
  tableHead: document.getElementById('tableHead'),
  totalCount: document.getElementById('totalCount'),
  correctPercent: document.getElementById('correctPercent'),
  searchInput: document.getElementById('searchInput'),
  createdBySelect: document.getElementById('createdBySelect'),
  fromCodeInput: document.getElementById('fromCodeInput'),
  fromCodeField: document.getElementById('fromCodeField'),
  caseCategoryInput: document.getElementById('caseCategoryInput'),
  caseSubcategoryInput: document.getElementById('caseSubcategoryInput'),
  caseOperationCodeInput: document.getElementById('caseOperationCodeInput'),
  caseDisplayInput: document.getElementById('caseDisplayInput'),
  queueDisplayInput: document.getElementById('queueDisplayInput'),
  totalScoreMin: document.getElementById('totalScoreMin'),
  totalScoreMax: document.getElementById('totalScoreMax'),
  dateFrom: document.getElementById('dateFrom'),
  dateTo: document.getElementById('dateTo'),
  correctFilter: document.getElementById('correctFilter'),
  limitSelect: document.getElementById('limitSelect'),
  loadBtn: document.getElementById('loadBtn'),
  resetBtn: document.getElementById('resetBtn'),
  qualityTable: document.getElementById('qualityTable'),
  tableWrap: document.getElementById('tableWrap'),
  topScrollWrap: document.getElementById('topScrollWrap'),
  topScrollInner: document.getElementById('topScrollInner'),
  modalOverlay: document.getElementById('modalOverlay'),
  modalTitle: document.getElementById('modalTitle'),
  modalMeta: document.getElementById('modalMeta'),
  modalContent: document.getElementById('modalContent'),
  closeModalBtn: document.getElementById('closeModalBtn'),
  copyModalBtn: document.getElementById('copyModalBtn'),
  pageTitle: document.getElementById('pageTitle'),
  pageDescription: document.getElementById('pageDescription'),
  brandSubtitle: document.getElementById('brandSubtitle'),
  callsPanelBtn: document.getElementById('callsPanelBtn'),
  chatsPanelBtn: document.getElementById('chatsPanelBtn')
}

let activePanel = 'calls'
let currentModalText = ''
let operatorsLoadedByPanel = { calls: false, chats: false }
let scrollSyncLocked = false

els.loadBtn.addEventListener('click', loadRows)
els.resetBtn.addEventListener('click', resetFilters)
els.closeModalBtn.addEventListener('click', closeModal)
els.copyModalBtn.addEventListener('click', copyModalText)
els.callsPanelBtn.addEventListener('click', () => switchPanel('calls'))
els.chatsPanelBtn.addEventListener('click', () => switchPanel('chats'))

els.modalOverlay.addEventListener('click', (e) => {
  if (e.target === els.modalOverlay) closeModal()
})

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !els.modalOverlay.classList.contains('hidden')) closeModal()
  if (e.key === 'Enter' && document.activeElement?.tagName !== 'BUTTON') loadRows()
})

window.addEventListener('resize', () => requestAnimationFrame(syncTopScrollbar))

els.topScrollWrap.addEventListener('scroll', () => {
  if (scrollSyncLocked) return
  scrollSyncLocked = true
  els.tableWrap.scrollLeft = els.topScrollWrap.scrollLeft
  scrollSyncLocked = false
})

els.tableWrap.addEventListener('scroll', () => {
  if (scrollSyncLocked) return
  scrollSyncLocked = true
  els.topScrollWrap.scrollLeft = els.tableWrap.scrollLeft
  scrollSyncLocked = false
})

function config() {
  return PANEL_CONFIG[activePanel]
}

function switchPanel(panel) {
  if (!PANEL_CONFIG[panel] || activePanel === panel) return
  activePanel = panel
  els.callsPanelBtn.classList.toggle('active', panel === 'calls')
  els.chatsPanelBtn.classList.toggle('active', panel === 'chats')
  resetFilters(false)
  applyPanelUi()
  loadRows()
}

function applyPanelUi() {
  const cfg = config()
  els.qualityTable.classList.toggle('calls-table', activePanel === 'calls')
  els.qualityTable.classList.toggle('chats-table', activePanel === 'chats')
  document.title = cfg.title
  els.pageTitle.textContent = cfg.title
  els.pageDescription.textContent = cfg.description
  els.brandSubtitle.textContent = cfg.subtitle
  els.searchInput.placeholder = cfg.searchPlaceholder
  document.querySelector('label[for=createdBySelect]').textContent = activePanel === 'chats' ? 'Контакт' : 'Оператор'
  document.querySelector('label[for=caseDisplayInput]').textContent = activePanel === 'chats' ? 'Сервіс' : 'Кейс'
  document.querySelector('label[for=queueDisplayInput]').textContent = activePanel === 'chats' ? 'Канал' : 'Черга'
  els.caseDisplayInput.placeholder = activePanel === 'chats' ? 'Сервіс' : 'C2C'
  els.queueDisplayInput.placeholder = activePanel === 'chats' ? 'monobank-web' : 'Оператори call center'
  els.createdBySelect.innerHTML = `<option value="">${activePanel === 'chats' ? 'Усі контакти' : 'Усі оператори'}</option>`
  els.fromCodeField.classList.toggle('hidden', !cfg.showFromCode)
  renderTableHead()
}

function renderTableHead() {
  els.tableHead.innerHTML = `<tr>${config().columns.map(col => `<th>${escapeHtml(col.title)}</th>`).join('')}</tr>`
  els.tableWrap.scrollLeft = 0
  els.topScrollWrap.scrollLeft = 0
}

function setStatus(message, isError = false) {
  els.status.textContent = message
  els.status.style.color = isError ? '#ff9b9b' : '#b9b3a8'
}

function resetFilters(shouldLoad = true) {
  els.searchInput.value = ''
  els.createdBySelect.value = ''
  els.fromCodeInput.value = ''
  els.caseCategoryInput.value = ''
  els.caseSubcategoryInput.value = ''
  els.caseOperationCodeInput.value = ''
  els.caseDisplayInput.value = ''
  els.queueDisplayInput.value = ''
  els.totalScoreMin.value = ''
  els.totalScoreMax.value = ''
  els.dateFrom.value = ''
  els.dateTo.value = ''
  els.correctFilter.value = ''
  els.limitSelect.value = '50'
  if (shouldLoad) loadRows()
}

function getValue(row, keys) {
  for (const key of keys) {
    if (row && row[key] !== null && row[key] !== undefined && row[key] !== '') return row[key]
  }
  return ''
}

function getRawValue(row) {
  return getValue(row, [
    'raw_transcription',
    'original_dialogue',
    'raw_chat',
    'raw_messages',
    'chat_text',
    'message_text',
    'messages',
    'conversation',
    'dialog_text',
    'text'
  ])
}

function getProcessedValue(row) {
  return getValue(row, [
    'processed_transcription',
    'analyzed_chat',
    'processed_chat',
    'processed_messages',
    'analysis_result',
    'result',
    'quality_result',
    'processed'
  ])
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

function normalizeCorrectValue(value, analyzedText = '') {
  if (value === true || value === 'true' || value === 1 || value === '1') return 1
  if (value === false || value === 'false' || value === 0 || value === '0') return 0

  const text = String(analyzedText || value || '').toLowerCase()
  if (text.includes('статус: коректний') || text.includes('status: correct')) return 1
  if (text.includes('статус: некоректний') || text.includes('status: incorrect')) return 0

  return 0
}

function correctnessBadgeMeta(value) {
  return normalizeCorrectValue(value) === 1
    ? { label: 'Так', className: 'score-good' }
    : { label: 'Ні', className: 'score-bad' }
}

function renderCorrectnessCell(value, analyzedText = '') {
  const meta = correctnessBadgeMeta(normalizeCorrectValue(value, analyzedText))
  return `<span class="score-value ${meta.className}">${meta.label}</span>`
}

function tryFormatJson(text) {
  if (!text) return ''
  if (typeof text !== 'string') {
    try { return JSON.stringify(text, null, 2) } catch { return String(text) }
  }
  try { return JSON.stringify(JSON.parse(text), null, 2) } catch { return text }
}

function truncateText(text, maxLength = 280) {
  if (!text) return ''
  const s = String(text)
  return s.length <= maxLength ? s : s.slice(0, maxLength) + '...'
}

function normalizePhoneForPrefix(phone) {
  const digits = String(phone ?? '').replace(/\D/g, '')
  if (!digits) return ''
  if (digits.startsWith('380') && digits.length >= 12) return '0' + digits.slice(3)
  return digits
}

function parseProcessed(processed) {
  if (processed === null || processed === undefined || processed === '') return null
  if (typeof processed === 'string') {
    try { return JSON.parse(processed) } catch { return null }
  }
  if (typeof processed === 'object') return processed
  return null
}

function extractScorePartsFromText(processed) {
  const text = String(processed ?? '')

  // Example: "📊 Оцінка: 16/22 (72.73%)"
  const scoreLineMatch = text.match(/(?:Оцінка|Оценка|Score)\s*:\s*(\d+(?:[.,]\d+)?)\s*\/\s*(\d+(?:[.,]\d+)?)/i)
  if (scoreLineMatch) {
    return {
      total: Number(scoreLineMatch[1].replace(',', '.')),
      max: Number(scoreLineMatch[2].replace(',', '.'))
    }
  }

  const fractionMatch = text.match(/(\d+(?:[.,]\d+)?)\s*\/\s*(\d+(?:[.,]\d+)?)/)
  if (fractionMatch) {
    return {
      total: Number(fractionMatch[1].replace(',', '.')),
      max: Number(fractionMatch[2].replace(',', '.'))
    }
  }

  return { total: null, max: null }
}

function extractTotalScore(processed) {
  const obj = parseProcessed(processed)
  if (obj) {
    const score = Number(obj.total_score ?? obj.score ?? obj.totalScore)
    if (Number.isFinite(score)) return score
  }

  const scoreParts = extractScorePartsFromText(processed)
  return Number.isFinite(scoreParts.total) ? scoreParts.total : null
}

function extractMaxScore(processed) {
  const obj = parseProcessed(processed)
  if (obj) {
    const score = Number(obj.max_score ?? obj.maxScore)
    if (Number.isFinite(score)) return score
  }

  const scoreParts = extractScorePartsFromText(processed)
  return Number.isFinite(scoreParts.max) ? scoreParts.max : null
}

function getScoreRatio(totalScore, maxScore) {
  if (!Number.isFinite(totalScore) || !Number.isFinite(maxScore) || maxScore <= 0) return null
  return totalScore / maxScore
}

function renderTotalScoreCell(processed) {
  const totalScore = extractTotalScore(processed)
  const maxScore = extractMaxScore(processed)
  const ratio = getScoreRatio(totalScore, maxScore)
  if (totalScore === null) return '<span class="score-value">—</span>'
  const scoreClass = ratio !== null && ratio < 0.7 ? 'score-bad' : 'score-good'
  return `<span class="score-value ${scoreClass}">${escapeHtml(totalScore)}</span>`
}

function renderMaxScoreCell(processed) {
  const maxScore = extractMaxScore(processed)
  if (maxScore === null) return '<span class="score-value">—</span>'
  return `<span class="score-value">${escapeHtml(maxScore)}</span>`
}

function syncTopScrollbar() {
  const tableWidth = els.qualityTable.scrollWidth
  const containerWidth = els.tableWrap.clientWidth
  els.topScrollInner.style.width = `${tableWidth}px`
  if (tableWidth > containerWidth + 2) {
    els.topScrollWrap.classList.add('visible')
    els.topScrollWrap.scrollLeft = els.tableWrap.scrollLeft
  } else {
    els.topScrollWrap.classList.remove('visible')
    els.topScrollWrap.scrollLeft = 0
    els.tableWrap.scrollLeft = 0
  }
}

async function apiFetch(path, options = {}) {
  const headers = { Authorization: `Bearer ${API_TOKEN}`, ...options.headers }
  const response = await fetch(`${API_BASE}${path}`, { ...options, headers })
  const text = await response.text()
  let payload = null
  try { payload = text ? JSON.parse(text) : null } catch { payload = text }
  if (!response.ok) {
    const message = payload && typeof payload === 'object' && payload.message ? payload.message : `HTTP ${response.status}`
    throw new Error(message)
  }
  return payload
}

function buildQuery() {
  return config().endpointMode === 'calls' ? buildCallsViewQuery() : buildGenericViewQuery()
}

function buildCallsViewQuery() {
  const params = new URLSearchParams()
  params.set('select', [
    'created_on', 'created_by', 'from_number', 'to_number', 'operator_score', 'case_category',
    'case_subcategory', 'case_operation_code', 'case_display', 'queue_display', 'is_correct',
    'raw_transcription', 'processed_transcription'
  ].join(','))
  params.set('order', 'created_on.desc')
  params.set('limit', String(Number(els.limitSelect.value) || 50))

  const map = [
    [els.createdBySelect.value.trim(), 'created_by', 'eq'],
    [els.caseCategoryInput.value.trim(), 'case_category', 'ilike'],
    [els.caseSubcategoryInput.value.trim(), 'case_subcategory', 'ilike'],
    [els.caseOperationCodeInput.value.trim(), 'case_operation_code', 'ilike'],
    [els.caseDisplayInput.value.trim(), 'case_display', 'ilike'],
    [els.queueDisplayInput.value.trim(), 'queue_display', 'ilike']
  ]

  if (els.dateFrom.value) params.append('created_on', `gte.${els.dateFrom.value}T00:00:00`)
  if (els.dateTo.value) params.append('created_on', `lte.${els.dateTo.value}T23:59:59`)
  if (els.correctFilter.value === '1' || els.correctFilter.value === '0') params.set('is_correct', `eq.${Number(els.correctFilter.value)}`)

  map.forEach(([value, column, op]) => {
    if (!value) return
    params.set(column, op === 'eq' ? `eq.${value}` : `ilike.*${value}*`)
  })

  return `/${config().view}?${params.toString()}`
}

function buildGenericViewQuery() {
  const params = new URLSearchParams()
  params.set('select', '*')
  params.set('order', 'created_on.desc')
  params.set('limit', String(Number(els.limitSelect.value) || 50))
  if (els.dateFrom.value) params.append('created_on', `gte.${els.dateFrom.value}T00:00:00`)
  if (els.dateTo.value) params.append('created_on', `lte.${els.dateTo.value}T23:59:59`)
  return `/${config().view}?${params.toString()}`
}

async function loadCreatedByOptions() {
  if (operatorsLoadedByPanel[activePanel]) return
  try {
    const optionColumn = activePanel === 'chats' ? 'contact' : 'created_by'
    const optionLabel = activePanel === 'chats' ? 'Усі контакти' : 'Усі оператори'
    const data = await apiFetch(`/${config().view}?select=${optionColumn}&order=${optionColumn}.asc&limit=1000`)
    const uniqueItems = [...new Set((data || []).map(item => (item[optionColumn] ?? '').toString().trim()).filter(Boolean))]
    const currentValue = els.createdBySelect.value
    els.createdBySelect.innerHTML = `<option value="">${optionLabel}</option>` +
      uniqueItems.map(name => `<option value="${escapeHtml(name)}">${escapeHtml(name)}</option>`).join('')
    if (uniqueItems.includes(currentValue)) els.createdBySelect.value = currentValue
    operatorsLoadedByPanel[activePanel] = true
  } catch (err) {
    console.error('Помилка завантаження списку', err)
  }
}

function openModal(title, meta, content) {
  currentModalText = content || ''
  els.modalTitle.textContent = title
  els.modalMeta.textContent = meta || ''
  els.modalContent.textContent = content || ''
  els.modalOverlay.classList.remove('hidden')
  document.body.style.overflow = 'hidden'
}

function closeModal() {
  els.modalOverlay.classList.add('hidden')
  document.body.style.overflow = ''
}

async function copyModalText() {
  try {
    await navigator.clipboard.writeText(currentModalText || '')
    els.copyModalBtn.textContent = 'Скопійовано'
    setTimeout(() => { els.copyModalBtn.textContent = 'Копіювати' }, 1200)
  } catch {
    els.copyModalBtn.textContent = 'Не вдалося'
    setTimeout(() => { els.copyModalBtn.textContent = 'Копіювати' }, 1200)
  }
}

function renderTextCell(text, type, row) {
  const fullText = type === 'processed' ? tryFormatJson(text ?? '') : (text ?? '')
  const preview = truncateText(fullText, 280)
  const meta = `${formatDateTime(getValue(row, ['created_on', 'created_at']))} | ${getValue(row, ['created_by', 'operator', 'operator_name']) || '—'}`
  const title = type === 'processed' ? config().secondTextTitle : config().firstTextTitle
  return `
    <div class="transcription">${escapeHtml(preview)}</div>
    <button class="open-full-btn" data-open-modal="1" data-modal-title="${escapeHtml(title)}" data-modal-meta="${escapeHtml(meta)}" data-modal-content="${escapeHtml(fullText)}">
      Відкрити повністю
    </button>
  `
}

function renderTable(rows) {
  if (!rows || rows.length === 0) {
    els.tableBody.innerHTML = `<tr><td colspan="${config().columns.length}" class="empty">Немає даних</td></tr>`
    requestAnimationFrame(syncTopScrollbar)
    return
  }

  els.tableBody.innerHTML = rows.map(row => `
    <tr>${config().columns.map(col => `<td>${col.render(row)}</td>`).join('')}</tr>
  `).join('')

  requestAnimationFrame(syncTopScrollbar)
}

els.tableBody.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-open-modal="1"]')
  if (!btn) return
  const textarea = document.createElement('textarea')
  textarea.innerHTML = btn.dataset.modalContent || ''
  openModal(btn.dataset.modalTitle || 'Деталі', btn.dataset.modalMeta || '', textarea.value)
})

function renderSummary(rows) {
  els.totalCount.textContent = rows.length
  const correctCount = rows.filter(r => normalizeCorrectValue(getValue(r, ['is_correct', 'correct']), getProcessedValue(r)) === 1).length
  const percent = rows.length ? ((correctCount / rows.length) * 100).toFixed(1) : '0.0'
  els.correctPercent.textContent = `${percent}%`
  els.correctPercent.classList.remove('score-good', 'score-bad')
  els.correctPercent.classList.add(Number(percent) >= 70 ? 'score-good' : 'score-bad')
}

function rowMatchesSearch(row, search) {
  return Object.values(row || {}).map(v => {
    if (v === null || v === undefined) return ''
    return typeof v === 'object' ? JSON.stringify(v) : String(v)
  }).join(' ').toLowerCase().includes(search)
}

function applyClientFilters(rows) {
  let result = rows || []
  const search = els.searchInput.value.trim().toLowerCase()
  const fromCodeFilter = els.fromCodeInput.value.trim()
  const minScoreRaw = els.totalScoreMin.value.trim()
  const maxScoreRaw = els.totalScoreMax.value.trim()
  const createdBy = els.createdBySelect.value.trim().toLowerCase()
  const category = els.caseCategoryInput.value.trim().toLowerCase()
  const subcategory = els.caseSubcategoryInput.value.trim().toLowerCase()
  const operation = els.caseOperationCodeInput.value.trim().toLowerCase()
  const caseDisplay = els.caseDisplayInput.value.trim().toLowerCase()
  const queueDisplay = els.queueDisplayInput.value.trim().toLowerCase()
  const correctFilter = els.correctFilter.value

  if (config().showFromCode && fromCodeFilter) {
    result = result.filter(row => normalizePhoneForPrefix(getValue(row, ['from_number', 'caller_id', 'client_phone', 'phone'])).startsWith(fromCodeFilter))
  }

  if (config().endpointMode === 'generic') {
    if (createdBy) result = result.filter(row => String(getValue(row, ['created_by', 'operator', 'operator_name', 'agent_name', 'contact'])).toLowerCase() === createdBy)
    if (category) result = result.filter(row => String(getValue(row, ['case_category', 'category'])).toLowerCase().includes(category))
    if (subcategory) result = result.filter(row => String(getValue(row, ['case_subcategory', 'subcategory', 'case_sub_category'])).toLowerCase().includes(subcategory))
    if (operation) result = result.filter(row => String(getValue(row, ['case_operation_code', 'operation_code'])).toLowerCase().includes(operation))
    if (caseDisplay) result = result.filter(row => String(getValue(row, ['case_display', 'case_name', 'case', 'case_service'])).toLowerCase().includes(caseDisplay))
    if (queueDisplay) result = result.filter(row => String(getValue(row, ['queue_display', 'queue', 'queue_name', 'channel'])).toLowerCase().includes(queueDisplay))
    if (correctFilter === '1' || correctFilter === '0') result = result.filter(row => normalizeCorrectValue(getValue(row, ['is_correct', 'correct']), getProcessedValue(row)) === Number(correctFilter))
  }

  const minScore = minScoreRaw === '' ? null : Number(minScoreRaw)
  const maxScore = maxScoreRaw === '' ? null : Number(maxScoreRaw)
  if (minScore !== null && Number.isFinite(minScore)) result = result.filter(row => {
    const score = extractTotalScore(getProcessedValue(row))
    return score !== null && score >= minScore
  })
  if (maxScore !== null && Number.isFinite(maxScore)) result = result.filter(row => {
    const score = extractTotalScore(getProcessedValue(row))
    return score !== null && score <= maxScore
  })
  if (search) result = result.filter(row => rowMatchesSearch(row, search))

  return result
}

async function loadRows() {
  try {
    await loadCreatedByOptions()
    setStatus(`Завантаження даних: ${config().title.toLowerCase()}...`)
    const data = await apiFetch(buildQuery())
    const rows = applyClientFilters(data || [])
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
  const headers = els.qualityTable.querySelectorAll('thead th')
  headers.forEach((th) => {
    if (th.dataset.resizableReady === '1') return
    th.classList.add('resizable')
    th.dataset.resizableReady = '1'
    if (!th.style.width) th.style.width = `${Math.max(th.offsetWidth, 120)}px`
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

applyPanelUi()
loadRows()
