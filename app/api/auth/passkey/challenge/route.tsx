//
//  my-next-auth  Copyright (C) 2024  gdar463
//  This program comes with ABSOLUTELY NO WARRANTY.
//  This is free software, and you are welcome to redistribute it
//  under certain conditions.
//  For everything check the LICENSE file bundled with the projcet
//

import prisma from "@/db";
import nextBase64 from "next-base64";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    if (request.cookies.has("session")) {
        const challenge = await prisma.challenge.findUnique({
            where: {
                session: request.cookies.get("session").value,
            },
            select: {
                challenge: true,
            },
        });
        return new NextResponse(challenge.challenge, {
            status: 200,
        });
    }
    const challenge = crypto.randomUUID();
    const session = nextBase64
        .encode(Array.from(crypto.getRandomValues(new Int8Array(32))).join(""))
        .replace("=", "")
        .replace("%3D", "")
        .substring(0, 32);
    await prisma.challenge.create({
        data: {
            createdAt: new Date(Date.now() + 1 * 60 * 1000),
            challenge: challenge,
            session: session,
        },
    });
    const response = new NextResponse(challenge, {
        status: 200,
    });
    response.cookies.set("session", session, {
        expires: new Date(Date.now() + 4.5 * 60 * 1000),
    });
    return response;
}
