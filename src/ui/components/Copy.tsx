import React, { ReactNode } from "react";
import ClipboardJS from "clipboard";
import { CopyIcon } from "../../ui/components/icons/Copy";
import { toast } from "../../ui/components/notification/toast";

type CopyToClipboardProps = {
	content: string | ReactNode;
	copy: string;
};
export const CopyToClipboard = ({ content, copy }: CopyToClipboardProps) => {
	React.useEffect(() => {
		// eslint-disable-next-line no-new
		new ClipboardJS(".span-clipboard");
	}, []);
	return (
		<span
			style={{ cursor: "pointer", height: "auto", width: "auto" }}
			className="span-clipboard"
			onClick={() => toast("Copied to the clipboard", "success")}
			data-clipboard-text={copy}
		>
			{content} <CopyIcon />
		</span>
	);
};
