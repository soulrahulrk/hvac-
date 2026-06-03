export class MessagingGateway {
  async sendSms(to: string, message: string) {
    const key = process.env.TEXTBELT_API_KEY;
    if (key) {
      const response = await fetch('https://textbelt.com/text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone: to, message, key }),
      });
      return response.json();
    } else {
      console.log('[MOCK SMS]', to, message);
      return { success: true, mock: true };
    }
  }

  async sendEmail(to: string, subject: string, body: string) {
    const key = process.env.MAILGUN_API_KEY;
    if (key) {
      const domain = process.env.MAILGUN_DOMAIN || 'sandbox.mailgun.org';
      const params = new URLSearchParams();
      params.append('from', `HVAC Recovery <mailgun@${domain}>`);
      params.append('to', to);
      params.append('subject', subject);
      params.append('text', body);

      const response = await fetch(`https://api.mailgun.net/v3/${domain}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(`api:${key}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params,
      });
      return response.json();
    } else {
      console.log('[MOCK EMAIL]', to, subject);
      return { success: true, mock: true };
    }
  }
}
