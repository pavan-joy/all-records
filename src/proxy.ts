import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/subscriptions/:path*",
    "/vendors/:path*",
    "/servers/:path*",
    "/firewalls/:path*",
    "/avaya-telephones/:path*",
    "/isp/:path*",
    "/csv-upload/:path*",
    "/admin-users/:path*",
    "/platform-settings/:path*",
    "/settings/:path*",
  ],
};
