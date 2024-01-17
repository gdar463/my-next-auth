//
//  my-next-auth  Copyright (C) 2024  gdar463
//  This program comes with ABSOLUTELY NO WARRANTY.
//  This is free software, and you are welcome to redistribute it
//  under certain conditions.
//  For everything check the LICENSE file bundled with the project
//

"use client";
import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function GithubCallback() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        getToken().then();
    }, []);

    const getToken = async () => {
        const code = searchParams.get("code");
        router.replace(`/api/auth/social/github?code=${code}`);
    };
    return;
}
