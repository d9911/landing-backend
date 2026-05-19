/* === ИНТЕГРАЦИЯ WEB SPEECH API ДЛЯ МАСТОДОНТ РОП === */
const micTrigger = document.getElementById('mic-trigger')
const micStatus = document.getElementById('mic-status')
const liveTranscript = document.getElementById('live-transcript')
const analysisText = document.getElementById('analysis-text')

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
let recognition = null
let isRecording = false

if (!SpeechRecognition) {
  micStatus.textContent = 'Ваш браузер не поддерживает native Web Speech API. Рекомендуется использовать Google Chrome.'
  micTrigger.disabled = true
} else {
  recognition = new SpeechRecognition()
  recognition.lang = 'ru-RU'
  recognition.continuous = true
  recognition.interimResults = true

  recognition.onstart = () => {
    isRecording = true
    micTrigger.classList.add('active')
    micStatus.textContent = 'Запись активна. Говорите в микрофон...'
  }

  recognition.onresult = (event) => {
    let interimTranscript = ''
    let finalTranscript = ''

    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        finalTranscript += event.results[i][0].transcript
      } else {
        interimTranscript += event.results[i][0].transcript
      }
    }
    liveTranscript.innerHTML = `<span style="color:#ffffff">${finalTranscript}</span><span style="color:var(--colors-steel)">${interimTranscript}</span>`

    // Детерминированный локальный парсинг речевых паттернов для симуляции ИИ
    evaluateSpeechText(finalTranscript.toLowerCase())
  }

  recognition.onerror = () => {
    stopVoiceRecording()
  }

  recognition.onend = () => {
    stopVoiceRecording()
  }
}

micTrigger.addEventListener('click', () => {
  if (!recognition) return
  if (isRecording) {
    recognition.stop()
  } else {
    liveTranscript.textContent = ''
    recognition.start()
  }
})

function stopVoiceRecording() {
  isRecording = false
  micTrigger.classList.remove('active')
  micStatus.textContent = 'Запись остановлена. Нажмите для нового сеанса.'
}

function evaluateSpeechText(text) {
  if (text.length < 5) return

  let score = 78
  let feedbackHtml = ''

  if (text.includes('здравствуйте') || text.includes('добрый день')) {
    score += 10
    feedbackHtml += `<p style="color:var(--colors-good); margin-bottom:6px;"><b>[ФЛАГ РОП]:</b> Приветствие отработано корректно соответствии со скриптом (+10 баллов).</p>`
  }
  if (text.includes('скидка') || text.includes('дешевле')) {
    score -= 15
    feedbackHtml += `<p style="color:var(--colors-warn); margin-bottom:6px;"><b>[ФЛАГ РОП]:</b> Обнаружен преждевременный демпинг цены без выявления ценности (-15 баллов).</p>`
  }
  if (text.includes('дорого') || text.includes('нет денег')) {
    score -= 20
    feedbackHtml += `<p style="color:var(--colors-bad); margin-bottom:6px;"><b>[ФЛАГ РОП]:</b> Провал этапа отработки возражений. Рекомендуется ручной разбор звонка РОПом.</p>`
  }

  score = Math.max(30, Math.min(100, score))
  document.getElementById('kpi-score').innerHTML = `${score}<span style="font-size:14px;color:var(--colors-steel)">/100</span>`
  document.getElementById('kpi-calls').textContent = '33'

  analysisText.innerHTML = `
                <div style="font-size:24px; font-weight:700; margin-bottom:12px; color:#ffffff">${score} из 100 баллов</div>
                ${feedbackHtml || '<p style="color:var(--colors-steel)">Текст обрабатывается. Критических триггерных отклонений от скрипта РОП пока не обнаружено.</p>'}
                <p style="margin-top:12px; font-size:12px; color:var(--colors-steel)">Транскрибированный текст: "${text}"</p>
            `
}

/* === ФУЛЛ-ЦИКЛ ОБРАБОТКИ ФОРМЫ ОБРАТНОЙ СВЯЗИ === */
document.getElementById('contact-feedback-form').addEventListener('submit', async function (e) {
  e.preventDefault()

  const name = document.getElementById('u-name').value.trim()
  const phone = document.getElementById('u-phone').value.trim()
  const email = document.getElementById('u-email').value.trim()
  const comment = document.getElementById('u-comment').value.trim()

  const statusBanner = document.getElementById('form-status-banner')
  const submitBtn = document.getElementById('submit-action-btn')

  statusBanner.className = 'form-status'
  statusBanner.style.display = 'none'

  // Нативная валидация на стороне клиента
  if (!name || !phone || !email || !comment) {
    statusBanner.textContent = 'Ошибка: Все поля формы обязательны для заполнения.'
    statusBanner.classList.add('error')
    return
  }

  const emailValidator = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailValidator.test(email)) {
    statusBanner.textContent = 'Ошибка: Указан некорректный формат почтового адреса.'
    statusBanner.classList.add('error')
    return
  }

  // Включение состояния Loading
  submitBtn.disabled = true
  submitBtn.querySelector('span').textContent = 'Отправка данных на API...'

  try {
    const response = await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, phone, email, comment }),
    })

    const data = await response.json()

    if (response.ok) {
      // Включение состояния Success
      statusBanner.textContent = 'Успешно! Ваше сообщение зарегистрировано. Копия подтверждения отправлена на ваш Email.'
      statusBanner.classList.add('success')
      document.getElementById('contact-feedback-form').reset()
    } else {
      // Обработка серверных ошибок валидации
      statusBanner.textContent = data.error || 'Ошибка сервера при валидации контракта.'
      statusBanner.classList.add('error')
    }
  } catch (err) {
    // Обработка сетевых сбоев
    statusBanner.textContent = 'Сбой сети: Не удалось соединиться с API-сервером бэкенда.'
    statusBanner.classList.add('error')
  } finally {
    // Выход из состояния Loading
    submitBtn.disabled = false
    submitBtn.querySelector('span').textContent = 'Отправить сообщение'
  }
})