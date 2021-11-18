/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import * as nodemailer from 'nodemailer';
import * as handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';
import config from '../config';
import buildError from '../utils/error.helper';

const { SMTP_HOST, SMTP_FROM, SMTP_PORT, SMTP_TLS, SMTP_USER, SMTP_PASS } = config.EMAIL;
type SendEmail = {
  type: string;
  emailTo: string | null;
  subject: string;
  replacements: Object;
}
type MailOptions = {
  from: string;
  to: string | null;
  subject: string;
  html: any;
}
export const sendEmail = async ({
  type,
  emailTo,
  subject,
  replacements,
}: SendEmail): Promise<boolean> => {
  const filePath = path.join(__dirname, `../emails/${type}.html`);
  const source = fs.readFileSync(filePath, 'utf-8').toString();

  // =============== PARTIALS START
  const headerPartialPath = path.join(
    __dirname,
    `../emails/partials/header.html`
  );
  const footerPartialPath = path.join(
    __dirname,
    `../emails/partials/footer.html`
  );
  const headerPartial = (fs.readFileSync(
    headerPartialPath,
    'utf-8'
  ) as unknown) as HandlebarsTemplateDelegate<any>;
  const footerPartial = (fs.readFileSync(
    footerPartialPath,
    'utf-8'
  ) as unknown) as HandlebarsTemplateDelegate<any>;
  handlebars.registerPartial({
    header: headerPartial,
    footer: footerPartial,
  });
  // =============== PARTIALS END

  const template = handlebars.compile(source);
  const htmlToSend = template(replacements);

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS)
    throw buildError(500, 'Email send error');

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST || 'email-smtp.us-east-1.amazonaws.com',
    port: Number(SMTP_PORT) || 587,
    secure: !!SMTP_TLS,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    }
  });

  const mailOptions = {
    from: SMTP_FROM,
    to: emailTo,
    subject,
    html: htmlToSend,
  } as any;
  const info = await transporter.sendMail(mailOptions);
  console.log('sent', info);
  return true;
};