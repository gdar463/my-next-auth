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

export default function Register() {
    const [passkeySupport, setPasskeySupport] = useState(false);
    const [challenge, setChallenge] = useState("");
    const router = useRouter();

    useEffect(() => {
        setPasskeySupport(client.isAvailable());
        if (client.isAvailable()) {
            getChallenge();
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

    const credsHandler = async (event) => {
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

    return (
        <div className="flex h-screen">
            <div className="m-auto">
                <h1 className="text-5xl font-extrabold">Register</h1>
                <hr className="my-6 w-full" />
                <form className="form-control" onSubmit={credsHandler}>
                    <text className="text-3xl font-semibold">
                        With a password
                    </text>
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
                        autoComplete="new-password"
                        required
                    />
                    <input
                        className="btn mb-1 mt-7"
                        type="submit"
                        value="Register"
                    />
                </form>
                <div className={`${passkeySupport ? "" : "hidden"}`}>
                    <hr className="my-6 w-full" />
                    <text className="text-3xl font-semibold">
                        Or you can use a passkey
                    </text>
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
                            className="btn mt-7"
                            type="submit"
                            value="Register"
                        />
                    </form>
                </div>
            </div>
        </div>
    );
}
