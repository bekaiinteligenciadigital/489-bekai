import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ShieldCheck, Save, Plus, Loader2, Search } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { getHarmfulTopics, HarmfulTopic, saveHarmfulTopic } from '@/services/counterbalance'

type TopicForm = {
  id?: string
  name: string
  slug: string
  description: string
  severity: HarmfulTopic['severity']
  keywords: string
  counterKeywords: string
  platformScope: string
  enabled: boolean
}

const emptyForm: TopicForm = {
  name: '',
  slug: '',
  description: '',
  severity: 'medium',
  keywords: '',
  counterKeywords: '',
  platformScope: '',
  enabled: true,
}

const csvToArray = (value: string) =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)

export function CounterbalanceTopicsManager() {
  const { toast } = useToast()
  const [topics, setTopics] = useState<HarmfulTopic[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [form, setForm] = useState<TopicForm>(emptyForm)

  const loadTopics = async () => {
    try {
      setLoading(true)
      const records = await getHarmfulTopics()
      setTopics(records)
    } catch (err) {
      toast({
        title: 'Falha ao carregar topicos',
        description: 'Nao foi possivel carregar a configuracao de topicos nocivos.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadTopics()
  }, [])

  const filteredTopics = useMemo(() => {
    const term = search.toLowerCase().trim()
    if (!term) return topics
    return topics.filter(
      (topic) =>
        topic.name.toLowerCase().includes(term) ||
        topic.slug.toLowerCase().includes(term) ||
        (topic.description || '').toLowerCase().includes(term),
    )
  }, [topics, search])

  const handleEdit = (topic: HarmfulTopic) => {
    setForm({
      id: topic.id,
      name: topic.name,
      slug: topic.slug,
      description: topic.description || '',
      severity: topic.severity,
      keywords: (topic.keywords_json || []).join(', '),
      counterKeywords: (topic.counter_keywords_json || []).join(', '),
      platformScope: (topic.platform_scope_json || []).join(', '),
      enabled: topic.enabled,
    })
  }

  const handleSave = async () => {
    if (!form.name.trim() || !form.slug.trim()) {
      toast({
        title: 'Campos obrigatorios',
        description: 'Nome e slug sao obrigatorios.',
        variant: 'destructive',
      })
      return
    }

    setSaving(true)
    try {
      await saveHarmfulTopic(
        {
          name: form.name.trim(),
          slug: form.slug.trim().toLowerCase(),
          description: form.description.trim(),
          severity: form.severity,
          keywords_json: csvToArray(form.keywords),
          counter_keywords_json: csvToArray(form.counterKeywords),
          platform_scope_json: csvToArray(form.platformScope.toLowerCase()),
          enabled: form.enabled,
        },
        form.id,
      )

      toast({
        title: 'Topico salvo',
        description: 'A regra de deteccao e contraponto foi atualizada.',
      })

      setForm(emptyForm)
      await loadTopics()
    } catch (err: any) {
      toast({
        title: 'Falha ao salvar topico',
        description: err?.message || 'Nao foi possivel salvar a configuracao.',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="grid xl:grid-cols-[1.1fr_0.9fr] gap-6">
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <ShieldCheck className="w-5 h-5" /> Topicos Nocivos Configurados
          </CardTitle>
          <CardDescription>
            Defina os gatilhos que os agentes devem considerar nocivos e os temas de contraponto.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar topico..."
              className="pl-9"
            />
          </div>

          {loading ? (
            <div className="py-10 flex items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Carregando topicos...</span>
            </div>
          ) : filteredTopics.length === 0 ? (
            <div className="rounded-xl border border-dashed bg-muted/10 p-4 text-sm text-muted-foreground">
              Nenhum topico encontrado.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTopics.map((topic) => (
                <div
                  key={topic.id}
                  className="rounded-xl border bg-background p-4 shadow-sm flex flex-col gap-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-foreground">{topic.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">{topic.description}</p>
                    </div>
                    <div className="flex gap-2 flex-wrap justify-end">
                      <Badge variant="outline">{topic.severity}</Badge>
                      <Badge
                        className={
                          topic.enabled
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }
                      >
                        {topic.enabled ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>
                      <strong>Gatilhos:</strong> {(topic.keywords_json || []).join(', ') || 'Nao definidos'}
                    </p>
                    <p>
                      <strong>Contraponto:</strong>{' '}
                      {(topic.counter_keywords_json || []).join(', ') || 'Nao definido'}
                    </p>
                  </div>

                  <div>
                    <Button variant="outline" size="sm" onClick={() => handleEdit(topic)}>
                      Editar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Plus className="w-5 h-5" /> {form.id ? 'Editar Topico' : 'Novo Topico'}
          </CardTitle>
          <CardDescription>
            Ajuste palavras-chave nocivas e palavras-chave de conteudo benefico.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Nome</Label>
            <Input value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} />
          </div>

          <div className="space-y-2">
            <Label>Slug</Label>
            <Input
              value={form.slug}
              onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))}
              placeholder="violencia"
            />
          </div>

          <div className="space-y-2">
            <Label>Descricao</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label>Severidade</Label>
            <Select
              value={form.severity}
              onValueChange={(value: HarmfulTopic['severity']) =>
                setForm((prev) => ({ ...prev, severity: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">low</SelectItem>
                <SelectItem value="medium">medium</SelectItem>
                <SelectItem value="high">high</SelectItem>
                <SelectItem value="critical">critical</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Palavras-chave nocivas</Label>
            <Textarea
              value={form.keywords}
              onChange={(e) => setForm((prev) => ({ ...prev, keywords: e.target.value }))}
              placeholder="violencia, arma, agressao"
            />
          </div>

          <div className="space-y-2">
            <Label>Palavras-chave de contraponto</Label>
            <Textarea
              value={form.counterKeywords}
              onChange={(e) => setForm((prev) => ({ ...prev, counterKeywords: e.target.value }))}
              placeholder="cultura de paz, resolucao de conflitos, empatia"
            />
          </div>

          <div className="space-y-2">
            <Label>Escopo de plataformas</Label>
            <Input
              value={form.platformScope}
              onChange={(e) => setForm((prev) => ({ ...prev, platformScope: e.target.value }))}
              placeholder="youtube, tiktok, instagram"
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="font-medium text-sm">Topico ativo</p>
              <p className="text-xs text-muted-foreground">
                Se desligado, ele deixa de gerar intervencoes automaticamente.
              </p>
            </div>
            <Switch
              checked={form.enabled}
              onCheckedChange={(checked) => setForm((prev) => ({ ...prev, enabled: checked }))}
            />
          </div>

          <div className="flex gap-3">
            <Button onClick={handleSave} disabled={saving} className="gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Salvar
            </Button>
            <Button variant="outline" onClick={() => setForm(emptyForm)}>
              Limpar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
