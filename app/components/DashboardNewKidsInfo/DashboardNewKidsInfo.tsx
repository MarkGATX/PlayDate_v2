import { AddKid } from "@/utils/actions/actions";
import { AdultsType, KidsType } from "@/utils/types/userTypeDefinitions";
import { useGSAP } from "@gsap/react";
import { RefObject, Suspense, createRef, useRef, useState } from "react";
import KidSearchResultsSuspense from "../KidSearchResults/KidSearchResultsSuspense";
import KidSearchResults from "../KidSearchResults/KidSearchResults";
import Image from "next/image";
import { useFormStatus } from "react-dom";
import gsap from "gsap";

export type kidsArray = {
  kidsRawData?: KidsType[];
};

export type newKidFormErrorType = {
  firstNameError?: string;
  lastNameError?: string;
  birthdayError?: string;
  profilePicError?: string;
};

export default function DashboardNewKidsInfo({
  currentUser,
}: {
  currentUser: AdultsType;
}) {
  const { pending } = useFormStatus();
  const [kidSearchTerm, setKidSearchTerm] = useState<string>("");
  const [newKidSectionOpen, setNewKidSectionOpen] = useState<boolean>(false);
  const [newKidFormError, setNewKidFormError] =
    useState<newKidFormErrorType | null>(null);
  const [newKidFirstName, setNewKidFirstName] = useState<string>();
  const [newKidLastName, setNewKidLastName] = useState<string>();
  const [newKidBirthday, setNewKidBirthday] = useState<string>();
  const [newKidFirstNameOnly, setNewKidFirstNameOnly] =
    useState<boolean>(false);
  const [newKidProfilePic, setNewKidProfilePic] = useState<string>();
  const newKidFormRef = useRef<HTMLDivElement | null>(null);
  const newKidSectionRef = useRef<HTMLElement | null>(null);
  const kidsFirstNameInputRef = createRef<HTMLInputElement>();
  const kidsLastNameInputRef = createRef<HTMLInputElement>();
  const kidsBirthdayInputRef = createRef<HTMLInputElement>();
  const kidsFirstNameOnlyInputRef = createRef<HTMLInputElement>();
  const kidsProfilePicInputRef = createRef<HTMLInputElement>();
  const saveNewKidButtonRef = useRef<HTMLButtonElement>(null);
  const firstNameErrorRef = useRef<HTMLParagraphElement | null>(null);
  const lastNameErrorRef = useRef<HTMLParagraphElement | null>(null);
  const birthdayErrorRef = useRef<HTMLParagraphElement | null>(null);

  //set context for gsap cleanups
  const { contextSafe } = useGSAP();

  const showKidsErrorMessage = contextSafe(
    (messageRef: RefObject<HTMLElement>) => {
      gsap.to(messageRef.current, {
        height: "2em",
        autoAlpha: 1,
      });
    },
  );

  const closeKidsErrorMessage = contextSafe(
    (messageRef: RefObject<HTMLElement>) => {
      gsap.to(messageRef.current, {
        height: 0,
        autoAlpha: 0,
      });
    },
  );

  const toggleNewKidForm = contextSafe(() => {
    if (newKidSectionRef.current) {
      const newKidSection = newKidSectionRef.current;
      if (newKidSectionOpen) {
        gsap.to(newKidSectionRef.current, {
          autoAlpha: 0,
          height: "0",
          duration: 0.5,
          ease: "power1.inOut",
        });
        if (kidsFirstNameInputRef.current) {
          kidsFirstNameInputRef.current.value = "";
        }
        if (kidsLastNameInputRef.current) {
          kidsLastNameInputRef.current.value = "";
        }
        if (kidsBirthdayInputRef.current) {
          kidsBirthdayInputRef.current.value = "";
        }
        setNewKidFirstName("");
        setNewKidLastName("");
        setNewKidBirthday("");
        setNewKidProfilePic("");
        setKidSearchTerm("");
      } else {
        gsap.to(newKidSectionRef.current, {
          autoAlpha: 1,
          height: "auto",
          duration: 0.3,
          ease: "power1.inOut",
          onComplete: () => {
            // Scroll to top after animation completes
            newKidSection.scrollIntoView({ behavior: "smooth" });
          },
        });
      }
      setNewKidSectionOpen((previousValue) => !previousValue);
    }
  });

  const handleAddNewKid = async (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    event.preventDefault();
    let formError: boolean = false;
    const alphanumericRegex = /^[a-z0-9]+$/i;
    //error handling for fields
    // check first name field for empty or invalid
    if (
      newKidFirstName === null ||
      newKidFirstName === undefined ||
      !newKidFirstName?.trim()
    ) {
      setNewKidFormError((prevState) => ({
        ...prevState,
        firstNameError: `First name can't be blank`,
      }));
      formError = true;
      if (firstNameErrorRef.current) {
        showKidsErrorMessage(firstNameErrorRef);
        firstNameErrorRef.current.innerText = `First name can't be blank`;
      }
    } else if (newKidFirstName && !alphanumericRegex.test(newKidFirstName)) {
      setNewKidFormError((prevState) => ({
        ...prevState,
        firstNameError: `First name can only be letters and numbers`,
      }));
      formError = true;
      if (firstNameErrorRef.current) {
        firstNameErrorRef.current.innerText = `First name can only be letters and numbers`;

        showKidsErrorMessage(firstNameErrorRef);
      }
    } else {
      formError = false;
      setNewKidFormError((prevState) => {
        const newState = { ...prevState };
        delete newState.firstNameError;
        return newState;
      });
      if (firstNameErrorRef.current) {
        firstNameErrorRef.current.innerText = ``;
        closeKidsErrorMessage(firstNameErrorRef);
      }
    }
    // check last name for empty or invalid
    if (
      newKidLastName === null ||
      newKidLastName === undefined ||
      !newKidLastName?.trim()
    ) {
      setNewKidFormError((prevState) => ({
        ...prevState,
        lastNameError: `Last name can't be blank`,
      }));
      formError = true;
      if (lastNameErrorRef.current) {
        lastNameErrorRef.current.innerText = `Last name can't be blank`;
        showKidsErrorMessage(lastNameErrorRef);
      }
    } else if (newKidLastName && !alphanumericRegex.test(newKidLastName)) {
      setNewKidFormError((prevState) => ({
        ...prevState,
        lastNameError: `Last name can only be letters and numbers`,
      }));
      formError = true;
      if (lastNameErrorRef.current) {
        lastNameErrorRef.current.innerText = `Last name can only be letters and numbers`;
        showKidsErrorMessage(lastNameErrorRef);
      }
    } else {
      formError = false;
      setNewKidFormError((prevState) => {
        const newState = { ...prevState };
        delete newState.lastNameError;
        return newState;
      });
      if (lastNameErrorRef.current) {
        lastNameErrorRef.current.innerText = ``;
        closeKidsErrorMessage(lastNameErrorRef);
      }
    }
    // check birthday for empty or too old
    if (!newKidBirthday) {
      setNewKidFormError((prevState) => ({
        ...prevState,
        birthdayError: `Birthday is required`,
      }));
      formError = true;
      if (birthdayErrorRef.current) {
        birthdayErrorRef.current.innerText = `Birthday is required`;
        showKidsErrorMessage(birthdayErrorRef);
      }
    } else if (newKidBirthday) {
      const parsedKidEditedBirthday = new Date(newKidBirthday);
      const today = new Date();
      const editedKidAgeMS =
        today.getTime() - parsedKidEditedBirthday.getTime();
      const editedKidAgeYears = editedKidAgeMS / (1000 * 60 * 60 * 24 * 365.25);
      if (editedKidAgeYears >= 19) {
        setNewKidFormError((prevState) => ({
          ...prevState,
          birthdayError: "Kids must be 18 or younger",
        }));
        formError = true;
        if (birthdayErrorRef.current) {
          // using separate declaration because gsap oddly animating the number 18 from 0 to 18 instead of displaying just the number
          birthdayErrorRef.current.innerText = "Kids must be 18 or younger";
          showKidsErrorMessage(birthdayErrorRef);
        }
      } else {
        setNewKidFormError((prevState) => {
          const newState = { ...prevState };
          delete newState.birthdayError;
          return newState;
        });
        formError = false;
        if (birthdayErrorRef.current) {
          birthdayErrorRef.current.innerText = ``;
          // gsap.to(birthdayErrorRef.current, {
          //     height: 0,
          //     autoAlpha: 0
          // })
          closeKidsErrorMessage(birthdayErrorRef);
        }
      }
    }
    if (!newKidProfilePic) {
      setNewKidProfilePic("/pics/generic_profile_pic.webp");
    }
    if (!currentUser) {
      return;
    }
    // build data and create new kid after double checking that fields are valid
    if (
      !formError &&
      currentUser &&
      newKidFirstName &&
      newKidLastName &&
      newKidBirthday &&
      newKidProfilePic
    ) {
      //run new kid action
      const rawAddKidData = {
        first_name: newKidFirstName.trim(),
        last_name: newKidLastName.trim(),
        birthday: newKidBirthday,
        first_name_only: newKidFirstNameOnly,
        primary_caregiver: currentUser.id,
        profile_pic: newKidProfilePic,
      };
      try {
        const addKidResult = await AddKid(rawAddKidData);
        toggleNewKidForm();
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <>
      <section
        id="addNewKidSection"
        ref={newKidSectionRef}
        className="h-0 overflow-hidden rounded-xl border-2 border-appBlue p-2 opacity-0"
      >
        <div>
          <h3 className="font-bold">Search for kid...</h3>
          <input
            type="text"
            value={kidSearchTerm}
            placeholder={`Kid's name`}
            className="rounded-lg border-2 bg-inputBG px-2"
            onChange={(event) => {
              setKidSearchTerm(event.target.value);
            }}
          ></input>
          <Suspense fallback={<KidSearchResultsSuspense />}>
            <KidSearchResults
              searchType="addKidToParent"
              currentUser={currentUser}
              searchTerm={kidSearchTerm}
            />
          </Suspense>
        </div>
        <h3 className="w-full text-center">OR</h3>
        <div>
          <h3 className="font-bold">Add new kid...</h3>
          <div id="newKidForm" ref={newKidFormRef}>
            <form id="addNewKidForm" className="flex flex-wrap justify-between">
              <input
                type="hidden"
                name="primary_caregiver"
                value={currentUser.id}
              />
              <div className="flex w-full flex-wrap items-center justify-between pb-1 pt-2">
                <label htmlFor="kidsFirstNameInput" className="w-1/3 text-sm">
                  First Name
                </label>
                <input
                  ref={kidsFirstNameInputRef}
                  id="kidsFirstNameInput"
                  value={newKidFirstName}
                  name="first_name"
                  type="text"
                  placeholder="First name"
                  onChange={(event) => setNewKidFirstName(event.target.value)}
                  required={true}
                  className={`w-2/3 rounded border-2 p-1 text-sm ${newKidFormError?.firstNameError ? "border-red-700" : "border-appBlue"}`}
                ></input>
                <p
                  ref={firstNameErrorRef}
                  className="h-0 w-full text-xs text-red-700 opacity-0"
                ></p>
              </div>
              <div className="flex w-full flex-wrap items-center justify-between pb-1 pt-2">
                <label htmlFor="kidsLastNameInput" className="w-1/3 text-sm">
                  Last Name
                </label>
                <input
                  ref={kidsLastNameInputRef}
                  id="kidsLastNameInput"
                  value={newKidLastName}
                  name="last_name"
                  type="text"
                  placeholder="Last name"
                  required={true}
                  onChange={(event) => setNewKidLastName(event.target.value)}
                  className="w-2/3 rounded border-2 border-appBlue p-1 text-sm"
                ></input>
                <p
                  ref={lastNameErrorRef}
                  className="h-0 w-full text-xs text-red-700 opacity-0"
                ></p>
              </div>
              <div className="flex w-full flex-wrap items-center justify-between pb-1 pt-2">
                <label htmlFor="kidsBirthdayInput" className="w-1/3 text-sm">
                  Birthday
                </label>
                <input
                  ref={kidsBirthdayInputRef}
                  id="kidsBirthdayInput"
                  value={newKidBirthday}
                  name="birthday"
                  type="date"
                  className="w-2/3 rounded border-2 border-appBlue p-1 text-sm"
                  onChange={(event) => setNewKidBirthday(event.target.value)}
                  required
                ></input>
                <p
                  ref={birthdayErrorRef}
                  className="h-0 w-full text-xs text-red-700 opacity-0"
                ></p>
              </div>
              <div className="py-1">
                <label
                  htmlFor="kidsShowLastNameInput"
                  className="w-1/2 text-sm"
                >
                  Show First Name Only
                </label>
                <input
                  ref={kidsFirstNameOnlyInputRef}
                  id="kidsShowLastNameInput"
                  type="checkbox"
                  name="first_name_only"
                  className="ml-2 rounded border-2 border-appBlue p-1 text-sm"
                  onChange={(event) =>
                    setNewKidFirstNameOnly(event.target.checked)
                  }
                ></input>
              </div>
              <div
                id="defaultProfilePics"
                className="flex w-full flex-wrap justify-center gap-2 py-1 transition-all"
              >
                <h4 className="mb-2 w-full text-xs font-bold">
                  Choose default avatar
                </h4>
                <input
                  type="radio"
                  name="profile_pic"
                  id="dinoProfilePic"
                  value="/pics/dino_profile_pic.webp"
                  className="hidden"
                  checked={newKidProfilePic === "/pics/dino_profile_pic.webp"}
                  onChange={(event) => setNewKidProfilePic(event.target.value)}
                />
                <label
                  htmlFor="dinoProfilePic"
                  className="relative flex h-12 w-12 cursor-pointer flex-col items-center justify-start transition-all hover:scale-110"
                >
                  <Image
                    src="/pics/dino_profile_pic.webp"
                    alt="Default Dino Profile Pic"
                    className="relative h-16 max-h-20 w-16 overflow-hidden rounded-full border-2 border-appGold bg-appBG"
                    fill={true}
                    style={{ objectFit: "cover" }}
                  ></Image>
                </label>
                <input
                  type="radio"
                  name="profile_pic"
                  id="dogProfilePic"
                  value="/pics/dog_profile_pic.webp"
                  className="hidden"
                  checked={newKidProfilePic === "/pics/dog_profile_pic.webp"}
                  onChange={(event) => setNewKidProfilePic(event.target.value)}
                />
                <label
                  htmlFor="dogProfilePic"
                  className="relative flex h-12 w-12 cursor-pointer flex-col items-center justify-start transition-all hover:scale-110"
                >
                  <Image
                    src="/pics/dog_profile_pic.webp"
                    alt="Default Dog Profile Pic"
                    className="relative h-16 max-h-20 w-16 overflow-hidden rounded-full border-2 border-appGold bg-appBG"
                    fill={true}
                    style={{ objectFit: "cover" }}
                  ></Image>
                </label>
                <input
                  type="radio"
                  name="profile_pic"
                  id="genericProfilePic"
                  value="/pics/generic_profile_pic.webp"
                  className="hidden"
                  checked={
                    newKidProfilePic === "/pics/generic_profile_pic.webp"
                  }
                  onChange={(event) => setNewKidProfilePic(event.target.value)}
                />
                <label
                  htmlFor="genericProfilePic"
                  className="relative flex h-12 w-12 cursor-pointer flex-col items-center justify-start transition-all hover:scale-110"
                >
                  <Image
                    src="/pics/generic_profile_pic.webp"
                    alt="Default generic Profile Pic"
                    className="relative h-16 max-h-20 w-16 overflow-hidden rounded-full border-2 border-appGold bg-appBG"
                    fill={true}
                    style={{ objectFit: "cover" }}
                  ></Image>
                </label>
                <input
                  type="radio"
                  name="profile_pic"
                  id="knightProfilePic"
                  value="/pics/knight_profile_pic.webp"
                  className="hidden"
                  checked={newKidProfilePic === "/pics/knight_profile_pic.webp"}
                  onChange={(event) => setNewKidProfilePic(event.target.value)}
                />
                <label
                  htmlFor="knightProfilePic"
                  className="relative flex h-12 w-12 cursor-pointer flex-col items-center justify-start transition-all hover:scale-110"
                >
                  <Image
                    src="/pics/knight_profile_pic.webp"
                    alt="Default knight Profile Pic"
                    className="relative h-16 max-h-20 w-16 overflow-hidden rounded-full border-2 border-appGold bg-appBG"
                    fill={true}
                    style={{ objectFit: "cover" }}
                  ></Image>
                </label>
                <input
                  type="radio"
                  name="profile_pic"
                  id="princessProfilePic"
                  value="/pics/princess_profile_pic.webp"
                  className="hidden"
                  checked={
                    newKidProfilePic === "/pics/princess_profile_pic.webp"
                  }
                  onChange={(event) => setNewKidProfilePic(event.target.value)}
                />
                <label
                  htmlFor="princessProfilePic"
                  className="relative flex h-12 w-12 cursor-pointer flex-col items-center justify-start transition-all hover:scale-110"
                >
                  <Image
                    src="/pics/princess_profile_pic.webp"
                    alt="Default princess Profile Pic"
                    className="relative h-16 max-h-20 w-16 overflow-hidden rounded-full border-2 border-appGold bg-appBG"
                    fill={true}
                    style={{ objectFit: "cover" }}
                  ></Image>
                </label>
                <input
                  type="radio"
                  name="profile_pic"
                  id="robot1ProfilePic"
                  value="/pics/robot1_profile_pic.webp"
                  className="hidden"
                  checked={newKidProfilePic === "/pics/robot1_profile_pic.webp"}
                  onChange={(event) => setNewKidProfilePic(event.target.value)}
                />
                <label
                  htmlFor="robot1ProfilePic"
                  className="relative flex h-12 w-12 cursor-pointer flex-col items-center justify-start transition-all hover:scale-110"
                >
                  <Image
                    src="/pics/robot1_profile_pic.webp"
                    alt="Default robot1 Profile Pic"
                    className="relative h-16 max-h-20 w-16 overflow-hidden rounded-full border-2 border-appGold bg-appBG"
                    fill={true}
                    style={{ objectFit: "cover" }}
                  ></Image>
                </label>
                <input
                  type="radio"
                  name="profile_pic"
                  id="robot2ProfilePic"
                  value="/pics/robot2_profile_pic.webp"
                  className="hidden"
                  checked={newKidProfilePic === "/pics/robot2_profile_pic.webp"}
                  onChange={(event) => setNewKidProfilePic(event.target.value)}
                />
                <label
                  htmlFor="robot2ProfilePic"
                  className="relative flex h-12 w-12 cursor-pointer flex-col items-center justify-start transition-all hover:scale-110"
                >
                  <Image
                    src="/pics/robot2_profile_pic.webp"
                    alt="Default robot2 Profile Pic"
                    className="relative h-16 max-h-20 w-16 overflow-hidden rounded-full border-2 border-appGold bg-appBG"
                    fill={true}
                    style={{ objectFit: "cover" }}
                  ></Image>
                </label>
                <input
                  type="radio"
                  name="profile_pic"
                  id="robot3ProfilePic"
                  value="/pics/robot3_profile_pic.webp"
                  className="hidden"
                  checked={newKidProfilePic === "/pics/robot3_profile_pic.webp"}
                  onChange={(event) => setNewKidProfilePic(event.target.value)}
                />
                <label
                  htmlFor="robot3ProfilePic"
                  className="relative flex h-12 w-12 cursor-pointer flex-col items-center justify-start transition-all hover:scale-110"
                >
                  <Image
                    src="/pics/robot3_profile_pic.webp"
                    alt="Default robot3 Profile Pic"
                    className="relative h-16 max-h-20 w-16 overflow-hidden rounded-full border-2 border-appGold bg-appBG"
                    fill={true}
                    style={{ objectFit: "cover" }}
                  ></Image>
                </label>
                <input
                  type="radio"
                  name="profile_pic"
                  id="superheroProfilePic"
                  value="/pics/superhero_profile_pic.webp"
                  className="hidden"
                  checked={
                    newKidProfilePic === "/pics/superhero_profile_pic.webp"
                  }
                  onChange={(event) => setNewKidProfilePic(event.target.value)}
                />
                <label
                  htmlFor="superheroProfilePic"
                  className="relative flex h-12 w-12 cursor-pointer flex-col items-center justify-start transition-all hover:scale-110"
                >
                  <Image
                    src="/pics/superhero_profile_pic.webp"
                    alt="Default superhero Profile Pic"
                    className="relative h-16 max-h-20 w-16 overflow-hidden rounded-full border-2 border-appGold bg-appBG"
                    fill={true}
                    style={{ objectFit: "cover" }}
                  ></Image>
                </label>
                <input
                  type="radio"
                  name="profile_pic"
                  id="unicornProfilePic"
                  value="/pics/unicorn_profile_pic.webp"
                  className="hidden"
                  checked={
                    newKidProfilePic === "/pics/unicorn_profile_pic.webp"
                  }
                  onChange={(event) => setNewKidProfilePic(event.target.value)}
                />
                <label
                  htmlFor="unicornProfilePic"
                  className="relative flex h-12 w-12 cursor-pointer flex-col items-center justify-start transition-all hover:scale-110"
                >
                  <Image
                    src="/pics/unicorn_profile_pic.webp"
                    alt="Default unicorn Profile Pic"
                    className="relative h-16 max-h-20 w-16 overflow-hidden rounded-full border-2 border-appGold bg-appBG"
                    fill={true}
                    style={{ objectFit: "cover" }}
                  ></Image>
                </label>
                <input
                  type="radio"
                  name="profile_pic"
                  id="fairyProfilePic"
                  value="/pics/fairy_profile_pic.webp"
                  className="hidden"
                  checked={newKidProfilePic === "/pics/fairy_profile_pic.webp"}
                  onChange={(event) => setNewKidProfilePic(event.target.value)}
                />
                <label
                  htmlFor="fairyProfilePic"
                  className="relative flex h-12 w-12 cursor-pointer flex-col items-center justify-start transition-all hover:scale-110"
                >
                  <Image
                    src="/pics/fairy_profile_pic.webp"
                    alt="Default fairy Profile Pic"
                    className="relative h-16 max-h-20 w-16 overflow-hidden rounded-full border-2 border-appGold bg-appBG"
                    fill={true}
                    style={{ objectFit: "cover" }}
                  ></Image>
                </label>
                <input
                  type="radio"
                  name="profile_pic"
                  id="ninjaProfilePic"
                  value="/pics/ninja_profile_pic.webp"
                  className="hidden"
                  checked={newKidProfilePic === "/pics/ninja_profile_pic.webp"}
                  onChange={(event) => setNewKidProfilePic(event.target.value)}
                />
                <label
                  htmlFor="ninjaProfilePic"
                  className="relative flex h-12 w-12 cursor-pointer flex-col items-center justify-start transition-all hover:scale-110"
                >
                  <Image
                    src="/pics/ninja_profile_pic.webp"
                    alt="Default ninja Profile Pic"
                    className="relative h-16 max-h-20 w-16 overflow-hidden rounded-full border-2 border-appGold bg-appBG"
                    fill={true}
                    style={{ objectFit: "cover" }}
                  ></Image>
                </label>
              </div>
              {/* <button type='submit' disabled={pending}>Save New Kid</button> */}
              <button
                ref={saveNewKidButtonRef}
                className="w-90 ml-auto mr-2 mt-2 transform cursor-pointer rounded-lg border-2 border-appBlue bg-appGold px-1 py-1 text-xs duration-300 ease-in-out hover:bg-appBlue hover:text-appGold active:bg-appGold active:text-appBlue active:shadow-activeButton disabled:pointer-events-none disabled:opacity-50"
                disabled={pending}
                onClick={(event) => handleAddNewKid(event)}
              >
                Save New Kid
              </button>
              {/* <SubmitButton text='Save New Kid' uiHandler={toggleNewKidForm} /> */}
            </form>
          </div>
        </div>
      </section>
      <button
        className="w-90 mb-4 mt-4 transform cursor-pointer rounded-lg border-2 border-appBlue bg-appGold px-2 py-2 text-sm duration-300 ease-in-out hover:bg-appBlue hover:text-appGold active:bg-appGold active:text-appBlue active:shadow-activeButton disabled:pointer-events-none disabled:opacity-50"
        onClick={toggleNewKidForm}
      >
        {newKidSectionOpen ? `Cancel` : `Add New Kid`}
      </button>
    </>
  );
}
