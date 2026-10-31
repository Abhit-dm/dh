import assert from 'node:assert/strict';
import { createServer } from 'node:net';
import { test } from 'node:test';
import { sendAppointmentNotifications } from '@/lib/email';

test('appointment requests still succeed when SMTP is not configured', async () => {
  const names = [
    'SMTP_HOST',
    'SMTP_PORT',
    'SMTP_FROM',
    'SMTP_USER',
    'SMTP_PASSWORD',
    'SMTP_SECURE',
    'HOSPITAL_NOTIFICATION_EMAIL',
  ];
  const previous = new Map(names.map((name) => [name, process.env[name]]));
  for (const name of names) delete process.env[name];

  try {
    await assert.doesNotReject(() =>
      sendAppointmentNotifications({
        reference: 'DH-20261031-0123456789',
        patientName: 'Test Patient',
        parentGuardianName: null,
        phone: '9876543210',
        email: 'patient@example.test',
        department: 'Child Care',
        doctor: null,
        preferredDate: '2099-12-01',
        preferredTime: '09:30',
      }),
    );
  } finally {
    for (const [name, value] of previous) {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
  }
});

test('sends hospital and patient notifications when SMTP is configured', { timeout: 10_000 }, async () => {
  const names = [
    'SMTP_HOST',
    'SMTP_PORT',
    'SMTP_FROM',
    'SMTP_USER',
    'SMTP_PASSWORD',
    'SMTP_SECURE',
    'HOSPITAL_NOTIFICATION_EMAIL',
  ];
  const previous = new Map(names.map((name) => [name, process.env[name]]));
  const recipients: string[] = [];
  const messages: string[] = [];
  const smtpServer = createServer((socket) => {
    socket.setEncoding('utf8');
    socket.write('220 test SMTP server\r\n');
    let buffer = '';
    let readingMessage = false;
    let message = '';

    socket.on('data', (chunk) => {
      buffer += chunk;
      let endOfLine = buffer.indexOf('\r\n');
      while (endOfLine !== -1) {
        const line = buffer.slice(0, endOfLine);
        buffer = buffer.slice(endOfLine + 2);

        if (readingMessage) {
          if (line === '.') {
            readingMessage = false;
            messages.push(message);
            message = '';
            socket.write('250 Message accepted\r\n');
          } else {
            message += `${line}\r\n`;
          }
        } else if (line.startsWith('EHLO ') || line.startsWith('HELO ')) {
          socket.write('250-test.local\r\n250 SIZE 1048576\r\n');
        } else if (line.startsWith('RCPT TO:')) {
          recipients.push(line.slice('RCPT TO:'.length).trim().replace(/[<>]/g, ''));
          socket.write('250 Recipient accepted\r\n');
        } else if (line === 'DATA') {
          readingMessage = true;
          socket.write('354 End data with <CR><LF>.<CR><LF>\r\n');
        } else if (line === 'QUIT') {
          socket.write('221 Closing connection\r\n');
          socket.end();
        } else {
          socket.write('250 OK\r\n');
        }

        endOfLine = buffer.indexOf('\r\n');
      }
    });
  });

  await new Promise<void>((resolve, reject) => {
    smtpServer.once('error', reject);
    smtpServer.listen(0, '127.0.0.1', resolve);
  });

  try {
    const address = smtpServer.address();
    assert.ok(address && typeof address !== 'string');
    process.env.SMTP_HOST = '127.0.0.1';
    process.env.SMTP_PORT = String(address.port);
    process.env.SMTP_FROM = 'DH Hospitals <no-reply@example.test>';
    process.env.SMTP_SECURE = 'false';
    process.env.HOSPITAL_NOTIFICATION_EMAIL = 'hospital@example.test';
    delete process.env.SMTP_USER;
    delete process.env.SMTP_PASSWORD;

    await sendAppointmentNotifications({
      reference: 'DH-20261031-0123456789',
      patientName: 'Test Patient',
      parentGuardianName: 'Test Guardian',
      phone: '9876543210',
      email: 'patient@example.test',
      department: 'Child Care',
      doctor: null,
      preferredDate: '2099-12-01',
      preferredTime: '09:30',
    });

    assert.deepEqual(recipients.sort(), [
      'hospital@example.test',
      'patient@example.test',
    ]);
    assert.equal(messages.length, 2);
    const normalizedMessages = messages.map((message) =>
      message.replace(/=\r?\n[ \t]?/g, ''),
    );
    assert.ok(
      normalizedMessages.every((message) =>
        message.includes('DH-20261031-0123456789'),
      ),
    );
    assert.ok(
      normalizedMessages.every(
        (message) => /pending/i.test(message) && /not confirmed/i.test(message),
      ),
    );
  } finally {
    await new Promise<void>((resolve, reject) => {
      smtpServer.close((error) => (error ? reject(error) : resolve()));
    });
    for (const [name, value] of previous) {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
  }
});
