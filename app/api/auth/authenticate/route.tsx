import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db";

export async function GET(request: NextRequest) {
    if (!request.cookies.has("token")) {
        var response = new NextResponse("Couldn't find token", {
            status: 401,
        });
        return response;
    }
    const fromDB = await prisma.user.findUnique({
        where: {
            token: request.cookies.get("token").value,
        },
        select: {
            email: true,
        },
    });
    if (fromDB != null) {
        const toClient = {
            email: fromDB.email,
        };
        var response = new NextResponse(JSON.stringify(toClient), {
            status: 200,
        });
        return response;
    } else {
        var response = new NextResponse("Couldn't find an account with token", {
            status: 404,
        });
        return response;
    }
}
