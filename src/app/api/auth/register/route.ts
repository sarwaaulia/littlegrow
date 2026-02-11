import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { registerSchema } from "@/lib/validation";

export async function POST(req: Request) {
	try {
		const body = await req.json();

		const validation = registerSchema.safeParse(body);

		if (!validation.success) {
			const fieldErrors = validation.error.flatten().fieldErrors;
			return NextResponse.json(
				{ message: "Validation failed", errors: fieldErrors },
				{ status: 400 },
			);
		}
        
		const { name, email, password } = validation.data;
		const supabase = await createClient();

		const { data, error } = await supabase.auth.signUp({
			email,
			password,
			options: {
				data: { name: name },
			},
		});

		if (error) {
			return NextResponse.json({ message: error.message }, { status: 400 });
		}

		return NextResponse.json(
			{ message: `Regist account successfully!` },
			{ status: 201 },
		);
	} catch (error: any) {
		console.error(`api error`, error)
		return NextResponse.json(
			{ message: `Something went wwrong during regist account` },
			{ status: 500 },
		);
	}
}
