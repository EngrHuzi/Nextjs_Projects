import React from 'react'
import { Button } from "@/components/ui/button"
import Link from 'next/link'
import heroImage from '/public/images/heroImage.webp';
import Image from 'next/image';



const Section = () => {
  return (
    <section className='py-7 flex flex-col lg:flex-row gap-y-10  '>
        <div className='py-6 '>
        <Button  className=' bg-green-200 text-black hover:bg-green-200 cursor-text py-3 px-6'>Sale 70%</Button>
    
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl mt-5 ">
        An Industria  Take on Streetwear
    </h1>
   
    <p className="leading-7 [&:not(:first-child)]:mt-6">
    Anyone can beat you but no one can <br /> beat your outfit as long as you wear <br />  Dine outfits.
    </p>

        <Button className='p-7 rounded-none mt-12'><Link href={'/Female'}>Start Shoping</Link></Button>
    </div>
      
        <div className='rounded-full h-[100] w-[100] flex bg-teal-400 m-10 '>
            <Image src={heroImage} alt='image'></Image>

        </div>
    </section>
  )
}

export default Section