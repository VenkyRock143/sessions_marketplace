import type { NextConfig } from "next";

const NextConfig = {
output: 'standalone', 
images: {
remotePatterns: [
{ hostname: 'localhost' },
{ hostname: 'lh3.googleusercontent.com' }, 
{ hostname: 'avatars.githubusercontent.com' }, 
],
}, 
}
module.exports = NextConfig