/*************************************************
 * HVDC WhatsApp ↔ Google Sheets (ENHANCED v2.0)
 * Enhanced Features:
 * - Batch processing for better performance
 * - HMAC webhook verification
 * - Rate limiting protection
 * - Advanced SLA monitoring
 * - Automatic backup system
 * - Real-time KPI integration
 *************************************************/

/** ====== ENHANCED CONFIG ====== */
const TIMEZONE = 'Asia/Dubai';
const FALLBACK_WEBAPP_URL = 'https://script.google.com/macros/s/REPLACE_WITH_DEPLOYED_ID/exec';

// Sheet names
const POLICIES_SHEET = 'Policies';
const INBOX_SHEET    = 'Inbox';
const SUMMARY_SHEET  = 'Summary';
const LOGS_SHEET     = 'Logs';
const KPI_SHEET      = 'KPI_Dashboard'; // NEW

// Performance parameters
const RETRIES      = 5;
const BACKOFF_MS   = 400;
const CACHE_TTL    = 60 * 30;
const QUEUE_INDEX  = 'QUEUE_INDEX';
const BATCH_SIZE   = 50;  // NEW: Batch processing size
const RATE_LIMIT   = 100; // NEW: Max requests per minute

// SLA Thresholds (in minutes)
const SLA_URGENT   = 10;
const SLA_ACTION   = 120;
const SLA_FYI      = 480;

/** ====== PROPERTIES ====== */
const PRJ = PropertiesService.getScriptProperties();

/** ====== ENHANCED MENU ====== */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('HVDC ▶')
    .addItem('Open Web App (Popup)',   'openWebAppPopup')
    .addItem('Open Web App (Sidebar)', 'openWebAppSidebar')
    .addSeparator()
    .addItem('Init All Sheets', 'initAllSheets')
    .addItem('Show Policies', 'showPolicies')
    .addItem('Show KPI Dashboard', 'showKPIDashboard')
    .addSeparator()
    .addItem('Process Queue', 'drainQueueEnhanced')
    .addItem('Generate Daily Report', 'generateDailyReport')
    .addItem('Backup Data', 'backupAllData')
    .addSeparator()
    .addItem('Setup Triggers', 'setupAutomatedTriggers')
    .addItem('Check System Health', 'checkSystemHealth')
    .addSeparator()
    .addSubMenu(ui.createMenu('🔧 Debug Tools')
      .addItem('Test Append Function', 'testAppendWithRetry')
      .addItem('Simulate Webhook', 'simulateWebhook')
      .addItem('Validate Data Integrity', 'validateDataIntegrity')
      .addItem('Setup Webhook Security', 'setupWebhookSecurity')
      .addItem('Run All Debug Tests', 'debugHelpers'))
    .addToUi();
}

/** ====== ENHANCED HELPERS ====== */
function getProp_(key, fallback = '') {
  const val = PRJ.getProperty(key);
  return val && val.trim() ? val.trim() : fallback;
}

function setProp_(key, value) { 
  PRJ.setProperty(key, value); 
}

function getWebAppUrl_() {
  return getProp_('WEBAPP_URL', FALLBACK_WEBAPP_URL);
}

function nowGst_() {
  return Utilities.formatDate(new Date(), TIMEZONE, 'yyyy-MM-dd HH:mm:ss');
}

function sanitizeHtml_(s = '') {
  return String(s).replace(/[&<>"']/g, m => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[m]));
}

function maskPII_(s) {
  if (!s) return s;
  let out = String(s);
  out = out.replace(/\+?\d[\d \-]{7,}\d/g, '****'); // phone
  out = out.replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '****'); // email
  return out;
}

function sha256_(s) {
  return Utilities.base64EncodeWebSafe(
    Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, s)
  ).replace(/=+$/,'');
}

/** ====== RATE LIMITING ====== */
class RateLimiter {
  constructor(maxRequests = 100, windowMs = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.cache = CacheService.getScriptCache();
  }
  
  isAllowed(key) {
    const now = Date.now();
    const cacheKey = `rate_${key}`;
    const data = this.cache.get(cacheKey);
    
    if (!data) {
      this.cache.put(cacheKey, JSON.stringify({
        count: 1,
        resetAt: now + this.windowMs
      }), Math.ceil(this.windowMs / 1000));
      return true;
    }
    
    const parsed = JSON.parse(data);
    if (now > parsed.resetAt) {
      this.cache.put(cacheKey, JSON.stringify({
        count: 1,
        resetAt: now + this.windowMs
      }), Math.ceil(this.windowMs / 1000));
      return true;
    }
    
    if (parsed.count >= this.maxRequests) {
      return false;
    }
    
    parsed.count++;
    this.cache.put(cacheKey, JSON.stringify(parsed), 
      Math.ceil((parsed.resetAt - now) / 1000));
    return true;
  }
}

/** ====== WEBHOOK VERIFICATION ====== */
function verifyWebhookSignature(payload, signature) {
  const secret = getProp_('WEBHOOK_SECRET');
  
  if (!secret || secret === 'default-secret-change-me') {
    Logger.log('WARNING: Webhook secret not properly configured');
    // 개발 환경에서만 경고, 프로덕션에서는 거부
    if (getProp_('ENV', 'dev') === 'production') {
      return false;
    }
  }
  
  try {
    const computed = Utilities.computeHmacSha256Signature(payload, secret);
    const computedBase64 = Utilities.base64Encode(computed);
    
    Logger.log('Signature verification:');
    Logger.log('Expected: ' + signature);
    Logger.log('Computed: ' + computedBase64);
    
    return computedBase64 === signature;
  } catch (e) {
    Logger.log('Signature verification error: ' + e);
    return false;
  }
}

// Webhook 보안 설정 함수
function setupWebhookSecurity() {
  const secret = Utilities.getUuid(); // 강력한 랜덤 시크릿 생성
  setProp_('WEBHOOK_SECRET', secret);
  
  Logger.log('Webhook Secret generated. Use this in your webhook sender:');
  Logger.log(secret);
  
  SpreadsheetApp.getActive().toast(
    'Webhook secret configured. Check logs for the secret value.',
    'Security Setup', 10
  );
}

/** ====== ENHANCED SHEET MANAGEMENT ====== */
function ensureSheetNamed_(name, headers = []) {
  const ss = SpreadsheetApp.getActive();
  let sh = ss.getSheetByName(name);
  if (!sh) sh = ss.insertSheet(name);
  
  if (headers.length && sh.getLastRow() === 0) {
    const range = sh.getRange(1, 1, 1, headers.length);
    range.setValues([headers]);
    sh.setFrozenRows(1);
    range.setFontWeight('bold').setBackground('#f1f3f4');
    sh.autoResizeColumns(1, headers.length);
  }
  return sh;
}

function initAllSheets() {
  const ss = SpreadsheetApp.getActive();
  ss.setSpreadsheetTimeZone(TIMEZONE);

  // Inbox
  ensureSheetNamed_(INBOX_SHEET, [
    'timestamp_gst','group','raw_text','detected_lang','sender',
    'phones_masked','emails_masked','priority','status'
  ]);

  // Summary
  ensureSheetNamed_(SUMMARY_SHEET, [
    'date_gst','yesterday_key_ops','today_key_ops','open_actions',
    'risks','handover_notes','kpi_score','alert_count'
  ]);

  // Policies
  ensureSheetNamed_(POLICIES_SHEET, [
    'section','content','updated_at','version'
  ]);

  // Logs
  ensureSheetNamed_(LOGS_SHEET, [
    'date_gst','group_name','summary','top_keywords','sla_breaches',
    'attachments','created_at','idempotency_key','processed_status'
  ]);
  
  // KPI Dashboard (NEW)
  ensureSheetNamed_(KPI_SHEET, [
    'metric','value','target','status','last_updated','trend',
    'alert_level','action_required'
  ]);

  // Default policies
  const pol = ss.getSheetByName(POLICIES_SHEET);
  if (pol.getLastRow() === 1) {
    pol.getRange(2,1,6,4).setValues([
      ['Scope','WhatsApp 업무 그룹방 공통 Master Policy', nowGst_(), 'v1.0'],
      ['Tags','[URGENT][ACTION][FYI][ETA][COST][GATE][CRANE]', nowGst_(), 'v1.0'],
      ['SLA','08:00–20:00 / URGENT 10m, ACTION 2h, FYI same-day', nowGst_(), 'v1.0'],
      ['FileName','YYYYMMDD_[SHPTNO]_[DOC]_v##', nowGst_(), 'v1.0'],
      ['PII','전화/이메일 마스킹(****), 외부 공유 금지', nowGst_(), 'v1.0'],
      ['Backup','Daily 02:00 GST automatic backup to Drive', nowGst_(), 'v1.0']
    ]);
  }
  
  SpreadsheetApp.getActive().toast('All sheets initialized successfully', 'HVDC ▶', 5);
}

/** ====== BATCH PROCESSING ====== */
function batchAppendRows(sheetName, rows) {
  if (!rows || rows.length === 0) return { ok: true, count: 0 };
  
  const sh = SpreadsheetApp.getActive().getSheetByName(sheetName);
  if (!sh) throw new Error(`Sheet ${sheetName} not found`);
  
  const lock = LockService.getDocumentLock();
  try {
    lock.waitLock(10000);
    
    // Process in batches
    let totalAppended = 0;
    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      const batch = rows.slice(i, i + BATCH_SIZE);
      const startRow = sh.getLastRow() + 1;
      sh.getRange(startRow, 1, batch.length, batch[0].length)
        .setValues(batch);
      totalAppended += batch.length;
      
      // Flush every batch
      if (i % (BATCH_SIZE * 2) === 0) {
        SpreadsheetApp.flush();
      }
    }
    
    SpreadsheetApp.flush();
    return { ok: true, count: totalAppended };
    
  } catch (e) {
    Logger.log('Batch append error: ' + e);
    return { ok: false, error: e.toString() };
  } finally {
    try { lock.releaseLock(); } catch(_) {}
  }
}

/** ====== SLA MONITORING ====== */
function calculateSLABreach(messageTime, responseTime, priority) {
  const timeDiff = (new Date(responseTime) - new Date(messageTime)) / 60000; // minutes
  
  switch(priority) {
    case 'URGENT':
      return timeDiff > SLA_URGENT ? timeDiff - SLA_URGENT : 0;
    case 'ACTION':
      return timeDiff > SLA_ACTION ? timeDiff - SLA_ACTION : 0;
    case 'FYI':
      return timeDiff > SLA_FYI ? timeDiff - SLA_FYI : 0;
    default:
      return 0;
  }
}

function updateKPIDashboard() {
  const kpiSheet = ensureSheetNamed_(KPI_SHEET);
  const logsSheet = SpreadsheetApp.getActive().getSheetByName(LOGS_SHEET);
  
  if (!logsSheet || logsSheet.getLastRow() < 2) return;
  
  // Calculate KPIs
  const data = logsSheet.getRange(2, 1, logsSheet.getLastRow() - 1, 
    logsSheet.getLastColumn()).getValues();
  
  const today = Utilities.formatDate(new Date(), TIMEZONE, 'yyyy-MM-dd');
  const todayData = data.filter(row => row[0].includes(today));
  
  const metrics = [
    ['Total Messages Today', todayData.length, 100, 
     todayData.length >= 100 ? 'GREEN' : 'YELLOW'],
    ['SLA Breaches', todayData.filter(r => r[4] > 0).length, 0, 
     todayData.filter(r => r[4] > 0).length > 5 ? 'RED' : 'GREEN'],
    ['Avg Response Time (min)', 
     todayData.reduce((a,r) => a + (r[4] || 0), 0) / (todayData.length || 1), 
     30, 'YELLOW'],
    ['Attachments Processed', 
     todayData.filter(r => r[5]).length, 50, 'GREEN'],
    ['Groups Active', 
     [...new Set(todayData.map(r => r[1]))].length, 5, 'GREEN']
  ];
  
  // Clear and update KPI sheet
  if (kpiSheet.getLastRow() > 1) {
    kpiSheet.getRange(2, 1, kpiSheet.getLastRow() - 1, 
      kpiSheet.getLastColumn()).clear();
  }
  
  const kpiRows = metrics.map(m => [
    m[0], m[1], m[2], m[3], nowGst_(), 
    '↑', // trend placeholder
    m[3] === 'RED' ? 'HIGH' : m[3] === 'YELLOW' ? 'MEDIUM' : 'LOW',
    m[3] === 'RED' ? 'YES' : 'NO'
  ]);
  
  if (kpiRows.length > 0) {
    kpiSheet.getRange(2, 1, kpiRows.length, kpiRows[0].length)
      .setValues(kpiRows);
  }
}

/** ====== ENHANCED QUEUE MANAGEMENT ====== */
function drainQueueEnhanced() {
  Logger.log('>>> Enhanced Queue Processing Started');
  
  const cache = CacheService.getScriptCache();
  let list = (PRJ.getProperty(QUEUE_INDEX) || '').split(',').filter(Boolean);
  
  if (!list.length) {
    Logger.log('Queue is empty');
    return;
  }
  
  const MAX_PROCESS = 50;
  const toProcess = list.slice(0, MAX_PROCESS);
  const remaining = list.slice(MAX_PROCESS);
  
  const batchRows = [];
  const failed = [];
  
  toProcess.forEach(id => {
    const raw = cache.get(id);
    if (!raw) return;
    
    try {
      const data = JSON.parse(raw);
      batchRows.push([
        data.date_gst,
        data.group_name,
        data.summary,
        (data.top_keywords || []).join(', '),
        Number(data.sla_breaches || 0),
        (data.attachments || []).join(', '),
        nowGst_(),
        sha256_([data.date_gst, data.group_name, data.summary].join('||')),
        'QUEUED'
      ]);
      cache.remove(id);
    } catch(e) {
      Logger.log('Failed to process queue item: ' + id);
      failed.push(id);
    }
  });
  
  // Batch append
  if (batchRows.length > 0) {
    const result = batchAppendRows(LOGS_SHEET, batchRows);
    if (!result.ok) {
      failed.push(...toProcess);
    } else {
      Logger.log(`Successfully processed ${result.count} queued items`);
    }
  }
  
  // Update queue
  PRJ.setProperty(QUEUE_INDEX, [...remaining, ...failed].join(','));
  
  // Update KPIs
  updateKPIDashboard();
  
  Logger.log(`Queue status: ${remaining.length + failed.length} items remaining`);
}

/** ====== DAILY REPORT GENERATION ====== */
function generateDailyReport() {
  const ss = SpreadsheetApp.getActive();
  const logsSheet = ss.getSheetByName(LOGS_SHEET);
  const summarySheet = ensureSheetNamed_(SUMMARY_SHEET);
  
  if (!logsSheet || logsSheet.getLastRow() < 2) {
    SpreadsheetApp.getActive().toast('No data to generate report', 'HVDC ▶', 5);
    return;
  }
  
  const today = Utilities.formatDate(new Date(), TIMEZONE, 'yyyy-MM-dd');
  const yesterday = Utilities.formatDate(
    new Date(Date.now() - 86400000), TIMEZONE, 'yyyy-MM-dd'
  );
  
  const data = logsSheet.getRange(2, 1, logsSheet.getLastRow() - 1, 
    logsSheet.getLastColumn()).getValues();
  
  const todayData = data.filter(row => row[0].includes(today));
  const yesterdayData = data.filter(row => row[0].includes(yesterday));
  
  // Extract key operations
  const extractKeyOps = (dayData) => {
    const keywords = {};
    dayData.forEach(row => {
      const kws = (row[3] || '').split(',').map(k => k.trim());
      kws.forEach(kw => {
        if (kw) keywords[kw] = (keywords[kw] || 0) + 1;
      });
    });
    return Object.entries(keywords)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([k, v]) => `${k}(${v})`)
      .join(', ');
  };
  
  // Identify open actions
  const openActions = todayData
    .filter(row => row[2] && row[2].includes('ACTION'))
    .map(row => row[2].substring(0, 100))
    .slice(0, 5)
    .join('; ');
  
  // Identify risks
  const risks = todayData
    .filter(row => row[4] > 0) // SLA breaches
    .map(row => `SLA Breach: ${row[1]} (${row[4]} min)`)
    .slice(0, 3)
    .join('; ');
  
  // Calculate KPI score
  const kpiScore = Math.max(0, 100 - (todayData.filter(r => r[4] > 0).length * 10));
  
  // Append summary
  summarySheet.appendRow([
    today,
    extractKeyOps(yesterdayData),
    extractKeyOps(todayData),
    openActions || 'None',
    risks || 'None identified',
    'Auto-generated at ' + nowGst_(),
    kpiScore,
    todayData.filter(r => r[4] > 0).length
  ]);
  
  SpreadsheetApp.getActive().toast('Daily report generated', 'HVDC ▶', 5);
}

/** ====== BACKUP SYSTEM ====== */
function backupAllData() {
  const ss = SpreadsheetApp.getActive();
  const backupName = `HVDC_Backup_${Utilities.formatDate(new Date(), TIMEZONE, 'yyyyMMdd_HHmmss')}`;
  
  try {
    // Create backup spreadsheet
    const backup = ss.copy(backupName);
    
    // Move to backup folder (create if doesn't exist)
    const folders = DriveApp.getFoldersByName('HVDC_Backups');
    let folder;
    if (folders.hasNext()) {
      folder = folders.next();
    } else {
      folder = DriveApp.createFolder('HVDC_Backups');
    }
    
    DriveApp.getFileById(backup.getId()).moveTo(folder);
    
    // Clean old backups (keep last 30)
    const files = folder.getFiles();
    const fileList = [];
    while (files.hasNext()) {
      const file = files.next();
      fileList.push({
        id: file.getId(),
        date: file.getDateCreated()
      });
    }
    
    fileList.sort((a, b) => b.date - a.date);
    if (fileList.length > 30) {
      fileList.slice(30).forEach(f => {
        DriveApp.getFileById(f.id).setTrashed(true);
      });
    }
    
    Logger.log('Backup completed: ' + backupName);
    SpreadsheetApp.getActive().toast('Backup completed: ' + backupName, 'HVDC ▶', 5);
    
  } catch (e) {
    Logger.log('Backup failed: ' + e);
    SpreadsheetApp.getActive().toast('Backup failed: ' + e, 'HVDC ▶', 5);
  }
}

/** ====== SYSTEM HEALTH CHECK ====== */
function checkSystemHealth() {
  const checks = {
    'Sheets': checkSheets(),
    'Properties': checkProperties(),
    'Queue': checkQueue(),
    'Triggers': checkTriggers(),
    'Rate Limits': checkRateLimits()
  };
  
  const html = `
    <style>
      body { font-family: Arial, sans-serif; padding: 20px; }
      .health-check { margin-bottom: 20px; }
      .status { 
        padding: 5px 10px; 
        border-radius: 3px; 
        display: inline-block;
        margin-left: 10px;
      }
      .ok { background: #4CAF50; color: white; }
      .warning { background: #FF9800; color: white; }
      .error { background: #F44336; color: white; }
    </style>
    <h2>System Health Check</h2>
    ${Object.entries(checks).map(([name, status]) => `
      <div class="health-check">
        <strong>${name}:</strong>
        <span class="status ${status.level}">${status.message}</span>
      </div>
    `).join('')}
  `;
  
  const htmlOutput = HtmlService.createHtmlOutput(html)
    .setWidth(500)
    .setHeight(400);
  SpreadsheetApp.getUi().showModalDialog(htmlOutput, 'System Health');
}

function checkSheets() {
  const required = [INBOX_SHEET, SUMMARY_SHEET, POLICIES_SHEET, LOGS_SHEET, KPI_SHEET];
  const ss = SpreadsheetApp.getActive();
  const missing = required.filter(name => !ss.getSheetByName(name));
  
  if (missing.length === 0) {
    return { level: 'ok', message: 'All sheets present' };
  } else if (missing.length <= 2) {
    return { level: 'warning', message: `Missing: ${missing.join(', ')}` };
  } else {
    return { level: 'error', message: `Missing ${missing.length} sheets` };
  }
}

function checkProperties() {
  const required = ['API_KEY', 'WEBAPP_URL'];
  const missing = required.filter(key => !getProp_(key));
  
  if (missing.length === 0) {
    return { level: 'ok', message: 'All properties set' };
  } else {
    return { level: 'warning', message: `Missing: ${missing.join(', ')}` };
  }
}

function checkQueue() {
  const list = (PRJ.getProperty(QUEUE_INDEX) || '').split(',').filter(Boolean);
  
  if (list.length === 0) {
    return { level: 'ok', message: 'Queue empty' };
  } else if (list.length <= 10) {
    return { level: 'warning', message: `${list.length} items in queue` };
  } else {
    return { level: 'error', message: `${list.length} items backed up!` };
  }
}

function checkTriggers() {
  const triggers = ScriptApp.getProjectTriggers();
  
  if (triggers.length >= 2) {
    return { level: 'ok', message: `${triggers.length} triggers active` };
  } else if (triggers.length === 1) {
    return { level: 'warning', message: 'Only 1 trigger active' };
  } else {
    return { level: 'error', message: 'No triggers configured' };
  }
}

function checkRateLimits() {
  // Check recent rate limit hits
  const cache = CacheService.getScriptCache();
  const keys = ['rate_global', 'rate_webhook'];
  let hits = 0;
  
  keys.forEach(key => {
    const data = cache.get(key);
    if (data) {
      const parsed = JSON.parse(data);
      if (parsed.count > 80) hits++;
    }
  });
  
  if (hits === 0) {
    return { level: 'ok', message: 'No rate limit concerns' };
  } else if (hits === 1) {
    return { level: 'warning', message: 'Approaching rate limits' };
  } else {
    return { level: 'error', message: 'Rate limits being hit' };
  }
}

/** ====== AUTOMATED TRIGGERS SETUP ====== */
function setupAutomatedTriggers() {
  // Clear existing triggers
  ScriptApp.getProjectTriggers().forEach(trigger => {
    ScriptApp.deleteTrigger(trigger);
  });
  
  // Queue processing - every 5 minutes
  ScriptApp.newTrigger('drainQueueEnhanced')
    .timeBased()
    .everyMinutes(5)
    .create();
  
  // Daily report - 8 AM GST
  ScriptApp.newTrigger('generateDailyReport')
    .timeBased()
    .atHour(8)
    .everyDays(1)
    .inTimezone(TIMEZONE)
    .create();
  
  // KPI update - every 30 minutes
  ScriptApp.newTrigger('updateKPIDashboard')
    .timeBased()
    .everyMinutes(30)
    .create();
  
  // Daily backup - 2 AM GST
  ScriptApp.newTrigger('backupAllData')
    .timeBased()
    .atHour(2)
    .everyDays(1)
    .inTimezone(TIMEZONE)
    .create();
  
  // System health check - every hour
  ScriptApp.newTrigger('autoHealthCheck')
    .timeBased()
    .everyHours(1)
    .create();
  
  SpreadsheetApp.getActive().toast('5 automated triggers configured', 'HVDC ▶', 5);
}

function autoHealthCheck() {
  const checks = {
    sheets: checkSheets(),
    properties: checkProperties(),
    queue: checkQueue()
  };
  
  const hasIssues = Object.values(checks).some(c => c.level !== 'ok');
  
  if (hasIssues) {
    // Log critical issues
    Logger.log('HEALTH CHECK ALERT: ' + JSON.stringify(checks));
    
    // Could send email alert here if needed
    // MailApp.sendEmail(...);
  }
}

/** ====== ENHANCED WEB APP ENDPOINTS ====== */
function doGet(e) {
  try {
    // Check for specific endpoints
    const path = e.parameter.path;
    
    switch(path) {
      case 'kpi':
        return getKPIData();
      case 'health':
        return getHealthStatus();
      default:
        return getRecentLogs();
    }
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({status:'error', error:String(err)}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Missing menu functions
function openWebAppPopup() {
  const url = getWebAppUrl_();
  const html = `
    <html>
      <body>
        <h2>HVDC WhatsApp Integration</h2>
        <p>Web App URL: <a href="${url}" target="_blank">${url}</a></p>
        <script>
          window.open('${url}', '_blank', 'width=800,height=600');
        </script>
      </body>
    </html>
  `;
  const htmlOutput = HtmlService.createHtmlOutput(html)
    .setWidth(400)
    .setHeight(300);
  SpreadsheetApp.getUi().showModalDialog(htmlOutput, 'Web App');
}

function openWebAppSidebar() {
  const url = getWebAppUrl_();
  const html = `
    <html>
      <body>
        <h3>HVDC Web App</h3>
        <p><a href="${url}" target="_blank">Open Web App</a></p>
      </body>
    </html>
  `;
  const htmlOutput = HtmlService.createHtmlOutput(html)
    .setWidth(300);
  SpreadsheetApp.getUi().showSidebar(htmlOutput);
}

function showPolicies() {
  const ss = SpreadsheetApp.getActive();
  const pol = ss.getSheetByName(POLICIES_SHEET);
  if (!pol) {
    SpreadsheetApp.getUi().alert('Policies sheet not found. Run "Init All Sheets" first.');
    return;
  }
  
  const data = pol.getDataRange().getValues();
  const [headers, ...rows] = data;
  
  const html = `
    <style>
      body { font-family: Arial, sans-serif; padding: 20px; }
      table { border-collapse: collapse; width: 100%; }
      th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
      th { background: #4CAF50; color: white; }
    </style>
    <h2>📋 HVDC Policies</h2>
    <table>
      <thead>
        <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
      </thead>
      <tbody>
        ${rows.filter(r => r[0]).map(row => `
          <tr>
            ${row.map(cell => `<td>${cell || ''}</td>`).join('')}
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
  
  const htmlOutput = HtmlService.createHtmlOutput(html)
    .setWidth(800)
    .setHeight(600);
  
  SpreadsheetApp.getUi().showModalDialog(htmlOutput, 'HVDC Policies');
}

function getRecentLogs() {
  const sh = ensureSheetNamed_(LOGS_SHEET);
  const last = sh.getLastRow();
  const head = sh.getRange(1,1,1,sh.getLastColumn()).getValues()[0];
  const n = Math.min(10, Math.max(0, last - 1));
  const rows = n ? sh.getRange(last - n + 1, 1, n, sh.getLastColumn()).getValues() : [];
  
  return ContentService
    .createTextOutput(JSON.stringify({
      status: 'ok', 
      rows: [head].concat(rows),
      timestamp: nowGst_()
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

function getKPIData() {
  const sh = SpreadsheetApp.getActive().getSheetByName(KPI_SHEET);
  if (!sh) {
    return ContentService
      .createTextOutput(JSON.stringify({status:'error', error:'KPI sheet not found'}))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  const data = sh.getDataRange().getValues();
  return ContentService
    .createTextOutput(JSON.stringify({
      status: 'ok',
      kpis: data,
      timestamp: nowGst_()
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

function getHealthStatus() {
  const health = {
    sheets: checkSheets(),
    properties: checkProperties(),
    queue: checkQueue(),
    triggers: checkTriggers(),
    rateLimits: checkRateLimits()
  };
  
  return ContentService
    .createTextOutput(JSON.stringify({
      status: 'ok',
      health: health,
      timestamp: nowGst_()
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  Logger.log("===== Enhanced doPost START =====");
  
  const rateLimiter = new RateLimiter(RATE_LIMIT, 60000);
  
  try {
    // Rate limiting check
    if (!rateLimiter.isAllowed('global')) {
      return jsonResponse_("rate_limited", "Too many requests");
    }
    
    // Validate request
    if (!e || !e.postData || !e.postData.contents) {
      Logger.log("ERROR: Empty body");
      return jsonResponse_("error", "Empty body");
    }
    
    // Verify webhook signature if present
    const signature = e.parameter.signature;
    if (signature && !verifyWebhookSignature(e.postData.contents, signature)) {
      Logger.log("ERROR: Invalid webhook signature");
      return jsonResponse_("error", "Invalid signature");
    }
    
    const body = JSON.parse(e.postData.contents);
    Logger.log("Parsed body: " + JSON.stringify(body));

    // API key verification
    if (body.api_key !== getProp_('API_KEY','')) {
      Logger.log("ERROR: Unauthorized API key");
      return jsonResponse_("error", "Unauthorized");
    }

    // Required fields check with enhanced validation
    const required = ['date_gst','group_name','summary'];
    const missing = required.filter(k => !body[k]);
    if (missing.length) {
      Logger.log("ERROR: Missing required fields: " + missing.join(', '));
      return jsonResponse_("error", "Missing: " + missing.join(', '));
    }

    // row 배열 생성 전 검증
    if (!body.date_gst || !body.group_name || !body.summary) {
      Logger.log("ERROR: Required fields missing");
      return jsonResponse_("error", "Missing required fields");
    }

    // Detect priority from summary
    let priority = 'FYI';
    if (body.summary) {
      if (body.summary.includes('[URGENT]')) priority = 'URGENT';
      else if (body.summary.includes('[ACTION]')) priority = 'ACTION';
    }

    // Calculate SLA if response time provided
    let slaBreach = 0;
    if (body.message_time && body.response_time) {
      slaBreach = calculateSLABreach(body.message_time, body.response_time, priority);
    }

    // Prepare row data with safe defaults
    const row = [
      body.date_gst || nowGst_(),
      maskPII_(body.group_name || ''),
      maskPII_(body.summary || ''),
      (body.top_keywords || []).map(String).slice(0,50).join(', '),
      slaBreach || Number(body.sla_breaches || 0),
      (body.attachments || []).map(maskPII_).slice(0,50).join(', '),
      nowGst_(),
      sha256_([body.date_gst, body.group_name, body.summary].filter(Boolean).join('||')),
      'LIVE'
    ];

    // row 검증
    if (!row || row.length === 0) {
      Logger.log("ERROR: Row creation failed");
      return jsonResponse_("error", "Failed to create data row");
    }

    // Validate row structure
    if (row.length !== 9) {
      Logger.log("ERROR: Invalid row structure. Expected 9 columns, got " + row.length);
      return jsonResponse_("error", "Invalid data structure");
    }

    // Try to append
    const result = appendWithRetryEnhanced(row);
    
    if (!result.ok) {
      // Queue for retry
      const qid = enqueueFallback_({
        date_gst: body.date_gst,
        group_name: body.group_name,
        summary: body.summary,
        top_keywords: body.top_keywords,
        sla_breaches: slaBreach,
        attachments: body.attachments
      });
      
      return jsonResponse_("queued", `Queued for retry (${qid})`);
    }
    
    // Update KPI dashboard in background
    try {
      updateKPIDashboard();
    } catch(kpiError) {
      Logger.log("KPI update failed (non-critical): " + kpiError);
    }
    
    return jsonResponse_("ok", null, { 
      dedup: result.dedup,
      attempt: result.attempt,
      priority: priority,
      sla_breach: slaBreach
    });
    
  } catch (err) {
    Logger.log("===== doPost ERROR: " + err);
    return jsonResponse_("error", err.toString());
  }
}

function appendWithRetryEnhanced(row) {
  // Enhanced validation for row parameter
  if (!row || !Array.isArray(row) || row.length === 0) {
    Logger.log("ERROR: appendWithRetryEnhanced called with invalid row: " + JSON.stringify(row));
    return { ok: false, fatal: true, error: 'Invalid row parameter' };
  }

  const sh = ensureSheetNamed_(LOGS_SHEET);
  
  // Validate key exists
  if (!row[7]) {
    Logger.log("ERROR: Missing idempotency_key in row");
    return { ok: false, fatal: true, error: 'Missing idempotency_key' };
  }
  
  const key = row[7]; // idempotency_key
  
  // Check for duplicate
  if (existsRow_(sh, key)) {
    return { ok: true, dedup: true };
  }
  
  const lock = LockService.getDocumentLock();
  
  for (let attempt = 1; attempt <= RETRIES; attempt++) {
    try {
      lock.waitLock(5000);
      
      // Double-check after acquiring lock
      if (existsRow_(sh, key)) {
        return { ok: true, dedup: true };
      }
      
      sh.appendRow(row);
      SpreadsheetApp.flush();
      
      return { ok: true, attempt: attempt };
      
    } catch (e) {
      const msg = String(e);
      
      // Non-retryable errors
      if (/Permission|Invalid|Argument/i.test(msg)) {
        return { ok: false, fatal: true, error: msg };
      }
      
      // Exponential backoff
      if (attempt < RETRIES) {
        Utilities.sleep(BACKOFF_MS * Math.pow(2, attempt - 1));
      }
      
    } finally {
      try { lock.releaseLock(); } catch(_) {}
    }
  }
  
  return { ok: false, timeout: true, error: 'Max retries exceeded' };
}

function existsRow_(sh, key, lookback = 200) {
  const last = sh.getLastRow();
  if (last < 2) return false;
  
  const start = Math.max(2, last - lookback + 1);
  const range = sh.getRange(start, 8, last - start + 1, 1);
  const values = range.getValues();
  
  return values.some(r => r[0] === key);
}

function enqueueFallback_(payload) {
  const cache = CacheService.getScriptCache();
  const id = 'q_' + sha256_(JSON.stringify(payload)) + '_' + Date.now();
  
  cache.put(id, JSON.stringify(payload), CACHE_TTL);
  
  const list = (PRJ.getProperty(QUEUE_INDEX) || '').split(',').filter(Boolean);
  if (!list.includes(id)) {
    list.push(id);
  }
  
  PRJ.setProperty(QUEUE_INDEX, list.join(','));
  
  return id;
}

function jsonResponse_(status, message = null, extra = {}) {
  const obj = Object.assign({ status: status }, extra);
  if (message) obj.message = message;
  
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/** ====== KPI DASHBOARD UI ====== */
function showKPIDashboard() {
  const sh = SpreadsheetApp.getActive().getSheetByName(KPI_SHEET);
  if (!sh) {
    SpreadsheetApp.getUi().alert('KPI Dashboard sheet not found. Run "Init All Sheets" first.');
    return;
  }
  
  const data = sh.getDataRange().getValues();
  const [headers, ...rows] = data;
  
  const html = `
    <style>
      body { font-family: Arial, sans-serif; padding: 20px; }
      table { border-collapse: collapse; width: 100%; }
      th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
      th { background: #4CAF50; color: white; }
      .status-GREEN { color: green; font-weight: bold; }
      .status-YELLOW { color: orange; font-weight: bold; }
      .status-RED { color: red; font-weight: bold; }
      .alert-HIGH { background: #ffebee; }
      .alert-MEDIUM { background: #fff3e0; }
      .alert-LOW { background: #e8f5e9; }
    </style>
    <h2>📊 KPI Dashboard</h2>
    <p>Last updated: ${nowGst_()}</p>
    <table>
      <thead>
        <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
      </thead>
      <tbody>
        ${rows.filter(r => r[0]).map(row => `
          <tr class="alert-${row[6]}">
            ${row.map((cell, idx) => {
              if (idx === 3) { // Status column
                return `<td class="status-${cell}">${cell}</td>`;
              }
              return `<td>${cell || ''}</td>`;
            }).join('')}
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
  
  const htmlOutput = HtmlService.createHtmlOutput(html)
    .setWidth(900)
    .setHeight(600);
  
  SpreadsheetApp.getUi().showModalDialog(htmlOutput, 'KPI Dashboard');
}

/** ====== DEBUGGING TOOLS ====== */
function debugHelpers() {
  
  // 1. 테스트 데이터로 appendWithRetryEnhanced 테스트
  function testAppendWithRetry() {
    const testRow = [
      nowGst_(),
      'TEST_GROUP',
      'Test message for debugging',
      'test, debug, hvdc',
      0,
      '',
      nowGst_(),
      sha256_('test-' + Date.now()),
      'TEST'
    ];
    
    Logger.log('Testing appendWithRetryEnhanced with:');
    Logger.log(testRow);
    
    const result = appendWithRetryEnhanced(testRow);
    Logger.log('Result: ' + JSON.stringify(result));
    
    return result;
  }
  
  // 2. Webhook 시뮬레이션
  function simulateWebhook() {
    const testPayload = JSON.stringify({
      api_key: getProp_('API_KEY', 'test-key'),
      date_gst: nowGst_(),
      group_name: 'Debug Test Group',
      summary: '[ACTION] Debug test message',
      top_keywords: ['debug', 'test'],
      attachments: ['test.pdf']
    });
    
    // Secret 설정
    const secret = getProp_('WEBHOOK_SECRET', 'test-secret');
    const signature = Utilities.base64Encode(
      Utilities.computeHmacSha256Signature(testPayload, secret)
    );
    
    // doPost 시뮬레이션
    const mockRequest = {
      postData: { contents: testPayload },
      parameter: { signature: signature }
    };
    
    Logger.log('Simulating webhook with signature: ' + signature);
    const response = doPost(mockRequest);
    Logger.log('Response: ' + response.getContent());
    
    return response;
  }
  
  // 3. 데이터 무결성 체크
  function validateDataIntegrity() {
    const sh = SpreadsheetApp.getActive().getSheetByName(LOGS_SHEET);
    if (!sh) {
      Logger.log('ERROR: Logs sheet not found');
      return false;
    }
    
    const lastRow = sh.getLastRow();
    if (lastRow < 2) {
      Logger.log('No data to validate');
      return true;
    }
    
    // 최근 10개 행 검증
    const rows = sh.getRange(
      Math.max(2, lastRow - 9), 
      1, 
      Math.min(10, lastRow - 1), 
      sh.getLastColumn()
    ).getValues();
    
    let errors = [];
    rows.forEach((row, idx) => {
      // 필수 필드 체크
      if (!row[0]) errors.push(`Row ${idx}: Missing date_gst`);
      if (!row[1]) errors.push(`Row ${idx}: Missing group_name`);
      if (!row[7]) errors.push(`Row ${idx}: Missing idempotency_key`);
      
      // 중복 키 체크
      const key = row[7];
      const duplicates = rows.filter(r => r[7] === key);
      if (duplicates.length > 1) {
        errors.push(`Row ${idx}: Duplicate key ${key}`);
      }
    });
    
    if (errors.length > 0) {
      Logger.log('Data integrity issues found:');
      errors.forEach(e => Logger.log('  - ' + e));
      return false;
    }
    
    Logger.log('Data integrity check passed');
    return true;
  }
  
  // 실행
  return {
    appendTest: testAppendWithRetry(),
    webhookTest: simulateWebhook(),
    integrityCheck: validateDataIntegrity()
  };
}

// 개별 디버그 함수들
function testAppendWithRetry() {
  const testRow = [
    nowGst_(),
    'TEST_GROUP',
    'Test message for debugging',
    'test, debug, hvdc',
    0,
    '',
    nowGst_(),
    sha256_('test-' + Date.now()),
    'TEST'
  ];
  
  Logger.log('Testing appendWithRetryEnhanced with:');
  Logger.log(testRow);
  
  const result = appendWithRetryEnhanced(testRow);
  Logger.log('Result: ' + JSON.stringify(result));
  
  SpreadsheetApp.getActive().toast(
    `Test completed: ${result.ok ? 'SUCCESS' : 'FAILED'} - ${result.error || ''}`,
    'Debug Test', 5
  );
  
  return result;
}

function simulateWebhook() {
  const testPayload = JSON.stringify({
    api_key: getProp_('API_KEY', 'test-key'),
    date_gst: nowGst_(),
    group_name: 'Debug Test Group',
    summary: '[ACTION] Debug test message',
    top_keywords: ['debug', 'test'],
    attachments: ['test.pdf']
  });
  
  // Secret 설정
  const secret = getProp_('WEBHOOK_SECRET', 'test-secret');
  const signature = Utilities.base64Encode(
    Utilities.computeHmacSha256Signature(testPayload, secret)
  );
  
  // doPost 시뮬레이션
  const mockRequest = {
    postData: { contents: testPayload },
    parameter: { signature: signature }
  };
  
  Logger.log('Simulating webhook with signature: ' + signature);
  const response = doPost(mockRequest);
  Logger.log('Response: ' + response.getContent());
  
  SpreadsheetApp.getActive().toast(
    'Webhook simulation completed. Check logs for details.',
    'Debug Test', 5
  );
  
  return response;
}

function validateDataIntegrity() {
  const sh = SpreadsheetApp.getActive().getSheetByName(LOGS_SHEET);
  if (!sh) {
    Logger.log('ERROR: Logs sheet not found');
    SpreadsheetApp.getActive().toast('ERROR: Logs sheet not found', 'Debug Test', 5);
    return false;
  }
  
  const lastRow = sh.getLastRow();
  if (lastRow < 2) {
    Logger.log('No data to validate');
    SpreadsheetApp.getActive().toast('No data to validate', 'Debug Test', 5);
    return true;
  }
  
  // 최근 10개 행 검증
  const rows = sh.getRange(
    Math.max(2, lastRow - 9), 
    1, 
    Math.min(10, lastRow - 1), 
    sh.getLastColumn()
  ).getValues();
  
  let errors = [];
  rows.forEach((row, idx) => {
    // 필수 필드 체크
    if (!row[0]) errors.push(`Row ${idx}: Missing date_gst`);
    if (!row[1]) errors.push(`Row ${idx}: Missing group_name`);
    if (!row[7]) errors.push(`Row ${idx}: Missing idempotency_key`);
    
    // 중복 키 체크
    const key = row[7];
    const duplicates = rows.filter(r => r[7] === key);
    if (duplicates.length > 1) {
      errors.push(`Row ${idx}: Duplicate key ${key}`);
    }
  });
  
  if (errors.length > 0) {
    Logger.log('Data integrity issues found:');
    errors.forEach(e => Logger.log('  - ' + e));
    SpreadsheetApp.getActive().toast(
      `Data integrity check failed: ${errors.length} issues found`,
      'Debug Test', 5
    );
    return false;
  }
  
  Logger.log('Data integrity check passed');
  SpreadsheetApp.getActive().toast('Data integrity check passed', 'Debug Test', 5);
  return true;
}