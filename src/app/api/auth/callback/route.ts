import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export async function GET(req: Request) {
    const { searchParams, origin } = new URL(req.url);
    const code = searchParams.get("code");
    const next = searchParams.get("next") ?? "/";

    if (code) {
        const supabase = await createClient(); 
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error && data?.user) {
            const metadata = data.user.user_metadata;
            const fullName = metadata.full_name || metadata.name || "Google User";

            await prisma.user.upsert({
                where: { id: data.user.id },
                update: {
                    email: data.user.email!,
                    name: fullName,
                },
                create: {
                    id: data.user.id,
                    email: data.user.email!,
                    name: fullName,
                    role: Role.CUSTOMER,
                },
            });

            return NextResponse.redirect(`${origin}${next}`);
        }
    }
    return NextResponse.redirect(`${origin}/login?error=auth-failed`);
}