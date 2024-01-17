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

let gitlabKeys;
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
        gitlabKeys = jose.createRemoteJWKSet(
            new URL("https://gitlab.com/oauth/discovery/keys"),
        );
        lastCheck = new Date().getTime() + 30 * 60 * 1000;
    }
    const redirectUri = new URL(
        "/auth/social/gitlab-callback",
        request.nextUrl.origin,
    );
    const uatFromGitlab = await fetch(
        encodeURI(
            `https://gitlab.com/oauth/token?client_id=${process.env.GITLAB_CLIENT_ID}&client_secret=${process.env.GITLAB_CLIENT_SECRET}&code=${code}&grant_type=authorization_code&redirect_uri=${redirectUri}`,
        ),
        {
            method: "POST",
            headers: {
                Accept: "application/json",
            },
        },
    );
    if (uatFromGitlab.status != 200) {
        console.log(await uatFromGitlab.json());
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
    const json = await uatFromGitlab.json();
    const idToken = json.id_token;
    const { payload } = await jose.jwtVerify(idToken, gitlabKeys, {
        issuer: "https://gitlab.com",
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
            gitlabId: id,
        },
    });
    if (socialFromDB === null) {
        const socialToDB = await prisma.social.upsert({
            create: {
                username: email,
                gitlabId: id,
            },
            where: {
                username: email,
            },
            update: {
                gitlabId: id,
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
