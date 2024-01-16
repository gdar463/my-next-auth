//
//  my-next-auth  Copyright (C) 2024  gdar463
//  This program comes with ABSOLUTELY NO WARRANTY.
//  This is free software, and you are welcome to redistribute it
//  under certain conditions.
//  For everything check the LICENSE file bundled with the projcet
//

"use client";
import { useCookies } from "next-client-cookies";
import { useRouter } from "next/navigation";

export default function Layout({ loggedIn }) {
    const token = useCookies().get("token");
    if (token) {
        return loggedIn;
    } else {
        useRouter().push("/");
    }
}
