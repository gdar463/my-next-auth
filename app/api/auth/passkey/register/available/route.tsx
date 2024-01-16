//
//  my-next-auth  Copyright (C) 2024  gdar463
//  This program comes with ABSOLUTELY NO WARRANTY.
//  This is free software, and you are welcome to redistribute it
//  under certain conditions.
//  For everything check the LICENSE file bundled with the projcet
//

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db";

export async function POST(request: NextRequest) {
    const email = await request.text();
    const fromDB = await prisma.user.findUnique({
        where: {
            email: email,
        },
    });
    if (fromDB != null) {
        return new NextResponse("Already taken", {
            status: 409,
        });
    }
    return new NextResponse("Available", {
        status: 200,
    });
}
