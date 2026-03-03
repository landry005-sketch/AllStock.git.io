import { Building2 } from 'lucide-react'
import React from 'react'

const dashboard = () => {
  return (
    <div>
        <div className='flex w-full justify-center'>
            <div className='flex w-max rounded-2xl border items-center font-semibold border-gray-300 bg-gray-50 z-30 text-xl  top-20 px-8 py-3 absolute'>
                <Building2 className='mr-3' size={30}/>Nom de l'organisation à laquelle vous appartenez :<span></span>
            </div>
        </div>
    </div>
  )
}

export default dashboard
