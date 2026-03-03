import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router';
import Accueil from './Accueil'; // Assure-toi que la majuscule est correcte
import ProtectedRoute from './protectedRoute';
import DashboardUser from './pages/dashboard';
import AccueilUser from './pages/AccueilUser';
import CategoryUser from './pages/CategoryUser';
import ProductUser from './pages/ProductUser';
function App() {
  const [activeForm, setActiveForm] = useState<'none' | 'director' | 'employé' | 'login'>('none');

  return (


   <div className="relative">
      <div className='flex h-full'>
        <BrowserRouter>
          <Routes>
            {/* --- Route publique --- */}
            <Route path="/" element={<Accueil setActiveForm={setActiveForm} activeForm={activeForm} />}/>
            
           
            


            {/* --- Route protégée --- */}
            <Route path="/accueil" element={<AccueilUser />}  >
              <Route index element={<DashboardUser/>}/>
              <Route path='dashboard' element={<DashboardUser/>}/>
              <Route path="categorie" element={<CategoryUser />} /> 
              <Route path="produit" element={<ProductUser />} /> 
            </Route>  
          </Routes>
        </BrowserRouter>
      </div>
    </div>
  )
}

export default App
