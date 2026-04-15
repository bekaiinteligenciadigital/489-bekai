import { useState, useRef, useEffect } from 'react'
import { UploadCloud, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

interface UploadedImage {
  id: string
  file: File
  preview: string
}

export function ImageUpload() {
  const [images, setImages] = useState<UploadedImage[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  // Cleanup object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      images.forEach((img) => URL.revokeObjectURL(img.preview))
    }
  }, [images])

  const processFiles = (files: FileList | File[]) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg']
    const newImages: UploadedImage[] = []
    let hasError = false

    Array.from(files).forEach((file) => {
      if (validTypes.includes(file.type)) {
        newImages.push({
          id: Math.random().toString(36).substring(7),
          file,
          preview: URL.createObjectURL(file),
        })
      } else {
        hasError = true
      }
    })

    if (hasError) {
      toast({
        title: 'Formato inválido',
        description: 'Apenas imagens em formato PNG ou JPG são permitidas.',
        variant: 'destructive',
      })
    }

    if (newImages.length > 0) {
      setImages((prev) => [...prev, ...newImages])
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files)
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files)
    }
    // Reset input value so the same file can be selected again if it was removed
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const removeImage = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setImages((prev) => {
      const imgToRemove = prev.find((i) => i.id === id)
      if (imgToRemove) {
        URL.revokeObjectURL(imgToRemove.preview)
      }
      return prev.filter((i) => i.id !== id)
    })
  }

  return (
    <div className="space-y-4 w-full">
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
          multiple
          accept="image/png, image/jpeg, image/jpg"
          className="hidden"
          onChange={handleFileInput}
        />
        <div className="bg-primary/10 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300">
          <UploadCloud className="w-8 h-8 text-primary" />
        </div>
        <h4 className="font-semibold text-primary text-lg">Envie prints (PNG/JPG) da tela</h4>
        <p className="text-sm text-muted-foreground mt-2 max-w-sm">
          Arraste as imagens aqui ou clique para selecionar. Pode selecionar múltiplos arquivos.
        </p>
        <Button variant="outline" className="mt-6 bg-background pointer-events-none">
          Selecionar Arquivos
        </Button>
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-6 animate-fade-in-up">
          {images.map((img) => (
            <div
              key={img.id}
              className="relative aspect-[3/4] sm:aspect-square rounded-lg overflow-hidden border border-border shadow-sm group bg-muted"
            >
              <img
                src={img.preview}
                alt="Preview do print"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-start justify-end p-2">
                <Button
                  variant="destructive"
                  size="icon"
                  className="h-8 w-8 rounded-full shadow-md hover:scale-105 transition-transform"
                  onClick={(e) => removeImage(img.id, e)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
