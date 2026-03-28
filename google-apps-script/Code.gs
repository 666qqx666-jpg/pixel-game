/**
 * 绑定在同一张电子表格：扩展程序 > Apps Script
 * 工作表：「题目」「回答」
 * 部署：部署为网络应用，访问权限：任何人
 */
var SHEET_Q = '题目'
var SHEET_A = '回答'

function doPost (e) {
  try {
    var raw = (e.postData && e.postData.contents) || '{}'
    var body = JSON.parse(raw)
    if (body.action === 'getQuestions') {
      return jsonOut(getQuestions_(body.count))
    }
    if (body.action === 'submit') {
      return jsonOut(submit_(body))
    }
    return jsonOut({ ok: false, error: 'unknown action' })
  } catch (err) {
    return jsonOut({ ok: false, error: String(err) })
  }
}

function doGet (e) {
  return jsonOut({ ok: false, hint: '请用 POST JSON，或改脚本支持 GET 测试' })
}

function jsonOut (obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON)
}

function getQuestions_ (requested) {
  var ss = SpreadsheetApp.getActiveSpreadsheet()
  var sh = ss.getSheetByName(SHEET_Q)
  if (!sh) return { ok: false, error: '找不到工作表：' + SHEET_Q }

  var values = sh.getDataRange().getValues()
  if (values.length < 2) return { ok: true, questions: [] }

  var h = values[0]
  var col = headerMap_(h)
  var need = ['题号', '题目', 'A', 'B', 'C', 'D']
  for (var i = 0; i < need.length; i++) {
    if (col[need[i]] === undefined) {
      return { ok: false, error: '题目表缺少列：' + need[i] }
    }
  }

  var rows = []
  for (var r = 1; r < values.length; r++) {
    var row = values[r]
    var qtext = String(row[col['题目']] || '').trim()
    if (!qtext) continue
    rows.push({
      questionNo: String(row[col['题号']]).trim(),
      question: qtext,
      A: String(row[col['A']] || ''),
      B: String(row[col['B']] || ''),
      C: String(row[col['C']] || ''),
      D: String(row[col['D']] || '')
    })
  }

  shuffle_(rows)
  var n = parseInt(requested, 10)
  if (!n || n < 1) n = 5
  n = Math.min(n, rows.length)
  return { ok: true, questions: rows.slice(0, n) }
}

function loadAnswerKey_ () {
  var ss = SpreadsheetApp.getActiveSpreadsheet()
  var sh = ss.getSheetByName(SHEET_Q)
  var values = sh.getDataRange().getValues()
  var h = values[0]
  var col = headerMap_(h)
  var map = {}
  for (var r = 1; r < values.length; r++) {
    var row = values[r]
    var no = String(row[col['题号']]).trim()
    var ans = normalizeChoice_(row[col['解答']])
    if (no && ans) map[no] = ans
  }
  return map
}

function submit_ (body) {
  var playerId = String(body.playerId || '').trim()
  if (!playerId) return { ok: false, error: '缺少 playerId' }

  var answers = body.answers || []
  var passTh = parseInt(body.passThreshold, 10)
  if (!passTh || passTh < 1) passTh = 3

  var key = loadAnswerKey_()
  var correct = 0
  for (var i = 0; i < answers.length; i++) {
    var a = answers[i]
    var no = String(a.questionNo).trim()
    var choice = normalizeChoice_(a.choice)
    if (key[no] && key[no] === choice) correct++
  }

  var total = answers.length
  var passed = correct >= passTh && total > 0

  var ss = SpreadsheetApp.getActiveSpreadsheet()
  var sh = ss.getSheetByName(SHEET_A)
  if (!sh) return { ok: false, error: '找不到工作表：' + SHEET_A }

  var rng = sh.getDataRange()
  var vals = rng.getValues()
  if (vals.length < 1) return { ok: false, error: '回答表为空' }

  var hc = headerMap_(vals[0])
  var req = ['ID', '闯关次数', '总分', '最高分', '第一次通关分数', '花了几次通关', '最近游玩时间']
  for (var j = 0; j < req.length; j++) {
    if (hc[req[j]] === undefined) {
      return { ok: false, error: '回答表缺少列：' + req[j] }
    }
  }

  var rowIdx = findPlayerRow_(vals, hc['ID'], playerId)
  var nowStr = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss')

  if (rowIdx < 0) {
    var newRow = rowTemplate_(vals[0])
    newRow[hc['ID']] = playerId
    newRow[hc['闯关次数']] = 1
    newRow[hc['总分']] = correct
    newRow[hc['最高分']] = correct
    newRow[hc['第一次通关分数']] = passed ? correct : ''
    newRow[hc['花了几次通关']] = passed ? 1 : ''
    newRow[hc['最近游玩时间']] = nowStr
    sh.appendRow(newRow)
    return {
      ok: true,
      correct: correct,
      total: total,
      passed: passed,
      summary: {
        attempts: 1,
        highScore: correct,
        firstPassScore: passed ? correct : null,
        attemptsToFirstPass: passed ? 1 : null,
        lastPlayed: nowStr
      }
    }
  }

  var prev = vals[rowIdx]
  var attempts = parseInt(prev[hc['闯关次数']], 10) || 0
  attempts += 1
  var high = Math.max(parseInt(prev[hc['最高分']], 10) || 0, correct)
  var firstPassCell = prev[hc['第一次通关分数']]
  var firstPassNum = firstPassCell === '' || firstPassCell === null ? null : parseInt(firstPassCell, 10)
  var attemptsToFirst = prev[hc['花了几次通关']]
  var attemptsToFirstNum = attemptsToFirst === '' || attemptsToFirst === null
    ? null
    : parseInt(attemptsToFirst, 10)

  var newFirstPass = firstPassNum
  var newAttemptsToFirst = attemptsToFirstNum

  if (passed) {
    if (firstPassNum == null || isNaN(firstPassNum)) {
      newFirstPass = correct
      newAttemptsToFirst = attempts
    }
  }

  sh.getRange(rowIdx + 1, hc['闯关次数'] + 1).setValue(attempts)
  sh.getRange(rowIdx + 1, hc['总分'] + 1).setValue(correct)
  sh.getRange(rowIdx + 1, hc['最高分'] + 1).setValue(high)
  if (newFirstPass != null && !isNaN(newFirstPass)) {
    sh.getRange(rowIdx + 1, hc['第一次通关分数'] + 1).setValue(newFirstPass)
  }
  if (newAttemptsToFirst != null && !isNaN(newAttemptsToFirst)) {
    sh.getRange(rowIdx + 1, hc['花了几次通关'] + 1).setValue(newAttemptsToFirst)
  }
  sh.getRange(rowIdx + 1, hc['最近游玩时间'] + 1).setValue(nowStr)

  return {
    ok: true,
    correct: correct,
    total: total,
    passed: passed,
    summary: {
      attempts: attempts,
      highScore: high,
      firstPassScore: newFirstPass,
      attemptsToFirstPass: newAttemptsToFirst,
      lastPlayed: nowStr
    }
  }
}

function headerMap_ (headerRow) {
  var m = {}
  for (var c = 0; c < headerRow.length; c++) {
    var name = String(headerRow[c] || '').trim()
    if (name) m[name] = c
  }
  return m
}

function shuffle_ (arr) {
  for (var i = arr.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1))
    var t = arr[i]
    arr[i] = arr[j]
    arr[j] = t
  }
}

function normalizeChoice_ (v) {
  var s = String(v == null ? '' : v).trim().toUpperCase()
  if (s === 'Ａ') s = 'A'
  if (s === 'Ｂ') s = 'B'
  if (s === 'Ｃ') s = 'C'
  if (s === 'Ｄ') s = 'D'
  return s
}

function findPlayerRow_ (vals, idCol, playerId) {
  for (var r = 1; r < vals.length; r++) {
    if (String(vals[r][idCol]).trim() === playerId) return r
  }
  return -1
}

function rowTemplate_ (headerRow) {
  var row = []
  for (var i = 0; i < headerRow.length; i++) row.push('')
  return row
}
