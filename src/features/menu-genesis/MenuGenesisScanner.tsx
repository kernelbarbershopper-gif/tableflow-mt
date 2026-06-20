'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Camera, FileText, CheckCircle, AlertCircle, Loader2, Sparkles, RotateCcw, X, Eye, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { nvidiaAI, NVIDIA_PROMPTS } from '@lib/nvidia-ai';
import { toast } from 'sonner';

interface MenuItemDetected {
  name: string;
  description?: string;
  price: number;
  category: string;
  allergens: string[];
  dietaryTags: string[];
  prepTimeMinutes: number;
  station: string;
  imageUrl?: string;
}

interface GenesisResult {
  items: MenuItemDetected[];
  categories: string[];
  confidence: number;
  rawText: string;
}

const ALLERGENS = ['glúten', 'lactose', 'nozes', 'frutos_do_mar', 'ovo', 'soja', 'amendoim', 'sésamo'] as const;
const DIETARY_TAGS = ['vegetariano', 'vegano', 'sem_gluten', 'low_carb', 'keto', 'apimentado', 'saudavel'] as const;
const STATIONS = ['grill', 'fryer', 'salad', 'bar', 'dessert', 'cold_prep'] as const;
const CATEGORIES = ['Entradas', 'Pratos Principais', 'Sobremesas', 'Bebidas', 'Acompanhamentos'] as const;

export function MenuGenesisScanner({ onComplete }: { onComplete: (items: MenuItemDetected[], categories: string[]) => void }) {
  const [stage, setStage] = useState<'upload' | 'processing' | 'review' | 'complete'>('upload');
  const [files, setFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [result, setResult] = useState<GenesisResult | null>(null);
  const [editedItems, setEditedItems] = useState<MenuItemDetected[]>([]);
  const [editedCategories, setEditedCategories] = useState<string[]>([]);
  const [progress, setProgress] = useState({ stage: '', percent: 0 });
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const validFiles = acceptedFiles.filter(f => f.type.startsWith('image/') || f.type === 'application/pdf');
    if (validFiles.length !== acceptedFiles.length) {
      toast.warning('Alguns arquivos não são imagens ou PDFs e foram ignorados');
    }
    setFiles(validFiles);
    const urls = validFiles.map(f => URL.createObjectURL(f));
    setPreviewUrls(urls);
    setStage('upload');
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'image/*': [], 'application/pdf': [] } });

  useEffect(() => () => previewUrls.forEach(URL.revokeObjectURL), [previewUrls]);

  const processImages = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    setStage('processing');

    try {
      const base64Images = await Promise.all(files.map(fileToBase64));
      
      setProgress({ stage: 'Enviando para IA NVIDIA...', percent: 20 });
      
      const response = await nvidiaAI.visionCompletion({
        messages: [
          { role: 'system', content: NVIDIA_PROMPTS.MENU_GENESIS.system },
          { role: 'user', content: [
            { type: 'text', text: NVIDIA_PROMPTS.MENU_GENESIS.user('') },
            ...base64Images.map((b64) => ({ type: 'image_url', image_url: { url: `data:image/jpeg;base64,${b64}` } }))
          ]}
        ],
        model: 'nvidia/cosmos-1.0-diffusion-7b',
        temperature: 0.1,
        maxTokens: 8192,
      });

      setProgress({ stage: 'Processando resposta da IA...', percent: 60 });

      const content = response.choices[0]?.message?.content;
      if (!content) throw new Error('Resposta vazia da IA');

      let parsed: GenesisResult;
      try {
        parsed = JSON.parse(content);
      } catch {
        const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[1]);
        } else {
          throw new Error('Formato JSON inválido na resposta');
        }
      }

      const validatedItems: MenuItemDetected[] = parsed.items
        .filter((item: any) => item.name && item.price > 0)
        .map((item: any) => ({
          name: item.name.trim(),
          description: item.description?.trim() || '',
          price: Math.round(Number(item.price) * 100),
          category: CATEGORIES.includes(item.category) ? item.category : 'Outros',
          allergens: (item.allergens || []).filter((a: string) => ALLERGENS.includes(a as any)),
          dietaryTags: (item.dietaryTags || []).filter((t: string) => DIETARY_TAGS.includes(t as any)),
          prepTimeMinutes: Math.max(0, Math.min(120, Number(item.prepTimeMinutes) || 0)),
          station: STATIONS.includes(item.station) ? item.station : 'cold_prep',
          imageUrl: item.imageUrl,
        }));

      const validatedCategories = [...new Set([
        ...CATEGORIES.filter(c => validatedItems.some(i => i.category === c)),
        ...parsed.categories.filter((c: string) => !CATEGORIES.includes(c) && validatedItems.some(i => i.category === c))
      ])];

      const finalResult: GenesisResult = {
        items: validatedItems,
        categories: validatedCategories,
        confidence: parsed.confidence || 0.85,
        rawText: parsed.rawText || '',
      };

      setResult(finalResult);
      setEditedItems(validatedItems);
      setEditedCategories(validatedCategories);
      setStage('review');
      setProgress({ stage: 'Concluído', percent: 100 });
      toast.success(`${validatedItems.length} itens extraídos com ${Math.round(finalResult.confidence * 100)}% de confiança`);
    } catch (error) {
      console.error('Menu Genesis error:', error);
      toast.error(error instanceof Error ? error.message : 'Falha ao processar cardápio');
      setStage('upload');
    } finally {
      setIsProcessing(false);
    }
  };

  const updateItem = (index: number, field: keyof MenuItemDetected, value: any) => {
    setEditedItems(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));
  };

  const addCategory = () => {
    const newCat = `Nova Categoria ${editedCategories.length + 1}`;
    setEditedCategories(prev => [...prev, newCat]);
  };

  const removeCategory = (cat: string) => {
    setEditedCategories(prev => prev.filter(c => c !== cat));
    setEditedItems(prev => prev.map(item => item.category === cat ? { ...item, category: 'Outros' } : item));
  };

  const confirmAndSave = () => {
    onComplete(editedItems, editedCategories);
    setStage('complete');
    toast.success('Cardápio importado com sucesso!');
  };

  const reset = () => {
    setFiles([]);
    setPreviewUrls([]);
    setResult(null);
    setEditedItems([]);
    setEditedCategories([]);
    setStage('upload');
  };

  if (stage === 'complete') {
    return (
      <Card className="w-full max-w-4xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle>Cardápio Importado!</CardTitle>
          <CardDescription>{editedItems.length} itens em {editedCategories.length} categorias prontos para usar</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center gap-4">
          <Button variant="outline" onClick={reset} size="lg">
            <RotateCcw className="w-4 h-4 mr-2" /> Importar Outro
          </Button>
          <Button onClick={() => onComplete(editedItems, editedCategories)} size="lg">
            Finalizar Configuração
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-center gap-2">
        {['upload', 'processing', 'review', 'complete'].map((s, i) => (
          <React.Fragment key={s}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
              ['upload', 'processing', 'review'].indexOf(stage) >= i 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted text-muted-foreground'
            }`}>
              {['upload', 'processing', 'review'].indexOf(stage) > i ? <CheckCircle className="w-5 h-5" /> : i + 1}
            </div>
            {i < 3 && <div className={`w-16 h-1 ${['upload', 'processing', 'review'].indexOf(stage) > i ? 'bg-primary' : 'bg-border'}`} />}
          </React.Fragment>
        ))}
      </div>

      {isProcessing && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>{progress.stage}</span>
            <span>{progress.percent}%</span>
          </div>
          <Progress value={progress.percent} className="h-2" />
        </div>
      )}

      {stage === 'upload' && (
        <Card className={isDragActive ? 'ring-2 ring-primary ring-offset-2' : ''} {...getRootProps()}>
          <CardContent className="p-12 text-center">
            <input {...getInputProps()} ref={fileInputRef} />
            <div className="mx-auto mb-4 w-20 h-20 bg-muted rounded-full flex items-center justify-center">
              <Upload className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Arraste fotos do cardápio aqui</h3>
            <p className="text-muted-foreground mb-6">Ou clique para selecionar arquivos (JPG, PNG, PDF - máx. 10MB cada)</p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                <FileText className="w-4 h-4 mr-2" /> Selecionar Arquivos
              </Button>
              <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
                <Camera className="w-4 h-4 mr-2" /> Tirar Foto
              </Button>
            </div>
            {files.length > 0 && (
              <div className="mt-6 space-y-2 text-left max-h-60 overflow-y-auto">
                {files.map((f, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 bg-muted rounded-lg">
                    <FileText className="w-5 h-5 text-muted-foreground" />
                    <span className="flex-1 text-sm truncate">{f.name}</span>
                    <span className="text-xs text-muted-foreground">{(f.size / 1024 / 1024).toFixed(1)} MB</span>
                  </div>
                ))}
              </div>
            )}
            {files.length > 0 && !isProcessing && (
              <Button className="mt-6 w-full" size="lg" onClick={processImages} disabled={isProcessing}>
                <Sparkles className="w-4 h-4 mr-2" /> Processar com IA NVIDIA
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {stage === 'processing' && (
        <Card>
          <CardContent className="p-12 text-center">
            <Loader2 className="mx-auto mb-4 w-12 h-12 text-primary animate-spin" />
            <h3 className="text-lg font-semibold mb-2">Processando com IA NVIDIA...</h3>
            <p className="text-muted-foreground">{progress.stage}</p>
            <Progress value={progress.percent} className="mt-4 h-3" />
          </CardContent>
        </Card>
      )}

      {stage === 'review' && result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Categorias ({editedCategories.length})
                <Button variant="ghost" size="sm" onClick={addCategory}>
                  <Sparkles className="w-4 h-4 mr-1" /> Adicionar
                </Button>
              </CardTitle>
              <CardDescription>Gerencie categorias do cardápio</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {editedCategories.map((cat, i) => (
                  <Badge key={cat} variant="outline" className="gap-1">
                    {cat}
                    <Button variant="ghost" size="icon" onClick={() => removeCategory(cat)}>
                      <X className="w-3 h-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Itens Detectados ({editedItems.length})</CardTitle>
              <CardDescription>Revise e edite antes de confirmar. Confiança média: {Math.round(result.confidence * 100)}%</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-4">
                  {editedItems.map((item, index) => (
                    <Card key={index} className="p-4" variant="outline">
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                        <div className="md:col-span-4 space-y-2">
                          <div>
                            <Label className="text-xs font-medium">Nome *</Label>
                            <Input value={item.name} onChange={e => updateItem(index, 'name', e.target.value)} />
                          </div>
                          <div>
                            <Label className="text-xs font-medium">Descrição</Label>
                            <Textarea value={item.description} onChange={e => updateItem(index, 'description', e.target.value)} rows={2} className="h-20" />
                          </div>
                        </div>

                        <div className="md:col-span-2 space-y-2">
                          <div>
                            <Label className="text-xs font-medium">Preço (centavos) *</Label>
                            <Input type="number" value={item.price} onChange={e => updateItem(index, 'price', Number(e.target.value))} />
                          </div>
                          <div>
                            <Label className="text-xs font-medium">Categoria *</Label>
                            <Select value={item.category} onValueChange={v => updateItem(index, 'category', v)}>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione" />
                              </SelectTrigger>
                              <SelectContent>
                                {editedCategories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="md:col-span-2 space-y-2">
                          <div>
                            <Label className="text-xs font-medium">Estação</Label>
                            <Select value={item.station} onValueChange={v => updateItem(index, 'station', v)}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                {STATIONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-xs font-medium">Tempo Prep (min)</Label>
                            <Input type="number" min="0" max="120" value={item.prepTimeMinutes} onChange={e => updateItem(index, 'prepTimeMinutes', Number(e.target.value))} />
                          </div>
                        </div>

                        <div className="md:col-span-2">
                          <Label className="text-xs font-medium block mb-1">Alérgenos</Label>
                          <div className="flex flex-wrap gap-1">
                            {ALLERGENS.map(a => (
                              <Badge key={a} variant={item.allergens.includes(a) ? 'default' : 'outline'} 
                                className="cursor-pointer" onClick={() => {
                                  const newAllergens = item.allergens.includes(a)
                                    ? item.allergens.filter(x => x !== a)
                                    : [...item.allergens, a];
                                  updateItem(index, 'allergens', newAllergens);
                                }}>
                                {a}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="md:col-span-2">
                          <Label className="text-xs font-medium block mb-1">Tags Dietéticas</Label>
                          <div className="flex flex-wrap gap-1">
                            {DIETARY_TAGS.map(t => (
                              <Badge key={t} variant={item.dietaryTags.includes(t) ? 'secondary' : 'outline'} 
                                className="cursor-pointer" onClick={() => {
                                  const newTags = item.dietaryTags.includes(t)
                                    ? item.dietaryTags.filter(x => x !== t)
                                    : [...item.dietaryTags, t];
                                  updateItem(index, 'dietaryTags', newTags);
                                }}>
                                {t}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={reset}>
              <RotateCcw className="w-4 h-4 mr-2" /> Recomeçar
            </Button>
            <Button size="lg" onClick={confirmAndSave} className="gap-2">
              <CheckCircle className="w-4 h-4" /> Confirmar e Salvar Cardápio
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = reject;
  });
}