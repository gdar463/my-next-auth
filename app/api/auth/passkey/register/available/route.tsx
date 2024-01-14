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
