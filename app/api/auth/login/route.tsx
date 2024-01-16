//
//  my-next-auth  Copyright (C) 2024  gdar463
//  This program comes with ABSOLUTELY NO WARRANTY.
//  This is free software, and you are welcome to redistribute it
//  under certain conditions.
//  For everything check the LICENSE file bundled with the projcet
//

import prisma from "@/db";
import { NextRequest, NextResponse } from "next/server";
import nextBase64 from "next-base64";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
    const json = await request.json();
    const fromDB = await prisma.user.findUnique({
        where: {
            email: json.email,
        },
    });
    if (fromDB === null) {
        var response = new NextResponse("Couldn't find an account with email", {
            status: 404,
        });
        return response;
    }
    const result = await bcrypt.compare(json.password, fromDB.password);
    if (result === true) {
        const token = nextBase64
            .encode(
                Array.from(crypto.getRandomValues(new Int8Array(32))).join(""),
            )
            .replace("=", "")
            .replace("%3D", "");
        const toDB = await prisma.user.update({
            where: {
                id: fromDB.id,
            },
            data: {
                token: token,
            },
        });
        var response = new NextResponse("Logged in", {
            status: 200,
        });
        response.cookies.set("token", token, {
            expires: new Date(Date.now() + 60 * 60 * 1000),
        });
        return response;
    } else {
        var response = new NextResponse("Incorrect Credentials", {
            status: 401,
        });
        return response;
    }
}
