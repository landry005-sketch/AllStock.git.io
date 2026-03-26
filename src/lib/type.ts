export type UserRole = 'ADMIN' | 'MANAGER' | 'STAFF' | ''; // Ajoute '' pour ton état initial

export interface User {
  id: string;
  password: string,
  identifier:string,
  username:string;
  name: string;
  email: string;
  role: UserRole;
  orgCode?: string;
  orgName?: string;
  photo?: string;
  logoUrl?: string;
  loginTime?: string;
  logoutTime?: string;
  isOnline?: boolean;
  lastActivity?: string;
}

export function canAccessUsers(role: UserRole): boolean {
  return role === "ADMIN" || role === "MANAGER";
}

export function canAccessSuppliers(role: UserRole): boolean {
  return role === "ADMIN" || role === "MANAGER";
}

export function canDeleteStaff(role: UserRole): boolean {
  return role === "ADMIN" || role === "MANAGER";
}

export function canDeleteManager(role: UserRole): boolean {
  return role === "ADMIN";
}

export function canManageOrders(role: UserRole): boolean {
  return role === "ADMIN" || role === "MANAGER";
}

export interface Product {
  id: string;
  name: string;
  category: string;
  quantity: number;
  purchasePrice: number; // Prix d'achat
  sellingPrice: number; // Prix de revente
  supplier: string;
  expiryDate: string;
  storageZone: string;
  qrCode: string;
  sales: number;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  productCount: number;
}

export interface Supplier {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  productsSupplied: number;
}

export interface Sale {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  totalPrice: number;
  customerName: string;
  soldBy: string;
  date: string;
  invoiceNumber: string;
}

export interface userSession {
  id: number;
  name: string;
  role: string;
  loginTime?: string |null;
  logoutTime?: string | null;
}

export interface dashboardResponse {
  product : Product[];
  user: userSession[];
  timeStamp: Date;
}
export interface DashboardUser {
  id: number;
  name: string;
  role: 'ADMIN' | 'MANAGER' | 'STAFF';
  orgCode: string;
}
