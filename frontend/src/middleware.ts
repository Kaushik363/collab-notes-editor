import { url } from "inspector";
import {NextRequest,NextResponse} from "next/server";

export function middleware(req: NextRequest){
    const {pathname}=req.nextUrl;
    //token value from cookie
    const accessToken = req.cookies.get("accessToken")?.value;

    //route types
    const isAuthPage= pathname==="/login";
    const isProtectedPage=pathname.startsWith("/notes");

    //case-1: unauthorised user
    if(!accessToken && isProtectedPage){
        const loginUrl=new URL("/login",req.url);
        return NextResponse.redirect(loginUrl);
    }

    //case-2: aunthenticated user
    if(accessToken&&isAuthPage){
        const notesUrl=new URL("/notes",req.url);
        return NextResponse.redirect(notesUrl);
    }

    return NextResponse.next();
}

export const config={
    matcher: ["/login", "/notes/:path*"],
}