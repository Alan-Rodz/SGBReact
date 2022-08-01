import { readFileSync } from 'fs';
import Handlebars from 'handlebars';
import { NextApiRequest, NextApiResponse } from 'next';
import { User } from 'next-auth'
import { EmailConfig } from 'next-auth/providers/email'
import nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import path from 'path';

import { saleHeaders, createSaleInfoRows, setNonAllowedMethodResponse, ProductInfo } from 'request';

// NOTE: These run on the server
// ********************************************************************************
// == Constant ====================================================================
const transporterOptions: SMTPTransport.Options = {
  host: process.env.EMAIL_SERVER_HOST,
  port: Number(process.env.EMAIL_SERVER_PORT),
  auth: { user: process.env.EMAIL_SERVER_USER, pass: process.env.EMAIL_SERVER_PASSWORD },
  secure: false/*no STARTTLS being used*/,
};
const transporter = nodemailer.createTransport(transporterOptions);
const emailsDir = path.resolve(process.cwd(), 'email');

// == Login =======================================================================
// -- Verification Request --------------------------------------------------------
type SendVerificationRequestParams = { /*taken from the type of EmailProvider*/
  identifier: string;
  url: string;
  expires: Date;
  provider: EmailConfig;
  token: string;
};
export const sendLoginLinkEmail = ({ identifier, url }: SendVerificationRequestParams) => {
  try {
    const userEmail = identifier/*alias*/;

    const emailFile = readFileSync(path.join(emailsDir, 'loginRequest.html'), { encoding: 'utf8' }),
          emailTemplate = Handlebars.compile(emailFile)/*inject dynamic values using Handlebars*/;

    transporter.sendMail({
      from: `"📚 Sistema de Gestión Bibliotecaria" ${process.env.EMAIL_FROM}`,
      to: userEmail,
      subject: 'Tu link de inicio de sesión en el Sistema de Gestión Bibliotecaria',

      // html template with injected values
      html: emailTemplate({ base_url: process.env.NEXTAUTH_URL, signin_url: url, email: identifier }),
    });

  } catch (error) {
    throw new Error(`There was an error sending the verification request email. The error was: ${error}`);
  }
};

// -- Welcome User ----------------------------------------------------------------
export const sendWelcomeEmail = async (message: { user: User }) => {
  const { email: userEmail } = message.user;
  try {
    if(!userEmail) throw new Error(`sendWelcomeEmail, userEmail does not exist for user: ${JSON.stringify(message.user)}`);

    const emailFile = readFileSync(path.join(emailsDir, 'welcome.html'), { encoding: 'utf8' }),
          emailTemplate = Handlebars.compile(emailFile);

    await transporter.sendMail({
      from: `"📚 Sistema de Gestión Bibliotecaria" ${process.env.EMAIL_FROM}`,
      to: userEmail,
      subject: 'Bienvenido al Sistema de Gestión Bibliotecaria 🎉',

      // html template with injected values
      html: emailTemplate({ base_url: process.env.NEXTAUTH_URL, support_email: process.env.SUPPORT_EMAIL }),
    });
  } catch (error) {
    throw new Error(`There was an error sending the verification request email. The error was: ${error}`);
  }
};

// == Sale ========================================================================
export const sendSaleConfirmationEmail = async (clientEmail: string, products: ProductInfo[], currentTaxRatePercentage: number, totalSalePrice: number) => {
  try {
    const emailFile = readFileSync(path.join(emailsDir, 'sale.html'), { encoding: 'utf8' }),
          emailTemplate = Handlebars.compile(emailFile);

    await transporter.sendMail({
      from: `"📚 Sistema de Gestión Bibliotecaria" ${process.env.EMAIL_FROM}`,
      to: clientEmail,
      subject: '¡Gracias por tu compra! 🎉',
      // html template with injected values
      html: emailTemplate({
        base_url: process.env.NEXTAUTH_URL,
        checkoutTableContent: createCheckoutTableBody(saleHeaders, createSaleInfoRows(products, currentTaxRatePercentage) ),
        totalSalePrice: totalSalePrice,
      }),
    });
  } catch (error) {
    throw new Error(`❌ Unable to send welcome email to user: (${clientEmail}). Error: ${error}`);
  }
};
export const sendMembershipSaleConfirmationEmail = async (libraryUserEmail: string, membershipPrice: number, currentTaxRatePercentage: number, totalSalePrice: number) => {
  try {
    const emailFile = readFileSync(path.join(emailsDir, 'sale.html'), { encoding: 'utf8' }),
          emailTemplate = Handlebars.compile(emailFile);

    await transporter.sendMail({
      from: `"📚 Sistema de Gestión Bibliotecaria" ${process.env.EMAIL_FROM}`,
      to: libraryUserEmail,
      subject: '¡Gracias por tu compra! 🎉',
      // html template with injected values
      html: emailTemplate({
        base_url: process.env.NEXTAUTH_URL,
        checkoutTableContent: createCheckoutTableBody(saleHeaders, createSaleInfoRows([ { productName: 'Membresía', price: membershipPrice, quantity: 1/*by definition*/, totalProductPrice: totalSalePrice } ], currentTaxRatePercentage) ),
        totalSalePrice: totalSalePrice,
      }),
    });
  } catch (error) {
    throw new Error(`❌ Unable to send welcome email to user: (${libraryUserEmail}). Error: ${error}`);
  }
};
// NOTE: The joins are so that the comma added from the map calls does not 
//       get added to the resulting string
const createCheckoutTableBody = (headerRow: string[], bodyRows: (string | number)[][]) =>
  `<tr>${headerRow.map(header => `<th>${header}</th>`).join('')}</tr>${bodyRows.map(bodyRow => `<tr>${bodyRow.map(bodyRowValue => `<td>${bodyRowValue}</td>`).join('')}</tr>`).join('')}`;

// == Handler =====================================================================
const handleEmailRequest = async (req: NextApiRequest, res: NextApiResponse) => setNonAllowedMethodResponse(res, [/*no methods allowed*/], req.method);
export default handleEmailRequest;

