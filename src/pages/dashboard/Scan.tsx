import React, { useRef, useState, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import { toast } from 'react-toastify';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Camera, Upload, Loader2, Save, RotateCcw, CheckCircle2, Scan } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import BarreCodeScanner from '../CodeScan';

const ScanProduct = () => {
    const webcamRef = useRef<Webcam>(null);
    const [isScanning, setIsScanning] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);
    const [preview, setPreview] = useState<string | null>(null);
    const [newProduct, setNewProduct] = useState({
        name: "",
        category_id: "",
        quantity: 0,
        purchasePrice: 0,
        sellingPrice: 0,
        supplier: "",
        expiryDate: "",
        storageZone: "",
    });
    
    // État pour stocker les données extraites par Gemini pour modification
    const [scannedData, setScannedData] = useState<any>(null);
    useEffect(() => {
        const userStr = localStorage.getItem("currentUser");
        if (userStr) {
          const user = JSON.parse(userStr);
        
          fetchCategories(user.orgCode);
        }
    }, []);
    
  const fetchCategories = async (orgId: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/stock/getCategory?org_id=${orgId}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error("Erreur catégories:", error);
    }
  };

    // 1. Analyse Gemini (Extraction seule)
    const sendToGemini = async (imageBlob: Blob) => {
        setIsScanning(true);
        const idToast = toast.loading("Gemini analyse le document...");

        try {
            const formData = new FormData();
            formData.append('image', imageBlob, 'scan.jpg');

            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/stock/scan-receipt', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            const result = await response.json();

            if (response.ok) {
                toast.update(idToast, { render: "Analyse terminée ! Vérifiez les données.", type: "success", isLoading: false, autoClose: 2000 });
                setScannedData(result.data); 
            } else {
                throw new Error(result.error || "Erreur d'analyse");
            }
        } catch (error: any) {
            toast.update(idToast, { render: error.message, type: "error", isLoading: false, autoClose: 3000 });
        } finally {
            setIsScanning(false);
        }
    };

    const handleConfirmSave = async () => {
        setIsSaving(true);
        const idToast = toast.loading("Enregistrement en cours...");

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/stock/confirm-save', {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(scannedData)
            });

            if (response.ok) {
                toast.update(idToast, { render: "Stock mis à jour avec succès !", type: "success", isLoading: false, autoClose: 3000 });
                setScannedData(null); // On ferme le formulaire
                setPreview(null);
            } else {
                const err = await response.json();
                throw new Error(err.error || "Erreur lors de l'enregistrement");
            }
        } catch (error: any) {
            toast.update(idToast, { render: error.message, type: "error", isLoading: false, autoClose: 3000 });
        } finally {
            setIsSaving(false);
        }
    };
    const handleProductChange = (index: number, field: string, value: any) => {
        const newData = { ...scannedData };
        newData.produits[index][field] = value;
        setScannedData(newData);
    };

    const handleCapture = useCallback(() => {
        const imageSrc = webcamRef.current?.getScreenshot();
        if (imageSrc) {
            setPreview(imageSrc);
            fetch(imageSrc).then(res => res.blob()).then(sendToGemini);
        }
    }, [webcamRef]);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result as string);
            reader.readAsDataURL(file);
            sendToGemini(file);
        }
    };

    return (
        <div className="space-y-6 w-full max-w-4xl mx-auto">
            {/* SECTION 1 : INTERFACE DE CAPTURE */}
            <Card className="border-2 border-primary/10 dark:bg-[#0f172a]">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Camera className="text-primary w-6 h-6" /> Entrée de Stock via IA
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="upload" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-6">
                            <TabsTrigger value="camera" className="gap-2"><Camera className="w-4 h-4" /> Caméra</TabsTrigger>
                            <TabsTrigger value="upload" className="gap-2"><Upload className="w-4 h-4" /> Fichier</TabsTrigger>
                        </TabsList>

                        <TabsContent value="camera" className="space-y-4">
                            <div className="relative overflow-hidden rounded-lg border bg-muted aspect-video">
                                <Webcam ref={webcamRef} screenshotFormat="image/jpeg" className="w-full h-full object-cover" />
                                {isScanning && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-background/40 backdrop-blur-md">
                                        <Loader2 className="w-12 h-12 animate-spin text-primary" />
                                    </div>
                                )}
                            </div>
                            <Button onClick={handleCapture} disabled={isScanning} className="w-full">
                                {isScanning ? "Analyse..." : "Capturer l'image"}
                            </Button>
                        </TabsContent>

                        <TabsContent value="upload">
                            <label htmlFor="picture" className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-muted hover:bg-muted/80">
                                <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                                <span className="text-sm">Cliquez pour uploader le reçu</span>
                                <input id="picture" type="file" className="hidden" onChange={handleFileUpload} disabled={isScanning} />
                            </label>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

            {/* SECTION 2 : FORMULAIRE DE VALIDATION (S'affiche après scan) */}
            {scannedData && (
                <Card className="border-2 dark:bg-[#0f172a] border-green-500/20 shadow-xl animate-in fade-in slide-in-from-bottom-4">
                    <CardHeader className="bg-green-500/5">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-green-700">Vérification des données</CardTitle>
                                <CardDescription>Complétez les champs vides ou corrigez les erreurs de l'IA.</CardDescription>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => setScannedData(null)}>
                                    <RotateCcw className="w-4 h-4 mr-2" /> Réinitialiser
                                </Button>
                                <Button size="sm" onClick={handleConfirmSave} disabled={isSaving} className="bg-green-600 hover:bg-green-700">
                                    {isSaving ? <Loader2 className="animate-spin" /> : <Save className="w-4 h-4 mr-2" />} 
                                    Confirmer 
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-muted-foreground">Fournisseur</label>
                                <Input 
                                    placeholder="Nom du fournisseur"
                                    value={scannedData.fournisseur?.nom || ""}
                                    onChange={(e) => setScannedData({...scannedData, fournisseur: {...scannedData.fournisseur, nom: e.target.value}})}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-muted-foreground">Organisation Détectée</label>
                                <Input value={scannedData.orgName_detecte || "Inconnue"} disabled className="bg-muted" />
                            </div>
                        </div>

                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Produit</TableHead>
                                    <TableHead className="w-24">Quantité</TableHead>
                                    <TableHead className="w-32">Prix Unitaire</TableHead>
                                    <TableHead>Code Barre</TableHead>
                                    <TableHead>Categorie du produit</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {scannedData.produits.map((prod: any, idx: number) => (
                                    <TableRow key={idx}>
                                        <TableCell>
                                            <Input value={prod.nom} onChange={(e) => handleProductChange(idx, 'nom', e.target.value)} />
                                        </TableCell>
                                        <TableCell>
                                            <Input type="number" value={prod.quantite} onChange={(e) => handleProductChange(idx, 'quantite', e.target.value)} />
                                        </TableCell>
                                        <TableCell>
                                            <Input type="number" value={prod.prix_achat_unitaire} onChange={(e) => handleProductChange(idx, 'prix_achat_unitaire', e.target.value)} />
                                        </TableCell>
                                        <TableCell>
                                            <Input type='text' value={prod.zone_stockage} onChange={(e) =>handleProductChange(idx, 'zone_stockage', e.target.value)}/>
                                        </TableCell>
                                       <TableCell className="relative">
                                            <div className="flex items-center gap-2">
                                                <Input 
                                                    value={prod.code_barre} 
                                                    placeholder="Code-barres"
                                                    onChange={(e) => handleProductChange(idx, 'code_barre', e.target.value)} 
                                                    className="dark:bg-slate-950 dark:border-slate-800"
                                                />
    

                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button 
                                                            variant="outline" 
                                                            size="icon" 
                                                            className="shrink-0 dark:bg-slate-900 dark:hover:bg-indigo-900/20 dark:border-slate-800"
                                                        >
                                                            <Scan className="h-4 w-4 text-indigo-500" />
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent className="sm:max-w-106.25 dark:bg-[#020617] dark:border-slate-800">
                                                        <DialogHeader>
                                                            <DialogTitle className="dark:text-white">Scanner le produit</DialogTitle>
                                                                <DialogDescription>
                                                                    Scannez le code-barres pour l'ajouter à la ligne {idx + 1}.
                                                                </DialogDescription>
                                                        </DialogHeader>
                                                        <div className="py-4">
                                                            <BarreCodeScanner 
                                                                onScanSuccess={(decodedText) => {
                                                                    handleProductChange(idx, 'code_barre', decodedText);
                                                                }} 
                                                            />
                                                        </div>
                                                    </DialogContent>
                                                </Dialog>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Select value={newProduct.category_id} onValueChange={(val) => setNewProduct({ ...newProduct, category_id: val })}>
                                                <SelectTrigger><SelectValue placeholder="Choisir..." /></SelectTrigger>
                                                <SelectContent>
                                                    {categories.map((cat) => (
                                                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default ScanProduct;