//
//  my-next-auth  Copyright (C) 2024  gdar463
//  This program comes with ABSOLUTELY NO WARRANTY.
//  This is free software, and you are welcome to redistribute it
//  under certain conditions.
//  For everything check the LICENSE file bundled with the projcet
//

import { NextRequest, NextResponse } from "next/server";
import * as jwt from "jsonwebtoken";
import prisma from "@/db";
import nextBase64 from "next-base64";

let githubJwt = null;

//TODO: Change this to be called by page redirected from github

export async function GET(request: NextRequest) {
    if (
        githubJwt === null ||
        jwt.decode(githubJwt, { json: true }).exp >=
            new Date().getTime() - 30 * 1000
    ) {
        const payload = {
            iat: new Date().getTime() - 60 * 1000,
            exp: new Date().getTime() + 9 * 60 * 1000,
            iss: process.env.GITHUB_APP_ID,
        };
        githubJwt = jwt.sign(payload, process.env.GITHUB_SECRET_KEY, {
            algorithm: "RS256",
        });
    }
    const code = request.nextUrl.searchParams.get("code");
    const uatFromGithub = await fetch(
        encodeURI(
            `https://github.com/login/oauth/access_token?client_id=${process.env.GITHUB_CLIENT_ID}&client_secret=${process.env.GITHUB_CLIENT_SECRET}&code=${code}`,
        ),
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${githubJwt}`,
            },
        },
    );
    const uat = (await uatFromGithub.text())
        .split("&")[0]
        .replace("access_token=", "");
    const userFromGithub = await fetch("https://api.github.com/user", {
        method: "GET",
        headers: {
            "X-GitHub-Api-Version": "2022-11-28",
            Accept: "application/vnd.github+json",
            Authorization: `Bearer ${uat}`,
        },
    });
    const json = await userFromGithub.json();
    const email = json.email;
    const id = json.id;
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
    const socialFromDB = await prisma.social.findUnique({
        where: {
            githubId: id,
        },
    });
    if (socialFromDB === null) {
        const socialToDB = await prisma.social.upsert({
            create: {
                username: email,
                githubId: id,
            },
            where: {
                username: email,
            },
            update: {
                githubId: id,
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
        expires: new Date(Date.now() + 30 * 60 * 1000),
    });
    return response;
}
