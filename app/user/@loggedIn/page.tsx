//
//  my-next-auth  Copyright (C) 2024  gdar463
//  This program comes with ABSOLUTELY NO WARRANTY.
//  This is free software, and you are welcome to redistribute it
//  under certain conditions.
//  For everything check the LICENSE file bundled with the projcet
//

"use client";
import { useEffect, useState } from "react";
import { useCookies } from "next-client-cookies";
import { useRouter } from "next/navigation";
import { client } from "@passwordless-id/webauthn";
import nextBase64 from "next-base64";

export default function Home() {
    const [email, setEmail] = useState("");
    const [passkeySupport, setPasskeySupport] = useState(false);
    const [challenge, setChallenge] = useState("");
    const cookies = useCookies();
    const router = useRouter();

    useEffect(() => {
        getUser().then();
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

    const getUser = async () => {
        var userRes: Response;
        await fetch("/api/auth/authenticate", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        }).then((res) => (userRes = res));
        if (userRes.status === 401 || userRes.status === 404) {
            alert("TUO TOKEN SU TUO BROWSER NON ESSERE IN NOSTRO DATABASE");
            cookies.remove("token");
            router.push("/");
        } else if (userRes.status === 500) {
            alert(
                "ESSERCI PROBLEMI! CONTATTARE ASSISTENZA TECNICA VIA POSTA ALL'INDIRIZZO Longyearbyen 9170, Svalbard e Jan Mayen, Norvegia!",
            );
        } else if (userRes.status != 200) {
            alert(
                "ALLARME ALLARME ALLARME ALLARME ALLARME ALLARME ALLARME ALLARME ALLARME ALLARME ALLARME ALLARME ALLARME ALLARME ALLARME ALLARME ",
            );
        }
        const json = await userRes.json();
        setEmail(json.email);
    };

    const webauthnHandler = async (event) => {
        event.preventDefault();
        if (
            !challenge.match(
                "[a-zA-Z0-9]{8}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{12}",
            )
        ) {
            alert("Ricarica la pagina e riprova");
            return;
        }
        // noinspection TypeScriptValidateJSTypes
        const registration = await client.register(email, challenge, {
            authenticatorType: "auto",
            userVerification: "required",
            timeout: 120000,
            userHandle: nextBase64
                .encode(
                    Array.from(crypto.getRandomValues(new Int8Array(64))).join(
                        "",
                    ),
                )
                .replace("=", "")
                .replace("%3D", "")
                .substring(0, 64),
        });
        const response = await fetch("/api/auth/passkey/add", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(registration),
        });
        const responseStatus = response.status;
        switch (responseStatus) {
            case 200:
                alert("Passkey added succefully");
                break;
            case 404:
                alert("Accesso scaduto. Ricarica la pagina e riprova");
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

    const logout = async (event) => {
        event.preventDefault();
        cookies.remove("token");
        window.location.reload();
    };

    return (
        <div className="flex h-screen">
            <div className="m-auto">
                <text className="text-lg font-semibold">
                    Logged in as <br />
                </text>
                <text id="email">{email}</text>
                <br />
                <div className={`${passkeySupport ? "" : "hidden"}`}>
                    <hr className="my-6 w-full" />
                    <text className="text-3xl font-bold">Add a passkey</text>
                    <form className="form-control" onSubmit={webauthnHandler}>
                        <input className="btn mt-6" type="submit" value="Add" />
                    </form>
                </div>
                <hr className="my-6 w-full" />
                <div className="flex flex-col">
                    <text className="text-center text-3xl font-bold">
                        Logout
                    </text>
                    <button className="btn mt-6" onClick={logout}>
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
}
