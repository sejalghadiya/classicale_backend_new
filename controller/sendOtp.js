import nodemailer from "nodemailer";

export const sendOTPEmail = async (email, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "sejalghadiya100@gmail.com",
        pass: "sejan@1009", // Use the generated App Password here
      },
    });

    const mailOptions = {
      from: "sejalghadiya100@gmail.com",
      to: email,
      subject: "123456",
      text: `Your OTP code is ${otp}`,
    };

    await transporter.sendMail(mailOptions);
    console.log("OTP email sent successfully");
  } catch (error) {
    console.error("Error sending OTP email:", error);
    throw new Error("Failed to send OTP");
  }
};
