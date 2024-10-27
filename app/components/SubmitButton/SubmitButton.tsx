"use client";

import { useFormStatus } from "react-dom";

export default function SubmitButton({
  text,
  uiHandler,
}: {
  text: string;
  uiHandler?: () => void;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      className="w-90 mr-2 mt-2 transform cursor-pointer rounded-lg border-2 border-appBlue bg-appGold px-1 py-1 text-xs duration-300 ease-in-out hover:bg-blueGradient hover:bg-appBlue hover:text-appGold active:bg-appGold active:text-appBlue active:shadow-activeButton disabled:pointer-events-none disabled:opacity-50"
      type="submit"
      disabled={pending}
    >
      {text}
    </button>
  );
}
