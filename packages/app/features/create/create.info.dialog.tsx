import { Button, Dialog, Unspaced, tokens } from "@memewar/design-system";
import { BulletList } from "@memewar/design-system/src/list/bullet-list";
import { X } from "@tamagui/lucide-icons";
import React from "react";

export const CreateInfoDialog = ({
	open,
	toggleOpen,
}: { open: boolean; toggleOpen: () => void }) => {
	return (
		<Dialog modal open={open} onOpenChange={toggleOpen}>
			{/* <Adapt when="sm" platform="touch">
				<Sheet animation="medium" zIndex={200000} modal dismissOnSnapToBottom>
					<Sheet.Frame padding="$4" gap="$4">
						<Adapt.Contents />
					</Sheet.Frame>
					<Sheet.Overlay
						animation="lazy"
						enterStyle={{ opacity: 0 }}
						exitStyle={{ opacity: 0 }}
					/>
				</Sheet>
			</Adapt> */}

			<Dialog.Portal>
				<Dialog.Overlay
					key="overlay"
					animation="quick"
					opacity={0.5}
					enterStyle={{ opacity: 0 }}
					exitStyle={{ opacity: 0 }}
				/>

				<Dialog.Content
					// bordered
					borderRadius={"$0"}
					elevate
					key="content"
					animateOnly={["transform", "opacity"]}
					animation={["quick", { opacity: { overshootClamping: true } }]}
					enterStyle={{ x: 0, y: -20, opacity: 0, scale: 0.9 }}
					exitStyle={{ x: 0, y: 10, opacity: 0, scale: 0.95 }}
					gap="$2.5"
					padding={"$3"}
					maxWidth={"80%"}
					backgroundColor={tokens.color.background}
				>
					<Dialog.Title fontSize={"$7"}>Creating Memes</Dialog.Title>
					<Dialog.Description>
						<BulletList
							data={[
								"Collectors have 12 hours to collect.",
								"Each edition costs 0.001 eth ($1.60).",
								"You are the sole owner of your NFT contract.",
								"A 0.00005 ($0.08) fee applies to each edition sold.",
							]}
						/>
					</Dialog.Description>

					<Unspaced>
						<Dialog.Close asChild>
							<Button
								position="absolute"
								top="$1.5"
								right="$1.5"
								size="$2"
								circular
								backgroundColor={tokens.color.background}
								icon={X}
							/>
						</Dialog.Close>
					</Unspaced>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog>
	);
};
