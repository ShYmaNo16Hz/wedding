import { google } from "googleapis";

function getAuthClient() {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    "http://localhost:4000/callback",
  );
  oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
  });
  return oauth2Client;
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  try {
    const { filename, mimeType, size } = req.body;
    if (!filename || !size) {
      return res
        .status(400)
        .json({ ok: false, error: "Missing filename or size" });
    }

    const auth = getAuthClient();
    const { token } = await auth.getAccessToken();

    // în /api/upload-session.js, în interiorul cererii fetch care creeaza sesiunea

    const origin = req.headers.origin || `https://${req.headers.host}`;
    const initRes = await fetch(
      "https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&fields=id,name,size",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json; charset=UTF-8",
          "X-Upload-Content-Type": mimeType || "application/octet-stream",
          "X-Upload-Content-Length": String(size),
          Origin: origin, // ← esențial: fără asta, PUT-ul din browser primește CORS error
        },
        body: JSON.stringify({
          name: filename,
          parents: [process.env.GOOGLE_DRIVE_FOLDER_ID],
        }),
      },
    );

    if (!initRes.ok) {
      const errText = await initRes.text();
      console.error("Drive session init failed:", initRes.status, errText);
      return res
        .status(500)
        .json({ ok: false, error: "Nu am putut iniția upload-ul" });
    }

    const uploadUrl = initRes.headers.get("location");
    if (!uploadUrl) {
      return res
        .status(500)
        .json({ ok: false, error: "Lipsește URL-ul de sesiune" });
    }

    return res.status(200).json({ ok: true, uploadUrl });
  } catch (err) {
    console.error("Upload session error:", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}
