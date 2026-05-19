// Расширяем глобальный объект Window для поддержки Web Speech API
interface IWindow extends Window {
  SpeechRecognition?: any;
  webkitSpeechRecognition?: any;
}

export function initSpeechAnalyzer(): void {
  const micTrigger = document.getElementById('mic-trigger') as HTMLDivElement | null;
  const micStatus = document.getElementById('mic-status') as HTMLDivElement | null;
  const liveTranscript = document.getElementById('live-transcript') as HTMLDivElement | null;
  const analysisText = document.getElementById('analysis-text') as HTMLDivElement | null;

  if (!micTrigger || !micStatus || !liveTranscript || !analysisText) return;

  const customWindow = window as unknown as IWindow;
  const SpeechRecognitionClass = customWindow.SpeechRecognition || customWindow.webkitSpeechRecognition;

  let recognition: any = null;
  let isRecording = false;

  if (!SpeechRecognitionClass) {
    micStatus.textContent = 'Ваш браузер не поддерживает Web Speech API.';
    micTrigger.style.opacity = '0.5';
    micTrigger.style.cursor = 'not-allowed';
    return;
  }

  recognition = new SpeechRecognitionClass();
  recognition.lang = 'ru-RU';
  recognition.continuous = true;
  recognition.interimResults = true;

  recognition.onstart = () => {
    isRecording = true;
    micTrigger.classList.add('active');
    micStatus.textContent = 'Запись активна. Говорите в микрофон...';
  };

  recognition.onresult = (event: any) => {
    let interimTranscript = '';
    let finalTranscript = '';

    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        finalTranscript += event.results[i][0].transcript;
      } else {
        interimTranscript += event.results[i][0].transcript;
      }
    }

    liveTranscript.innerHTML = `<span style="color:#ffffff">${finalTranscript}</span><span style="color:var(--colors-steel)">${interimTranscript}</span>`;
    evaluateSpeechText(finalTranscript.toLowerCase());
  };

  recognition.onerror = () => stopVoiceRecording();
  recognition.onend = () => stopVoiceRecording();

  function stopVoiceRecording(): void {
    isRecording = false;
    micTrigger?.classList.remove('active');
    if (micStatus) micStatus.textContent = 'Запись остановлена. Нажмите для нового сеанса.';
  }

  function evaluateSpeechText(text: string): void {
    if (text.length < 5) return;

    let score = 78;
    let feedbackHtml = '';

    if (text.includes('здравствуйте') || text.includes('добрый день')) {
      score += 10;
      feedbackHtml += `<p style="color:var(--colors-good); margin-bottom:6px;"><b>[ФЛАГ РОП]:</b> Приветствие отработано корректно (+10 баллов).</p>`;
    }
    if (text.includes('скидка') || text.includes('дешевле')) {
      score -= 15;
      feedbackHtml += `<p style="color:var(--colors-warn); margin-bottom:6px;"><b>[ФЛАГ РОП]:</b> Обнаружен преждевременный демпинг цены (-15 баллов).</p>`;
    }
    if (text.includes('дорого') || text.includes('нет денег')) {
      score -= 20;
      feedbackHtml += `<p style="color:var(--colors-bad); margin-bottom:6px;"><b>[ФЛАГ РОП]:</b> Провал этапа отработки возражений.</p>`;
    }

    score = Math.max(30, Math.min(100, score));

    const kpiScore = document.getElementById('kpi-score');
    if (kpiScore) kpiScore.innerHTML = `${score}<span style="font-size:14px;color:var(--colors-steel)">/100</span>`;

    if (analysisText) {
      analysisText.innerHTML = `
        <div style="font-size:24px; font-weight:700; margin-bottom:12px; color:#ffffff">${score} из 100 баллов</div>
        ${feedbackHtml || '<p style="color:var(--colors-steel)">Текст обрабатывается. Отклонений пока не обнаружено.</p>'}
        <p style="margin-top:12px; font-size:12px; color:var(--colors-steel)">Транскрипт: "${text}"</p>
      `;
    }
  }

  micTrigger.addEventListener('click', () => {
    if (isRecording) {
      recognition.stop();
    } else {
      liveTranscript.textContent = 'Ожидание голоса...';
      recognition.start();
    }
  });
}