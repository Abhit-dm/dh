import nodemailer from 'nodemailer';

type AppointmentEmail = {
  reference: string;
  patientName: string;
  parentGuardianName: string | null;
  phone: string;
  email: string | null;
  department: string;
  doctor: string | null;
  preferredDate: string;
  preferredTime: string;
};

function smtpConfig() {
  const allSettings = [
    'SMTP_HOST',
    'SMTP_PORT',
    'SMTP_FROM',
    'SMTP_USER',
    'SMTP_PASSWORD',
    'SMTP_SECURE',
    'HOSPITAL_NOTIFICATION_EMAIL',
  ];
  if (allSettings.every((name) => !process.env[name]?.trim())) return null;

  const host = process.env.SMTP_HOST?.trim();
  const portText = process.env.SMTP_PORT?.trim();
  const from = process.env.SMTP_FROM?.trim();
  const hospitalEmail = process.env.HOSPITAL_NOTIFICATION_EMAIL?.trim();
  if (!host || !portText || !from || !hospitalEmail) {
    throw new Error('SMTP_HOST, SMTP_PORT, SMTP_FROM, and HOSPITAL_NOTIFICATION_EMAIL are required together.');
  }
  const port = Number(portText);
  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    throw new Error('SMTP_PORT must be a valid TCP port.');
  }

  const user = process.env.SMTP_USER?.trim();
  const password = process.env.SMTP_PASSWORD;
  if (Boolean(user) !== Boolean(password)) {
    throw new Error('SMTP_USER and SMTP_PASSWORD must both be configured or both be empty.');
  }

  return {
    host,
    port,
    secure: process.env.SMTP_SECURE?.trim().toLowerCase() === 'true',
    from,
    hospitalEmail,
    ...(user && password ? { auth: { user, pass: password } } : {}),
  };
}

async function deliver(
  notification: string,
  send: () => Promise<unknown>,
) {
  try {
    await send();
  } catch (error) {
    console.error('[email]', {
      notification,
      errorName: error instanceof Error ? error.name : 'UnknownError',
    });
  }
}

export async function sendAppointmentNotifications(appointment: AppointmentEmail) {
  let config: ReturnType<typeof smtpConfig>;
  try {
    config = smtpConfig();
  } catch (error) {
    console.error('[email]', {
      notification: 'configuration',
      errorName: error instanceof Error ? error.name : 'UnknownError',
    });
    return;
  }
  if (!config) return;

  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    ...(config.auth ? { auth: config.auth } : {}),
  });
  const details = [
    `Reference: ${appointment.reference}`,
    `Status: Pending — the appointment is not confirmed.`,
    `Patient: ${appointment.patientName}`,
    ...(appointment.parentGuardianName
      ? [`Parent/guardian: ${appointment.parentGuardianName}`]
      : []),
    `Mobile: ${appointment.phone}`,
    `Department: ${appointment.department}`,
    `Doctor: ${appointment.doctor ?? 'No preference'}`,
    `Preferred date: ${appointment.preferredDate}`,
    `Preferred time: ${appointment.preferredTime}`,
  ].join('\n');
  const patientEmail = appointment.email;

  await Promise.all([
    deliver('appointment-hospital', () =>
      transporter.sendMail({
        from: config.from,
        to: config.hospitalEmail,
        subject: `New appointment request ${appointment.reference}`,
        text: details,
      }),
    ),
    ...(patientEmail
      ? [
          deliver('appointment-patient', () =>
            transporter.sendMail({
              from: config.from,
              to: patientEmail,
              subject: `DH Hospitals received request ${appointment.reference}`,
              text: [
                `Dear ${appointment.patientName},`,
                '',
                `DH Hospitals has received your appointment request ${appointment.reference}.`,
                'It is pending and is not confirmed. The hospital will contact you about availability.',
                '',
                `Department: ${appointment.department}`,
                `Preferred date: ${appointment.preferredDate}`,
                `Preferred time: ${appointment.preferredTime}`,
                '',
                'DH Hospitals',
              ].join('\n'),
            }),
          ),
        ]
      : []),
  ]);
}
