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
            const ghClientId = process.env.GITHUB_CLIENT_ID;
            const ghRedirectUri = new URL(
                "/auth/social/github-callback",
                request.nextUrl.origin,
            );
            const ghState = nextBase64
                .encode(
                    Array.from(crypto.getRandomValues(new Int8Array(64))).join(
                        "",
                    ),
                )
                .replace("=", "")
                .replace("%3D", "")
                .substring(0, 24);
            const ghUrl = encodeURI(
                `https://github.com/login/oauth/authorize?client_id=${ghClientId}&scope=read-user user-email&redirect_uri=${ghRedirectUri}&state=${ghState}`,
            );
            return new NextResponse(null, {
                status: 302,
                headers: {
                    Location: ghUrl,
                },
            });
        case "gitlab":
            const glClientId = process.env.GITLAB_CLIENT_ID;
            const glRedirectUri = new URL(
                "/auth/social/gitlab-callback",
                request.nextUrl.origin,
            );
            const glState = nextBase64
                .encode(
                    Array.from(crypto.getRandomValues(new Int8Array(64))).join(
                        "",
                    ),
                )
                .replace("=", "")
                .replace("%3D", "")
                .substring(0, 24);
            const glUrl = encodeURI(
                `https://gitlab.com/oauth/authorize?client_id=${glClientId}&response_type=code&scope=openid+profile+email&redirect_uri=${glRedirectUri}&state=${glState}`,
            );
            return new NextResponse(null, {
                status: 302,
                headers: {
                    Location: glUrl,
                },
            });
        case "discord":
            const dsClientId = process.env.DISCORD_CLIENT_ID;
            const dsRedirectUri = new URL(
                "/auth/social/discord-callback",
                request.nextUrl.origin,
            );
            const dsState = nextBase64
                .encode(
                    Array.from(crypto.getRandomValues(new Int8Array(64))).join(
                        "",
                    ),
                )
                .replace("=", "")
                .replace("%3D", "")
                .substring(0, 24);
            const dsUrl = encodeURI(
                `https://discord.com/api/oauth2/authorize?client_id=${dsClientId}&response_type=code&scope=identify+email&redirect_uri=${dsRedirectUri}&state=${dsState}&prompt=none`,
            );
            return new NextResponse(null, {
                status: 302,
                headers: {
                    Location: dsUrl,
                },
            });
        case "google":
            const ggClientId = process.env.GOOGLE_CLIENT_ID;
            const ggRedirectUri = new URL(
                "/auth/social/google-callback",
                request.nextUrl.origin,
            );
            const ggState = nextBase64
                .encode(
                    Array.from(crypto.getRandomValues(new Int8Array(64))).join(
                        "",
                    ),
                )
                .replace("=", "")
                .replace("%3D", "")
                .substring(0, 24);
            const ggUrl = encodeURI(
                `https://accounts.google.com/o/oauth2/v2/auth?client_id=${ggClientId}&response_type=code&scope=profile+openid+email&redirect_uri=${ggRedirectUri}&state=${ggState}&prompt=select_account`,
            );
            return new NextResponse(null, {
                status: 302,
                headers: {
                    Location: ggUrl,
                },
            });
        default:
            return new NextResponse(null, {
                status: 302,
                headers: {
                    Location: new URL(
                        "/?error=unknown-provider",
                        request.nextUrl.origin,
                    ).toString(),
                },
            });
    }
}
