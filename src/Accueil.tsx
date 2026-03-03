import { Building, Building2, Check, Eye, EyeOff, Hotel, Loader, UserRound, Users, X } from "lucide-react"
import { useState} from "react";

interface AccueilProps {
  setActiveForm: (form: 'none' | 'director' | 'employé' | 'login') => void;
  activeForm: 'none' | 'director' | 'employé' | 'login';
  
}


const accueil = ({ setActiveForm, activeForm }: AccueilProps) => {
  const [formData, setFormData] = useState({
    username : '',
    email: '',
    password: '',
    orgName:'',
    orgCode:'',
    identifier:'',
    logo: null as File | null
  })
  const handleChange = (e:React.ChangeEvent<HTMLInputElement>) =>{
    setFormData({
      ...formData,
      [e.target.name]:e.target.value

    });
  };
  const [loginError, setLoginError] = useState('')
  
  const [showPassword, setShowPassword] = useState(false);
  const [status, SetStatus] = useState < 'idle' |'loading'| 'success'| 'error' > ('idle');
  const [message, SetMessage] = useState('');
  const [orgCode, SetOrgCode] = useState('');

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) =>{
    e.preventDefault();
    
    SetStatus('loading');
    setLoginError('');

    let url = '';
    switch (activeForm) {
      case 'director':
        url= 'http://localhost:5000/api/auth/register-director'
        break;
      case 'employé':
        url= 'http://localhost:5000/api/auth/register-employee'
        break;
      case 'login':
        url= 'http://localhost:5000/api/auth/login'
        break;
      default:
        url= ''
    }

    try{
      let body :any;
      let headers: any = {};

      if (activeForm === 'login'){
        headers['Content-Type'] = 'application/json';
       const loginValue =  formData.email || formData.username.trim();

    body = JSON.stringify({
        identifier: loginValue,
        password: formData.password
    });

      }else{
        const formDataToSend = new FormData();
        formDataToSend.append('username', formData.username);
        formDataToSend.append('email', formData.email);
        formDataToSend.append('password', formData.password);
        formDataToSend.append('orgName', formData.orgName);
        formDataToSend.append('orgCode', formData.orgCode);
        if (formData.logo){
          formDataToSend.append('logo', formData.logo)
          console.log("fichier prêt à l'envoie:", formData.logo)
        }
        body = formDataToSend;
      }
      console.log("Données envoyées au login :", {
        identifier: formData.email || formData.username,
        password: formData.password
    });
      const response= await fetch(url, {
        method: 'POST',
        headers: headers,
        body: body
      });

      const data = await response.json();
      if (response.ok){
        if (activeForm === 'login') {
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify({
            id: data.id,
            username: data.username,
            role: data.role,
            org_id: data.org_id
          }));
          SetStatus("success");
          setTimeout(()=>{
            window.location.href= '/accueil';
          }, 1000);
        }else{
          SetMessage(data.message)
          if (data.orgCode) SetOrgCode(data.orgCode);
          SetStatus('success')
        }
       
      }else{
        if (activeForm === 'login'){
          setLoginError(data.error || "Identifiant ou mot de passe incorecte")
          SetStatus('error')
        }else{
          SetMessage(data.error || "Une erreur est survenue lors de votre inscription")
          SetStatus("error")
        }
      }
      
    }catch (err){
     if (activeForm === 'login'){
      setLoginError("Erreur de connexion au serveur")
     }else{
      SetMessage("Erreur de connexion au serveur");
     }
     SetStatus('error')
    }
  }

  return (
    <div className="hero min-h-screen img relative">
      <div className="hero-overlay"></div>
      <div className="hero-content text-neutral-content text-center">
        <div className="max-w-md flex flex-col items-center justify-center min-h-screen w-full px-4 text-center">
     
          <h1 className="mb-5 text-5xl font-bold text-gray-50">BONJOUR</h1>
          <p className="mb-5 text-gray-50">
            Bienvenue sur AllStock votre partenaire dans la gestion de vos entrepots ou reserves que ce soit des petits ou grands magasins
          </p>
          <div className="flex items-center sm:flex-row justify-center w-max gap-8">
            <button onClick={()=>setActiveForm('director')} className="bg-amber-600 cursor-pointer flex  hover:bg-amber-700 text-white font-bold py-2 w-72 px-4 rounded gap-1" ><Building2/>Créer une organisation</button>
            <button onClick={()=>setActiveForm('employé')} className=" bg-transparent w-72 flex cursor-pointer hover:bg-amber-600 text-amber-600 font-semibold hover:text-white gap-1 py-2 px-4 border border-amber-600 hover:border-transparent rounded" ><UserRound/>Rejoindre une organisation</button>
          </div>
        </div>
      </div>
      
      {activeForm === 'director' &&(


        <div className="absolute shadow-2xl  border-2 rounded-2xl shadow-gray-400  bg-gray-50  ">
          <header className="justify-end mr-4 mt-4 text-gray-950 hover:text-red-500 flex"><X onClick={()=>{setActiveForm('none'); SetStatus('idle');}} className="cursor-pointer"/></header>
          <div className="justify-center flex flex-col items-center px-10">
            {status === 'success' ? (
              <div className="flex flex-col items-center text-center py-10 animate-in fade-in zoom-in duration-300">
                <div className="bg-green-100 p-4 rounded-full mb-4">
                <Check className="text-green-600 w-12 h-12" />
                </div>
                <h1 className="font-sans text-gray-950 text-3xl mb-2">Compte Créé !</h1>
                <p className="text-gray-600 mb-6">{message}</p>
          
                {orgCode && (
                  <div className="bg-amber-50 border-2 border-dashed border-amber-200 rounded-xl p-6 w-full mb-6">
                  <p className="text-amber-800 text-sm font-bold uppercase tracking-widest mb-2">Code de votre organisation</p>
                  <p className="text-4xl font-mono font-black text-amber-900">{orgCode}</p>
                  </div>
                )};
                <button 
                  onClick={() => { setActiveForm('none'); SetStatus('idle'); /* Redirige ici si besoin */ }}
                  className="bg-amber-700 text-white px-8 py-2 rounded-md hover:bg-amber-800 cursor-pointer transition-colors"
                >
                  Fermer et continuer
                </button>
              </div>
              ): (
                <>
                  <h1 className="font-sans text-gray-950 text-4xl">Créer un Compte</h1>
                  <p className="font-bold text-gray-400 mb-5">Commencer à gerer votre stock dès maintenant grace à <span className="text-amber-700">StockAll</span></p>
                  {status === 'error' && (
                    <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4 w-full text-center text-sm border border-red-200">
                      {message}
                    </div>
                  )}  
                  <form onSubmit={handleSubmit} className={`flex flex-col ${status === 'loading' ? 'opacity-40 pointer-events-none' :''}`}>
                    <label htmlFor="" className="text-gray-950 font-semibold">Nom d'utilisateur<br/>
                      <input type="text" placeholder="Nom utilisateur" name="username" onChange={handleChange} className="border px-3 rounded-md py-1 w-120 mb-4" required/>
                    </label>
                    <label htmlFor="" className="text-gray-950 font-semibold">Votre adresse Mail<br/>
                      <input type="email" placeholder="email" name="email" onChange={handleChange} className="border px-3 rounded-md py-1 w-120 mb-4" required/>
                    </label>
                    <label className="text-gray-950 font-semibold relative block">
                            Créer votre mot de passe<br/>
                      <div className="relative">
                        <input 
                          name="password"
                          type={showPassword ? "text" : "password"} 
                          placeholder="mot de passe" 
                          onChange={handleChange}
                          className="border px-3 rounded-md py-1 w-120 mb-4 outline-amber-700 pr-10" 
                          required
                        />
    
                            
                        <div 
                          className="absolute inset-y-0 right-0 pr-3 flex items-center mb-4 cursor-pointer text-gray-400 hover:text-amber-700"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <Eye size={20} /> 
                          ) : (
                              <EyeOff size={20} />
                          )}
                        </div>
                      </div>
                    </label>
                    <label htmlFor="" className="text-gray-950 font-semibold">Nom de votre organisation<br/>
                      <input type="text" placeholder="nom de l'entreprise" name="orgName" onChange={handleChange} required className="border px-3 rounded-md py-1 w-120 mb-6 "/>
                    </label>
                    <label className="text-gray-950 font-semibold">Insérez le logo de votre organisation ici<br/>
                      <input type="file" onChange={(e) => {if (e.target.files && e.target.files[0]) {setFormData({ ...formData, logo: e.target.files[0] });}}}  name="logo" className="border cursor-pointer px-3 rounded-md py-1 w-120 mb-6 " accept="image/*"/>
                    </label>
                    <button className="bg-amber-700 rounded-md py-1 text-gray-50 font-stretch-100% hover:bg-gray-50 hover:text-amber-700 mb-4 hover:border hover:border-gray-700 cursor-pointer">
                      {status === 'loading' ? "Chargement..." : "Créer votre compte"}
                    </button>
                  </form>
                  <div className="flex mb-4">
                    <p className="text-gray-950">Vous avez déjà un compte ?</p>
                    <button onClick={()=>{setActiveForm('login');SetStatus('idle')}} className="text-amber-700 ml-2 cursor-pointer hover:brightness-50 hover:underline">Connectez-vous</button>
                  </div>
                </>
            )}
          </div>
          
        </div>
      )}
      {activeForm === 'employé' && (
         <div className="absolute shadow-2xl  border-2 rounded-2xl shadow-gray-400  bg-gray-50  ">
            <header className="justify-end mr-4 mt-4 text-gray-950 hover:text-red-500 flex"><X onClick={()=>{setActiveForm('none'); SetStatus('idle');}} className="cursor-pointer"/></header>
            <div className="justify-center flex flex-col items-center px-10">
              {status === 'success' ? (
                <div className="flex flex-col items-center text-center py-10 animate-in slide-in-from-bottom-4 duration-500">
                  <div className="bg-amber-100 p-4 rounded-full mb-4">
                    <Users className="text-amber-700 w-12 h-12" />
                  </div>
                  <h1 className="font-sans text-gray-950 text-3xl mb-2">Bienvenue dans l'équipe !</h1>
                  <p className="text-gray-600 mb-6 max-w-xs leading-relaxed">
                        Votre compte a été créé avec succès. Vous pouvez maintenant vous connecter pour accéder à l'inventaire.
                  </p>
                  <button 
                      onClick={() => { setActiveForm('login'); SetStatus('idle'); /* Logique de connexion ici */ }}
                      className="bg-amber-700 text-white px-10 py-2 rounded-md hover:bg-amber-800 transition-all shadow-md font-bold"
                  >
                      Se connecter
                  </button>
                </div>
                ): (
                  <>
                    <h1 className="font-sans text-gray-950 text-4xl">Créer un Compte</h1>
                    <p className="font-bold text-gray-400 mb-5">Créer un compte avec le code fourni par votre administrateur <span className="text-amber-700">StockAll</span></p>
                    {status === 'error' && (
                      <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4 w-full text-center text-sm border border-red-200">
                        {message}
                      </div>
                    )}  
                    <form onSubmit={handleSubmit} className={`flex flex-col ${status === 'loading' ? 'opacity-40 pointer-events-none' :''}`}>
                      <label htmlFor="" className="text-gray-950 font-semibold">Nom d'utilisateur<br/>
                        <input type="text" placeholder="Nom utilisateur" name="username" onChange={handleChange} className="border px-3 rounded-md py-1 w-120 mb-4" required/>
                      </label>
                      <label htmlFor="" className="text-gray-950 font-semibold">Votre adresse Mail<br/>
                        <input type="email" placeholder="email" name="email" onChange={handleChange} className="border px-3 rounded-md py-1 w-120 mb-4" />
                      </label>
                      <label className="text-gray-950 font-semibold relative block">
                            Créer votre mot de passe<br/>
                        <div className="relative">
                          <input 
                            name="password"
                            type={showPassword ? "text" : "password"} 
                            placeholder="mot de passe" 
                            onChange={handleChange}
                            className="border px-3 rounded-md py-1 w-120 mb-4 outline-amber-700 pr-10" 
                            required
                          />
    
                          <div 
                            className="absolute inset-y-0 right-0 pr-3 flex items-center mb-4 cursor-pointer text-gray-400 hover:text-amber-700"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                                <Eye size={20} />
                                ) : (
                                <EyeOff size={20} />
                            )}
                          </div>
                        </div>
                      </label>
                      <label htmlFor="" className="text-gray-950 font-semibold">Code de votre Organisation<br/>
                        <input type="text" placeholder="code de l'entreprise" name="orgCode" onChange={handleChange} required className="border px-3 rounded-md py-1 w-120 mb-6 "/>
                      </label>
                      <button className="bg-amber-700 rounded-md py-1 text-gray-50 font-stretch-100% hover:bg-gray-50 hover:text-amber-700 mb-4 hover:border hover:border-gray-700 cursor-pointer">
                        {status === 'loading' ? "Chargement..." : "Créer votre compte"}
                      </button>
                    </form>
                    <div className="flex mb-4">
                      <p className="text-gray-950">Vous avez déjà un compte ?</p>
                      <button onClick={()=>{setActiveForm('login');SetStatus('idle')}} className="text-amber-700 ml-2 cursor-pointer hover:brightness-50 hover:underline">Connectez-vous</button>
                    </div>
                  </>
                )}
                
          </div>
         </div>
      )}
      
      {activeForm === 'login' && (
        <div className="absolute shadow-2xl  border-2 rounded-2xl shadow-gray-400  bg-gray-50 ">
          <header className="justify-end mr-4 mt-4 text-gray-950 flex"><X onClick={()=>{setActiveForm('none'); SetStatus('idle');}} className="hover:text-red-500  cursor-pointer"/></header>
          <div className="justify-center flex flex-col items-center px-10">
            <h1 className="font-sans text-gray-950 text-4xl">Se connecter</h1>
            <div className="flex mt-2 gap-1">
                 <p className="text-gray-400 mb-5 ">Entrer vos identifiants pour accéder a votre espace </p><span className="text-amber-600">StockAll</span>
            </div>
           
            <form onSubmit={handleSubmit} className={`flex flex-col ${status === 'loading' ? 'opacity-40 pointer-events-none' :''}`}>
              <label htmlFor="" className="text-gray-950 font-semibold">Votre adresse Mail ou votre Nom utilisateur<br/>
                <input type="text" className="border px-3 rounded-md py-1 w-120 mb-4" required placeholder="Entrer votre identifiant" name="email" 
      /* AJOUTE CECI */ onChange={handleChange} />
              </label>
              <label htmlFor=""  className="text-gray-950 font-semibold">Votre mot de passe<br/>
                <input type="text" className="border px-3 rounded-md py-1 w-120 mb-4" required placeholder="password" name="password" value={formData.password} onChange={handleChange}/>
              </label>
              {status === 'error' && (
                  <p className="text-red-500 text-xs text-center mb-4 font-semibold">
                    {loginError || "Email ou mot de passe incorrect"}
                  </p>
              )}
              <button 
                className="bg-amber-700 rounded-md py-1 text-gray-50 font-stretch-100% hover:bg-gray-50 hover:text-amber-700 mb-4 hover:border hover:border-gray-700 cursor-pointer"
                type="submit"
                disabled= {status === 'loading'}

              >
                {status === 'loading' ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader className="animate-spin" size={18} /> Connexion...
                  </span>
                ) : (
                          "Se connecter"
                )}
              </button>
            </form>
            <button className="text-gray-400 ml-2 cursor-pointer hover:brightness-50 hover:underline">Avez-vous oublié votre mot de passe</button>
            <div className="flex my-4">
              <p className="text-gray-950">Pas encore de compte ?</p>
              <button onClick={()=>{setActiveForm('director');SetStatus('idle')}} className="text-amber-700 ml-2 cursor-pointer hover:brightness-50 hover:underline">Inscrivez votre entreprise</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default accueil
