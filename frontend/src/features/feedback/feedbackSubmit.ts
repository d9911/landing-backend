export function initFeedbackForm(): void {
  const form = document.getElementById('contact-feedback-form') as HTMLFormElement | null;
  if (!form) return;

  form.addEventListener('submit', async (e: Event) => {
    e.preventDefault();

    const nameInput = document.getElementById('u-name') as HTMLInputElement;
    const phoneInput = document.getElementById('u-phone') as HTMLInputElement;
    const emailInput = document.getElementById('u-email') as HTMLInputElement;
    const commentInput = document.getElementById('u-comment') as HTMLTextAreaElement;

    const statusBanner = document.getElementById('form-status-banner') as HTMLDivElement;
    const submitBtn = document.getElementById('submit-action-btn') as HTMLButtonElement;
    const btnText = submitBtn.querySelector('span') as HTMLSpanElement;

    const name = nameInput.value.trim();
    const phone = phoneInput.value.trim();
    const email = emailInput.value.trim();
    const comment = commentInput.value.trim();

    statusBanner.className = 'form-status';
    statusBanner.style.display = 'none';

    if (!name || !phone || !email || !comment) {
      statusBanner.style.display = '';
      statusBanner.textContent = 'Ошибка: Все поля формы обязательны для заполнения.';
      statusBanner.className = 'form-status error';
      return;
    }

    const emailValidator = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailValidator.test(email)) {
      statusBanner.style.display = '';
      statusBanner.textContent = 'Ошибка: Указан некорректный формат почтового адреса.';
      statusBanner.className = 'form-status error';
      return;
    }

    submitBtn.disabled = true;
    btnText.textContent = 'Отправка данных на API...';

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, email, comment }),
      });

      const data = await response.json();
      statusBanner.style.display = '';

      if (response.ok) {
        if (data.warning) {
          statusBanner.innerHTML = `
            <strong style="color: #997300;">✅ Заявка успешно отправлена разработчику!</strong><br>
            <span style="font-size: 13px; margin-top: 6px; display: block; color: #b38b00;">
              <b>⚠️ Предупреждение системы:</b> ${data.warning}
            </span>
          `;
          statusBanner.className = 'form-status warning';
        } else {
          statusBanner.textContent = data.message || 'Успешно! Ваше сообщение зарегистрировано.';
          statusBanner.className = 'form-status success';
        }
        form.reset();
      } else {
        statusBanner.textContent = data.error || 'Ошибка сервера при валидации контракта.';
        statusBanner.className = 'form-status error';
      }
    } catch (err) {
      statusBanner.style.display = '';
      statusBanner.textContent = 'Сбой сети: Не удалось соединиться с API-сервером бэкенда.';
      statusBanner.className = 'form-status error';
    } finally {
      submitBtn.disabled = false;
      btnText.textContent = 'Отправить сообщение';
    }
  });
}