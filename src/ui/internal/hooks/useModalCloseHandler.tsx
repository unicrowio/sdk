import React from "react";

export const useModalCloseHandler = (onModalClose: VoidFunction) => {
  const ref = React.useRef(null);

  const handleClickOutside = (event: KeyboardEvent) => {
    const escPressed = event.key === "Escape";

    // since our modals are wrapped in a div or form element and positioned fixed,
    // this is the easiest way to check if the click was outside the modal
    const clickedOutside =
      ref.current && ref.current.children[0] === event.target;

    if (escPressed || clickedOutside) {
      onModalClose();
    }
  };

  React.useEffect(() => {
    document.addEventListener("keyup", handleClickOutside);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("keyup", handleClickOutside);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return ref;
};
