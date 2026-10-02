"use client";
import { useState } from "react";
import type { LocalUserChoices } from "@livekit/components-react";
import "@livekit/components-styles";

import { CallLobby } from "./call-lobby";
import { CallActive } from "./call-active";
import { CallEnded } from "./call-ended";

interface Props {
	meetingName: string;
	token: string;
	serverUrl: string;
	userName: string;
}

export const CallUI = ({ meetingName, token, serverUrl, userName }: Props) => {
	const [show, setShow] = useState<"lobby" | "call" | "ended">("lobby");
	const [choices, setChoices] = useState<LocalUserChoices>();

	const handleJoin = (userChoices: LocalUserChoices) => {
		setChoices(userChoices);
		setShow("call");
	};

	const handleLeave = () => {
		setShow("ended");
	};

	return (
		<div className="h-full">
			{show === "lobby" && (
				<CallLobby userName={userName} onJoin={handleJoin} />
			)}
			{show === "call" && choices && (
				<CallActive
					meetingName={meetingName}
					token={token}
					serverUrl={serverUrl}
					choices={choices}
					onLeave={handleLeave}
				/>
			)}
			{show === "ended" && <CallEnded />}
		</div>
	);
};
