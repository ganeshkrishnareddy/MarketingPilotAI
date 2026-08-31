import { NextResponse } from "next/server";

/**
 * POST /api/voice/recording-ready
 * Vobiz posts RecordStop here when a recorded call ends, with the final
 * recording file URL. We store it (keyed by CallUUID) so recordings can be
 * fetched and audited.
 */

const recordings = new Map<string, { url: string; duration: number }>();

export function getRecording(callUuid: string) {
  return recordings.get(callUuid);
}

export async function POST(req: Request) {
  const params = await req.formData().catch(() => null);
  const event = ((params?.get("Event") as string) || "").trim();
  const callUuid = ((params?.get("CallUUID") as string) || "").trim();
  const fileUrl = ((params?.get("RecordFile") as string) || (params?.get("RecordUrl") as string) || "").trim();
  const duration = parseInt((params?.get("RecordingDuration") as string) || "0", 10);

  if (event === "RecordStop" && callUuid && fileUrl) {
    recordings.set(callUuid, { url: fileUrl, duration });
    console.log(`[Voice Recording] Call ${callUuid} recorded (${duration}s): ${fileUrl}`);
  } else {
    console.log("[Voice Recording] Webhook received:", event, callUuid, fileUrl);
  }

  return NextResponse.json({ ok: true });
}
