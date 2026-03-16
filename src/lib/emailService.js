import emailjs from '@emailjs/browser';

// Constants from environment variables
const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_space_mail';
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

/**
 * Sends an email notification to the admin.
 * @param {Object} templateParams - The parameters for the email template.
 * @param {string} templateId - The EmailJS template ID.
 */
export const sendEmailNotification = async (templateParams, templateId) => {
  if (!SERVICE_ID || !templateId || !PUBLIC_KEY) {
    console.warn('Email notification skipped: Missing EmailJS configuration.');
    return;
  }

  try {
    const response = await emailjs.send(
      SERVICE_ID,
      templateId,
      templateParams,
      PUBLIC_KEY
    );
    console.log('Email notification sent successfully:', response.status, response.text);
    return response;
  } catch (error) {
    console.error('Failed to send email notification:', error);
    throw error;
  }
};

/**
 * Helper to send a new lead notification.
 */
export const notifyNewLead = (leadData) => {
  const templateId = import.meta.env.VITE_EMAILJS_LEAD_TEMPLATE_ID;
  return sendEmailNotification({
    from_name: leadData.name,
    from_email: leadData.email,
    phone: leadData.phone,
    subject: leadData.subject || 'New Lead',
    message: leadData.message,
    type: leadData.type || 'contact',
    created_at: new Date().toLocaleString()
  }, templateId);
};

/**
 * Helper to send a new reservation notification.
 */
export const notifyNewReservation = (reservationData) => {
  const templateId = import.meta.env.VITE_EMAILJS_RESERVATION_TEMPLATE_ID;
  return sendEmailNotification({
    customer_name: reservationData.full_name,
    customer_email: reservationData.email,
    customer_phone: reservationData.phone,
    car_name: reservationData.car_name,
    reservation_date: reservationData.reservation_date,
    created_at: new Date().toLocaleString()
  }, templateId);
};

/**
 * Helper to send a new chat notification.
 */
export const notifyNewChat = (chatData) => {
  const templateId = import.meta.env.VITE_EMAILJS_CHAT_TEMPLATE_ID;
  return sendEmailNotification({
    customer_name: chatData.name || 'Anonymous Guest',
    chat_id: chatData.id,
    message: chatData.message,
    created_at: new Date().toLocaleString()
  }, templateId);
};
