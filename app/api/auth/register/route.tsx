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
    const emailFromDB = await prisma.user.findUnique({
        where: {
            email: json.email,
        },
    });
    if (emailFromDB != null) {
        const response = new NextResponse("Email aready registered", {
            status: 409,
        });
        return response;
    }
    const password = await bcrypt.hash(json.password, 10);
    const toDB = await prisma.user.create({
        data: {
            email: json.email,
            password: password,
        },
    });
    if (toDB === null) {
        const response = new NextResponse("Unable to create user", {
            status: 500,
        });
        return response;
    }
    const token = nextBase64
        .encode(Array.from(crypto.getRandomValues(new Int8Array(32))).join(""))
        .replace("=", "")
        .replace("%3D", "");
    const tokenToDB = await prisma.user.update({
        where: {
            id: toDB.id,
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
