import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { loginSchema } from "@/lib/validation";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
	try {
		const body = await req.json();
		console.log(body);

		const validation = loginSchema.safeParse(body);
		if (!validation.success) {
			return NextResponse.json(
				{ message: "Email or password does not match" },
				{ status: 400 },
			);
		}

		const { email, password } = validation.data;
		const supabase = await createClient();

		const { data, error } = await supabase.auth.signInWithPassword({
			email,
			password,
		});

		if (data.user) {
            // ambil role dari prisma
			const userDb = await prisma.user.findUnique({
				where: {
					id: data.user.id,
				},
			});

			if (error) {
				return NextResponse.json({ message: error.message }, { status: 401 });
			}

			return NextResponse.json({
				message: `Login successfully!`,
				role: userDb?.role, // kirim ke front end
				redirectPath: userDb?.role === "ADMIN" ? "/admin/dashboard" : "customer",
			});
		}
	} catch (error) {
		return NextResponse.json(
			{ message: `Something went wwrong during login` },
			{ status: 500 },
		);
	}
}
