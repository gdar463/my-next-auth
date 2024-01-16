//
//  my-next-auth  Copyright (C) 2024  gdar463
//  This program comes with ABSOLUTELY NO WARRANTY.
//  This is free software, and you are welcome to redistribute it
//  under certain conditions.
//  For everything check the LICENSE file bundled with the projcet
//

import nextBase64 from "next-base64";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const provider = request.nextUrl.searchParams.get("provider");
    switch (provider) {
        case "github":
            const clientId = process.env.GITHUB_CLIENT_ID;
            const redirectUri = new URL(
                "/api/auth/social/github/callback",
                request.nextUrl.origin,
            );
            const state = nextBase64
                .encode(
                    Array.from(crypto.getRandomValues(new Int8Array(64))).join(
                        "",
                    ),
                )
                .replace("=", "")
                .replace("%3D", "")
                .substring(0, 24);
            const url = encodeURI(
                `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=read-user user-email&redirect_uri=${redirectUri}&state=${state}`,
            );
            return new NextResponse(null, {
                status: 302,
                headers: {
                    Location: url,
                },
            });
        default:
            return new NextResponse("Provider doesn't exist", {
                status: 404,
            });
    }
}
