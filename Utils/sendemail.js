import nodemailer from "nodemailer";

export const sendEmail = async (to, subject, text, html = null) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: Number(process.env.SMTP_PORT) === 465, // true for SSL, false for TLS
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Verify connection (optional for debugging)
    // await transporter.verify();
    await transporter.verify();
    await transporter.sendMail({
      from: `"Boutique App" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text,
      html: html || undefined, // if html is provided, it will be used
    });

  } catch (error) {
    console.error("Error sending email:", error.message);
    throw new Error("Email could not be sent");
  }
};
