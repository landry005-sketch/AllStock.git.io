import { Box, Building, Building2, ChartColumn, Check, Eye, EyeOff, Hotel, Loader, Package, ShieldCheck, TrendingUp, UserRound, Users, X } from "lucide-react"
import { useEffect, useState} from "react";
import { useNavigate } from "react-router";





const accueil = () => {




 
 
  const [init, setInit] = useState(false);
  const navigate = useNavigate();
 

  return (
    <div className="bg-blue-100 min-w-screen dark:bg-[#020617]/80  flex flex-col justify-center text-center" >
      
      <div className=" relative z-10 flex flex-col min-w-screen">
          <header className="bg-gray-50 dark:bg-[#0f172a] fixed min-w-screen top-0 z-30 flex justify-between  items-center px-16 py-5">
        <div className="text-blue-700 flex items-center text-sm md:text-3xl font-semibold gap-3">
          <Package size={40}/>
          <h1 >AllStock</h1>
        </div>
        <button className="btn dark:bg-[#1a387f] dark:text-white dark:border-[#1a387f]"
              onClick={() => navigate("/login")}>Se connecter</button>
      </header>
      <h1 className="text-xl md:text-5xl  mt-28 font-semibold">Gérez votre stock en toute simplicité</h1>
      <p className="mt-5 text-sm md:text-xl dark:text-gray-300 text-gray-700">AllStock est la solution complète pour gérer vos inventaires, suivre vos<br/> produits et optimiser votre chaine d'approvisionnement</p>
      <div className="px-16 md:flex grid gap-6 mt-10">
        <div className="md:w-1/3 dark:bg-[#0f172a] flex flex-col bg-gray-50 rounded-xl border gap-3 border-gray-400 py-6 px-6 text-center justify-center items-center">
          <Package size={40} className="bg-blue-200 rounded-4xl text-blue-700 px-2 py-2"/>
          <h2 className="text-xl font-semibold">Gestion des stocks</h2>
          <p className="text-gray-700">Suivez vos produits en temps réel avec<br/> des alertes automatiques</p>
        </div>
        <div className="md:w-1/3 flex dark:bg-[#0f172a] flex-col bg-gray-50 rounded-xl border gap-3 border-gray-400 py-6 px-6 text-center justify-center items-center">
          <ChartColumn color="green" size={40} className="bg-green-200 rounded-4xl text-blue-700 px-2 py-2"/>
          <h2 className="text-xl font-semibold">Analyses Avancées</h2>
          <p className="text-gray-700">Des rapports détaillés pour prendre les<br/>bonnes décisions</p>
        </div>
        <div className="md:w-1/3 dark:bg-[#0f172a] flex flex-col bg-gray-50 rounded-xl border gap-3 border-gray-400 py-6 px-6 text-center justify-center items-center">
          <Users color="purple" size={40} className="bg-purple-200 rounded-4xl text-blue-700 px-2 py-2"/>
          <h2 className="text-xl font-semibold">Collaboration d'équipe</h2>
          <p className="text-gray-700">Travaillez ensemble avec vos équipes en<br/>temps réel</p>
        </div>
      </div>
      <div className="my-8 gap-6  px-16 grid  md:flex">
        <div className="flex w-min dark:shadow-black dark:bg-[#0f172a] gap-5 md:gap-0 md:w-1/3 shadow-2xl shadow-gray-300 bg-gray-50 rounded-xl border border-gray-400 px-6 py-6 justify-start items-center text-center">
          <div className="w-1/7 ">
            <TrendingUp className="text-blue-700" size={40}/>
          </div>
          <div className="w-6/7 flex flex-col items-start ">
            <h1 className=" text-4xl">10,000+</h1>
            <p className="text-gray-700">Organisations</p>
          </div>
        </div>
        <div className="flex w-min dark:shadow-black dark:bg-[#0f172a] gap-8 md:gap-0 md:w-1/3 shadow-2xl shadow-gray-300 bg-gray-50 rounded-xl border border-gray-400 md:px-6 px-9 py-6 justify-start items-center text-center">
          <div className="w-1/7 ">
            <Building2 color="green" className="text-blue-700" size={40}/>
          </div>
          <div className="w-6/7 flex flex-col items-start ">
            <h1 className=" text-4xl">50M+</h1>
            <p className="text-gray-700">Organisations</p>
          </div>
        </div>
        <div className="flex w-min dark:bg-[#0f172a] gap-8 md:gap-0 md:w-1/3 dark:shadow-black shadow-2xl shadow-gray-300 bg-gray-50 rounded-xl border border-gray-400 px-9 md:px-6 py-6 justify-start items-center text-center">
          <div className="w-1/7 ">
            <ShieldCheck color="purple" className="text-blue-700" size={40}/>
          </div>
          <div className="w-6/7 flex flex-col items-start ">
            <h1 className=" text-4xl">99,9%</h1>
            <p className="text-gray-700">Organisations</p>
          </div>
        </div>
      </div>
    
            <div className="bg-gray-50 dark:bg-[#0f172a] gap-5 flex flex-col justify-center items-center shadow-2xl shadow-gray-700 text-center py-12 px-12 md:mx-16 mb-16 rounded-xl border border-gray-400">
        <h1 className="text-sm md:text-[33px] text-center font-semibold">Commencez dès maintenant</h1>
        <p className="text-sm md:text-xl text-gray-500">Créer votre organisation</p>
        <div className="flex items-center  justify-center w-full gap-8">
        
          <div className="flex flex-col justify-center   hover:border-blue-700 text-center items-center  w-full mx-80 py-6 border border-blue-200 rounded-2xl px-22 md:px-0">
            <Building2 size={80} className="bg-blue-200 rounded-4xl text-blue-700 my-5 px-2 py-2"/>
            <p className="text-sm md:text-3xl font-semibold scale-x-125">Enregistrer une organisation</p>
            <p className="hidden md:block scale-x-120 text-gray-500 my-2">Créer votre entreprise et obtenez un<br/> code organisation</p>
            <div className="w-full text-[10px] md:text-sm  md:ml-24 flex justify-start mt-4 md:px-10">
              <ShieldCheck color="green"/>
              <p>Administration complète</p>
            </div>
            <div className="w-full md:ml-24 text-[10px] md:text-sm flex justify-start mt-4 md:px-10">
              <ShieldCheck color="green"/>
              <p>Administration complète</p>
            </div>
            <div className="w-full md:ml-24 text-[10px] md:text-sm  flex justify-start mt-4 md:px-10">
              <ShieldCheck color="green"/>
              <p>Administration complète</p>
            </div>
            <div className="w-full md:ml-24 text-[10px] md:text-sm  flex justify-start my-4 md:px-10">
              <ShieldCheck color="green"/>
              <p>Administration complète</p>
            </div>
            <button onClick={()=>navigate('/register-director')} className="btn md:w-124 border-0 bg-blue-600 text-gray-50 rounded-xl px-8 md:px-20 hover:brightness-90 mt-4" >Créer une organisation</button>
          </div>
         
        </div>
       
      </div>
      
        

      
    
     
      
      </div>
      
    </div>
  )
}

export default accueil
