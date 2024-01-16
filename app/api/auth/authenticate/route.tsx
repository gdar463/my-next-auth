//
//  my-next-auth  Copyright (C) 2024  gdar463
//  This program comes with ABSOLUTELY NO WARRANTY.
//  This is free software, and you are welcome to redistribute it
//  under certain conditions.
//  For everything check the LICENSE file bundled with the projcet
//

// noinspection UnnecessaryLocalVariableJS

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db";

export async function GET(request: NextRequest) {
    if (!request.cookies.has("token")) {
        const response = new NextResponse("Couldn't find token", {
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
        const response = new NextResponse(JSON.stringify(toClient), {
            status: 200,
        });
        return response;
    } else {
        const response = new NextResponse(
            "Couldn't find an account with token",
            {
                status: 404,
            },
        );
        return response;
    }
}
