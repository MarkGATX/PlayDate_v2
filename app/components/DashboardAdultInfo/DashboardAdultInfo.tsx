import { EditAdult } from "@/utils/actions/actions";
import { AdultsType } from "@/utils/types/userTypeDefinitions";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import Image from "next/image";
import { RefObject, createRef, useRef, useState } from "react";

export type editAdultFormErrorType = {
  firstNameError?: string;
  lastNameError?: string;
  phoneNumberError?: string;
  emailError?: string;
  profilePicError?: string;
};

export default function DashboardAdultInfo({ user }: { user: AdultsType }) {
  const [editAdultFormError, setEditAdultFormError] =
    useState<editAdultFormErrorType | null>(null);
  const [editAdultInfo, setEditAdultInfo] = useState<boolean>(false);
  const [adultFirstName, setAdultFirstName] = useState<string>(user.first_name);
  const [adultLastName, setAdultLastName] = useState<string>(user.last_name);
  const [adultPhoneNumber, setAdultPhoneNumber] = useState<string | undefined>(
    user.phone_number,
  );
  const [adultEmail, setAdultEmail] = useState<string>(user.email);
  const [adultShowPhoneNumber, setAdultShowPhoneNumber] = useState(
    user.show_phone_number,
  );
  const [adultShowEmail, setAdultShowEmail] = useState(user.show_email);
  const adultFirstNameInputRef = createRef<HTMLInputElement>();
  const adultLastNameInputRef = createRef<HTMLInputElement>();
  const adultEmailInputRef = createRef<HTMLInputElement>();
  const adultShowPhoneNumberInputRef = createRef<HTMLInputElement>();
  const adultShowEmailInputRef = createRef<HTMLInputElement>();
  const adultPhoneNumberInputRef = createRef<HTMLInputElement>();
  const adultFirstNameErrorRef = useRef<HTMLParagraphElement | null>(null);
  const adultLastNameErrorRef = useRef<HTMLParagraphElement | null>(null);
  const adultPhoneNumberErrorRef = useRef<HTMLParagraphElement | null>(null);
  const adultEmailErrorRef = useRef<HTMLParagraphElement | null>(null);

  const { contextSafe } = useGSAP();

  const cancelAdultEdits = async () => {
    setAdultFirstName(user.first_name);
    setAdultLastName(user.last_name);
    setAdultPhoneNumber(user.phone_number);
    setAdultEmail(user.email);
    setAdultShowPhoneNumber(user.show_phone_number);
    setAdultShowEmail(user.show_email);
    setEditAdultInfo((previousValue) => !previousValue);
  };

  const showAdultInfoErrorMessage = contextSafe(
    (messageRef: RefObject<HTMLElement>) => {
      gsap.to(messageRef.current, {
        height: "2em",
        autoAlpha: 1,
      });
    },
  );

  const closeAdultInfoErrorMessage = contextSafe(
    (messageRef: RefObject<HTMLElement>) => {
      gsap.to(messageRef.current, {
        height: 0,
        autoAlpha: 0,
      });
    },
  );

  const handleSaveAdultInfoEdits = async (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    event.preventDefault();
    let formError: boolean = false;
    const alphanumericRegex = /^[a-z0-9]+$/i;
    //error handling for fields
    // check first name field for empty or invalid
    if (
      adultFirstName === null ||
      adultFirstName === undefined ||
      !adultFirstName?.trim()
    ) {
      setEditAdultFormError((prevState) => ({
        ...prevState,
        firstNameError: `First name can't be blank`,
      }));
      formError = true;
      if (adultFirstNameErrorRef.current) {
        showAdultInfoErrorMessage(adultFirstNameErrorRef);
        adultFirstNameErrorRef.current.innerText = `First name can't be blank`;
      }
    } else if (adultFirstName && !alphanumericRegex.test(adultFirstName)) {
      setEditAdultFormError((prevState) => ({
        ...prevState,
        firstNameError: `First name can only be letters and numbers`,
      }));
      formError = true;
      if (adultFirstNameErrorRef.current) {
        adultFirstNameErrorRef.current.innerText = `First name can only be letters and numbers`;
        showAdultInfoErrorMessage(adultFirstNameErrorRef);
      }
    } else {
      formError = false;
      setEditAdultFormError((prevState) => {
        const newState = { ...prevState };
        delete newState.firstNameError;
        return newState;
      });
      // setEditAdultFormError({ firstNameError: undefined })
      if (adultFirstNameErrorRef.current) {
        adultFirstNameErrorRef.current.innerText = ``;
        closeAdultInfoErrorMessage(adultFirstNameErrorRef);
      }
    }
    // check last name for empty or invalid
    if (
      adultLastName === null ||
      adultLastName === undefined ||
      !adultLastName?.trim()
    ) {
      setEditAdultFormError((prevState) => ({
        ...prevState,
        lastNameError: `Last name can't be blank`,
      }));
      formError = true;
      if (adultLastNameErrorRef.current) {
        adultLastNameErrorRef.current.innerText = `Last name can't be blank`;
        showAdultInfoErrorMessage(adultLastNameErrorRef);
      }
    } else if (adultLastName && !alphanumericRegex.test(adultLastName)) {
      setEditAdultFormError((prevState) => ({
        ...prevState,
        lastNameError: `Last name can only be letters and numbers`,
      }));
      formError = true;
      if (adultLastNameErrorRef.current) {
        adultLastNameErrorRef.current.innerText = `Last name can only be letters and numbers`;
        showAdultInfoErrorMessage(adultLastNameErrorRef);
      }
    } else {
      formError = false;
      setEditAdultFormError((prevState) => {
        const newState = { ...prevState };
        delete newState.lastNameError;
        return newState;
      });
      if (adultLastNameErrorRef.current) {
        adultLastNameErrorRef.current.innerText = ``;
        closeAdultInfoErrorMessage(adultLastNameErrorRef);
      }
    }

    if (!formError && adultFirstName && adultLastName) {
      const editAdultData: Omit<
        AdultsType,
        | "firebase_uid"
        | "profilePicURL"
        | "Kids"
        | "Adult_Kid"
        | "emergency_contact"
      > = {
        first_name: adultFirstName.trim(),
        last_name: adultLastName.trim(),
        show_phone_number: adultShowPhoneNumber,
        show_email: adultShowEmail,
        phone_number: adultPhoneNumber,
        email: adultEmail,
        id: user.id,
      };

      try {
        const editAdultResult = await EditAdult(editAdultData);
        setEditAdultInfo(false);
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <section
      id="profileDetails"
      className="flex w-full flex-wrap justify-between gap-y-4 p-4"
    >
      {editAdultInfo ? (
        <>
          <div id="profileName" className="w-7/12">
            <input
              ref={adultFirstNameInputRef}
              id="adultFirstNameInput"
              name="first_name"
              type="text"
              placeholder="First name"
              onChange={(event) => setAdultFirstName(event.target.value)}
              required={true}
              value={adultFirstName}
              className={`w-full rounded border-2 p-1 text-sm ${editAdultFormError?.firstNameError ? "border-red-700" : "border-appBlue"}`}
            ></input>
            <p
              ref={adultFirstNameErrorRef}
              className="h-0 w-full text-xs text-red-700 opacity-0"
            ></p>

            <input
              ref={adultLastNameInputRef}
              id="adultLastNameInput"
              name="last"
              type="text"
              placeholder="Last name"
              onChange={(event) => setAdultLastName(event.target.value)}
              required={true}
              value={adultLastName}
              className={`mt-2 w-full rounded border-2 p-1 text-sm ${editAdultFormError?.lastNameError ? "border-red-700" : "border-appBlue"}`}
            ></input>
            <p
              ref={adultLastNameErrorRef}
              className="h-0 w-full text-xs text-red-700 opacity-0"
            ></p>

            <input
              ref={adultPhoneNumberInputRef}
              id="adultPhoneNumberInput"
              name="last"
              type="tel"
              placeholder="Phone number"
              onChange={(event) => setAdultPhoneNumber(event.target.value)}
              required={true}
              value={adultPhoneNumber}
              className={`mt-2 w-full rounded border-2 p-1 text-sm ${editAdultFormError?.phoneNumberError ? "border-red-700" : "border-appBlue"}`}
            ></input>
            <p
              ref={adultPhoneNumberErrorRef}
              className="h-0 w-full text-xs text-red-700 opacity-0"
            ></p>

            <input
              ref={adultEmailInputRef}
              id="adultEmailInput"
              name="last"
              type="email"
              placeholder="E-mail"
              onChange={(event) => setAdultEmail(event.target.value)}
              required={true}
              value={adultEmail}
              className={`mt-2 w-full rounded border-2 p-1 text-sm ${editAdultFormError?.emailError ? "border-red-700" : "border-appBlue"}`}
            ></input>
            <p
              ref={adultEmailErrorRef}
              className="h-0 w-full text-xs text-red-700 opacity-0"
            ></p>
          </div>
          <div id="profilePicContainer" className="flex flex-col items-center">
            <div
              id="profilePic"
              className="relative h-20 max-h-20 w-20 overflow-hidden rounded-full border-2 border-appBlue"
            >
              <Image
                src={
                  user?.profilePicURL
                    ? user.profilePicURL
                    : `/pics/generic_profile_pic.webp`
                }
                alt="profile picture"
                className=""
                fill={true}
                style={{ objectFit: "cover" }}
              ></Image>
            </div>
            <button className="w-90 mt-2 transform cursor-pointer rounded-lg border-2 border-appBlue bg-appGold px-1 py-1 text-xs duration-300 ease-in-out hover:bg-appBlue hover:text-appGold active:bg-appGold active:text-appBlue active:shadow-activeButton disabled:pointer-events-none disabled:opacity-50">
              Change pic
            </button>
          </div>
          <div id="profileOptions" className="w-full">
            <div>
              <input
                ref={adultShowPhoneNumberInputRef}
                id="adultShowPhoneNumber"
                type="checkbox"
                name="show_phone_number"
                className="mx-2 rounded border-2 border-appBlue p-1 text-sm"
                onChange={(event) =>
                  setAdultShowPhoneNumber(event.target.checked)
                }
              ></input>
              <label htmlFor="adultShowPhoneNumber" className="w-1/2 text-sm">
                Show Phone Number to Connections
              </label>
            </div>
            <div>
              <input
                ref={adultShowEmailInputRef}
                id="adultShowEmail"
                type="checkbox"
                name="show_phone_number"
                className="mx-2 rounded border-2 border-appBlue p-1 text-sm"
                onChange={(event) => setAdultShowEmail(event.target.checked)}
              ></input>
              <label htmlFor="adultShowEmail" className="w-1/2 text-sm">
                Show Email to Connections
              </label>
            </div>
          </div>
          <button
            className="mt-2 w-full transform cursor-pointer rounded-lg border-2 border-appBlue bg-appGold px-1 py-1 text-xs duration-300 ease-in-out hover:bg-appBlue hover:text-appGold active:bg-appGold active:text-appBlue active:shadow-activeButton disabled:pointer-events-none disabled:opacity-50"
            onClick={(event) => handleSaveAdultInfoEdits(event)}
          >
            Save Edits
          </button>
        </>
      ) : (
        <>
          <div id="profileName" className="w-7/12">
            <h2 className="text-lg font-bold">
              {user?.first_name} {user?.last_name}
            </h2>
            <p className="text-xs">
              {user?.phone_number ? user.phone_number : `No phone number`}
            </p>
            <p className="text-xs">{user?.email ? user.email : `No e-mail`}</p>
          </div>
          <div id="profilePicContainer" className="flex flex-col items-center">
            <div
              id="profilePic"
              className="relative h-20 max-h-20 w-20 overflow-hidden rounded-full border-2 border-appBlue"
            >
              <Image
                src={
                  user?.profilePicURL
                    ? user.profilePicURL
                    : `/pics/generic_profile_pic.webp`
                }
                alt="profile picture"
                className=""
                fill={true}
                style={{ objectFit: "cover" }}
              ></Image>
            </div>
          </div>
          <div id="profileOptions" className="w-full">
            <fieldset className="text-sm">
              <div className="block">
                {user.show_phone_number ? (
                  <p>
                    Show <span className="font-bold">phone number</span> to
                    connections
                  </p>
                ) : (
                  <p>
                    Do <span className="font-bold">NOT</span> show phone number
                    to connections
                  </p>
                )}
              </div>
              <div className="block">
                {user.show_email ? (
                  <p>
                    Show <span className="font-bold">email</span> to connections
                  </p>
                ) : (
                  <p>
                    Do <span className="font-bold">NOT</span> show email to
                    connections
                  </p>
                )}
              </div>
            </fieldset>
          </div>
        </>
      )}
      <button
        className="mt-4 w-full transform cursor-pointer rounded-lg border-2 border-appBlue bg-appGold px-2 py-2 text-sm duration-200 ease-in-out hover:bg-appBlue hover:text-appGold active:bg-appGold active:text-appBlue active:shadow-activeButton disabled:pointer-events-none disabled:opacity-50"
        onClick={cancelAdultEdits}
      >
        {editAdultInfo ? `Cancel` : `Edit Profile`}
      </button>
    </section>
  );
}
