import {
	CommandDialog,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import { Dispatch, SetStateAction } from "react";

interface Props {
	open: boolean;
	setOpen: Dispatch<SetStateAction<boolean>>;
}
export const DashboardCommand = ({ open, setOpen }: Props) => {
	return (
		<CommandDialog open={open} onOpenChange={setOpen}>
			<CommandInput placeholder="Search for a meeting or an agent" />
			<CommandList>
				<CommandItem>test</CommandItem>
			</CommandList>
		</CommandDialog>
	);
};
