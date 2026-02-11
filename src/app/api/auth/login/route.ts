import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { loginSchema } from "@/lib/validation";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
	try {
        const body = await req.json();
        const validation = loginSchema.safeParse(body);
        
        if (!validation.success) {
            return NextResponse.json(
                { message: "Format email atau password salah" },
                { status: 400 }
            );
        }

        const { email, password } = validation.data;
        const supabase = await createClient();

        
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        
        if (error) {
            return NextResponse.json({ message: error.message }, { status: 401 });
        }

        
        if (data?.user) {
            const userDb = await prisma.user.findUnique({
                where: { id: data.user.id },
            });

           
            if (!userDb) {
                return NextResponse.json({ message: "User data not found in database" }, { status: 404 });
            }

            return NextResponse.json({
                message: `Login successfully!`,
                role: userDb.role,
                redirectPath: userDb.role === "ADMIN" ? "/admin/dashboard" : "/customer",
            });
        }

        
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    } catch (error) {
        console.error("LOGIN_ERROR:", error); 
        return NextResponse.json(
            { message: "Something went wrong during login" },
            { status: 500 }
        );
    }
}
