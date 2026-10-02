"use client";
import { Loader2Icon } from "lucide-react";
import { useEffect, useState } from "react";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";

import { CallUI } from "./call-ui";

interface Props {
	meetingId: string;
	meetingName: string;
	userId: string;
	userName: string;
	userImage: string;
}

export const CallConnect = ({ meetingId, meetingName, userName }: Props) => {
	const trpc = useTRPC();
	const { mutateAsync: generateToken } = useMutation(
		trpc.meetings.generateToken.mutationOptions()
	);

	const [token, setToken] = useState<string>();

	useEffect(() => {
		let active = true;
		generateToken({ meetingId })
			.then((t) => {
				if (active) setToken(t);
			})
			.catch((err) => console.error("Failed to get LiveKit token", err));
		return () => {
			active = false;
		};
	}, [meetingId, generateToken]);

	if (!token) {
		return (
			<div className="flex h-screen items-center justify-center bg-radial from-sidebar-accent to-sidebar">
				<Loader2Icon className="size-6 animate-spin text-white" />
			</div>
		);
	}

	return (
		<CallUI
			meetingName={meetingName}
			token={token}
			serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL!}
			userName={userName}
		/>
	);
};
