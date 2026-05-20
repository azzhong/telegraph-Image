import { auth } from "@/auth"

const LOGIN = '/login'

export default auth(async (req) => {
    const { nextUrl } = req;
    const isAuthenticated = !!req.auth;
    const role = req?.auth?.user?.role;
    const isLoginRoute = nextUrl.pathname === LOGIN;

    // 如果已经是在登录页，不做限制
    if (isLoginRoute) {
        return;
    }

    // 如果未登录或角色不是 admin，强制重定向到登录页
    if (!isAuthenticated || role !== 'admin') {
        return Response.redirect(new URL(LOGIN, nextUrl));
    }
})

// 匹配所有路径，除了 _next 相关文件、静态资源、favicon 和登录页
export const config = {
    matcher: [
        "/((?!api|_next/static|_next/image|favicon.ico|login|img).*)",
    ],
};