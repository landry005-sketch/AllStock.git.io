import { useEffect, useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router";
import { 
  Package, 
  LayoutDashboard, 
  ShoppingCart, 
  Users, 
  Truck, 
  Settings, 
  LogOut,
  Menu,
  FolderTree
} from "lucide-react";
import type { User } from "@/lib/type";
import UserAvatar from "@/components/UserAvatar";
import { Button } from "@/components/ui/button";
import OrgLogo from "@/components/OrgLogo";



export default function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    const userStr = localStorage.getItem("currentUser");
    if (!userStr) {
      navigate("/login");
      return;
    }
    setCurrentUser(JSON.parse(userStr));
  }, [navigate]);

  const handleLogout = () => {
    const user = currentUser;
    if (user) {
      // Mettre à jour l'heure de déconnexion
      const updatedUser = {
        ...user,
        logoutTime: new Date().toISOString(),
      };
      localStorage.setItem("currentUser", JSON.stringify(updatedUser));
    }
    localStorage.removeItem("currentUser");
    navigate("/");
  };

  if (!currentUser) {
    return null;
  }

  const menuItems = [
    { icon: LayoutDashboard, label: "Tableau de bord", path: "/dashboard", roles: ["admin", "manager", "staff"] },
    { icon: Package, label: "Produits", path: "/dashboard/products", roles: ["admin", "manager", "staff"] },
    { icon: FolderTree, label: "Catégories", path: "/dashboard/categories", roles: ["admin", "manager", "staff"] },
    { icon: Users, label: "Utilisateurs", path: "/dashboard/users", roles: ["admin", "manager"] },
    { icon: Truck, label: "Fournisseurs", path: "/dashboard/suppliers", roles: ["admin", "manager"] },
    { icon: ShoppingCart, label: "Ventes", path: "/dashboard/sales", roles: ["admin", "manager", "staff"] },
    { icon: Settings, label: "Paramètres", path: "/dashboard/settings", roles: ["admin", "manager", "staff"] },
  ];

  const filteredMenuItems = menuItems.filter((item) =>
    item.roles.includes(currentUser.role)
  );

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-700";
      case "manager":
        return "bg-blue-100 text-blue-700";
      case "staff":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="flex h-screen w-screen bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`${
          isSidebarOpen ? "w-64" : "w-0"
        } bg-white shadow-lg transition-all duration-300 overflow-hidden`}
      >
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <Package className="w-8 h-8 text-indigo-600" />
            <h1 className="text-2xl text-indigo-600">AllStock</h1>
          </div>

          {/* User Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3 mb-2">
              <UserAvatar 
                name={currentUser.name} 
                photoUrl={currentUser.photo}
                size="md"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm truncate">{currentUser.name}</p>
                <p className="text-xs text-gray-500 truncate">{currentUser.email}</p>
              </div>
            </div>
            <span className={`inline-block px-2 py-1 text-xs rounded ${getRoleBadgeColor(currentUser.role)}`}>
              {currentUser.role.toUpperCase()}
            </span>
          </div>

          {/* Navigation */}
          <nav className="space-y-2">
            {filteredMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Button
                  key={item.path}
                  variant={isActive ? "default" : "ghost"}
                  className={`w-full justify-start ${
                    isActive ? "bg-indigo-600 text-white" : ""
                  }`}
                  onClick={() => navigate(item.path)}
                >
                  <Icon className="w-4 h-4 mr-3" />
                  {item.label}
                </Button>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="mt-8 pt-6 border-t">
            <Button
              variant="outline"
              className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-3" />
              Déconnexion
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white shadow-sm p-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <Menu className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm">{currentUser.orgName}</p>
                <p className="text-xs text-gray-500">Code: {currentUser.orgCode}</p>
              </div>
              <OrgLogo 
                logoUrl={currentUser.logoUrl} 
                orgName={currentUser.orgName || "Mon entreprise"}
                size="md"
              />
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
