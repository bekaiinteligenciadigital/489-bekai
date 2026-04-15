import { useState, useRef } from 'react'
import { UploadCloud, FileAudio, CheckCircle2, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

interface AudioUploadProps {
  onTranscribed: (text: string) => void
}

export function AudioUpload({ onTranscribed }: AudioUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [progress, setProgress] = useState(0)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [transcript, setTranscript] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const processFile = (selectedFile: File) => {
    if (
      !selectedFile.type.startsWith('audio/') &&
      !selectedFile.name.match(/\.(mp3|wav|m4a|ogg)$/i)
    ) {
      return toast({
        title: 'Formato inválido',
        description: 'Apenas arquivos de áudio (MP3, WAV) são permitidos.',
        variant: 'destructive',
      })
    }

    setFile(selectedFile)
    setIsTranscribing(true)
    setProgress(0)
    setTranscript('')

    let currentProgress = 0
    const interval = setInterval(() => {
      currentProgress += 15
      if (currentProgress >= 100) {
        clearInterval(interval)
        setProgress(100)
        setIsTranscribing(false)
        const mockTranscript =
          'Ninguém me entende nessa casa. Eu prefiro ficar no Discord com o pessoal, eles sim sabem o que eu tô passando. A vida é muito chata offline, não tem nada pra fazer de verdade.'
        setTranscript(mockTranscript)
        onTranscribed(mockTranscript)
        toast({
          title: 'Transcrição Concluída',
          description: 'O áudio foi processado com sucesso.',
        })
      } else {
        setProgress(currentProgress)
      }
    }, 500)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0])
    }
  }

  return (
    <div className="space-y-4 w-full animate-fade-in">
      {!file ? (
        <div
          className={cn(
            'border-2 border-dashed rounded-xl p-8 sm:p-12 flex flex-col items-center justify-center text-center transition-all cursor-pointer relative overflow-hidden group',
            isDragging
              ? 'border-primary bg-primary/10 scale-[1.01]'
              : 'border-primary/20 bg-primary/5 hover:bg-primary/10',
          )}
          onDragOver={(e) => {
            e.preventDefault()
            setIsDragging(true)
          }}
          onDragLeave={(e) => {
            e.preventDefault()
            setIsDragging(false)
          }}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*,.mp3,.wav,.m4a"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) processFile(e.target.files[0])
              if (fileInputRef.current) fileInputRef.current.value = ''
            }}
          />
          <div className="bg-primary/10 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300">
            <UploadCloud className="w-8 h-8 text-primary" />
          </div>
          <h4 className="font-semibold text-primary text-lg">Anexar Áudio (MP3, WAV)</h4>
          <p className="text-sm text-muted-foreground mt-2 max-w-sm">
            Arraste um áudio com reflexões ou conversas do seu filho, ou clique para selecionar.
          </p>
          <Button variant="outline" className="mt-6 bg-background pointer-events-none">
            Selecionar Arquivo
          </Button>
        </div>
      ) : (
        <div className="bg-muted/30 border border-border p-6 rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-primary/10 p-2 rounded-lg">
                <FileAudio className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm text-foreground truncate max-w-[200px] sm:max-w-[300px]">
                  {file.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            {!isTranscribing && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setFile(null)
                  onTranscribed('')
                }}
                className="text-muted-foreground hover:text-destructive"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>

          {isTranscribing ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
                <span className="flex items-center gap-2">
                  <Loader2 className="w-3 h-3 animate-spin" /> Transcrevendo áudio via IA...
                </span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          ) : (
            <div className="space-y-3 pt-2 border-t border-border/50">
              <div className="flex items-center gap-2 text-primary font-medium text-sm">
                <CheckCircle2 className="w-4 h-4" /> Transcrição Concluída
              </div>
              <div className="bg-background p-3 rounded-lg border shadow-sm text-sm text-muted-foreground italic relative">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/40 rounded-l-lg" />"
                {transcript}"
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
