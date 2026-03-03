import { Building2, Container, Pen, Plus, Trash2 } from 'lucide-react'
import React from 'react'

const ProductUser = () => {
  return (
    <div className='flex flex-col relative'>
            <div className='flex w-full absolute shadow-2xl shadow-gray-600 rounded-2xl border justify-start border-gray-300 bg-gray-50 px-8 py-3'>
                <div className='flex w-full  items-center font-semibold   text-xl  '>
                    <div className='flex w-3/6  gap-1'><Building2 className='' size={30}/>Nom de l'organisation à laquelle vous appartenez :</div>
                    <div className='flex justify-start w-2/6 '><span className=' font-bold'></span></div>
                    <div className='flex   w-1/6 '><button className='bg-amber-600 cursor-pointer hover:scale-95 flex rounded-md justify-center items-center  px-2 py-1 text-gray-50 font-sans shadow-2xl shadow-gray-700 relative'><Plus/>Ajouter un produit</button></div>
                </div>
                
            </div>
            <div className='flex gap-12 mt-28 justify-end'>
              <div className='flex  w-1/7 mx-2 bg-green-200 gap-2 rounded-md'>
                <Container size={30}/>
                <div className='flex flex-col justify-start'>
                  <p className=''>Total produits:</p>
                  <h1 className='text-xl ml-32 font-bold'>445</h1>
                </div>
              </div>
            </div>
            <div className='absolute top-48 w-full rounded-2xl px-8 bg-gray-50 z-30 shadow-2xl shadow-gray-600 border'>
              <h1 className='text-gray-950 text-2xl font-bold'>Liste des produits</h1>
              <table className='w-full flex flex-col gap-2'>
                <th className='bg-gray-300 w-full items-center flex justify-between rounded-md px-3'>
                  <td>Nom</td>
                  <td>Marque</td>
                  <td>Catégorie</td>
                  <td>Quantité Restante</td>
                  <td className='bg-red-300'>Prix Unitaire</td>
                  <td>Action</td>
                </th>
                <tr className='w-full items-center flex justify-between rounded-md px-3'>
                  <td>Spaguetti</td>
                  <td>Broli</td>
                  <td>Denrée alimentaire</td>
                  <td>120</td>
                  <td className='bg-amber-200'>350 FCFA</td>
                  <td className='flex gap-2'>
                    <Pen/>
                    <Trash2 className='text-amber-600'/>
                  </td>
                </tr>
              </table>
            </div>
        <div className='bg-gray-50  absolute z-50 gap-3 shadow-2xl rounded-xl flex flex-col px-8 justify-center pointer-events-none'>
          <h1 className='text-2xl font-semibold'>Ajouter un produit</h1>
          <div className='flex'>
            <form action="" className='pointer-events-auto flex flex-col gap-3'>
              <input type="text" className='border rounded-md px-4 w-300' placeholder='nom du produit'/><br/>
              <input type="text" className='border rounded-md px-4 w-300' placeholder='Description du produit'/><br/>
              <input type="text" className='border rounded-md px-4 w-300' placeholder='Marque'/><br/>
              <input type="text" className='border rounded-md px-4 w-300' placeholder='Quantité'/><br/>
              <input type="text" className='border rounded-md px-4 w-300' placeholder=''/><br/>
            </form>
          </div>
          
        </div>
    </div>
  )
}

export default ProductUser
