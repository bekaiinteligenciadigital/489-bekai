import { Card, CardContent } from '@/components/ui/card'
import { Activity, ExternalLink } from 'lucide-react'
import { useState, useEffect } from 'react'
import pb from '@/lib/pocketbase/client'

export function ResultadoCriadores() {
  const [creators, setCreators] = useState<any[]>([])

  useEffect(() => {
    const fetchCreators = async () => {
      try {
        const records = await pb.collection('creators').getFullList({ sort: '-created' })
        if (records.length > 0) {
          setCreators(records)
        }
      } catch (err) {
        console.error(err)
      }
    }
    fetchCreators()
  }, [])

  const defaultCreators = [
    {
      display_name: 'Dr. Augusto Cury',
      reason:
        'Ensina ferramentas práticas para a Gestão da Emoção e combate à Síndrome do Pensamento Acelerado (SPA).',
      img: 'https://img.usecurling.com/ppl/medium?gender=male&seed=12',
      profile_url: 'https://instagram.com/augustocury',
    },
    {
      display_name: 'Eslen Delanogare',
      reason: 'Substitui o niilismo pela ciência da disciplina e construção de rotina forte.',
      img: 'https://img.usecurling.com/ppl/medium?gender=male&seed=6',
      profile_url: 'https://instagram.com/eslendelanogare',
    },
    {
      display_name: 'Brasil Paralelo',
      reason: 'Substitui o relativismo por valores tradicionais e patriotismo bem fundamentado.',
      img: 'https://img.usecurling.com/i?q=shield&shape=fill&color=blue',
      profile_url: 'https://youtube.com/brasilparalelo',
    },
  ]

  const displayList = creators.length > 0 ? creators : defaultCreators

  return (
    <div className="pt-2">
      <h3 className="text-xl font-serif font-bold text-primary mb-3 flex items-center gap-2">
        <Activity className="w-5 h-5 text-secondary" /> Curadoria de Criadores Positivos
      </h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-3xl leading-relaxed">
        Perfis e canais recomendados para aplicar o rebalanceamento algorítmico, oferecendo
        equivalência estética com valores construtivos.
      </p>
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
        {displayList.slice(0, 3).map((item, i) => (
          <a
            key={i}
            href={item.profile_url || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="block outline-none"
          >
            <Card className="hover:shadow-lg transition-all group overflow-hidden border-border/50 h-full cursor-pointer hover:border-primary/40 focus:ring-2 focus:ring-primary">
              <CardContent className="p-5 flex flex-col gap-4 h-full">
                <div className="flex items-center gap-4">
                  <img
                    src={item.img || `https://img.usecurling.com/ppl/medium?seed=${i + 10}`}
                    className="w-14 h-14 rounded-full object-cover shrink-0 ring-2 ring-primary/10 group-hover:ring-primary/30 transition-all"
                    alt={item.display_name || item.handle}
                  />
                  <div className="flex flex-col">
                    <h4 className="font-bold text-base text-foreground group-hover:text-primary transition-colors flex items-center gap-1.5">
                      {item.display_name || item.handle}
                      <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </h4>
                  </div>
                </div>
                <div className="bg-muted/40 p-3 rounded-lg flex-1">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    <span className="font-bold text-primary block mb-1">Por que seguir:</span>{' '}
                    {item.reason ||
                      item.rationale_summary ||
                      'Conteúdo de alta qualidade e alinhado aos valores e reestruturação da rotina.'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </a>
        ))}
      </div>
    </div>
  )
}
