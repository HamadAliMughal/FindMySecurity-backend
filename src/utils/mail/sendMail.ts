// import { createTransport } from "nodemailer"
import sgMail from "@sendgrid/mail"
sgMail.setApiKey(process.env.SENDGRID_API_KEY || '')
// const setConnection = () => {
//   const transport = createTransport({
//     host: process.env.HOST_SMTP,
//     port: Number(process.env.PORT_SMTP),
//     secure: true,
//     auth: {
//       user: process.env.AUTH_USER_SMTP,
//       pass: process.env.AUTH_PASS_SMTP,
//     }
//   })
//   return transport
// }
export const sentEmailWithTemplate = async (sender: any, subject: any, template: any, data: any) => {
  const msg = {
    to: sender,
    from: {
      email: process.env.AUTH_USER_SMTP || 'no-reply@memvy.com',
      name: 'Memvy',
    },
    subject: subject,
    templateId: template,
    dynamicTemplateData: data,
    trackingSettings: {
      clickTracking: {
        enable: false,
      },
    }
  }
  sgMail.send(msg)
  return true
}

