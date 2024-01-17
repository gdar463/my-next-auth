//
//  my-next-auth  Copyright (C) 2024  gdar463
//  This program comes with ABSOLUTELY NO WARRANTY.
//  This is free software, and you are welcome to redistribute it
//  under certain conditions.
//  For everything check the LICENSE file bundled with the project.
//

export default function Layout({ children }) {
    return (
        <div className="flex h-screen flex-col">
            <div className="m-auto flex min-w-52 flex-col items-center self-center text-center">
                <span className="loading-xl loading loading-spinner"></span>
                <text className="mt-3 text-3xl font-extrabold">Loading...</text>
            </div>
            {children}
        </div>
    );
}
