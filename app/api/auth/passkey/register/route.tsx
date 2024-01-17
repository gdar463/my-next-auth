//
//  my-next-auth  Copyright (C) 2024  gdar463
//  This program comes with ABSOLUTELY NO WARRANTY.
//  This is free software, and you are welcome to redistribute it
//  under certain conditions.
//  For everything check the LICENSE file bundled with the projcet
//

import { NextRequest, NextResponse } from "next/server";
import { server } from "@passwordless-id/webauthn";
import prisma from "@/db";
import nextBase64 from "next-base64";

interface CredentialKey {
    id: string;
    publicKey: string;
    algorithm: "RS256" | "ES256";
}

interface RegistrationEncoded {
    username: string;
    credential: CredentialKey;
    authenticatorData: string;
    clientData: string;
    attestationData?: string;
}

export async function POST(request: NextRequest) {
    const json: RegistrationEncoded = await request.json();
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
    };
    const registrationParsed = await server.verifyRegistration(json, expected);
    const userFromDB = await prisma.user.findUnique({
        where: {
            email: registrationParsed.username,
        },
        select: {
            id: true,
        },
    });
    if (userFromDB != null) {
        return new NextResponse("Email already registered", {
            status: 409,
        });
    }
    const userToDB = await prisma.user.create({
        data: {
            email: registrationParsed.username,
        },
    });
    const passkeyToDB = await prisma.passkey.create({
        data: {
            credential: registrationParsed.credential,
            credentialId: registrationParsed.credential.id,
            authAAGUID: registrationParsed.authenticator.aaguid,
            authName: registrationParsed.authenticator.name,
            username: registrationParsed.username,
        },
    });
    const token = nextBase64
        .encode(Array.from(crypto.getRandomValues(new Int8Array(32))).join(""))
        .replace("=", "")
        .replace("%3D", "");
    const tokenToDB = await prisma.user.update({
        where: {
            email: passkeyToDB.username,
        },
        data: {
            token: token,
        },
    });
    const response = new NextResponse("User created successfully", {
        status: 200,
    });
    response.cookies.set("token", token, {
        expires: new Date().getTime() + 30 * 60 * 1000,
    });
    return response;
}
