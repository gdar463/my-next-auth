//
//  my-next-auth  Copyright (C) 2024  gdar463
//  This program comes with ABSOLUTELY NO WARRANTY.
//  This is free software, and you are welcome to redistribute it
//  under certain conditions.
//  For everything check the LICENSE file bundled with the projcet
//

"use client";

import { useRouter } from "next/navigation";
import { client } from "@passwordless-id/webauthn";
import { useEffect, useState } from "react";
import nextBase64 from "next-base64";
import Image from "next/image";

export default function Register() {
    // noinspection DuplicatedCode
    const [passkeySupport, setPasskeySupport] = useState(false);
    const [challenge, setChallenge] = useState("");
    const [currentTab, setCurrentTab] = useState(0);
    const router = useRouter();

    useEffect(() => {
        setPasskeySupport(client.isAvailable());
        if (client.isAvailable()) {
            getChallenge().then();
        }
    }, []);

    const getChallenge = async () => {
        setChallenge(
            await (
                await fetch("/api/auth/passkey/challenge", {
                    method: "GET",
                })
            ).text(),
        );
    };

    const handler = async (event) => {
        event.preventDefault();

        const request = {
            email: event.target.email.value,
            password: event.target.password.value,
        };

        const response = await fetch("/api/auth/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(request),
        });

        const responseStatus = response.status;
        switch (responseStatus) {
            case 200:
                router.push("/user");
                break;
            case 409:
                alert("ESISTE GIA' ACCOUNT CON QUESTO USERNAME");
                break;
            case 500:
                alert(
                    "ESSERCI PROBLEMI! CONTATTARE ASSISTENZA TECNICA VIA POSTA ALL'INDIRIZZO Longyearbyen 9170, Svalbard e Jan Mayen, Norvegia!",
                );
                break;
            default:
                alert(
                    "ALLARME ALLARME ALLARME ALLARME ALLARME ALLARME ALLARME ALLARME ALLARME ALLARME ALLARME ALLARME ALLARME ALLARME ALLARME ALLARME ",
                );
                break;
        }
    };

    const webauthnHandler = async (event) => {
        event.preventDefault();
        const available = await fetch("/api/auth/passkey/register/available", {
            method: "POST",
            body: event.target.email.value,
        });
        const availableStatus = available.status;
        switch (availableStatus) {
            case 200:
                break;
            case 409:
                alert(
                    "TU NON POTER CREARE PASSKEY COSI'. SE TU AVERE QUESTO ACCOUNT AGGIUNGI DA ACCOUNT",
                );
                return;
            case 500:
                alert(
                    "ESSERCI PROBLEMI! CONTATTARE ASSISTENZA TECNICA VIA POSTA ALL'INDIRIZZO Longyearbyen 9170, Svalbard e Jan Mayen, Norvegia!",
                );
                return;
            default:
                alert(
                    "ALLARME ALLARME ALLARME ALLARME ALLARME ALLARME ALLARME ALLARME ALLARME ALLARME ALLARME ALLARME ALLARME ALLARME ALLARME ALLARME ",
                );
                return;
        }
        if (
            !challenge.match(
                "[a-zA-Z0-9]{8}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{12}",
            )
        ) {
            alert("Ricarica la pagina e riprova");
            return;
        }
        // noinspection TypeScriptValidateJSTypes
        const registration = await client.register(
            event.target.email.value,
            challenge,
            {
                authenticatorType: "auto",
                userVerification: "required",
                timeout: 120000,
                userHandle: nextBase64
                    .encode(
                        Array.from(
                            crypto.getRandomValues(new Int8Array(64)),
                        ).join(""),
                    )
                    .replace("=", "")
                    .replace("%3D", "")
                    .substring(0, 64),
            },
        );
        const response = await fetch("/api/auth/passkey/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(registration),
        });
        const responseStatus = response.status;
        switch (responseStatus) {
            case 200:
                router.push("/user");
                break;
            case 404:
                await getChallenge();
                alert("Accesso scaduto. Riprova");
                break;
            case 409:
                alert(
                    "TU NON POTER CREARE PASSKEY COSI'. SE TU AVERE QUESTO ACCOUNT AGGIUNGI DA ACCOUNT",
                );
                break;
            case 500:
                alert(
                    "ESSERCI PROBLEMI! CONTATTARE ASSISTENZA TECNICA VIA POSTA ALL'INDIRIZZO Longyearbyen 9170, Svalbard e Jan Mayen, Norvegia!",
                );
                break;
            default:
                alert(
                    "ALLARME ALLARME ALLARME ALLARME ALLARME ALLARME ALLARME ALLARME ALLARME ALLARME ALLARME ALLARME ALLARME ALLARME ALLARME ALLARME ",
                );
                break;
        }
    };

    const socialHandler = async (provider: string) => {
        router.push(`/api/auth/social?provider=${provider}`);
    };

    return (
        <div className="flex h-screen min-h-[40%]">
            <div className="m-auto">
                <h1 className="ml-1 text-5xl font-extrabold">Register</h1>
                <hr className="my-6 w-full" />
                <div role="tablist" className="tabs tabs-bordered">
                    <a
                        role="tab"
                        className={`tab ${
                            currentTab === 0
                                ? "tab-active font-[600]"
                                : "text-gray-400"
                        } ml-1 text-lg`}
                        onClick={() => setCurrentTab(0)}
                    >
                        Credentials
                    </a>
                    <a
                        role="tab"
                        className={`tab ${
                            currentTab === 1
                                ? "tab-active font-[600]"
                                : "text-gray-400"
                        } text-lg ${passkeySupport ? "" : "hidden"}`}
                        onClick={() => setCurrentTab(1)}
                    >
                        Passkey
                    </a>
                    <a
                        role="tab"
                        className={`tab ${
                            currentTab === 2
                                ? "tab-active font-[600]"
                                : "text-gray-400"
                        } text-lg`}
                        onClick={() => setCurrentTab(2)}
                    >
                        Social
                    </a>
                </div>
                <div className={`${currentTab != 0 ? "hidden" : ""}`}>
                    <form className="form-control" onSubmit={handler}>
                        <label className="label mt-4">Email</label>
                        <input
                            className="input input-bordered"
                            type="email"
                            id="email"
                            autoComplete="email"
                            required
                        />
                        <label className="label mt-1">Password</label>
                        <input
                            className="input input-bordered"
                            type="password"
                            id="password"
                            minLength={8}
                            autoComplete="current-password"
                            required
                        />
                        <input
                            className="btn mb-1 mt-7 text-base"
                            type="submit"
                            value="Register"
                        />
                    </form>
                </div>
                <div className={`${currentTab != 1 ? "hidden" : ""}`}>
                    <form className="form-control" onSubmit={webauthnHandler}>
                        <label className="label mt-4">Email</label>
                        <input
                            className="input input-bordered"
                            type="email"
                            id="email"
                            autoComplete="email webauthn"
                            required
                        />
                        <input
                            className="btn mt-7 text-base"
                            type="submit"
                            value="Register with a passkey"
                        />
                    </form>
                </div>
                <div className={`${currentTab != 2 ? "hidden" : ""}`}>
                    <div
                        className="btn mt-7 flex items-center justify-center"
                        onClick={() => socialHandler("google")}
                    >
                        <Image
                            src="/icons/social/google.png"
                            alt="Google Logo"
                            width={30}
                            height={30}
                        />
                        <text className="flex-grow align-middle text-base">
                            Sign up with Google
                        </text>
                    </div>
                    <div
                        className="btn mt-4 flex items-center justify-center"
                        onClick={() => socialHandler("github")}
                    >
                        <Image
                            src="/icons/social/github.png"
                            alt="Github Logo"
                            width={30}
                            height={30}
                        />
                        <text className="flex-grow align-middle text-base">
                            Sign up with Github
                        </text>
                    </div>
                    <div
                        className="btn mt-4 flex items-center justify-center"
                        onClick={() => socialHandler("gitlab")}
                    >
                        <Image
                            src="/icons/social/gitlab.png"
                            alt="Gitlab Logo"
                            width={30}
                            height={30}
                        />
                        <text className="flex-grow align-middle text-base">
                            Sign up with Gitlab
                        </text>
                    </div>
                    <div
                        className="btn mt-4 flex items-center justify-center"
                        onClick={() => socialHandler("discord")}
                    >
                        <Image
                            src="/icons/social/discord.png"
                            alt="Discord Logo"
                            width={30}
                            height={30}
                        />
                        <text className="flex-grow align-middle text-base">
                            Sign up with Discord
                        </text>
                    </div>
                </div>
            </div>
        </div>
    );
}
