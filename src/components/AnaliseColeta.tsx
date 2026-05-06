import { useState } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { UploadCloud, Link as LinkIcon, FileText, Search, Hash, Mic } from 'lucide-react'
import { ImageUpload } from '@/components/ImageUpload'
import { AudioUpload } from '@/components/AudioUpload'
import useFamilyStore from '@/stores/useFamilyStore'

export function AnaliseColeta({ setStep }: { setStep: (step: number) => void }) {
  const { pendingAnalysis, setPendingAnalysis } = useFamilyStore()
  const [audioTranscript, setAudioTranscript] = useState('')

  const handleProcess = () => {
    if (audioTranscript && pendingAnalysis) {
      setPendingAnalysis({
        ...pendingAnalysis,
        audioTranscript,
      })
    }
    setStep(3)
  }

  return (
    <Card className="animate-fade-in-up shadow-md">
      <CardHeader>
        <CardTitle>Passo 2: Módulo de Coleta</CardTitle>
        <CardDescription>
          Envie prints, áudios, links, hashtags ou relate o que ele(a) tem consumido.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="prints" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6 h-auto p-1 bg-muted/50 rounded-lg">
            <TabsTrigger
              value="prints"
              className="gap-2 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <UploadCloud className="w-4 h-4 hidden sm:block" /> Imagens
            </TabsTrigger>
            <TabsTrigger
              value="audio"
              className="gap-2 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <Mic className="w-4 h-4 hidden sm:block" /> Áudio
            </TabsTrigger>
            <TabsTrigger
              value="links"
              className="gap-2 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <LinkIcon className="w-4 h-4 hidden sm:block" /> Links
            </TabsTrigger>
            <TabsTrigger
              value="quest"
              className="gap-2 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <FileText className="w-4 h-4 hidden sm:block" /> Relato
            </TabsTrigger>
          </TabsList>

          <TabsContent value="prints" className="space-y-4 animate-fade-in">
            <ImageUpload />
          </TabsContent>

          <TabsContent value="audio" className="space-y-4 animate-fade-in">
            <AudioUpload onTranscribed={setAudioTranscript} />
          </TabsContent>

          <TabsContent value="links" className="space-y-4 animate-fade-in">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>URLs ou @Usuários</Label>
                <Input placeholder="Ex: https://tiktok.com/@usuario ou @influenciador" />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Hash className="w-4 h-4" /> Hashtags Consumidas
                </Label>
                <Input placeholder="Ex: #corecore, #desabafo, #sad" />
                <p className="text-xs text-muted-foreground">
                  Insira termos de busca ou hashtags que seu filho tem pesquisado.
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="quest" className="space-y-4 animate-fade-in">
            <div className="space-y-3">
              <Label>Descreva os temas, gírias ou ideias repetidas recentemente:</Label>
              <Textarea
                placeholder="Ex: Tem dito que 'nada importa', que a família não entende..."
                className="min-h-[120px] resize-none"
              />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="justify-between border-t pt-6 pb-28 md:pb-6">
        <Button variant="ghost" onClick={() => setStep(1)}>
          Voltar
        </Button>
        <Button onClick={handleProcess} size="lg" className="bg-primary hover:bg-primary/90">
          Processar IA <Search className="w-5 h-5 ml-2" />
        </Button>
      </CardFooter>
    </Card>
  )
}
