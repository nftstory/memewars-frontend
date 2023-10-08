import { Button, Paragraph, YStack } from "@memewar/design-system";
import { ChevronLeft } from "@tamagui/lucide-icons";
import React from "react";
import { useParams } from "@memewar/app/hooks/use-params";
import { useLink } from "@memewar/app/hooks/use-link";

export function UserDetailScreen() {
	const { id } = useParams<{ id: string }>();
	const link = useLink({ href: "/" });

	return (
		<YStack f={1} jc="center" ai="center" space>
			<Paragraph ta="center" fow="700">{`User ID: ${id}`}</Paragraph>
			<Button {...link} icon={ChevronLeft}>
				Go Home
			</Button>
		</YStack>
	);
}
