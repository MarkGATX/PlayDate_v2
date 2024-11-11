'use client'

import emailjs from '@emailjs/browser'
import { FormEvent, useRef, useState } from 'react';

export default function Contact() {
    const nameRef = useRef<HTMLInputElement | null>(null);
    const emailRef = useRef<HTMLInputElement | null>(null);
    const messageRef = useRef<HTMLTextAreaElement | null>(null);
    const formRef = useRef<HTMLFormElement | null>(null);
    const [message, setMessage] = useState<string>()

    const HandleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
        console.log(formRef.current)
        event.preventDefault();
        if (!nameRef.current || !emailRef.current || !messageRef.current || !formRef.current) {
            return
        } else {
            const name = nameRef.current.value;
            const email = emailRef.current.value;
            const message = messageRef.current.value;

            emailjs.sendForm('default_service', 'playdate_contact', formRef.current, process.env.NEXT_PUBLIC_EMAILJS_KEY)
                .then((result) => {
                    // clear out the input after a successful submit..
                    nameRef.current!.value = '';
                    emailRef.current!.value = '';
                    messageRef.current!.value = '';
                    setMessage(`Thanks for reaching out. I'll get back to you as soon as I can`);
                    // setShow(true);
                }, (error) => {
                    setMessage(`Sorry but something went wrong. ${error.message}`)
                    console.log(error)
                });
        };
    }

    return (
        <main>
            <div className='bg-blueGradient bg-appBlue text-appBG'>
                <h1 className='text-3xl font-bold p-8'>Contact Us</h1>
            </div>
            <div  className="p-8 flex flex-col justify-center items-center">
                <p className='mb-8'>Questions or concerns? Drop us a line and let us know. We'll get back to you as soon as we can.</p>
                <form id="contact-form" ref={formRef} onSubmit={HandleFormSubmit} className='w-full lg:w-1/2'>
                    <div>
                        <label htmlFor="name">Name:</label>
                        <input type="text" id="name" name="name" ref={nameRef} className='mt-2 w-full rounded border-2 p-1 text-sm mb-4' required />
                    </div>
                    <div>
                        <label htmlFor="email">Email:</label>
                        <input type="email" id="email" name="email" ref={emailRef} className='mt-2 w-full rounded border-2 p-1 text-sm mb-4' required />
                    </div>
                    <div>
                        <label htmlFor="message">Message:</label>
                        <textarea id="message" name="message" ref={messageRef} rows={4} cols={50} className='mt-2 w-full rounded border-2 p-1 text-sm mb-4' required></textarea>
                    </div>
                    <button type="submit" className="min-w-24 mt-2 transform cursor-pointer rounded-lg border-2 border-appBlue bg-appGold px-1 py-1 text-xs duration-300 ease-in-out hover:bg-blueGradient hover:bg-appBlue hover:text-appGold active:bg-appGold active:text-appBlue active:shadow-activeButton disabled:pointer-events-none disabled:opacity-50">Send</button>
                </form>
            </div>
        </main>
    )
}