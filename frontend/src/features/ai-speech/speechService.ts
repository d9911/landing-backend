interface IWindow extends Window {
  SpeechRecognition?: any
  webkitSpeechRecognition?: any
}

export function initSpeechAnalyzer(): void {
  const micTrigger = document.getElementById('mic-trigger') as HTMLDivElement | null
  const micStatus = document.getElementById('mic-status') as HTMLDivElement | null
  const liveTranscript = document.getElementById('live-transcript') as HTMLDivElement | null
  const analysisText = document.getElementById('analysis-text') as HTMLDivElement | null
  const kpiScore = document.getElementById('kpi-score') as HTMLDivElement | null
  const kpiScoreEl = document.getElementById('kpi-score') as HTMLDivElement | null
  const kpiWords = document.getElementById('kpi-words') as HTMLDivElement | null
  const kpiChars = document.getElementById('kpi-chars') as HTMLDivElement | null
  const kpiTimer = document.getElementById('kpi-calls') as HTMLDivElement | null

  let score = 78
  let seconds = 0
  let timerInterval: any = null
  let recognition: any = null
  let isRecording = false

  if (!micTrigger || !micStatus || !liveTranscript || !analysisText) return

  const transcriptWrapper = liveTranscript.parentElement
  if (transcriptWrapper) {
    const copyBtn = document.createElement('button')
    copyBtn.className = 'copy-btn'
    copyBtn.textContent = '📋'
    copyBtn.title = 'Скопировать текст'
    transcriptWrapper.style.position = 'relative'
    transcriptWrapper.appendChild(copyBtn)

    copyBtn.addEventListener('click', () => {
      const textToCopy = liveTranscript.innerText
      navigator.clipboard.writeText(textToCopy).then(() => {
        const originalText = copyBtn.textContent
        copyBtn.textContent = '✅'
        setTimeout(() => (copyBtn.textContent = originalText), 2000)
      })
    })
  }

  const customWindow = window as unknown as IWindow
  const SpeechRecognitionClass = customWindow.SpeechRecognition || customWindow.webkitSpeechRecognition

  if (!SpeechRecognitionClass) {
    micStatus.textContent = 'Ваш браузер не поддерживает Web Speech API.'
    micTrigger.style.opacity = '0.5'
    micTrigger.style.cursor = 'not-allowed'
    return
  }

  recognition = new SpeechRecognitionClass()
  recognition.lang = 'ru-RU'
  recognition.continuous = true
  recognition.interimResults = true

  function startTimer() {
    timerInterval = setInterval(() => {
      seconds++
      const mins = Math.floor(seconds / 60)
        .toString()
        .padStart(2, '0')
      const secs = (seconds % 60).toString().padStart(2, '0')
      if (kpiTimer) kpiTimer.textContent = `${mins}:${secs}`
    }, 1000)
  }

  function stopTimer() {
    clearInterval(timerInterval)
  }

  // Обновление метрик текста
  function updateTextMetrics(text: string) {
    const words = text
      .trim()
      .split(/\s+/)
      .filter((w) => w.length > 0).length
    const charsWithSpaces = text.length
    const charsNoSpaces = text.replace(/\s/g, '').length

    // Обновляем DOM (нужно добавить эти элементы в HTML!)
    const wordsEl = document.getElementById('kpi-words')
    const charsEl = document.getElementById('kpi-chars')
    if (wordsEl) wordsEl.textContent = words.toString()
    if (charsEl) charsEl.textContent = `${charsNoSpaces} / ${charsWithSpaces}`
  }
  recognition.onstart = () => {
    isRecording = true
    micTrigger.classList.add('active')
    micStatus.textContent = 'Запись активна. Говорите в микрофон...'

    // Запускаем таймер
    let seconds = 0
    timerInterval = setInterval(() => {
      seconds++
      const mins = Math.floor(seconds / 60)
        .toString()
        .padStart(2, '0')
      const secs = (seconds % 60).toString().padStart(2, '0')
      const timerEl = document.getElementById('kpi-calls')
      if (timerEl) timerEl.textContent = `${mins}:${secs}`
    }, 1000)
  }

  recognition.onresult = (event: any) => {
    let interimTranscript = ''
    let finalTranscript = ''

    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        finalTranscript += event.results[i][0].transcript
      } else {
        interimTranscript += event.results[i][0].transcript
      }
    }

    liveTranscript.innerHTML = `<span style="color:var(--colors-text)">${finalTranscript}</span><span style="color:var(--colors-steel)">${interimTranscript}</span>`
    updateTextMetrics(finalTranscript)
    evaluateSpeechText(finalTranscript.toLowerCase())
  }

  recognition.onerror = () => stopVoiceRecording()
  recognition.onend = () => stopVoiceRecording()

  function stopVoiceRecording(): void {
    isRecording = false
    micTrigger?.classList.remove('active')
    if (micStatus) micStatus.textContent = 'Запись остановлена. Нажмите для нового сеанса.'

    clearInterval(timerInterval)
    timerInterval = null

    if (recognition) {
      recognition.stop()
    }

    micTrigger?.classList.remove('active')
    if (micStatus) micStatus.textContent = 'Запись остановлена. Нажмите для нового сеанса.'
  }

  function evaluateSpeechText(text: string): void {
    if (text.length < 5) return

    let score = 78
    let feedbackHtml = ''
    let newScore = 78
    if (text.includes('здравствуйте')) newScore += 5
    if (text.includes('дорого')) newScore -= 10

    if (text.includes('здравствуйте') || text.includes('добрый день')) {
      score += 10
      feedbackHtml += `<p style="color:var(--colors-good); margin-bottom:6px;"><b>[ФЛАГ РОП]:</b> Приветствие отработано корректно (+10 баллов).</p>`
    }
    if (text.includes('скидка') || text.includes('дешевле')) {
      score -= 15
      feedbackHtml += `<p style="color:var(--colors-warn); margin-bottom:6px;"><b>[ФЛАГ РОП]:</b> Обнаружен преждевременный демпинг цены (-15 баллов).</p>`
    }
    if (text.includes('дорого') || text.includes('нет денег')) {
      score -= 20
      feedbackHtml += `<p style="color:var(--colors-bad); margin-bottom:6px;"><b>[ФЛАГ РОП]:</b> Провал этапа отработки возражений.</p>`
    }

    score = Math.max(30, Math.min(100, score))

    score = newScore
    if (kpiScore) kpiScore.innerHTML = `${score}<span>/100</span>`

    if (analysisText) {
      analysisText.innerHTML = `
        <div style="font-size:24px; font-weight:700; margin-bottom:12px; color:var(--colors-text)">${score} из 100 баллов</div>
        ${feedbackHtml || '<p style="color:var(--colors-steel)">Текст обрабатывается. Отклонений пока не обнаружено.</p>'}
        <p style="margin-top:12px; font-size:12px; color:var(--colors-steel)">Транскрипт: "${text}"</p>
      `
    }

    if (kpiScoreEl) {
      kpiScoreEl.textContent = score.toString()
      if (score >= 80) kpiScoreEl.style.color = 'var(--colors-good)'
      else if (score < 50) kpiScoreEl.style.color = 'var(--colors-bad)'
      else kpiScoreEl.style.color = 'var(--colors-text)'
    }
  }
  micTrigger.addEventListener('click', () => {
    if (isRecording) {
      stopVoiceRecording() // Используем нашу универсальную функцию
    } else {
      liveTranscript.textContent = 'Ожидание голоса...'
      recognition.start()
    }
  })
}
