/**
 * Sends an email notification via Next.js API route.
 * @param {Object} payload - The email data.
 */
export const sendEmailNotification = async (payload) => {
  try {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to send email');
    }

    const data = await response.json();
    console.log('API notification sent:', data);
    return data;
  } catch (error) {
    console.error('Failed to send email via API:', error);
    return null;
  }
};

/**
 * Helper to send a new lead notification.
 */
export const notifyNewLead = (leadData) => {
  return sendEmailNotification({
    type: 'Lead / Financing',
    name: leadData.name,
    email: leadData.email,
    phone: leadData.phone,
    car_name: leadData.car_name,
    income: leadData.income,
    message: leadData.message,
    details: leadData.additionalData ? JSON.stringify(leadData.additionalData, null, 2) : null
  });
};

/**
 * Helper to send a new reservation notification.
 */
export const notifyNewReservation = (reservationData) => {
  return sendEmailNotification({
    type: 'Vehicle Reservation',
    name: reservationData.full_name,
    email: reservationData.email,
    phone: reservationData.phone,
    car_name: reservationData.car_name,
    message: `Reservation placed on ${reservationData.reservation_date}`
  });
};

/**
 * Helper to send a new chat notification.
 */
export const notifyNewChat = (chatData) => {
  return sendEmailNotification({
    type: 'New Support Chat',
    name: chatData.name || 'Anonymous Guest',
    email: chatData.email || 'support@attkissonautos.com',
    phone: chatData.phone || 'N/A',
    message: chatData.message,
    details: `Chat ID: ${chatData.id}`
  });
};
