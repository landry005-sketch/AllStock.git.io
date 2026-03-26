import React, { useState, type ReactNode } from 'react'
import AnimationBackground from './pages/AnimationBackground';
import FeatureCard from './components/ui/FeatureCard';
import AccordionItem from './components/ui/AccordionItem';
import StatItem from './components/ui/StatItem';

const Landing = () => {

  return (
    
    <div className="min-h-screen min-w-screen relative bg-gray-50 text-center font-sans text-slate-900 selection:bg-indigo-100">
      {/* Navigation / Logo */}
      <AnimationBackground/>
      <nav className="max-w-7xl mx-auto px-8 py-10 flex justify-between items-center">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="w-10 h-10 bg-[#5d5cde] rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform duration-300">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
              <line x1="12" y1="22.08" x2="12" y2="12"></line>
            </svg>
          </div>
          <span className="text-2xl font-extrabold tracking-tight text-[#1e293b]">AllStock</span>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="max-w-5xl mx-auto px-6 pt-12 pb-24 text-center relative">
        <div className="inline-block px-4 py-1.5 mb-6 text-sm font-semibold text-[#5d5cde] bg-blue-50 rounded-full border border-blue-100 animate-pulse">
          Nouveauté : Analyses Prédictives par IA disponibles
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold mb-8 leading-[1.15] bg-linear-to-r from-slate-900 to-[#5d5cde] bg-clip-text text-transparent">
          L'intelligence au service <br />de votre inventaire.
        </h1>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-12 leading-relaxed">
          AllStock transforme la complexité de votre logistique en un avantage compétitif. Un outil complet, intuitif et puissant pour piloter votre croissance.
        </p>
        
        <div className="flex flex-col items-center gap-6">
          <button 
            onClick={() => window.location.href = '/accueil'} 
            className="group relative bg-[#5d5cde] text-white px-12 py-5 rounded-2xl text-lg font-bold shadow-xl hover:shadow-indigo-200 hover:scale-[1.02] transition-all duration-300 overflow-hidden"
          >
            <span className="relative z-10">Commencer mon essai gratuit</span>
            <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
          </button>
          <p className="text-sm text-slate-400 flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-500"><polyline points="20 6 9 17 4 12"></polyline></svg>
            14 jours gratuits, puis abonnement flexible.
          </p>
        </div>
      </header>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Fonctionnalités avancées</h2>
          <div className="w-20 h-1.5 bg-[#5d5cde] mx-auto rounded-full"></div>
        </div>

        <div className="grid lg:grid-cols-2 gap-10">
          <FeatureCard 
            icon={<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />}
            title="Traçabilité Multi-Dimensionnelle"
            description="Ne perdez plus jamais un produit de vue. Gérez les numéros de série, les dates de péremption (FEFO/FIFO) et les numéros de lots sur plusieurs zones de stockage."
            tags={["Scan QR & Code-barres", "Multi-entrepôts"]}
            color="text-[#5d5cde]"
            bgColor="bg-blue-50"
          />
          <FeatureCard 
            icon={<polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />}
            title="Algorithmes de Prévision IA"
            description="Notre IA analyse vos historiques de vente et les tendances saisonnières pour prédire vos besoins futurs. Évitez les ruptures et le surstockage inutile."
            tags={["Analyses saisonnières", "Alertes intelligentes"]}
            color="text-green-600"
            bgColor="bg-green-50"
          />
          <FeatureCard 
            icon={<><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><polyline points="16 11 18 13 22 9" /></>}
            title="Flux de Travail Collaboratifs"
            description="Attribuez des tâches, validez les bons de commande et communiquez en temps réel avec vos équipes logistiques via un tableau de bord partagé."
            tags={["Rôles personnalisés", "Logs d'activité"]}
            color="text-purple-600"
            bgColor="bg-purple-50"
          />
          <FeatureCard 
            icon={<><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></>}
            title="Écosystème Connecté"
            description="Synchronisation native avec Shopify, Amazon, WooCommerce et vos outils comptables habituels. Centralisez tout, ne ressaisissez plus rien."
            tags={["API Ouverte", "Cloud Sync"]}
            color="text-orange-600"
            bgColor="bg-orange-50"
          />
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-[#1e293b] py-24 text-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="grid md:grid-cols-3 gap-12">
            <StatItem value="10k+" label="Entreprises nous font confiance" />
            <StatItem value="50M+" label="Articles suivis quotidiennement" />
            <StatItem value="99.9%" label="Temps de disponibilité garanti" />
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-4xl mx-auto px-6 py-24">
        <h2 className="text-3xl font-bold text-center mb-12">Questions fréquentes</h2>
        <div className="space-y-4">
          <AccordionItem 
            title="L'essai est-il vraiment gratuit ?" 
            content="Oui, pendant 14 jours, vous avez accès à l'intégralité des fonctionnalités premium d'AllStock. Aucune carte de crédit n'est requise pour commencer."
          />
          <AccordionItem 
            title="Puis-je importer mes données existantes ?" 
            content="Absolument. Nous supportons l'import massif via fichiers CSV et Excel, ainsi que des connecteurs directs pour les plateformes e-commerce majeures."
          />
        </div>
      </section>

      {/* CTA Footer */}
      <section className="max-w-7xl mx-auto px-6 mb-24">
        <div className="bg-linear-to-br from-[#5d5cde] to-[#4a49b8] rounded-[40px] p-12 md:p-20 text-center text-white shadow-2xl relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-black mb-6 leading-tight">Prêt à transformer <br />votre logistique ?</h2>
            <p className="text-xl text-blue-100 mb-10 max-w-xl mx-auto">Rejoignez la nouvelle ère de la gestion de stock dès aujourd'hui.</p>
            <button className="bg-white text-[#5d5cde] px-12 py-5 rounded-2xl text-lg font-bold shadow-xl hover:bg-blue-50 transition-colors" onClick={() => {window.location.href='/accueil'}}>
              Commencer maintenant
            </button>
          </div>
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl"></div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-100 py-16">
        <div className="max-w-7xl mx-auto px-8 grid md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-[#5d5cde] rounded-lg flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>
              </div>
              <span className="text-xl font-bold">AllStock</span>
            </div>
            <p className="text-slate-500 max-w-sm">La plateforme de gestion de stock nouvelle génération pour les entreprises ambitieuses.</p>
          </div>
          <div>
            <h4 className="font-bold mb-6 text-slate-900">Produit</h4>
            <ul className="space-y-4 text-slate-500 text-sm">
              <li className="hover:text-[#5d5cde] cursor-pointer">Fonctionnalités</li>
              <li className="hover:text-[#5d5cde] cursor-pointer">Tarifs</li>
              <li className="hover:text-[#5d5cde] cursor-pointer">Sécurité</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-6 text-slate-900">Support</h4>
            <ul className="space-y-4 text-slate-500 text-sm">
              <li className="hover:text-[#5d5cde] cursor-pointer">Contact</li>
              <li className="hover:text-[#5d5cde] cursor-pointer">Centre d'aide</li>
              <li className="hover:text-[#5d5cde] cursor-pointer">API</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-8 mt-16 pt-8 border-t border-slate-50 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-400 font-medium">
          <p>© 2025 AllStock. Tous droits réservés.</p>
          <div className="flex gap-6">
            <span className="hover:text-[#5d5cde] cursor-pointer">Confidentialité</span>
            <span className="hover:text-[#5d5cde] cursor-pointer">CGU</span>
            <span className="hover:text-[#5d5cde] cursor-pointer">Mentions légales</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Sous-composant pour les cartes de fonctionnalités

<FeatureCard icon={undefined} title={''} description={''} tags={[]} color={''} bgColor={''}/>
// Sous-composant pour les statistiques


// Sous-composant Accordéon pour la FAQ


export default Landing
