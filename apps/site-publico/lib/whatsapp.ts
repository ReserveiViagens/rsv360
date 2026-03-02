import axios from 'axios';

const WHATSAPP_PHONE_ID = process.env.WHATSAPP_PHONE_ID;
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const WHATSAPP_API_URL = `https://graph.facebook.com/v20.0/${WHATSAPP_PHONE_ID}/messages`;

// Enviar mensagem de texto simples
export async function sendWhatsAppMessage(to: string, text: string): Promise<boolean> {
  if (!WHATSAPP_PHONE_ID || !WHATSAPP_TOKEN) {
    console.warn('WhatsApp não configurado. Mensagem não enviada.');
    return false;
  }

  try {
    const response = await axios.post(
      WHATSAPP_API_URL,
      {
        messaging_product: 'whatsapp',
        to: to.replace(/\D/g, ''), // Remove caracteres não numéricos
        type: 'text',
        text: {
          body: text,
        },
      },
      {
        headers: {
          'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.status === 200;
  } catch (error: any) {
    console.error('Erro ao enviar mensagem WhatsApp:', error.response?.data || error.message);
    return false;
  }
}

// Enviar template aprovado
export async function sendWhatsAppTemplate(
  to: string,
  templateName: string,
  parameters: Array<string> = [],
  language: string = 'pt_BR'
): Promise<boolean> {
  if (!WHATSAPP_PHONE_ID || !WHATSAPP_TOKEN) {
    console.warn('WhatsApp não configurado. Template não enviado.');
    return false;
  }

  try {
    const components: any[] = [];
    
    if (parameters.length > 0) {
      components.push({
        type: 'body',
        parameters: parameters.map((param) => ({
          type: 'text',
          text: param,
        })),
      });
    }

    const response = await axios.post(
      WHATSAPP_API_URL,
      {
        messaging_product: 'whatsapp',
        to: to.replace(/\D/g, ''),
        type: 'template',
        template: {
          name: templateName,
          language: {
            code: language,
          },
          components: components.length > 0 ? components : undefined,
        },
      },
      {
        headers: {
          'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.status === 200;
  } catch (error: any) {
    console.error('Erro ao enviar template WhatsApp:', error.response?.data || error.message);
    return false;
  }
}

// Templates específicos
export async function sendBookingConfirmed(
  phone: string,
  guestName: string,
  propertyName: string,
  bookingCode: string,
  checkIn: string,
  checkInTime: string,
  checkOut: string,
  checkOutTime: string
): Promise<boolean> {
  return sendWhatsAppTemplate(phone, 'booking_confirmed', [
    guestName,
    propertyName,
    bookingCode,
    checkIn,
    checkInTime,
    checkOut,
    checkOutTime,
  ]);
}

export async function sendPaymentSuccess(phone: string): Promise<boolean> {
  return sendWhatsAppTemplate(phone, 'booking_payment_success');
}

export async function sendCheckinInstructions(
  phone: string,
  guestName: string,
  address: string,
  pinCode: string,
  wifiName: string,
  wifiPassword: string,
  parking: string
): Promise<boolean> {
  return sendWhatsAppTemplate(phone, 'checkin_instructions', [
    guestName,
    address,
    pinCode,
    wifiName,
    wifiPassword,
    parking,
  ]);
}

export async function sendCheckoutReminder(
  phone: string,
  guestName: string,
  checkoutTime: string
): Promise<boolean> {
  return sendWhatsAppTemplate(phone, 'checkout_reminder', [guestName, checkoutTime]);
}

export async function sendReviewRequest(
  phone: string,
  guestName: string,
  propertyName: string,
  reviewLink: string
): Promise<boolean> {
  return sendWhatsAppTemplate(phone, 'review_request', [guestName, propertyName, reviewLink]);
}

export async function sendCancellationConfirmed(
  phone: string,
  bookingCode: string,
  refundAmount: number
): Promise<boolean> {
  return sendWhatsAppTemplate(phone, 'cancellation_confirmed', [
    bookingCode,
    `R$ ${refundAmount.toFixed(2)}`,
  ]);
}

export async function sendLateCheckinWarning(phone: string): Promise<boolean> {
  return sendWhatsAppTemplate(phone, 'late_checkin_warning');
}

export async function sendBirthdayDiscount(phone: string, guestName: string): Promise<boolean> {
  return sendWhatsAppTemplate(phone, 'birthday_discount', [guestName]);
}

export async function sendLastMinuteDiscount(
  phone: string,
  propertyName: string,
  discountLink: string
): Promise<boolean> {
  return sendWhatsAppTemplate(phone, 'last_minute_discount', [propertyName, discountLink]);
}

export async function sendInquiryAutoResponse(
  phone: string,
  propertyName: string,
  propertyLink: string
): Promise<boolean> {
  return sendWhatsAppTemplate(phone, 'inquiry_auto_response', [propertyName, propertyLink]);
}

export async function sendPaymentLink(phone: string, paymentLink: string): Promise<boolean> {
  return sendWhatsAppTemplate(phone, 'payment_link', [paymentLink]);
}

export async function sendWelcomeNewUser(phone: string, userName: string, profileLink: string): Promise<boolean> {
  return sendWhatsAppTemplate(phone, 'welcome_new_user', [userName, profileLink]);
}

// Templates específicos de Caldas Novas
export async function sendCaldasCountryPromo(phone: string, promoLink: string): Promise<boolean> {
  return sendWhatsAppTemplate(phone, 'caldascountry_promo', [promoLink]);
}

export async function sendReveillonParadise(
  phone: string,
  checkIn: string,
  pinCode: string
): Promise<boolean> {
  return sendWhatsAppTemplate(phone, 'reveillon_paradise', [checkIn, pinCode]);
}

export async function sendCarnavalCaldas(phone: string, bookingLink: string): Promise<boolean> {
  return sendWhatsAppTemplate(phone, 'carnaval_caldas', [bookingLink]);
}

export async function sendNatalPraça(phone: string, detailsLink: string): Promise<boolean> {
  return sendWhatsAppTemplate(phone, 'natal_praça', [detailsLink]);
}

export async function sendRodeoFestival(phone: string): Promise<boolean> {
  return sendWhatsAppTemplate(phone, 'rodeo_festival');
}

export async function sendAguasQuentesSemana(phone: string, discountPercent: number): Promise<boolean> {
  return sendWhatsAppTemplate(phone, 'aguas_quentes_semana', [`${discountPercent}%`]);
}

