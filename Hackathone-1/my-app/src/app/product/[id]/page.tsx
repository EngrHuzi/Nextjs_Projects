"use client"
import { Products } from '@/utils/mock'
import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useState  } from 'react'
import { Button } from '@/components/ui/button'


const DetailPage = (id:number|string) => {

  return (
   Products.filter((product) =>product.id ==id)
  )
}


function Page({params}:{params:{id:string}}) {
  const [State, setState] = useState<number>(1)
    const result=DetailPage(params.id)
  return (
    <>
   
    <div className='flex-wrap flex justify-center mt-16 py-9 '>
       {result.map((products)=>(
        <div key={products.id} className='flex justify-between ' >
          <div>
          
                <Image src={products.image} alt={products.name} className='w-80 h-96 max-w-lg overflow-hidden'/>
                </div>
           
             <div className='ml-10 space-y-10 '>
               <div>{products.title}</div>
               <div className='font-bold'>{products.select}</div>
               <Link href={'/'}>
               <div className='flex space-x-5 mt-5 font-semibold'>
               <div>XS</div>
               <div>S</div>
               <div>M</div>
               <div>L</div>
               <div>XL</div>
               </div>

              </Link>
               <div className='flex space-x-5  '>
               <h2 className='mt-2 font-semibold mr-5'>Quantity:</h2>
                <div> <Button onClick={()=>setState(State-1)} className='rounded-full' >-</Button></div>
                <div className='font-semibold mt-2'>{State}</div>
                <div ><Button onClick={()=>setState(State+1)}  className='rounded-full'>+</Button></div>
              

              
              

                
               </div>
               <div className='ml-1 flex gap-5 '>
                <Button>Add to cart</Button>
                <div className='text-xl font-extrabold mt-2'>${products.price}</div>
               </div>

              

               
               </div>
              
            </div>
            
            
        
       ))}
     

    </div>
    <div className='mt-10 py-20'>
      <h1 className='text-4xl'>Product Information</h1>
    <hr className='border-gray-950 border-1 mt-10' />
    </div>

    <div className='flex items-center '>
    <h3 className="scroll-m-20  font-semibold tracking-tight uppercase text-gray-500">
    Product details
    </h3>
      <p className="leading-7 [&:not(:first-child)]:mt-6 ml-20">
      Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has
       been the industrys standard dummy text ever since the 1500s, when an unknown printer took
        a galley of type and scrambled it to make a type specimen book. It has survived not only five 
        centuries, but also the leap into electronic typesetting, remaining essentially unchanged.
         It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently 
      with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.
      </p>
      
    </div>
    </>
  )
}

export default Page