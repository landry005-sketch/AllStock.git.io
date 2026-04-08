import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router';
import Accueil from './Accueil'; // Assure-toi que la majuscule est correcte
import ProtectedRoute from './protectedRoute';
import Login from './pages/Login';
import RegistrerEmployer from './RegistrerEmployer';
import RegisterOrganisation from './RegisterOrganisation';
import DashboardLayount from './pages/dashboard/DashboardLayount';
import DashboardHome from './pages/dashboard/DashboardHome';
import  Users  from './pages/dashboard/Users';
import CompleteSetup from './pages/CompleteSetup';
import { ToastContainer } from 'react-toastify';
import Scan from './pages/dashboard/Scan';
import Landing from './Landing';
import Categories from './pages/dashboard/Categories';
import Product from './pages/dashboard/Product';
import Suppliers from './pages/dashboard/Suppliers';
import Sales from './pages/dashboard/Sales';
import Settings from './pages/dashboard/settings';
import { ThemeProvider } from './ThemeContent';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';



function App() {
  const [activeForm, setActiveForm] = useState<'none' | 'director' | 'employé' | 'login'>('none');
  const [showLogin, setShowLogin ] = useState(false);
  return (


   <div className="relative">
      <div className='flex h-full'>
        <ToastContainer position='top-right' autoClose={3000}/>
        <ThemeProvider>
          <BrowserRouter>
          <Routes>
            {/* --- Route publique --- */}
            <Route path='/' element={<Landing/>}/>
            <Route path="/accueil" element={<Accueil/>}/>
            <Route path='/register-employé' element={<RegistrerEmployer/>}/>
            <Route path='/register-director' element={<RegisterOrganisation/>}/>
            <Route path='/login' element={<Login/>}/>
            <Route path='/mot-de-passe-oublie' element={<ForgotPassword/>}/>
            <Route path='reset-password/:token' element={<ResetPassword/>} />
            <Route path="/complete-setup" element={<CompleteSetup />} />
            <Route element={<ProtectedRoute/>}>
            {/*Route privée*/}
              <Route path="/dashboard" element={<DashboardLayount />}  >
                <Route index element ={<DashboardHome/>}/>
                <Route path='users' element={<Users/>}/>
                <Route path="categories" element={<Categories />} /> 
                <Route path="produits" element={<Product />} /> 
                <Route path="scan" element={<Scan/>}/>
                <Route path="suppliers" element={<Suppliers/>}/>
                <Route path="sales" element={<Sales/>}/>
                <Route path='settings' element={<Settings/>}/>
              </Route>  
            </Route> 
          </Routes>
        </BrowserRouter>
        </ThemeProvider>
        
      </div>
    </div>
  )
}

export default App
