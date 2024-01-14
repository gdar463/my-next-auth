import { NextRequest, NextResponse } from "next/server";
import { server } from "@passwordless-id/webauthn";
import prisma from "@/db";
import nextBase64 from "next-base64";
import { Prisma } from "@prisma/client";

export interface AuthenticationEncoded {
    credentialId: string;
    authenticatorData: string;
    clientData: string;
    signature: string;
}

export async function POST(request: NextRequest) {
    const json: AuthenticationEncoded = await request.json();
    if (!request.cookies.has("session")) {
        return new NextResponse("Session expired", {
            status: 404,
        });
    }
    const session = request.cookies.get("session").value;
    const challengeFromDB = await prisma.challenge.findUnique({
        where: {
            session: session,
        },
    });
    if (challengeFromDB === null) {
        return new NextResponse("Challenge expired", {
            status: 404,
        });
    }
    const expected = {
        challenge: challengeFromDB.challenge,
        origin: request.nextUrl.origin,
        userVerified: true,
    };
    const passkeyFromDB = await prisma.passkey.findUnique({
        where: {
            credentialId: json.credentialId,
        },
        select: {
            credential: true,
            username: true,
        },
    });
    if (passkeyFromDB === null) {
        return new NextResponse("Passkey not Correct", {
            status: 401,
        });
    }
    try {
        // @ts-expect-error
        const registrationParsed = await server.verifyAuthentication(
            json,
            passkeyFromDB.credential,
            expected,
        );
    } catch (error) {
        console.error(error);
        return new NextResponse("Passkey not Correct", {
            status: 401,
        });
    }
    const token = nextBase64
        .encode(Array.from(crypto.getRandomValues(new Int8Array(32))).join(""))
        .replace("=", "")
        .replace("%3D", "");
    const tokenToDB = await prisma.user.update({
        where: {
            email: passkeyFromDB.username,
        },
        data: {
            token: token,
        },
    });
    var response = new NextResponse("User created successfully", {
        status: 200,
    });
    response.cookies.set("token", token, {
        expires: new Date(Date.now() + 30 * 60 * 1000),
    });
    return response;
}
