import ProductCard from '@/components/ProductCard'
import React from 'react'
import {Products} from '@/utils/mock'

const Page = () => {
  const sliceMethod=Products.slice(0,8);
    
  return (
    <div className='grid grid-cols-4'>
{sliceMethod.map(product =>(
  <ProductCard
   key={product.id} 
  title={product.title} 
  price={product.price}
  image={product.image}
  category={product.category}
  id={product.id}
      />
))}
    </div>
  )
}

export default Page