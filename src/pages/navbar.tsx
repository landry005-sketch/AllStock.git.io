import { Building2, Search, User, User2, UserRound, UsersRound } from 'lucide-react'
import React from 'react'

const navbar = () => {
  return (
    <div className='flex flex-col  gap-6 w-full relative'>
        <div className='flex justify-between  w-full'>
            <h1 className='text-4xl'>Bienvenue, LUCY!</h1>
            <div className='flex relative items-center'>
                <Search className='absolute ml-2 text-gray-400 cursor-pointer hover:text-gray-950'/>
                <input type="text" className='rounded-md py-1 px-8  border ' placeholder='rechercher'/>
                <UsersRound className='rounded-4xl text-amber-700 ml-5 bg-red-50' size={30}/>
            </div>
        </div>
        
        
    </div>
    
  )
}

export default navbar
