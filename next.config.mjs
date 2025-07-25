import createNextIntlPlugin from "next-intl/plugin";

/** @type {import("next").NextConfig} */


const withNextIntl = createNextIntlPlugin("./i18n/request.tsx");

const nextConfig = {
    // reactStrictMode: true,
    // output: "export",
    // images: {
    //     unoptimized: true
    // },

    async headers() {
        return [
            {
                source: "/:path*",
                headers: [
                    { key: "Access-Control-Allow-Credentials", value: "true" },
                    { key: "Access-Control-Allow-Origin", value: "*" }, // replace this your actual origin
                    { key: "Access-Control-Allow-Methods", value: "GET,DELETE,PATCH,POST,PUT" },
                    {
                        key: "Access-Control-Allow-Headers",
                        value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, " +
                            "Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
                    },
                ],
            },
        ];
    },
};

export default withNextIntl(nextConfig);
