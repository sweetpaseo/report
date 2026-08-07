import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import {
  getServiceAccountCredentials,
  saveServiceAccountCredentials,
  ServiceAccountCredentials,
} from "@/lib/google-api";

export async function GET() {
  const sessionToken = (await cookies()).get(SESSION_COOKIE)?.value;
  const role = await verifySessionToken(sessionToken);
  if (!role) {
    return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
  }

  const creds = getServiceAccountCredentials();
  if (!creds) {
    return NextResponse.json({ configured: false });
  }

  return NextResponse.json({
    configured: true,
    client_email: creds.client_email,
    project_id: creds.project_id,
  });
}

export async function POST(request: Request) {
  const sessionToken = (await cookies()).get(SESSION_COOKIE)?.value;
  const role = await verifySessionToken(sessionToken);
  if (role !== "admin") {
    return NextResponse.json({ error: "Hanya administrator yang dapat menyimpan Service Account" }, { status: 403 });
  }

  try {
    const body = await request.json();
    let creds: ServiceAccountCredentials;

    if (typeof body.json_string === "string") {
      creds = JSON.parse(body.json_string);
    } else if (body.client_email && body.private_key) {
      creds = body as ServiceAccountCredentials;
    } else {
      return NextResponse.json({ error: "Format Service Account JSON tidak valid" }, { status: 400 });
    }

    if (!creds.client_email || !creds.private_key) {
      return NextResponse.json({ error: "Service Account JSON harus berisi client_email dan private_key" }, { status: 400 });
    }

    saveServiceAccountCredentials(creds);
    return NextResponse.json({
      success: true,
      message: "Berhasil menyimpan Service Account Google API",
      client_email: creds.client_email,
    });
  } catch (err: any) {
    return NextResponse.json({ error: `Gagal memproses JSON: ${err.message}` }, { status: 400 });
  }
}
