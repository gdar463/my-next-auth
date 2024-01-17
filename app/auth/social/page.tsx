//
//  my-next-auth  Copyright (C) 2024  gdar463
//  This program comes with ABSOLUTELY NO WARRANTY.
//  This is free software, and you are welcome to redistribute it
//  under certain conditions.
//  For everything check the LICENSE file bundled with the project
//

"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Social() {
    const router = useRouter();
    useEffect(() => {
        router.replace("/");
    }, []);
    return;
}
