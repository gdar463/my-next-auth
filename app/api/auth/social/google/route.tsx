//
//  my-next-auth  Copyright (C) 2024  gdar463
//  This program comes with ABSOLUTELY NO WARRANTY.
//  This is free software, and you are welcome to redistribute it
//  under certain conditions.
//  For everything check the LICENSE file bundled with the project
//

import { NextRequest, NextResponse } from "next/server";
import * as jose from "jose";
import prisma from "@/db";
import nextBase64 from "next-base64";

let googleKeys;
let lastCheck: number = Math.max();

export async function GET(request: NextRequest) {
    const code = request.nextUrl.searchParams.get("code");
    if (code === "" || code === undefined || code === null) {
        return new NextResponse(null, {
            status: 302,
            headers: {
                Location: new URL(
                    "/?error=invalid-code",
                    request.nextUrl.origin,
                ).toString(),
            },
        });
    }
    if (lastCheck <= new Date().getTime()) {
        googleKeys = jose.createRemoteJWKSet(
            new URL("https://www.googleapis.com/oauth2/v3/certs"),
        );
        lastCheck = new Date().getTime() + 30 * 60 * 1000;
    }
    const redirectUri = new URL(
        "/auth/social/google-callback",
        request.nextUrl.origin,
    );
    const uatFromGoogle = await fetch(
        encodeURI(`https://oauth2.googleapis.com/token`),
        {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: encodeURI(
                `client_id=${process.env.GOOGLE_CLIENT_ID}&client_secret=${process.env.GOOGLE_CLIENT_SECRET}&code=${code}&grant_type=authorization_code&redirect_uri=${redirectUri}`,
            ),
        },
    );
    const json = await uatFromGoogle.json();
    console.log(json);
    const idToken = json.id_token;
    const { payload } = await jose.jwtVerify(idToken, googleKeys, {
        issuer: "https://accounts.google.com",
    });
    const id = payload.sub as string;
    const email = payload.email as string;
    const emailFromDB = await prisma.user.findUnique({
        where: {
            email: email,
        },
    });
    if (emailFromDB === null) {
        const userToDB = await prisma.user.create({
            data: {
                email: email,
            },
        });
    }
    const socialFromDB = await prisma.social.findFirst({
        where: {
            googleId: id,
        },
    });
    if (socialFromDB === null) {
        const socialToDB = await prisma.social.upsert({
            create: {
                username: email,
                googleId: id,
            },
            where: {
                username: email,
            },
            update: {
                googleId: id,
            },
        });
    }
    const token = nextBase64
        .encode(Array.from(crypto.getRandomValues(new Int8Array(32))).join(""))
        .replace("=", "")
        .replace("%3D", "");
    const tokenToDB = await prisma.user.update({
        where: {
            email: email,
        },
        data: {
            token: token,
        },
    });
    const response = new NextResponse(null, {
        status: 302,
        headers: {
            Location: new URL("/user", request.nextUrl.origin).toString(),
        },
    });
    response.cookies.set("token", token, {
        expires: new Date().getTime() + 30 * 60 * 1000,
    });
    return response;
}
