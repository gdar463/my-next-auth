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
