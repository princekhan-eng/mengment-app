import ImageKit from "imagekit";

const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || "public_demo_key";
const privateKey = process.env.IMAGEKIT_PRIVATE_KEY || "private_demo_key";
const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || "https://ik.imagekit.io/managehub_demo";

export const imagekit = new ImageKit({
    publicKey,
    privateKey,
    urlEndpoint,
});

export function getAuthenticationParameters() {
    return imagekit.getAuthenticationParameters();
}
