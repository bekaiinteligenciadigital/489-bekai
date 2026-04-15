import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Stethoscope, Phone, Mail } from 'lucide-react'
import { ChildProfile } from '@/stores/useFamilyStore'

interface ProfessionalCardProps {
  childrenWithProfs: ChildProfile[]
}

export function ProfessionalCard({ childrenWithProfs }: ProfessionalCardProps) {
  if (childrenWithProfs.length === 0) return null

  return (
    <Card className="shadow-sm bg-indigo-50/40 border-indigo-100">
      <CardHeader className="pb-3 border-b border-indigo-100/50">
        <CardTitle className="text-base flex items-center gap-2 text-indigo-900">
          <Stethoscope className="w-5 h-5 text-indigo-600" /> Ponte Profissional
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        {childrenWithProfs.map((c) => (
          <div key={`prof-${c.id}`} className="space-y-2">
            <p className="text-[10px] font-bold text-indigo-800 uppercase tracking-wider">
              Acompanhamento de {c.name}
            </p>
            <div className="bg-white p-3 rounded-lg border border-indigo-100 shadow-sm space-y-3">
              <div>
                <p className="font-bold text-sm text-indigo-950">{c.healthProfessional?.name}</p>
                <p className="text-xs text-indigo-700/80">{c.healthProfessional?.clinic}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="flex-1 h-8 text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                  asChild
                >
                  <a href={`tel:${c.healthProfessional?.phone}`}>
                    <Phone className="w-3 h-3 mr-1" /> Ligar
                  </a>
                </Button>
                {c.healthProfessional?.email && (
                  <Button
                    size="sm"
                    variant="secondary"
                    className="flex-1 h-8 text-xs bg-indigo-100 text-indigo-800 hover:bg-indigo-200"
                    asChild
                  >
                    <a href={`mailto:${c.healthProfessional?.email}`}>
                      <Mail className="w-3 h-3 mr-1" /> Email
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
