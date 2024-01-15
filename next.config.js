/** @type {import('next').NextConfig} */
const nextConfig = {
    images: { unoptimized: true },
    pageExtensions: ["ts", "tsx"],
    // async headers() {
    //     return [
    //         {
    //             source: "/(.*)",
    //             headers: [
    //                 {
    //                     key: "Access-Control-Allow-Origin",
    //                     value: "*"
    //                 },
    //                 {
    //                     key: "Access-Control-Allow-Methods",
    //                     value: "GET"
    //                 }
    //             ]
    //         }
    //     ]
    // }
};

module.exports = nextConfig;
