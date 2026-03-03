import { Building2 } from 'lucide-react'
import React from 'react'

const CategoryUser = () => {
  return (
    <div className='flex flex-col'>
            <div className='flex w-full justify-center'>
                <div className='flex w-max rounded-2xl border items-center font-semibold border-gray-300 bg-gray-50 z-30 text-xl  top-20 px-8 py-3 absolute'>
                    <Building2 className='mr-3' size={30}/>Nom de l'organisation à laquelle vous appartenez :<span></span>
                </div>
                <button className='bg-amber-600'>hdhd</button>
            </div>
        
    </div>
  )
}

export default CategoryUser
