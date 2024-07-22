import React from 'react'
import {Products} from '@/utils/mock'
import ProductCard from '@/components/ProductCard'

function Male() {
  const thisclice=Products.slice(8,11)
  return (
    <div className='flex justify-evenly'>
        {thisclice.map(product =>(
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

export default Male