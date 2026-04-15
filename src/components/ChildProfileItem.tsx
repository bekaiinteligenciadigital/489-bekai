import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChildProfile } from '@/stores/useFamilyStore'
import { Stethoscope, Trash2 } from 'lucide-react'

export function ChildProfileItem({
  child,
  onRemove,
}: {
  child: ChildProfile
  onRemove: (id: string) => void
}) {
  return (
    <div className="p-4 rounded-xl border bg-muted/10 hover:bg-muted/30 transition-colors flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between group">
      <div className="flex gap-4 items-center min-w-0 w-full sm:w-auto">
        <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xl uppercase shrink-0">
          {child.name.charAt(0)}
        </div>
        <div className="min-w-0">
          <h4 className="font-bold text-foreground text-base truncate">
            {child.name}{' '}
            <span className="text-sm font-normal text-muted-foreground">({child.age} anos)</span>
          </h4>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {child.platforms.map((p) => (
              <Badge key={p} variant="secondary" className="text-[10px]">
                {p}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between w-full sm:w-auto gap-4 sm:ml-auto">
        {child.hasProfessional && (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100">
            <Stethoscope className="w-3.5 h-3.5" /> Apoio Ativo
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => onRemove(child.id)}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
