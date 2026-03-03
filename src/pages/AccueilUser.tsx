import React from 'react'
import Navbar from './navbar'
import { Home, TableOfContents, Container, LogOut } from 'lucide-react'
import { Link, Navigate, Outlet } from 'react-router'

const AccueilUser = () => {
  return (
    
    <div className="drawer lg:drawer-open bg--50">
      <input id="my-drawer-4" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content">
          {/* Navbar */}
        <nav className="navbar w-full ">
          <label htmlFor="my-drawer-4" aria-label="open sidebar" className="btn btn-square btn-ghost">
            {/* Sidebar toggle icon */}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" fill="none" stroke="currentColor" className="my-1.5 inline-block size-4"><path d="M4 4m0 2a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z"></path><path d="M9 4v16"></path><path d="M14 10l2 2l-2 2"></path></svg>
          </label>
          <div className="px-4  w-full h-full flex"><Navbar/></div>
        </nav>
            {/* Page content here */}
        <div className="p-4 mt-8"><Outlet/></div>
      </div>

      <div className="drawer-side is-drawer-close:overflow-visible">
        <label htmlFor="my-drawer-4" aria-label="close sidebar" className="drawer-overlay"></label>
        <div className="flex min-h-full flex-col justify-center bg-gray-300 is-drawer-close:w-14 is-drawer-open:w-64">
          {/* Sidebar content here */}
          <img src="/public/images.png" alt="Logo-organisation" className='is-drawer-close:hidden w-full h-40 mb-10'/>
          <ul className="menu w-full grow gap-8">
            {/* List item */}
            <li>
              <Link to='/accueil/dashboard' className=" is-drawer-close:tooltip flex justify-start is-drawer-close:tooltip-right" data-tip="Homepage">
            {/* Home icon */}
                <Home/>
                <span className="is-drawer-close:hidden font-bold">DASHBOARD</span>
              </Link>
            </li>
            <li>
              <Link to={'/accueil/categorie'} className=" is-drawer-close:tooltip flex justify-start is-drawer-close:tooltip-right" data-tip="Homepage">
            {/* Home icon */}
                <TableOfContents/>
                <span className="is-drawer-close:hidden font-bold">CATEGORIES</span>
              </Link >
            </li>
            <li>
              <Link to={'/accueil/produit'} className=" is-drawer-close:tooltip flex justify-start is-drawer-close:tooltip-right" data-tip="Homepage">
            {/* Home icon */}
                <Container/>
                <span className="is-drawer-close:hidden font-bold">PRODUITS</span>
              </Link >
            </li>


            {/* List item */}
           
          </ul>
          <button className='bg-amber-600 rounded-md cursor-pointer text-gray-50 mb-10 justify-center px-2 py-2 flex mx-5  s-drawer-close:tooltip is-drawer-close:hidden'>
            <LogOut/>
            <span className='is-drawer-close:hidden'>Se deconnecter</span>
          </button>
        </div>
      </div>
    </div>
    
  )
}

export default AccueilUser
