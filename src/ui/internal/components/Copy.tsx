import React, { ReactNode } from "react";
import { toast } from "ui/internal/notification/toast";
import { CopyIcon } from "../../../ui/internal/assets/Copy";

type CopyToClipboardProps = {
  content: string | ReactNode;
  copy: string;
};
export const CopyToClipboard = ({ content, copy }: CopyToClipboardProps) => {
  return (
    // rome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
    <span
      style={{ cursor: "pointer", height: "auto", width: "auto" }}
      className="span-clipboard"
      onClick={async () => {
        copyToClipboard(copy).then(() => {
          toast("Copied to the clipboard", "success");
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

const copyToClipboard = async (text) => {
  if ("clipboard" in navigator) {
    return await navigator.clipboard.writeText(text);
  } else {
    return document.execCommand("copy", true, text);
  }
};
