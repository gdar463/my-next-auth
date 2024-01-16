//
//  my-next-auth  Copyright (C) 2024  gdar463
//  This program comes with ABSOLUTELY NO WARRANTY.
//  This is free software, and you are welcome to redistribute it
//  under certain conditions.
//  For everything check the LICENSE file bundled with the projcet
//

import Link from "next/link";

export default function Home() {
    return (
        <div className="flex h-screen">
            <div className="m-auto min-w-52">
                <div className="flex flex-col">
                    <Link href="/auth/login" className="btn">
                        Login
                    </Link>
                    <hr className="my-10 w-full" />
                    <Link href="/auth/register" className="btn">
                        Register
                    </Link>
                </div>
            </div>
        </div>
    );
}
