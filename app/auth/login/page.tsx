"use client";

import { client } from "@passwordless-id/webauthn";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Login() {
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
                window.location.replace("/user");
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
                window.location.replace("/user");
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

    return (
        <div className="flex h-screen">
            <div className="m-auto">
                <h1 className="text-5xl font-extrabold">Login</h1>
                <hr className="my-6 w-full" />
                <form className="form-control" onSubmit={handler}>
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
                        autoComplete="current-password"
                        required
                    />
                    <input
                        className="btn mb-1 mt-7"
                        type="submit"
                        value="Login"
                    />
                </form>
                <div className={`${passkeySupport ? "" : "hidden"}`}>
                    <hr className="my-6 w-full" />
                    <text className="text-3xl font-semibold">
                        Or you can use a passkey
                    </text>
                    <form className="form-control" onSubmit={webauthnHandler}>
                        <input
                            className="btn mt-6"
                            type="submit"
                            value="Login"
                        />
                    </form>
                </div>
            </div>
        </div>
    );
}
