import twilio from "twilio";


const accountSid = process.env.TWILIO_ACCOUNT_SID as string;
const authToken = process.env.TWILIO_AUTH_TOKEN as string;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER as string;

const client = twilio(accountSid, authToken);

export async function sendVerificationSMS(userPhoneNumber: string, verificationCode: string): Promise<string> {
  try {
    const message = await client.messages.create({
      body: `Your verification code is: ${verificationCode}`,
      from: twilioPhoneNumber,
      to: userPhoneNumber,
    });
    return message.sid;
  } catch (error) {
    console.error("Error sending SMS:", error);
    throw error;
  }
}
