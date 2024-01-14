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
