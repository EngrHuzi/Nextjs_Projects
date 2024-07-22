import React from 'react'
import {Products} from '@/utils/mock'
import ProductCard from '@/components/ProductCard'

function Kids() {
    const thisclice=Products.slice(11,15);
  return (
    <div className='grid grid-cols-3 '>
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

export default Kids