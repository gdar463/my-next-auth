//
//  my-next-auth  Copyright (C) 2024  gdar463
//  This program comes with ABSOLUTELY NO WARRANTY.
//  This is free software, and you are welcome to redistribute it
//  under certain conditions.
//  For everything check the LICENSE file bundled with the projcet
//

"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export function InvalidCodeError() {
    return (
        <div className="w-full rounded-2xl border-2 border-red-400 bg-red-200">
            <div className="m-3 flex flex-row items-center">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 shrink-0 stroke-current "
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                </svg>
                <text className="ml-1.5 font-medium">
                    The website returned an empty code.
                    <br /> Please try again.
                </text>
            </div>
        </div>
    );
}

export function ExpiredCodeError() {
    return (
        <div className="w-full rounded-2xl border-2 border-red-400 bg-red-200">
            <div className="m-3 flex flex-row items-center">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 shrink-0 stroke-current "
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                </svg>
                <text className="ml-1.5 font-medium">
                    The code expired or is invalid or you cancelled.
                    <br /> Please try again.
                </text>
            </div>
        </div>
    );
}

export function UnknownProviderError() {
    return (
        <div className="w-full rounded-2xl border-2 border-red-400 bg-red-200">
            <div className="m-3 flex flex-row items-center">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 shrink-0 stroke-current "
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                </svg>
                <text className="ml-1.5 font-medium">
                    The provider doesn't exists.
                    <br /> If it should work report this bug to{" "}
                    <a className="link" href="mailto:gdar463@gmail.com">
                        gdar463
                    </a>
                    .
                    <br /> If you did something, Why?
                </text>
            </div>
        </div>
    );
}

export function UnknownError() {
    return (
        <div className="w-full rounded-2xl border-2 border-red-400 bg-red-200">
            <div className="m-3 flex flex-row items-center">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 shrink-0 stroke-current "
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                </svg>
                <text className="ml-2 font-medium">
                    Unknown error.
                    <br /> Please try again.
                </text>
            </div>
        </div>
    );
}

export default function Home() {
    const searchParams = useSearchParams();
    const error = searchParams.get("error");

    let errorElement;
    switch (error) {
        case "invalid-code":
            errorElement = <InvalidCodeError />;
            break;
        case "expired-code":
            errorElement = <ExpiredCodeError />;
            break;
        case "unknown-provider":
            errorElement = <UnknownProviderError />;
            break;
        default:
            errorElement = <UnknownError />;
            break;
    }

    return (
        <div className="flex h-screen">
            <div className="m-auto min-w-52">
                <div className="flex flex-col">
                    <div
                        className={`${
                            searchParams.has("error") ? "mb-10" : "hidden"
                        }`}
                    >
                        {errorElement}
                    </div>
                    <Link href="/auth/login" className="btn text-base">
                        Login
                    </Link>
                    <hr className="my-10 w-full" />
                    <Link href="/auth/register" className="btn text-base">
                        Register
                    </Link>
                </div>
            </div>
        </div>
    );
}
