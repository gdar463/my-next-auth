//
//  my-next-auth  Copyright (C) 2024  gdar463
//  This program comes with ABSOLUTELY NO WARRANTY.
//  This is free software, and you are welcome to redistribute it
//  under certain conditions.
//  For everything check the LICENSE file bundled with the projcet
//

"use client";

import { client } from "@passwordless-id/webauthn";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function Login() {
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

        const response = await fetch("/api/auth/login", {
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
            case 401:
                alert("Credenziali Sbagliate");
                break;
            case 404:
                alert("NON C'E' ACCOUNT CON QUESTA EMAIL");
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
        // noinspection TypeScriptValidateJSTypes
        const authentication = await client.authenticate([], challenge, {
            authenticatorType: "auto",
            userVerification: "required",
            timeout: 120000,
        });
        const response = await fetch("/api/auth/passkey/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(authentication),
        });
        const responseStatus = response.status;
        switch (responseStatus) {
            case 200:
                router.push("/user");
                break;
            case 401:
                alert("Passkey non valida (in qualche modo)");
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
                <h1 className="ml-1 text-5xl font-extrabold">Login</h1>
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
                            value="Login"
                        />
                    </form>
                </div>
                <div className={`${currentTab != 1 ? "hidden" : ""}`}>
                    <form className="form-control" onSubmit={webauthnHandler}>
                        <input
                            className="btn mt-7 text-base"
                            type="submit"
                            value="Login with a passkey"
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
                            Sign in with Google
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
                            Sign in with Github
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
                            Sign in with Gitlab
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
                            Sign in with Discord
                        </text>
                    </div>
                </div>
            </div>
        </div>
    );
}
