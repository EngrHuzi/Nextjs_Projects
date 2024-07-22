import React from 'react'
import Image, { StaticImageData } from 'next/image'
import Link from 'next/link'



function ProductCard(props:{title:string,price:number,image:StaticImageData|string,category:string,id:number }) {
  return (
    <section>
       
       <Link
       href={`/product/${props.id}`}>
          <div className=' mt-3 max-w-sm p-3  border-gray-200 rounded-none'>
            <Image src={props.image}  alt="image" ></Image>
          
          </div>
          <div> <h3 className='font-semibold'>{props.title}</h3>
          <p className='text-lg font-bold'>${props.price}</p>
          <h2 className='text-xl font-medium'>Category  {props.category}</h2>
          </div>
          </Link>
      
    </section>
  )
}

export default ProductCard