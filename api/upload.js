import { google } from "googleapis";
import { Readable } from "stream";

console.log("ENV CHECK:", {
  clientId: !!process.env.GOOGLE_CLIENT_ID,
  secret: !!process.env.GOOGLE_CLIENT_SECRET,
  refresh: !!process.env.GOOGLE_REFRESH_TOKEN,
  folder: !!process.env.GOOGLE_DRIVE_FOLDER_ID,
});

export const config = {
  api: {
    bodyParser: false,
    sizeLimit: "200mb",
  },
};

// ── OAuth2 cu refresh token ───────────────────────────────────────────────────
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

// ── Citește body-ul raw ca Buffer ─────────────────────────────────────────────
function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

// ── Parse multipart ───────────────────────────────────────────────────────────
function parseMultipart(buffer, boundary) {
  const boundaryBuf = Buffer.from("--" + boundary);
  const parts = [];
  let start = 0;

  while (start < buffer.length) {
    const boundaryIdx = buffer.indexOf(boundaryBuf, start);
    if (boundaryIdx === -1) break;

    const headerStart = boundaryIdx + boundaryBuf.length + 2;
    const headerEnd = buffer.indexOf(Buffer.from("\r\n\r\n"), headerStart);
    if (headerEnd === -1) break;

    const headers = buffer.slice(headerStart, headerEnd).toString();
    const dataStart = headerEnd + 4;
    const nextBoundary = buffer.indexOf(boundaryBuf, dataStart);
    const dataEnd = nextBoundary === -1 ? buffer.length : nextBoundary - 2;

    const nameMatch = headers.match(/name="([^"]+)"/);
    const filenameMatch = headers.match(/filename="([^"]+)"/);
    const contentTypeMatch = headers.match(/Content-Type:\s*([^\r\n]+)/);

    if (nameMatch) {
      parts.push({
        name: nameMatch[1],
        filename: filenameMatch ? filenameMatch[1] : null,
        contentType: contentTypeMatch ? contentTypeMatch[1].trim() : null,
        data: buffer.slice(dataStart, dataEnd),
      });
    }

    start = nextBoundary === -1 ? buffer.length : nextBoundary;
  }

  return parts;
}

// ── Handler principal ─────────────────────────────────────────────────────────
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  try {
    const contentType = req.headers["content-type"] || "";
    const boundaryMatch = contentType.match(/boundary=([^\s;]+)/);
    if (!boundaryMatch) {
      return res.status(400).json({ ok: false, error: "Missing boundary" });
    }

    const buffer = await readBody(req);
    const parts = parseMultipart(buffer, boundaryMatch[1]);

    const filePart = parts.find((p) => p.filename);
    if (!filePart) {
      return res.status(400).json({ ok: false, error: "No file found" });
    }

    const auth = getAuthClient();
    const drive = google.drive({ version: "v3", auth });
    const fileStream = Readable.from(filePart.data);

    const driveResponse = await drive.files.create({
      requestBody: {
        name: filePart.filename,
        parents: [process.env.GOOGLE_DRIVE_FOLDER_ID],
      },
      media: {
        mimeType: filePart.contentType || "application/octet-stream",
        body: fileStream,
      },
      fields: "id, name, size",
    });

    return res.status(200).json({
      ok: true,
      fileId: driveResponse.data.id,
      name: driveResponse.data.name,
    });
  } catch (err) {
    console.error("Upload error:", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}
