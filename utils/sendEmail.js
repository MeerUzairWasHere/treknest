import { createTransport } from "nodemailer";
import config from "./nodemailerConfig.js";

export const sendEmail = async ({ to, subject, html }) => {
  const transporter = createTransport(config);

  return transporter.sendMail({
    from: '"support@treknest" <meer.uxair007@gmail.com>', // sender address
    to,
    subject,
    html,
  });
};
