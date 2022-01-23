/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';
import config from '../config';
import { buildError } from '../utils/error.helper';

const {
  SMTP_HOST,
  SMTP_FROM,
  SMTP_PORT,
  SMTP_TLS,
  SMTP_USER,
  SMTP_PASS,
} = config.EMAIL;
type SendEmail = {
  type: string;
  emailTo: string | null;
  subject: string;
};
type MailOptions = {
  from: string;
  to: string | null;
  subject: string;
  html: any;
};
export const sendEmail = async ({
  type,
  emailTo,
  subject,
}: SendEmail): Promise<boolean> => {
  const filePath = path.join(__dirname, `../emails/${type}.html`);
  const source = fs.readFileSync(filePath, 'utf-8').toString();

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS)
    throw buildError(500, 'Email send error');

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  const mailOptions = {
    from: SMTP_FROM,
    to: emailTo,
    subject,
    html: 'Hello,<br> you successfully created account! </br>',
  } as any;
  const info = await transporter.sendMail(mailOptions);
  return true;
};
