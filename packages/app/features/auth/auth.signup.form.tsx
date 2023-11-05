import {
	Button,
	H1,
	Paragraph,
	Form,
	Image,
	// @ts-ignore
	tokens,
	YStack,
	Input,
	Text,
} from "@memewar/design-system";

import React, { useEffect } from "react";
import { Controller } from "react-hook-form";

import { useSignUpForm } from "./auth.signup.hook";
import { useRouter } from "@memewar/app/hooks/use-router";
import { useSession } from "@memewar/app/hooks/use-session";

export default function SignUp() {
	const { signUp, ...methods } = useSignUpForm();
	const router = useRouter();
	const { data: session } = useSession();

	useEffect(() => {
		console.log("session", session);
		if (session) router.push("/");
	}, [session, router]);

	return (
		<YStack
			flex={1}
			justifyContent="center"
			alignItems="center"
			backgroundColor={tokens.color.background}
			padding="$8"
		>
			<Form onSubmit={signUp}>
				<YStack space="$3" borderRadius="$1" maxWidth={360}>
					<YStack space="$2">
						<H1 fontSize={24}>Choose your name</H1>
						<Paragraph fontSize={18} color={tokens.color.textSecondary}>
							Account names are visible to others.
						</Paragraph>
					</YStack>
					<Controller
						control={methods.control}
						rules={{ required: true }}
						name={"username"}
						render={({ field: { onChange, value }, fieldState: { error } }) => (
							<>
								<Input
									borderColor={tokens.color.input}
									borderRadius={"$1"}
									value={value}
									onChangeText={onChange}
									autoFocus
									autoCapitalize="none"
									// @ts-expect-error: webauthn not typed correctly but is supported
									autoComplete="username webauthn"
								/>
								{error && <Text>{error.message}</Text>}
							</>
						)}
					/>
					<Form.Trigger asChild>
						<Button
							size={"$3"}
							height={"$4"}
							width={"60%"}
							backgroundColor={tokens.color.button}
							borderRadius={"$1"}
							color={tokens.color.white}
						>
							{methods.formState.isSubmitting
								? "Creating..."
								: "Create Account"}
						</Button>
					</Form.Trigger>
				</YStack>
			</Form>
			<Paragraph
				position="absolute"
				bottom={80}
				color={tokens.color.textSecondary}
				maxWidth={"80%"}
			>
				WARNING: Meme War is Alpha wallet software. Assume that any ETH put into
				the system cannot be recovered. The developers will provide no
				guarantees or refunds.
			</Paragraph>
		</YStack>
	);
}
