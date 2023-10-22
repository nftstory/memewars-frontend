import { Button, Paragraph, YStack } from "@memewar/design-system";
import { ChevronLeft } from "@tamagui/lucide-icons";
import React from "react";
import { useParams } from "@memewar/app/hooks/use-params";
import { useLink } from "@memewar/app/hooks/use-link";

export function ProfileDetailScreen() {
	const { id } = useParams<{ id: string }>();
	const link = useLink({ href: "/" });

	return (
		<YStack flex={1} justifyContent="center" alignItems="center" space>
			<Paragraph textAlign="center">{`User ID: ${id}`}</Paragraph>
			<Button {...link} icon={ChevronLeft}>
				Go Home
			</Button>
		</YStack>
	);
}
