import { Button, H1, Image, tokens, YStack } from "@memewar/design-system";
import React from "react";
import { useLink } from "solito/navigation";

export function AuthScreen() {
	const signupLinkProps = useLink({
		href: "/sign-up",
	});
	const signinLinkProps = useLink({
		href: "/sign-in",
	});

	return (
		<>
			{/* TODO: fix types on tamagui vs our exports */}
			<Image
				src="/img/main-bg.png"
				fill
				resizeMode="cover"
				objectFit="cover"
				objectPosition="center"
				alt="main-background"
				priority={true}
				style={{ zIndex: -1 }}
			/>
			<YStack flex={1} justifyContent="center" alignItems="center">
				<YStack
					space="$6"
					padding="$5"
					borderRadius="$1"
					maxWidth={360}
					backgroundColor={tokens.color.white}
				>
					<H1 fontSize={36} textAlign="center">
						memewar.army
					</H1>
					<YStack paddingHorizontal="$6" space="$6">
						<Button
							{...signupLinkProps}
							size={"$5"}
							backgroundColor={tokens.color.button}
							color={tokens.color.white}
							borderRadius={"$1"}
							// tODO: button text should be fontSize 24
						>
							Sign Up
						</Button>
						<Button
							{...signinLinkProps}
							variant="outlined"
							size={"$5"}
							borderColor={tokens.color.input}
							borderRadius={"$1"}
						>
							Sign In
						</Button>
					</YStack>
				</YStack>
			</YStack>
		</>
	);
}
