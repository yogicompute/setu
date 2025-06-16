import { auth } from "@/lib/auth";
import { SignInView } from "@/modules/auth/ui/views/sign-in-view";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

interface Props {
	searchParams?: { callbackUrl?: string };
}

const page = async ({ searchParams }: Props) => {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL}	${searchParams?.callbackUrl}`;
	if (!!session) {
		redirect(callbackUrl || "/");
	}
	return <SignInView callbackUrl={callbackUrl} />;
};

export default page;
