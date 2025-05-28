"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export default function Home() {
	const { data: session } = authClient.useSession();

	const [email, setEmail] = useState("");
	const [name, setName] = useState("");
	const [password, setPassword] = useState("");

	const onSubmit = () => {
		authClient.signUp.email(
			{
				email,
				name,
				password,
			},
			{
				onSuccess: (ctx) => {
					window.alert("DOne");
				},
				onError: (ctx) => {
					window.alert("Something went wrong");
				},
			}
		);
	};

	if (session) {
		return (
			<div>
				you are logged in {session.user.name}
				<Button onClick={() => authClient.signOut()}>Log out</Button>
			</div>
		);
	}
	return (
		<div>
			<Input
				placeholder="name"
				value={name}
				onChange={(e) => setName(e.target.value)}
			/>
			<Input
				placeholder="email"
				value={email}
				onChange={(e) => setEmail(e.target.value)}
			/>
			<Input
				placeholder="password"
				value={password}
				onChange={(e) => setPassword(e.target.value)}
			/>
			<Button onClick={onSubmit}>Create User</Button>
		</div>
	);
}
