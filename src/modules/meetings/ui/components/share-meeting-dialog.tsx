import { ResponsiveDialog } from "@/components/responsive-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { FaWhatsapp, FaFacebook } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import Link from "next/link";
import { cn } from "@/lib/utils";

{
	/* <FaWhatsapp /> */
}
{
	/* <FaFacebook /> */
}
{
	/* <MdEmail /> */
}

const socialShare = [
	{
		name: "Whatsapp",
		href: (link: string) =>
			`https://wa.me/?text=${encodeURIComponent(link)}`,
		icon: FaWhatsapp,
		iconClass: "text-[#25D366]", // Whatsapp green
	},
	{
		name: "Facebook",
		href: (link: string) =>
			`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
				link
			)}`,
		icon: FaFacebook,
		iconClass: "text-[#1877F3]", // Facebook blue
	},
	{
		name: "Email",
		href: (link: string) =>
			`mailto:?subject=Join%20this%20meeting&body=${encodeURIComponent(
				link
			)}`,
		icon: MdEmail,
		iconClass: "text-[#EA4335]", // Gmail red
	},
];

interface ShareMeetingDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	meetingId: string;
}

export const ShareMeetingDialog = ({
	open,
	onOpenChange,
	meetingId,
}: ShareMeetingDialogProps) => {
	const meetingShareLink = `${process.env.NEXT_PUBLIC_APP_URL}/call/${meetingId}`;

	const handleCopy = () => {
		navigator.clipboard
			.writeText(meetingShareLink)
			.then(() => {
				onOpenChange(false);
				toast("Link Copied to cliboard!");
			})
			.catch((err) => {
				toast("Failed to copy Link");
			});
	};

	return (
		<ResponsiveDialog
			title="Share Meeting"
			description="Share the meeting link"
			open={open}
			onOpenChange={onOpenChange}>
			<div className="w-full flex flex-col gap-y-4">
				<div className="w-full flex items-center space-x-2">
					<Input
						value={meetingShareLink}
						onChange={() => {}}
						className="flex-1"
					/>
					<Button className="px-4 py-2" onClick={handleCopy}>
						Copy
					</Button>
				</div>
				<div className="flex flex-col gap-6">
					<p className="font-semibold">Socials</p>
					<div className="flex gap-8">
						{socialShare.map((item) => (
							<Link
								className="flex flex-col items-center gap-2 "
								key={item.name}
								href={item.href(meetingShareLink)}
								target="_blank">
								<item.icon
									className={cn(item.iconClass, "size-5")}
								/>
								<p className="text-sm">{item.name}</p>
							</Link>
						))}
					</div>
				</div>
			</div>
		</ResponsiveDialog>
	);
};
