import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CookiesProvider } from "next-client-cookies/server";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Magic Auth App",
    description: "Creds and Passkeys?",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html>
            <CookiesProvider>
                <body className={`${inter.className} min-w-52`}>
                    {children}
                </body>
            </CookiesProvider>
        </html>
    );
}
