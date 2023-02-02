import React from "react";

export const useModalCloseHandler = (onModalClose) => {
  const ref = React.useRef(null);

  const handleClickOutside = (event) => {
    const KEYCODE_ESC = 27;

    const escPressed =
      event.keyCode === KEYCODE_ESC ||
      event.which === KEYCODE_ESC ||
      event.charCode === KEYCODE_ESC ||
      event.key == "Escape";

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
