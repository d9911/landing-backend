interface MailData {
  name: string
  phone: string
  email: string
  comment: string
}

export const createOwnerMailHtml = ({ name, phone, email, comment }: MailData): string => `
    <div style="font-family: 'Inter', system-ui, -apple-system, sans-serif; max-width: 550px; margin: 0 auto; padding: 24px; color: #1a202c; background-color: #f7fafc; border-radius: 12px;">

      <div style="background: #1a202c; padding: 16px 20px; border-radius: 8px 8px 0 0; margin-bottom: 0;">
        <h2 style="color: #ffffff; margin: 0; font-size: 18px; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase;">
          🚀 Получен новый лид!
        </h2>
      </div>

      <div style="background: #ffffff; padding: 24px; border-radius: 0 0 8px 8px; border: 1px solid #e2e8f0; border-top: none;">

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr style="border-bottom: 1px solid #edf2f7;">
            <td style="padding: 10px 0; color: #718096; font-size: 14px; width: 100px; font-weight: 500;">Имя:</td>
            <td style="padding: 10px 0; font-size: 15px; font-weight: 600; color: #2d3748;">${name}</td>
          </tr>
          <tr style="border-bottom: 1px solid #edf2f7;">
            <td style="padding: 10px 0; color: #718096; font-size: 14px; font-weight: 500;">Телефон:</td>
            <td style="padding: 10px 0; font-size: 15px; font-weight: 600;">
              <a href="tel:${phone}" style="color: #ff7a17; text-decoration: none;">${phone}</a>
            </td>
          </tr>
          <tr style="border-bottom: 1px solid #edf2f7;">
            <td style="padding: 10px 0; color: #718096; font-size: 14px; font-weight: 500;">Email:</td>
            <td style="padding: 10px 0; font-size: 15px;">
              <a href="mailto:${email}" style="color: #ff7a17; text-decoration: none; font-weight: 500;">${email}</a>
            </td>
          </tr>
        </table>

        <div style="margin-top: 24px;">
          <h4 style="margin: 0 0 10px 0; color: #4a5568; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
            💬 Комментарий заказчика:
          </h4>
          <div style="background: #fdfbf7; padding: 16px; border-left: 4px solid #ff7a17; border-radius: 0 8px 8px 0; font-size: 14px; line-height: 1.6; color: #2d3748; font-style: italic;">
            ${comment ? comment.replace(/\n/g, '<br>') : '<span style="color: #a0aec0;">Пользователь не оставил комментарий</span>'}
          </div>
        </div>

      </div>

      <div style="text-align: center; margin-top: 20px; font-size: 11px; color: #a0aec0;">
        <p style="margin: 0;">Письмо сгенерировано автоматически формой обратной связи.</p>
        <p style="margin: 4px 0 0 0;">Den Gu Studio © 2026</p>
      </div>

    </div>
`

export const createUserMailHtml = ({ name, comment }: Pick<MailData, 'name' | 'comment'>): string => `
    <div style="font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #2d3748; background-color: #ffffff; border: 1px solid #edf2f7; border-radius: 12px;">

      <div style="border-bottom: 2px solid #ff7a17; padding-bottom: 16px; margin-bottom: 24px;">
        <h2 style="color: #ff7a17; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">Den Gu Studio</h2>
        <p style="margin: 4px 0 0 0; font-size: 14px; color: #718096;">Digital-разработка и дизайн</p>
      </div>

      <h3 style="font-size: 18px; font-weight: 600; margin-top: 0; margin-bottom: 12px; color: #1a202c;">
        Здравствуйте, ${name}!
      </h3>

      <p style="font-size: 15px; line-height: 1.6; margin-bottom: 16px; color: #4a5568;">
        Спасибо за ваше обращение! Мы успешно получили вашу заявку на разработку. Наш менеджер уже изучает детали и свяжется с вами в течение <strong>2-3 часов</strong> (в рабочее время), чтобы обсудить проект.
      </p>

      <p style="font-size: 15px; line-height: 1.6; margin-bottom: 8px; color: #4a5568;">
        Копия вашего сообщения для проверки:
      </p>

      <div style="background: #fdfbf7; padding: 16px; border-left: 4px solid #ff7a17; border-radius: 0 8px 8px 0; margin-bottom: 24px;">
        <p style="margin: 0 0 8px 0; font-size: 12px; text-transform: uppercase; font-weight: 700; color: #a0aec0; letter-spacing: 0.5px;">Ваш запрос:</p>
        <p style="margin: 0; font-size: 14px; line-height: 1.5; color: #2d3748; font-style: italic;">
          ${comment ? comment : '<i>(Комментарий не был указан)</i>'}
        </p>
      </div>

      <div style="background: #f7fafc; padding: 16px; border-radius: 8px; font-size: 14px; color: #718096; line-height: 1.5;">
        <p style="margin: 0 0 6px 0; font-weight: 600; color: #4a5568;">Остаемся на связи:</p>
        <p style="margin: 0;">Если вам нужно срочно дополнить ТЗ или внести изменения, вы можете просто ответить на это письмо или написать нам напрямую.</p>
      </div>

      <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #edf2f7; text-align: center; font-size: 12px; color: #a0aec0;">
        <p style="margin: 0;">С уважением, команда Den Gu Studio</p>
        <p style="margin: 4px 0 0 0;">Это автоматическое уведомление, на него можно отвечать.</p>
      </div>

    </div>
  `
