import { NextRequest, NextResponse } from "next/server";
import twilio from "twilio";
import { sendEmail } from "@/lib/email";

// Meta WhatsApp Cloud API Credentials (from environment)
const META_ACCESS_TOKEN = process.env.META_ACCESS_TOKEN || "";
const META_PHONE_NUMBER_ID = process.env.META_PHONE_NUMBER_ID || "";

if (!META_ACCESS_TOKEN || !META_PHONE_NUMBER_ID) {
  console.error("[Webhook] Missing META_ACCESS_TOKEN / META_PHONE_NUMBER_ID in .env.local");
}

export async function POST(req: NextRequest) {
  try {
    // 1. Parse the incoming data from your Voice Agent
    const body = await req.json();
    
    // Default to the provided values from your cURL if not specified by the voice agent
    const patientPhone = body.phone || "whatsapp:+917814201332";
    const patientEmail = body.email || ""; // Provide an email from the Voice Agent
    const patientName = body.name || "Patient";
    const appointmentDate = body.date || "12/1";
    const appointmentTime = body.time || "3pm";
    
    console.log(`[Webhook] Received appointment for ${patientPhone} at ${appointmentDate} ${appointmentTime}`);

    // Format phone number for Meta (remove 'whatsapp:' and '+')
    const formattedPhone = patientPhone.replace('whatsapp:', '').replace('+', '');
    
    // 2. Send WhatsApp Message via Meta Cloud API
    const metaResponse = await fetch(`https://graph.facebook.com/v19.0/${META_PHONE_NUMBER_ID}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${META_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: formattedPhone,
        type: "template",
        template: {
          name: "appointment_confirmation_v1",
          language: {
            code: "en_US"
          },
          components: [
            {
              type: "body",
              parameters: [
                {
                  type: "text",
                  text: patientName || "Patient" // Maps to {{1}}
                },
                {
                  type: "text",
                  text: appointmentDate // Maps to {{2}}
                },
                {
                  type: "text",
                  text: appointmentTime // Maps to {{3}}
                }
              ]
            }
          ]
        }
      })
    });

    const metaData = await metaResponse.json();

    if (!metaResponse.ok) {
      console.error("[WhatsApp Meta Error]:", metaData);
      throw new Error(metaData.error?.message || "Failed to send Meta WhatsApp message");
    }

    console.log(`[WhatsApp] Sent successfully via Meta! Message ID: ${metaData.messages?.[0]?.id}`);

    // 4. Send the Email Receipt
    if (patientEmail) {
      await sendEmail({
        to: patientEmail,
        subject: `Appointment Confirmation - Vision 360 Clinic`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
            <h2 style="color: #3b82f6;">Appointment Confirmed!</h2>
            <p>Hi ${patientName},</p>
            <p>Your appointment has been successfully booked via our AI Voice Assistant.</p>
            <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Date:</strong> ${appointmentDate}</p>
              <p style="margin: 5px 0;"><strong>Time:</strong> ${appointmentTime}</p>
            </div>
            <p>If you need to reschedule, simply reply to this email or chat with us on WhatsApp.</p>
            <br/>
            <p>Best regards,<br/><strong>Vision 360 Clinic Team</strong></p>
          </div>
        `
      });
      console.log(`[Email] Receipt sent to ${patientEmail}`);
    }

    // 5. Return success back to the Voice Agent
    return NextResponse.json({ 
      success: true, 
      messageId: metaData.messages?.[0]?.id,
      emailSent: !!patientEmail,
      status: "Automations triggered via Meta"
    });

  } catch (error: any) {
    console.error("[Webhook Error]:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process webhook" }, 
      { status: 500 }
    );
  }
}
