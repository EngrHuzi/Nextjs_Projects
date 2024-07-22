import { StaticImageData } from "next/image"

export type products={
    title: string
    id:number,
    name:string,
    price:number,
    image:string | StaticImageData
    category:string
    select:string
  
}