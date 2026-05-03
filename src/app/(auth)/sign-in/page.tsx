import { auth } from "@/lib/auth";
import { SignInView } from "@/modules/auth/ui/views/sign-in-view";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

interface Props {
	// `searchParams` is a promise in Next's server runtime; align with PageProps.
	searchParams?: Promise<{ callbackUrl?: string }>;
}

const page = async ({ searchParams }: Props) => {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	// Await `searchParams` before accessing its properties to satisfy
	// Next's sync-dynamic-apis requirement.
	const sp = (searchParams ? await searchParams : {}) as { callbackUrl?: string };
	const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? ""}${sp.callbackUrl ?? ""}`;

	if (!!session) {
		redirect(callbackUrl || "/");
	}

	return <SignInView callbackUrl={callbackUrl} />;
};

export default page;
