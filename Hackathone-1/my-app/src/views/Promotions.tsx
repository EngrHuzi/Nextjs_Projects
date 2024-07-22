import React from 'react'
import Image from 'next/image'
import event1 from '/public/images/event1.webp' 
import event2 from '/public/images/event2.webp'
import event3 from '/public/images/event3.webp'
import { Button } from '@/components/ui/button'
function Promotions() {
  return (
    <section>

        <div className='flex justify-center font-semibold  text-sm  text-amber-800'>
            <h4>PROMOTIONS</h4>
        </div>
        <div className='flex justify-center mt-2'>
        <h3 className="scroll-m-20 text-2xl font-bold tracking-tight">
        Our Promotions Events
    </h3>
        </div>
        <div className=' flex justify-evenly mt-3 flex-wrap'> 
        <div className='mt-3'>
        <div className=' max-w-sm p-3 bg-gray-200 border border-gray-200 rounded-none shadow dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700 flex '>
           <div> <h1 className='font-bold text-lg '>GET UP TO  60%</h1>
            <p className='mt-4'>For the summer  season</p>
            </div>
           <Image src={event1} alt='img' className='ml-20'></Image>
           
        </div>

        <div className=' mt-3 max-w-sm p-3 bg-black border border-black rounded-none  text-white'>
        <h1 className="scroll-m-20 text-4xl font-semibold tracking-tight lg:text-5xl mt-5 flex justify-center ">
        GET 30% Off
    </h1>
    <p className='font-serif flex justify-center mt-3'>USE PROMO CODE</p>

    <Button  className=' bg-gray-200 text-black  py-3 px-6 ml-20 mt-3'>DINEWEEKENDSALE</Button>
 
        </div>
        </div>

        
        <div className='mt-3 max-w-sm p-3 bg-gray-200 border border-gray-200 rounded-none  '>
            <p>Flex Sweatshirt</p>
            <h3 className='font-bold text-lg'>$75.00</h3>
 

        <Image src={event2} alt='img'></Image>
        </div>
        <div className='mt-3 max-w-sm p-3 bg-orange-200 border border-gray-200 rounded-none '>
        <p>Flex Push Button Bomber</p>
        <h3 className='font-bold text-lg'>$190.00</h3>
        <Image src={event3} alt='img'></Image>
        </div>
        </div>
        

    </section>
  )
}

export default Promotions