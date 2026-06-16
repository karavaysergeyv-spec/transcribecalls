const API_BASE = 'https://108.143.242.121'
const API_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYXBpX3VzZXIifQ.9QleIf2PnFan3-0q11AqCQYQXCnfTMbRGRSeaoLRtYA'
const TRANSCRIBE_WEBHOOK_URL = 'https://n8n.terminals.com.ua:24443/webhook/7f05adb8-4714-43a4-add9-f865a69e08fa'

const CALLS_SELECT_COLUMNS = [
  'created_on', 'created_by', 'from_number', 'to_number', 'operator_score', 'case_category',
  'case_subcategory', 'case_operation_code', 'case_display', 'queue_display', 'is_correct',
  'raw_transcription', 'processed_transcription'
]

const TRANSCRIBE_SELECT_COLUMNS = [
  'id', 'created_on', 'created_by', 'from_number', 'to_number', 'duration_seconds', 'operator_score',
  'case_category', 'case_subcategory', 'case_operation_code', 'case_display', 'queue_display'
]

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
    selectColumns: CALLS_SELECT_COLUMNS,
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
  ,
  transcribe: {
    view: 'calls_no_transcribe',
    title: 'Транскрибувати запис',
    subtitle: 'Transcribe Record',
    description: 'Транскрибування записів · контроль якості',
    searchPlaceholder: 'Номер, оператор, категорія, черга, транскрипція',
    firstTextTitle: 'Raw транскрібація',
    secondTextTitle: 'Результат',
    textType: 'транскрібація',
    showFromCode: true,
    endpointMode: 'calls',
    selectColumns: TRANSCRIBE_SELECT_COLUMNS,
    supportsCorrectness: false,
    columns: [
      { title: 'Дата', render: row => escapeHtml(formatDateTime(getValue(row, ['created_on', 'created_at', 'date']))) },
      { title: 'Оператор', render: row => escapeHtml(getValue(row, ['created_by', 'operator', 'operator_name', 'agent_name'])) },
      { title: 'Звідки', render: row => escapeHtml(getValue(row, ['from_number', 'caller_id', 'client_phone', 'phone'])) },
      { title: 'Куди', render: row => escapeHtml(getValue(row, ['to_number', 'called_id', 'queue_number'])) },
      { title: 'Тривалість, с', render: row => escapeHtml(getValue(row, ['duration_seconds'])) },
      { title: 'Оцінка оператора', render: row => renderOperatorScoreCell(row) },
      { title: 'Категорія', render: row => escapeHtml(getValue(row, ['case_category', 'category'])) },
      { title: 'Підкатегорія', render: row => escapeHtml(getValue(row, ['case_subcategory', 'subcategory', 'case_sub_category'])) },
      { title: 'Код операції', render: row => escapeHtml(getValue(row, ['case_operation_code', 'operation_code'])) },
      { title: 'Кейс', render: row => escapeHtml(getValue(row, ['case_display', 'case_name', 'case'])) },
      { title: 'Черга', render: row => escapeHtml(getValue(row, ['queue_display', 'queue', 'queue_name'])) },
      { title: 'Дія', render: row => renderTranscribeButton(row) }
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
  chatsPanelBtn: document.getElementById('chatsPanelBtn'),
  transcribePanelBtn: document.getElementById('transcribePanelBtn'),
  columnsBtn: document.getElementById('columnsBtn'),
  columnsMenu: document.getElementById('columnsMenu'),
  exportExcelBtn: document.getElementById('exportExcelBtn')
}

let activePanel = 'calls'
let currentModalText = ''
let operatorsLoadedByPanel = { calls: false, chats: false, transcribe: false }
let scrollSyncLocked = false
let currentRows = []

els.loadBtn.addEventListener('click', loadRows)
els.resetBtn.addEventListener('click', resetFilters)
els.closeModalBtn.addEventListener('click', closeModal)
els.copyModalBtn.addEventListener('click', copyModalText)
els.callsPanelBtn.addEventListener('click', () => switchPanel('calls'))
els.chatsPanelBtn.addEventListener('click', () => switchPanel('chats'))
els.transcribePanelBtn.addEventListener('click', () => switchPanel('transcribe'))
els.columnsBtn.addEventListener('click', () => {
  els.columnsMenu.classList.toggle('hidden')
  renderColumnsMenu()
})

els.exportExcelBtn?.addEventListener('click', exportVisibleGridToExcel)

document.addEventListener('click', (e) => {
  if (!els.columnsMenu.classList.contains('hidden') && !e.target.closest('.columns-control')) {
    els.columnsMenu.classList.add('hidden')
  }
})

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

function getSelectedCreatedByValues() {
  return Array.from(els.createdBySelect.selectedOptions || [])
    .map(option => option.value.trim())
    .filter(Boolean)
}

function clearCreatedBySelection() {
  Array.from(els.createdBySelect.options || []).forEach(option => {
    option.selected = false
  })
}

function switchPanel(panel) {
  if (!PANEL_CONFIG[panel] || activePanel === panel) return
  activePanel = panel
  operatorsLoadedByPanel[panel] = false
  els.callsPanelBtn.classList.toggle('active', panel === 'calls')
  els.chatsPanelBtn.classList.toggle('active', panel === 'chats')
  els.transcribePanelBtn.classList.toggle('active', panel === 'transcribe')
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
  els.createdBySelect.innerHTML = ''
  els.fromCodeField.classList.toggle('hidden', !cfg.showFromCode)
  const supportsCorrectness = cfg.supportsCorrectness !== false
  els.correctFilter.disabled = !supportsCorrectness
  els.correctFilter.closest('.field')?.classList.toggle('hidden', !supportsCorrectness)
  renderTableHead()
}

function columnStorageKey() {
  return `qualityDashboardColumns_${activePanel}`
}

function getDefaultColumnState() {
  return {
    order: config().columns.map((_, index) => index),
    hidden: {}
  }
}

function getColumnState() {
  const defaults = getDefaultColumnState()
  try {
    const saved = JSON.parse(localStorage.getItem(columnStorageKey()) || 'null')
    if (!saved || !Array.isArray(saved.order)) return defaults

    const validIndexes = new Set(config().columns.map((_, index) => index))
    const cleanedOrder = saved.order.filter(index => validIndexes.has(index))
    for (const index of validIndexes) {
      if (!cleanedOrder.includes(index)) cleanedOrder.push(index)
    }

    return {
      order: cleanedOrder,
      hidden: saved.hidden && typeof saved.hidden === 'object' ? saved.hidden : {}
    }
  } catch {
    return defaults
  }
}

function saveColumnState(state) {
  localStorage.setItem(columnStorageKey(), JSON.stringify(state))
}

function getVisibleColumns() {
  const state = getColumnState()
  return state.order
    .filter(index => state.hidden[String(index)] !== true)
    .map(index => ({ originalIndex: index, col: config().columns[index] }))
    .filter(item => item.col)
}

function resetColumnState() {
  localStorage.removeItem(columnStorageKey())
  renderColumnsMenu()
  renderTableHead()
  renderTable(currentRows)
  requestAnimationFrame(syncTopScrollbar)
}

function renderColumnsMenu() {
  const state = getColumnState()
  const rows = state.order.map(index => {
    const col = config().columns[index]
    if (!col) return ''
    const checked = state.hidden[String(index)] !== true
    return `
      <div class="columns-menu-item" draggable="true" data-col-index="${index}">
        <span class="drag-handle" title="Перетягнути">☰</span>
        <label>
          <input type="checkbox" data-action="toggle-column" data-col-index="${index}" ${checked ? 'checked' : ''}>
          <span>${escapeHtml(col.title || 'Без назви')}</span>
        </label>
      </div>
    `
  }).join('')

  els.columnsMenu.innerHTML = `
    <div class="columns-menu-header">
      <strong>Колонки</strong>
      <button type="button" class="columns-reset-btn" data-action="reset-columns">Скинути</button>
    </div>
    <div class="columns-menu-hint">Галочка приховує/показує, перетягування міняє порядок.</div>
    <div class="columns-menu-list">${rows}</div>
  `
}

els.columnsMenu.addEventListener('change', (e) => {
  const checkbox = e.target.closest('[data-action="toggle-column"]')
  if (!checkbox) return

  const index = checkbox.dataset.colIndex
  const state = getColumnState()
  state.hidden[index] = !checkbox.checked
  saveColumnState(state)
  renderTableHead()
  renderTable(currentRows)
  requestAnimationFrame(syncTopScrollbar)
})

els.columnsMenu.addEventListener('click', (e) => {
  if (e.target.closest('[data-action="reset-columns"]')) resetColumnState()
})

els.columnsMenu.addEventListener('dragstart', (e) => {
  const item = e.target.closest('.columns-menu-item')
  if (!item) return
  e.dataTransfer.effectAllowed = 'move'
  e.dataTransfer.setData('text/plain', item.dataset.colIndex)
  item.classList.add('dragging')
})

els.columnsMenu.addEventListener('dragend', (e) => {
  const item = e.target.closest('.columns-menu-item')
  if (item) item.classList.remove('dragging')
})

els.columnsMenu.addEventListener('dragover', (e) => {
  if (e.target.closest('.columns-menu-item')) e.preventDefault()
})

els.columnsMenu.addEventListener('drop', (e) => {
  const target = e.target.closest('.columns-menu-item')
  if (!target) return
  e.preventDefault()

  const fromIndex = Number(e.dataTransfer.getData('text/plain'))
  const toIndex = Number(target.dataset.colIndex)
  if (!Number.isFinite(fromIndex) || !Number.isFinite(toIndex) || fromIndex === toIndex) return

  const state = getColumnState()
  const order = state.order.filter(index => index !== fromIndex)
  const insertAt = order.indexOf(toIndex)
  order.splice(insertAt, 0, fromIndex)
  state.order = order
  saveColumnState(state)

  renderColumnsMenu()
  renderTableHead()
  renderTable(currentRows)
  requestAnimationFrame(syncTopScrollbar)
})

function renderTableHead() {
  const cols = getVisibleColumns()
  const textColumnTitles = new Set([
    config().firstTextTitle,
    config().secondTextTitle,
    'Raw транскрібація',
    'Raw діалог',
    'Результат'
  ])

  let colgroup = els.qualityTable.querySelector('colgroup')
  if (!colgroup) {
    colgroup = document.createElement('colgroup')
    els.qualityTable.insertBefore(colgroup, els.qualityTable.firstChild)
  }

  colgroup.innerHTML = cols.map(item => {
    const isTextCol = textColumnTitles.has(item.col.title)
    return `<col class="${isTextCol ? 'text-col' : 'fixed-col'}">`
  }).join('')

  els.tableHead.innerHTML = `<tr>${cols.map(item => `<th data-col-index="${item.originalIndex}">${escapeHtml(item.col.title)}</th>`).join('')}</tr>`
  els.tableWrap.scrollLeft = 0
  els.topScrollWrap.scrollLeft = 0
}

function setStatus(message, isError = false) {
  els.status.textContent = message
  els.status.style.color = isError ? '#ff9b9b' : '#b9b3a8'
}

function resetFilters(shouldLoad = true) {
  els.searchInput.value = ''
  clearCreatedBySelection()
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

function getOperatorScore(row) {
  const score = Number(getValue(row, ['operator_score']))
  return Number.isFinite(score) ? score : null
}

function getRowScore(row) {
  const processedScore = extractTotalScore(getProcessedValue(row))
  return processedScore !== null ? processedScore : getOperatorScore(row)
}

function formatDateTime(value) {
  if (!value) return ''

  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value

  // -3 часа
  d.setHours(d.getHours() - 3)

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

function renderOperatorScoreCell(row) {
  const score = getOperatorScore(row)
  if (score === null) return '<span class="score-value">—</span>'
  return `<span class="score-value">${escapeHtml(score)}</span>`
}

function renderTranscribeButton(row) {
  const dialogId = getValue(row, ['id'])
  if (!dialogId) return '<span class="score-value">—</span>'

  return `
    <button class="transcribe-btn" type="button" data-transcribe-id="${escapeHtml(dialogId)}">
      Транскрибувати
    </button>
  `
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
  params.set('select', (config().selectColumns || CALLS_SELECT_COLUMNS).join(','))
  params.set('order', 'created_on.desc')
  params.set('limit', String(Number(els.limitSelect.value) || 50))

  const selectedOperators = getSelectedCreatedByValues()

  if (selectedOperators.length === 1) {
    params.set('created_by', `eq.${selectedOperators[0]}`)
  }

  if (selectedOperators.length > 1) {
    params.set('created_by', `in.(${selectedOperators.map(v => `"${v.replaceAll('"', '\\"')}"`).join(',')})`)
  }

  const map = [
    [els.caseCategoryInput.value.trim(), 'case_category', 'ilike'],
    [els.caseSubcategoryInput.value.trim(), 'case_subcategory', 'ilike'],
    [els.caseOperationCodeInput.value.trim(), 'case_operation_code', 'ilike'],
    [els.caseDisplayInput.value.trim(), 'case_display', 'ilike'],
    [els.queueDisplayInput.value.trim(), 'queue_display', 'ilike']
  ]

  if (els.dateFrom.value) params.append('created_on', `gte.${els.dateFrom.value}T00:00:00`)
  if (els.dateTo.value) params.append('created_on', `lte.${els.dateTo.value}T23:59:59`)
  if (config().supportsCorrectness !== false && (els.correctFilter.value === '1' || els.correctFilter.value === '0')) {
    params.set('is_correct', `eq.${Number(els.correctFilter.value)}`)
  }

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
    const currentValues = getSelectedCreatedByValues()

    let allRows = []
    const pageSize = 1000
    let offset = 0

    while (true) {
      const data = await apiFetch(
        `/${config().view}?select=${optionColumn}&limit=${pageSize}&offset=${offset}`
      )

      const chunk = data || []
      allRows = allRows.concat(chunk)

      if (chunk.length < pageSize) break
      offset += pageSize
    }

    const uniqueItems = [...new Set(
      allRows
        .map(item => (item[optionColumn] ?? '').toString().trim())
        .filter(Boolean)
    )].sort((a, b) => a.localeCompare(b, 'uk'))

    els.createdBySelect.innerHTML = uniqueItems
      .map(name => `<option value="${escapeHtml(name)}">${escapeHtml(name)}</option>`)
      .join('')

    Array.from(els.createdBySelect.options).forEach(option => {
      option.selected = currentValues.includes(option.value)
    })

    operatorsLoadedByPanel[activePanel] = true
  } catch (err) {
    console.error('Помилка завантаження списку', err)
    setStatus(`Помилка завантаження операторів: ${err.message}`, true)
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
  const cols = getVisibleColumns()

  if (!rows || rows.length === 0) {
    els.tableBody.innerHTML = `<tr><td colspan="${cols.length || 1}" class="empty">Немає даних</td></tr>`
    requestAnimationFrame(syncTopScrollbar)
    return
  }

  els.tableBody.innerHTML = rows.map(row => `
    <tr>${cols.map(item => `<td data-col-index="${item.originalIndex}">${item.col.render(row)}</td>`).join('')}</tr>
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

els.tableBody.addEventListener('click', async (e) => {
  const btn = e.target.closest('[data-transcribe-id]')
  if (!btn) return

  await transcribeDialog(btn)
})

async function transcribeDialog(btn) {
  const dialogId = btn.dataset.transcribeId
  if (!dialogId) return

  const originalText = btn.textContent
  btn.disabled = true
  btn.textContent = 'Відправка...'
  setStatus(`Відправка на транскрибування: ${dialogId}`)

  try {
    const response = await fetch(TRANSCRIBE_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dialog_ids: [dialogId] })
    })

    if (!response.ok) throw new Error(`HTTP ${response.status}`)

    btn.textContent = 'Відправлено'
    setStatus(`Запис відправлено на транскрибування: ${dialogId}`)
  } catch (err) {
    console.error(err)
    btn.disabled = false
    btn.textContent = originalText
    setStatus(`Помилка транскрибування: ${err.message}`, true)
  }
}

function renderSummary(rows) {
  els.totalCount.textContent = rows.length
  if (config().supportsCorrectness === false) {
    els.correctPercent.textContent = '—'
    els.correctPercent.classList.remove('score-good', 'score-bad')
    return
  }
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
  const createdByList = getSelectedCreatedByValues().map(value => value.toLowerCase())
  const category = els.caseCategoryInput.value.trim().toLowerCase()
  const subcategory = els.caseSubcategoryInput.value.trim().toLowerCase()
  const operation = els.caseOperationCodeInput.value.trim().toLowerCase()
  const caseDisplay = els.caseDisplayInput.value.trim().toLowerCase()
  const queueDisplay = els.queueDisplayInput.value.trim().toLowerCase()
  const correctFilter = els.correctFilter.value

  if (createdByList.length) {
    result = result.filter(row => {
      const value = String(getValue(row, ['created_by', 'operator', 'operator_name', 'agent_name', 'contact'])).toLowerCase()
      return createdByList.includes(value)
    })
  }

  if (config().showFromCode && fromCodeFilter) {
    result = result.filter(row => normalizePhoneForPrefix(getValue(row, ['from_number', 'caller_id', 'client_phone', 'phone'])).startsWith(fromCodeFilter))
  }

  if (config().endpointMode === 'generic') {
    if (category) result = result.filter(row => String(getValue(row, ['case_category', 'category'])).toLowerCase().includes(category))
    if (subcategory) result = result.filter(row => String(getValue(row, ['case_subcategory', 'subcategory', 'case_sub_category'])).toLowerCase().includes(subcategory))
    if (operation) result = result.filter(row => String(getValue(row, ['case_operation_code', 'operation_code'])).toLowerCase().includes(operation))
    if (caseDisplay) result = result.filter(row => String(getValue(row, ['case_display', 'case_name', 'case', 'case_service'])).toLowerCase().includes(caseDisplay))
    if (queueDisplay) result = result.filter(row => String(getValue(row, ['queue_display', 'queue', 'queue_name', 'channel'])).toLowerCase().includes(queueDisplay))
    if (correctFilter === '1' || correctFilter === '0') result = result.filter(row => normalizeCorrectValue(getValue(row, ['is_correct', 'correct']), getProcessedValue(row)) === Number(correctFilter))
  }

  const minScore = minScoreRaw === '' ? null : Number(minScoreRaw)
  const maxScore = maxScoreRaw === '' ? null : Number(maxScoreRaw)

  if (minScore !== null && Number.isFinite(minScore)) {
    result = result.filter(row => {
      const score = getRowScore(row)
      return score !== null && score >= minScore
    })
  }

  if (maxScore !== null && Number.isFinite(maxScore)) {
    result = result.filter(row => {
      const score = getRowScore(row)
      return score !== null && score <= maxScore
    })
  }

  if (search) result = result.filter(row => rowMatchesSearch(row, search))

  return result
}

async function loadRows() {
  try {
    await loadCreatedByOptions()
    setStatus(`Завантаження даних: ${config().title.toLowerCase()}...`)
    const data = await apiFetch(buildQuery())
    const rows = applyClientFilters(data || [])
    currentRows = rows
    renderTable(rows)
    renderSummary(rows)
    setStatus(`Завантажено записів: ${rows.length}`)
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
function exportVisibleGridToExcel() {
  const cols = getVisibleColumns()

  if (!currentRows.length) {
    setStatus('Немає даних для експорту', true)
    return
  }

  const exportRows = currentRows.map(row => {
    const result = {}

    cols.forEach(item => {
      const title = item.col.title

      if (title.includes('Raw')) {
        result[title] = getRawValue(row)
        return
      }

      if (title.includes('Результат') || title.includes('Аналіз')) {
        result[title] = tryFormatJson(getProcessedValue(row))
        return
      }

      const div = document.createElement('div')
      div.innerHTML = item.col.render(row)

      result[title] = div.textContent.trim()
    })

    return result
  })

  const headers = Object.keys(exportRows[0])

  let csv = '\uFEFF'

  csv += headers.map(v => `"${v}"`).join(';') + '\n'

  exportRows.forEach(row => {
    csv += headers.map(h =>
      `"${String(row[h] ?? '').replace(/"/g, '""')}"`
    ).join(';') + '\n'
  })

  const blob = new Blob(
    [csv],
    { type: 'text/csv;charset=utf-8;' }
  )

  const link = document.createElement('a')

  link.href = URL.createObjectURL(blob)

  const panel = activePanel

  link.download = `${panel}_${new Date().toISOString().slice(0,10)}.csv`

  document.body.appendChild(link)

  link.click()

  document.body.removeChild(link)

  URL.revokeObjectURL(link.href)
}
applyPanelUi()
loadRows()
