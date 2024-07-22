import ProductCard from '@/components/ProductCard'
import React from 'react'
import {Products} from '@/utils/mock'



function Productlist() {

  const sliceMethod=Products.slice(5,11);

 

  return (
    <div>
       <div className='flex justify-center font-semibold  text-sm  text-amber-800 mt-5'>
            <h4>PRODUCTS</h4>
        </div>
        <div className='flex justify-center mt-2'>
        <h3 className="scroll-m-20 text-2xl font-bold tracking-tight">
        Check What We Have
    </h3>
        </div>

        <div className='flex justify-between flex-wrap'>

{sliceMethod.map(product =>(
  <ProductCard key={product.id} 
  title={product.title} 
  price={product.price}
   image={product.image} 
   category={product.category} 
   id={product.id}
    />
))}

</div>

<div className='flex justify-end mt-10 py-5'>
<h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl mt-5 py-3 ">
Unique and Authentic <br /> Vintage Designer <br /> Jewellery
    </h1>
</div>
<div>
<div>
 
</div>
</div>


      </div>

        
      )
}

export default Productlist