'use client'
 
import { useFormStatus } from 'react-dom'
 
export default function SubmitButton({text}:{text:string}) {
  const { pending } = useFormStatus()
 
  return (
    <button className='px-1 w-90 text-xs cursor-pointer py-1 mt-2 bg-appGold hover:bg-appBlue active:bg-appGold active:shadow-activeButton active:text-appBlue hover:text-appGold border-2 border-appBlue rounded-lg transform ease-in-out duration-300 disabled:opacity-50 disabled:pointer-events-none mr-2'  type="submit" disabled={pending}>
    {text}
    </button>
  )
}