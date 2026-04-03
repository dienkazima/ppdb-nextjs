import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";

const secretKey = process.env.JWT_SECRET || "B4HAs14_R4h4514_PPDB_2026_S3cur3!";
const key = new TextEncoder().encode(secretKey);

export interface SessionPayload {
  id: string;
  username: string;
  name: string;
  role: string;
  jenjang: string | null;
}

export async function signToken(payload: SessionPayload) {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(key);
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, key, {
      algorithms: ["HS256"],
    });
    return payload as unknown as SessionPayload;
  } catch (error) {
    return null;
  }
}

export async function getSession() {
  const sessionToken = (await cookies()).get("auth_token")?.value;
  if (!sessionToken) return null;
  return await verifyToken(sessionToken);
}
