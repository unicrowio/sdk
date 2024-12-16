import React, { ReactNode } from "react";
import { toast } from "ui/internal/notification/toast";
import { CopyIcon } from "../assets/CopyIcon";

interface CopyToClipboardProps {
  content: string | ReactNode;
  copy: string;
}
export const CopyToClipboard = ({ content, copy }: CopyToClipboardProps) => {
  return (
    // rome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
    <span
      style={{ cursor: "pointer", height: "auto", width: "auto" }}
      className="span-clipboard"
      onClick={async () => {
        copyToClipboard(copy).then(() => {
          toast.success("Copied to the clipboard");
        });
      }}
      data-clipboard-text={copy}
    >
      <>
        {content} <CopyIcon />
      </>
    </span>
  );
};

async function copyToClipboard(text: string): Promise<void> {
  await navigator.clipboard.writeText(text);
}
