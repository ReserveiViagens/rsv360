import axios from 'axios';

const MESSENGER_PAGE_ACCESS_TOKEN = process.env.MESSENGER_PAGE_ACCESS_TOKEN;
const INSTAGRAM_ACCESS_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN;

// Enviar mensagem via Facebook Messenger
export async function sendMessengerMessage(psid: string, text: string): Promise<boolean> {
  if (!MESSENGER_PAGE_ACCESS_TOKEN) {
    console.warn('Messenger não configurado. Mensagem não enviada.');
    return false;
  }

  try {
    const response = await axios.post(
      `https://graph.facebook.com/v20.0/me/messages?access_token=${MESSENGER_PAGE_ACCESS_TOKEN}`,
      {
        recipient: { id: psid },
        message: { text },
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    return response.status === 200;
  } catch (error: any) {
    console.error('Erro ao enviar mensagem Messenger:', error.response?.data || error.message);
    return false;
  }
}

// Enviar mensagem via Instagram Direct
export async function sendInstagramMessage(instagramScopedId: string, text: string): Promise<boolean> {
  if (!INSTAGRAM_ACCESS_TOKEN) {
    console.warn('Instagram não configurado. Mensagem não enviada.');
    return false;
  }

  try {
    const response = await axios.post(
      `https://graph.facebook.com/v20.0/${instagramScopedId}/messages?access_token=${INSTAGRAM_ACCESS_TOKEN}`,
      {
        recipient: { id: instagramScopedId },
        message: { text },
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    return response.status === 200;
  } catch (error: any) {
    console.error('Erro ao enviar mensagem Instagram:', error.response?.data || error.message);
    return false;
  }
}

// Enviar mensagem unificada (Messenger ou Instagram)
export async function sendMetaMessage(
  psid: string,
  text: string,
  platform: 'messenger' | 'instagram' = 'messenger'
): Promise<boolean> {
  if (platform === 'instagram') {
    return sendInstagramMessage(psid, text);
  } else {
    return sendMessengerMessage(psid, text);
  }
}

