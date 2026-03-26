import React, { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router';
import { 
  LayoutDashboard, Package, FolderTree, Users, 
  Truck, ShoppingCart, Settings, LogOut, Menu, 
  Scan
} from 'lucide-react';

import OrgLogo from '@/components/OrgLogo';
import { Button } from '@/components/ui/button';
import UserAvatar from '@/components/UserAvatar';
import type { User } from '@/lib/type';

const DashboardLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const syncUser = async () => {
      const userStr = localStorage.getItem("currentUser");
      const token = localStorage.getItem("token");

      if (!userStr || !token) {
        navigate("/login");
        return;
      }

      const storedUser = JSON.parse(userStr);

      try {
        // APPEL API : On récupère les données fraîches
        // Note : Assure-toi que ton backend a bien le slash dans router.get('/profile/:id', ...)
        const response = await fetch(`http://localhost:5000/api/user/profile/${storedUser.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const fullData = await response.json();
          console.log("✅ Profil synchronisé :", fullData);
          setCurrentUser(fullData);
          localStorage.setItem("currentUser", JSON.stringify(fullData));
        } else {
          console.warn("⚠️ Échec synchro (Status:", response.status, "). Utilisation données locales.");
          setCurrentUser(storedUser);
          
          // Si le token est expiré (401/403), on déconnecte
          if (response.status === 401 || response.status === 403) {
            handleLogout();
          }
        }
      } catch (error) {
        console.error("❌ Erreur de synchronisation profil:", error);
        setCurrentUser(storedUser);
      } finally {
        setIsLoading(false);
      }
    };

    syncUser();
  }, [navigate]);

  const handleLogout = () => {
    if (currentUser) {
      const updatedUser = {
        ...currentUser,
        logoutTime: new Date().toISOString(),
      };
      localStorage.setItem("currentUser", JSON.stringify(updatedUser));
    }
    localStorage.removeItem("currentUser");
    localStorage.removeItem("token");
    navigate("/");
  };

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-50 text-indigo-600 font-medium">
        Chargement de l'espace StockFlow...
      </div>
    );
  }

  if (!currentUser) return null;

  const menuItems = [
    { icon: LayoutDashboard, label: "Tableau de bord", path: "/dashboard", roles: ["ADMIN", "MANAGER", "STAFF"] },
    { icon: Package, label: "Produits", path: "/dashboard/produits", roles: ["ADMIN", "MANAGER", "STAFF"] },
    { icon: FolderTree, label: "Catégories", path: "/dashboard/categories", roles: ["ADMIN", "MANAGER", "STAFF"] },
    { icon: Users, label: "Utilisateurs", path: "/dashboard/users", roles: ["ADMIN", "MANAGER"] },
    { icon: Truck, label: "Fournisseurs", path: "/dashboard/suppliers", roles: ["ADMIN", "MANAGER"] },
    {icon: Scan, label: "Scan facture", path:"/dashboard/scan", roles:["ADMIN", "MANAGER", "STAFF"]},
    { icon: ShoppingCart, label: "Ventes", path: "/dashboard/sales", roles: ["ADMIN", "MANAGER", "STAFF"] },
    { icon: Settings, label: "Paramètres", path: "/dashboard/settings", roles: ["ADMIN", "MANAGER", "STAFF"] },
  ];

  // Filtrage basé sur le rôle avec protection
  const filteredMenuItems = menuItems.filter((item) => {
    const userRole = currentUser?.role?.toUpperCase();
    return userRole && item.roles.includes(userRole);
  });

  const getRoleBadgeColor = (role: string) => {
    switch (role?.toUpperCase()) {
      case "ADMIN": return "bg-red-100 text-red-700";
      case "MANAGER": return "bg-blue-100 text-blue-700";
      case "STAFF": return "bg-green-100 text-green-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="flex w-screen h-screen bg-gray-100 overflow-hidden">
      {/* SIDEBAR */}
      <aside className={`${isSidebarOpen ? "w-64" : "w-0"} bg-white shadow-lg transition-all duration-300 overflow-hidden dark:text-amber-900 dark:bg-[#0f172a] dark:border-slate-800 flex flex-col`}>
        <div className="p-6 flex-1 overflow-y-auto">
          {/* Logo App */}
          <div className="flex items-center gap-3 mb-8">
            <Package className="w-8 h-8 text-indigo-600" />
            <h1 className="text-2xl font-bold text-indigo-600">AllStock</h1>
          </div>

          {/* User Profile Card */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6 border dark:border-0 dark:bg-[#0f172a] border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <UserAvatar name={currentUser.name} photoUrl={currentUser.logoUrl} size="md" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{currentUser.name}</p>
                <p className="text-xs text-gray-500 truncate">{currentUser.email}</p>
              </div>
            </div>
            <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider ${getRoleBadgeColor(currentUser.role)}`}>
              {currentUser.role || "Inconnu"}
            </span>
          </div>

          {/* Navigation */}
          <nav className="space-y-1 ">
            {filteredMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Button
                  key={item.path}
                  variant={isActive ? "secondary" : "ghost"}
                  className={`w-full justify-start gap-3 ${isActive ? "bg-indigo-50  dark:bg-indigo-500/10 dark:text-indigo-400 text-indigo-700 font-medium" : "text-gray-600  hover:text-indigo-600 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-200"}`}
                  onClick={() => navigate(item.path)}
                >
                  <Icon 
                   key={item.path}
                  
                  className={`
                    w-5 h-5 transition-colors
                    ${isActive 
                      ? "text-indigo-600 dark:text-indigo-400" 
                      : "text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300"
                    }
                  `} />
                  <span className="font-medium">{item.label}</span>
                </Button>
              );
            })}
          </nav>
        </div>

        {/* Logout Bottom */}
        <div className="p-4 border-t border-gray-100">
          <Button variant="ghost" className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors" onClick={handleLogout}>
            <LogOut className="w-5 h-5 mr-3" />
            Déconnexion
          </Button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden ">
        {/* Top Header Bar */}
        <header className="bg-white  border-b dark:border-slate-800 border-gray-200 h-16 flex backdrop-blur-mditems-center px-6 dark:bg-[#020617]/80">
          <div className="flex items-center justify-between w-full">
            <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-gray-500">
              <Menu className="w-6 h-6" />
            </Button>

            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-gray-800 dark:text-blue-500">{currentUser.orgName || "Ma Structure"}</p>
                {currentUser.role === "ADMIN" && (
                  <p className="text-[10px] text-gray-400 font-mono tracking-tighter">ID: {currentUser.orgCode || "---"}</p>
                )}
              </div>
              <OrgLogo logoUrl={currentUser.logoUrl} orgName={currentUser.orgName || "AllStock"} size="md" />
            </div>
          </div>
        </header>

        {/* Page Content Rendering */}
        <main className="flex-1 overflow-y-auto p-8 dark:bg-[#020617] dark:text-slate-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;