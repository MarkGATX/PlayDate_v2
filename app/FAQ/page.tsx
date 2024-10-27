

export default function FAQ() {


    return (
        <main>
            <div className='bg-blueGradient bg-appBlue text-appBG'>
                <h1 className='text-3xl font-bold p-8'>Playdate - The story</h1>
            </div>
            <p className='mt-8 px-8 py-4'>{`With our young son growing up during the time of lockdowns, our family quickly learned how hard it can be for parents to keep their kids entertained. Playdate is a project meant to make it easier for parents to schedule playdates and other events and even find new places you may have never thought of.
            
            The original idea for Playdate was one I came up with as a group project in a coding bootcamp. Now, years later, I decided to follow up on the idea and create a completel application.`}</p>
            <p className='px-8 py-4'>{`Keep in mind for the recommendations to work, you `}<span className='font-bold '>{`MUST ALLOW GEOLOCATION IN YOUR BROWSER.`}</span></p>
            <p className='px-8 py-4'>{`Keep in mind this application is in pre-release. That means there will be occassional bugs, there will be more functionality added over time, and the interface will change over time. How will it change? That depends on you. I'd love to hear your feedback on what you like and don't like about how Playdate is working. `}</p>
            <a href="https://forms.gle/miaP4Dp2ggkaPQX87" target="_blank" className='px-8 py-4 font-bold text-lg hover:underline'>
                <button className="w-90 transform cursor-pointer rounded-xl border-2 border-appBlue bg-appGold px-2 py-2 text-sm duration-300 ease-in-out hover:bg-blueGradient hover:bg-appBlue hover:text-appGold active:bg-appGold active:text-appBlue active:shadow-activeButton disabled:pointer-events-none disabled:opacity-50">Click here to go to the feedback form</button>
            </a>
            <div >
                <div className='bg-blueGradient bg-appBlue text-appBG mt-16'>
                    <h1 className='text-3xl font-bold p-4'>{`FAQ's`}</h1>
                </div>
                <details className='detailSection p-4 xl:px-8'>
                    <summary className='font-bold'>How does it work?</summary>
                    <p>{`When you land on the Playdate home page, the application takes your current location as well as the current weather and pulls a list of places that might be a good choice to go visit. You can see ratings for the place from Google as well as ratings from users of the Playdate app as well as amenities at the place, like bathrooms or things to eat.`} </p>

                    <p className='mt-4'>{`Once you decide on a place to visit, you can start a playdate and invite other families on the app to join in. It's great for last minute plans and helping to organize your plans.`}</p>
                </details>
                <details className='detailSection p-4 xl:px-8'>
                    <summary className='font-bold'>How do I make an account?</summary>
                    <p>{`Currently you have to login to Playdate with a Google account. Once you do that, an account will automatically be made in Playdate. Based on user feedback other options for login and account generation could be added.`}</p>
                </details>
                <details className='detailSection p-4 xl:px-8'>
                    <summary className='font-bold'>What about my kids?</summary>
                    <p>{`Accounts are only available for parents. Once you have an account, you can add a new kid to your account inside your Dashboard section marked "Kids." When you add a kid, you'll be marked as the Primary Caregiver. There's no way to change Primary Caregiver at this time. Currently your account will be the one to receive all notifications about playdates for that kid. `} </p>

                    <p className='mt-4'>{`If another parent wants to have access to a kid you've already added, they can search for the kid and request being added as a parent. You'll get a notification and can approve or reject the request.`}</p>
                </details>
                <details className='detailSection p-4 xl:px-8'>
                    <summary className='font-bold'>How do I start a playdate?</summary>
                    <p>{`When you find a location that you want to visit, click on the "Start a playdate button." From there you'll be taken to the playdate page. You can change the date and time of the playdate if you want, or leave it at the current time if you're on your way there now. You can also add a custom message about the playdate if you want.`} </p>

                    <p className='mt-4'>{`After you set the details, search the application for kids to invite. You can see the current status of any invites on the playdate page.`}</p>
                </details>
                <details className='detailSection p-4 xl:px-8'>
                    <summary className='font-bold'>Is there an easier way to add kids to a playdate?</summary>
                    <p>{`Sure! When you're inviting kids to a playdate, you have the option to add friends to a friend group. Each kid has one friend group. When you start another playdate later, you can invite the friend group by clicking the "Invite friend group" button.`}</p>
                </details>
                <details className='detailSection p-4 xl:px-8 '>
                    <summary className='font-bold'>Can I edit the friend group?</summary>
                    <p>{`You can remove friends from the friend group in the Dashboard. Go to the Kids section and find your kid. Click the button for the friend group to see all the friends in the group. You can remove friends from the group with the "Remove" button.`}</p>
                </details>
                <details className='detailSection p-4 xl:px-8'>
                    <summary className='font-bold'>What happens if someone invites us to a playdate?</summary>
                    <p>{`From your Dashboard page, there's a section for notifications. When you toggle that open, you'll see any invites for playdates as well as any changes to existing playdates. You can respond to invites from those notifications and see them reflected in your Playdates section.`}</p>
                </details>
                <details className='detailSection p-4 xl:px-8'>
                    <summary className='font-bold'>{`We're really popular. How can I keep track of all our playdates?`}</summary>
                    <p>{`If you go to your personal Dashboard, you'll see a section with upcoming playdates. When you toggle that open, you'll see all of the playdates coming up in the future as well as your current status for that playdate.`}</p>
                </details>
            </div>
        </main>
    )
}