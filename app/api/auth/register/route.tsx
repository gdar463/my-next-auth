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
        var response = new NextResponse("Email aready registered", {
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
        var response = new NextResponse("Unable to create user", {
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
    var response = new NextResponse("User created successfully", {
        status: 200,
    });
    response.cookies.set("token", token, {
        expires: new Date(Date.now() + 30 * 60 * 1000),
    });
    return response;
}