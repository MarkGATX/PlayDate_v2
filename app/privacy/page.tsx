import Link from "next/link";

export default function privacy() {
    return (
        <main>
            <div className='bg-blueGradient bg-appBlue text-appBG'>
                <h1 className='text-3xl font-bold p-8'>Playdate - Privacy Policy</h1>
            </div>
            <div className="p-8">

                <p>Last updated: 11/11/2024</p>

                <h2 className="text-lg font-bold">1. Introduction</h2>
                <p>{`Mark Gardner ("we", "our", or "us") operates the Playdate application (the "Service"). This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our Service.`}</p>

                <h2 className="text-lg font-bold">2. Information Collection and Use</h2>
                <p>We collect several different types of information for various purposes to provide and improve our Service to you:</p>

                <h3 className="font-bold">2.1 Personal Data</h3>
                <p>While using our Service, we may ask you to provide us with certain personally identifiable information that can be used to contact or identify you ("Personal Data"). Personally identifiable information may include, but is not limited to:</p>
                <ul className='mb-4 list-disc'>
                    <li className='ml-8'>Email address</li>
                    <li className='ml-8'>First name and last name</li>
                    <li className='ml-8'>Phone number</li>
                    <li className='ml-8'>Address, State, Province, ZIP/Postal code, City</li>
                    <li className='ml-8'>Cookies and Usage Data</li>
                </ul>

                <h3 className="font-bold">2.2 Usage Data</h3>
                <p>We may also collect information that your browser sends whenever you visit our Service or when you access the Service by or through a mobile device ("Usage Data").</p>

                <h2 className="text-lg font-bold">3. Use of Data</h2>
                <p>Playdate uses the collected data for various purposes:</p>
                <ul className='mb-4 list-disc'>
                    <li className='ml-8'>To provide and maintain the Service</li>
                    <li className='ml-8'>To notify you about changes to our Service</li>
                    <li className='ml-8'>To allow you to participate in interactive features of our Service when you choose to do so</li>
                    <li className='ml-8'>To provide customer care and support</li>
                    <li className='ml-8'>To provide analysis or valuable information so that we can improve the Service</li>
                    <li>To monitor the usage of the Service</li>
                    <li>To detect, prevent and address technical issues</li>
                </ul>

                <h2 className="text-lg font-bold">4. Transfer of Data</h2>
                <p>Your information, including Personal Data, may be transferred to — and maintained on — computers located outside of your state, province, country or other governmental jurisdiction where the data protection laws may differ from those from your jurisdiction.</p>

                <h2 className="text-lg font-bold">5. Disclosure of Data</h2>
                <p>We may disclose your Personal Data in the good faith belief that such action is necessary to:</p>
                <ul className='mb-4 list-disc'>
                    <li className='ml-8'>To comply with a legal obligation</li>
                    <li className='ml-8'>To protect and defend the rights or property of [Your Company Name]</li>
                    <li className='ml-8'>To prevent or investigate possible wrongdoing in connection with the Service</li>
                    <li className='ml-8'>To protect the personal safety of users of the Service or the public</li>
                    <li>To protect against legal liability</li>
                </ul>

                <h2 className="text-lg font-bold">6. Security of Data</h2>
                <p>The security of your data is important to us, but remember that no method of transmission over the Internet, or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your Personal Data, we cannot guarantee its absolute security.</p>

                <h2 className="text-lg font-bold">7. Your Data Protection Rights</h2>
                <p>We aim to take reasonable steps to allow you to correct, amend, delete, or limit the use of your Personal Data. If you wish to be informed what Personal Data we hold about you and if you want it to be removed from our systems, please contact us.</p>

                <h2 className="text-lg font-bold">8. Changes to This Privacy Policy</h2>
                <p>We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. We will let you know via email and/or a prominent notice on our Service, prior to the change becoming effective and update the "effective date" at the top of this Privacy Policy.</p>

                <h2 className="text-lg font-bold">9. Contact Us</h2>
                <p>If you have any questions about this Privacy Policy, please contact us:</p>
                <ul className='mb-4 list-disc'>
                    <li className='ml-8'>By visiting this page on our website: <Link href='./contact' className='underline hover:scale-110'>Contact Page</Link></li>
                </ul>
            </div>
        </main>
    )
}