import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ExternalLink, BookText, Loader2 } from 'lucide-react'

interface Reference {
  id?: string
  title: string
  summary?: string
  content_link?: string
  evidence_level?: string
  axis?: string
  clinical_status?: string
  journal_name?: string
  impact_factor?: number
}

interface ScientificPreviewModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  reference: Reference | null
}

export function ScientificPreviewModal({
  open,
  onOpenChange,
  reference,
}: ScientificPreviewModalProps) {
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open && reference) {
      setLoading(true)
      const t = setTimeout(() => setLoading(false), 800)
      return () => clearTimeout(t)
    }
  }, [open, reference])

  if (!reference) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-primary text-xl font-serif">
            <BookText className="w-6 h-6" /> Pré-visualização do Estudo
          </DialogTitle>
          <DialogDescription>Resumo técnico e evidências científicas extraídas.</DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground animate-pulse">
              Buscando detalhes do estudo...
            </p>
          </div>
        ) : (
          <div className="space-y-4 animate-fade-in">
            <div className="flex flex-wrap gap-2">
              {reference.axis && (
                <Badge variant="secondary" className="bg-secondary/10 text-secondary">
                  {reference.axis}
                </Badge>
              )}
              {reference.evidence_level && (
                <Badge variant="outline" className="border-primary/20 text-primary">
                  Evidência: {reference.evidence_level}
                </Badge>
              )}
              {reference.clinical_status && (
                <Badge variant="outline" className="bg-muted/50">
                  {reference.clinical_status}
                </Badge>
              )}
            </div>

            <h3 className="font-bold text-lg text-foreground leading-tight">{reference.title}</h3>

            {reference.journal_name && (
              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground bg-muted/40 p-3 rounded-lg border border-border/50">
                <span className="font-semibold text-primary">Revista/Journal:</span>{' '}
                {reference.journal_name}
                {reference.impact_factor && (
                  <>
                    <span className="text-border mx-1">|</span>
                    <span className="font-semibold text-primary">Fator de Impacto:</span>{' '}
                    {reference.impact_factor}
                  </>
                )}
              </div>
            )}

            <div className="bg-slate-50 border border-slate-100 p-4 rounded-lg text-sm text-slate-800 leading-relaxed shadow-inner max-h-60 overflow-y-auto">
              {reference.summary ? (
                <p>{reference.summary}</p>
              ) : (
                <p className="italic text-muted-foreground">
                  Resumo indisponível para este estudo. Clique abaixo para acessar a fonte completa.
                </p>
              )}
            </div>
          </div>
        )}

        <DialogFooter className="mt-4 flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
          {reference.content_link ? (
            <Button asChild className="gap-2 w-full sm:w-auto group/btn">
              <a href={reference.content_link} target="_blank" rel="noopener noreferrer">
                Acessar Fonte Original{' '}
                <ExternalLink className="w-4 h-4 ml-2 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
              </a>
            </Button>
          ) : (
            <Button disabled className="gap-2 w-full sm:w-auto opacity-50">
              <ExternalLink className="w-4 h-4" /> Link Indisponível
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
