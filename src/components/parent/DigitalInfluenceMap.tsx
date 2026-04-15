import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { DigitalEvent } from '@/services/parent'
import { Map, Users } from 'lucide-react'
import pb from '@/lib/pocketbase/client'

export function DigitalInfluenceMap({ events }: { events: DigitalEvent[] }) {
  const [creators, setCreators] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCreators = async () => {
      try {
        const records = await pb.collection('creators').getList(1, 20, {
          sort: '-created',
        })
        setCreators(records.items)
      } catch (err) {
        console.error('Failed to fetch creators', err)
      } finally {
        setLoading(false)
      }
    }
    fetchCreators()
  }, [])

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2 text-indigo-900">
          <Map className="w-5 h-5" /> Mapa de Influência Digital
        </CardTitle>
        <CardDescription>
          Principais criadores e canais detectados no ambiente digital.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-slate-100 rounded-md"></div>
            <div className="h-12 bg-slate-100 rounded-md"></div>
          </div>
        ) : creators.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground border-2 border-dashed rounded-lg">
            <Users className="w-8 h-8 mx-auto mb-2 opacity-20" />
            <p className="text-sm">Nenhuma influência mapeada ainda.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {creators.map((creator) => (
              <div
                key={creator.id}
                className="flex items-start gap-3 p-3 rounded-lg border bg-slate-50/50 hover:bg-slate-50 transition-colors"
              >
                <Avatar className="w-10 h-10 border shadow-sm">
                  <AvatarImage
                    src={creator.profile_url}
                    alt={creator.handle || creator.display_name || ''}
                  />
                  <AvatarFallback>
                    {(creator.display_name || creator.handle || '?').charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {creator.display_name || creator.handle || 'Criador'}
                    </p>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                      {creator.platform}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 truncate mt-0.5">
                    {/* FIX: Render string property instead of the entire object */}
                    {creator.handle ? `@${creator.handle}` : creator.platform}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
