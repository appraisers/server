/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import * as nodemailer from 'nodemailer';
import * as handlebars from 'handlebars';
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
  emailTo: string;
  subject: string;
  replacements?: Object;
};
type MailOptions = {
  from: string;
  to: string;
  subject: string;
  html: any;
};
export const sendEmail = async ({
  type,
  emailTo,
  subject,
  replacements,
}: SendEmail): Promise<boolean> => {
  const filePath = path.join(__dirname, `../emails/${type}.html`);
  const source = fs.readFileSync(filePath, 'utf-8').toString();

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS)
    throw buildError(500, 'Email send error');

  const template = handlebars.compile(source);
  const htmlToSend = template(replacements);

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
    html: htmlToSend,
  } as MailOptions;
  const info = await transporter.sendMail(mailOptions);
  console.log('send email info', info);
  return true;
};
