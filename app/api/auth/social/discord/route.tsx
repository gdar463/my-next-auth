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
    const redirectUri = new URL(
        "/auth/social/discord-callback",
        request.nextUrl.origin,
    ).toString();
    const data = new FormData();
    data.append("grant_type", "authorization_code");
    data.append("code", code);
    data.append("redirect_uri", redirectUri);
    const uatFromDiscord = await fetch(
        encodeURI(`https://discord.com/api/v10/oauth2/token`),
        {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Authorization: `Basic ${Buffer.from(
                    process.env.DISCORD_CLIENT_ID +
                        ":" +
                        process.env.DISCORD_CLIENT_SECRET,
                ).toString("base64")}`,
            },
            body: `grant_type=authorization_code&code=${code}&redirect_uri=${redirectUri}`,
        },
    );
    if (uatFromDiscord.status != 200) {
        console.log(await uatFromDiscord.json());
        console.log(data);
        return new NextResponse(null, {
            status: 302,
            headers: {
                Location: new URL(
                    "/?error=expired-code",
                    request.nextUrl.origin,
                ).toString(),
            },
        });
    }
    const json = await uatFromDiscord.json();
    const accessToken = json.access_token;
    const refreshToken = json.access_token;
    const userFromDB = await fetch(
        encodeURI(`https://discord.com/api/v10/users/@me`),
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        },
    );
    const revokeAccess = await fetch(
        encodeURI(`https://discord.com/api/v10/oauth2/token/revoke`),
        {
            method: "POST",
            headers: {
                Authorization: `Basic ${Buffer.from(
                    process.env.DISCORD_CLIENT_ID +
                        ":" +
                        process.env.DISCORD_CLIENT_SECRET,
                ).toString("base64")}`,
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: `token=${accessToken}&token_type_hint=access_token`,
        },
    );
    const revokeRefresh = await fetch(
        encodeURI(`https://discord.com/api/v10/oauth2/token/revoke`),
        {
            method: "POST",
            headers: {
                Authorization: `Basic ${Buffer.from(
                    process.env.DISCORD_CLIENT_ID +
                        ":" +
                        process.env.DISCORD_CLIENT_SECRET,
                ).toString("base64")}`,
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: `token=${refreshToken}&token_type_hint=refresh_token`,
        },
    );
    const userJson = await userFromDB.json();
    const email = userJson.email;
    const id = userJson.id;
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
            discordId: id,
        },
    });
    if (socialFromDB === null) {
        const socialToDB = await prisma.social.upsert({
            create: {
                username: email,
                discordId: id,
            },
            where: {
                username: email,
            },
            update: {
                discordId: id,
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
