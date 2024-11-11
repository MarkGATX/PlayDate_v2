import Link from "next/link";

export default function TOS() {
    return (
        <main>
            <div className='bg-blueGradient bg-appBlue text-appBG'>
                <h1 className='text-3xl font-bold p-8'>Playdate - Terms of Service</h1>
            </div>
            <div className="p-8">
                <h1 className='font-bold text-xl mb-8'>App Terms of Service</h1>

                <h2 className="text-lg font-bold">1. Acceptance of Terms</h2>
                <p className='mb-4'>By downloading, installing, or using Playdate, you agree to be bound by these Terms of Service. If you do not agree to these terms, do not use the app.</p>

                <h2 className="text-lg font-bold">2. Description of Service</h2>
                <p className='mb-4'>Playdate is a platform designed to help parents schedule play dates for their children. The app facilitates connections between users but is not responsible for the actual play dates or interactions between users.</p>

                <h2 className="text-lg font-bold">3. User Responsibilities</h2>
                <p >Users must:</p>
                <ul className='mb-4 list-disc'>
                    <li className='ml-8'>Provide accurate information when creating profiles</li>
                    <li className='ml-8'>Be at least 18 years old or have parental consent to use the app</li>
                    <li className='ml-8'>Supervise all play dates and interactions arranged through the app</li>
                    <li className='ml-8'>Not use the app for any illegal or unauthorized purpose</li>
                </ul>

                <h2 className="text-lg font-bold">4. Privacy and Data Protection</h2>
                <p className='mb-4'>We collect and use personal information as outlined in our <Link href='./privacy'>Privacy Policy</Link>. By using the app, you consent to our data practices described in the Privacy Policy.</p>

                <h2 className="text-lg font-bold">5. Limitation of Liability</h2>
                <p >Playdate is not responsible for:</p>
                <ul className='mb-4 list-disc'>
                    <li className='ml-8'>The actions, content, or data of third parties</li>
                    <li className='ml-8'>Any injuries, disputes, or issues arising from play dates arranged through the app</li>
                    <li className='ml-8'>Loss or damage resulting from use of the app</li>
                </ul>

                <h2 className="text-lg font-bold">6. Intellectual Property</h2>
                <p className='mb-4'>All content and functionality within the app is the exclusive property of Mark Gardner and is protected by copyright and other intellectual property laws.</p>

                <h2 className="text-lg font-bold">7. Termination of Service</h2>
                <p className='mb-4'>We reserve the right to terminate or suspend your account at any time for any reason, without notice.</p>

                <h2 className="text-lg font-bold">8. Changes to Terms</h2>
                <p className='mb-4'>We may modify these Terms at any time. Continued use of the app after changes constitutes acceptance of the new Terms.</p>

                <h2 className="text-lg font-bold">9. Disclaimer of Warranties</h2>
                <p className='mb-4'>{`The app is provided "as is" without any warranties, express or implied.`}</p>

                <h2 className="text-lg font-bold">10. Governing Law</h2>
                <p className='mb-4'>These Terms shall be governed by and construed in accordance with the laws of the state of Texas.</p>

                <h2 className="text-lg font-bold">11. Contact Information</h2>
                <p className='mb-4'>For any questions regarding these Terms, please contact us at <Link href='./contact' className='underline hover:scale-110'>our Contact Page</Link>.</p>
            </div>
        </main>
    )
}