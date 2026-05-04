# Deploy simplificado: front + agentes + backend no mesmo servico

Este projeto pode ser publicado com **um unico deploy** usando PocketBase para:

- servir o front em `pb_public`
- executar hooks e agentes de IA
- manter banco e arquivos em `pb_data`

## O que foi preparado

Arquivos principais:

- `Dockerfile.pocketbase`
- `render.yaml`
- `deploy-pocketbase.env.example`

## Como funciona

O `Dockerfile.pocketbase`:

1. faz o build do front React/Vite
2. copia o build para `/pb/pb_public`
3. copia os hooks para `/pb/pb_hooks`
4. copia as migrations para `/pb/pb_migrations`
5. sobe o PocketBase na porta `8090`

Com isso, o mesmo servico entrega:

- interface web
- API do PocketBase
- agentes de IA
- sincronizacao social

## Importante

O cliente do PocketBase no front foi preparado para usar:

- `VITE_POCKETBASE_URL`, se existir
- ou `window.location.origin`, se nao existir

Entao esse deploy unico funciona sem precisar separar front e backend.

## Caminho mais facil: Render

Este repositorio agora tem `render.yaml`.

### Passos

1. Entre no Render
2. Escolha **New + Blueprint**
3. Conecte o repositorio GitHub
4. Selecione este repo
5. O Render vai ler `render.yaml`
6. Preencha os secrets obrigatorios
7. Clique em deploy

## Secrets minimos

Obrigatorio para os agentes:

- `GROQ_API_KEY`
- `YOUTUBE_API_KEY` para busca oficial de videos, canais e playlists de contraponto

Obrigatorio quando for ligar OAuth real das redes:

- `SOCIAL_OAUTH_REDIRECT_BASE`
- `YOUTUBE_CLIENT_ID`
- `INSTAGRAM_CLIENT_ID`
- `TIKTOK_CLIENT_ID`
- `WHATSAPP_CLIENT_ID`
- `DISCORD_CLIENT_ID`
- `ROBLOX_CLIENT_ID`

Base de referencia:

- `deploy-pocketbase.env.example`

## YouTube no contraponto

Com `YOUTUBE_API_KEY` configurada, o backend passa a:

- buscar conteudos positivos no YouTube via API oficial
- sugerir videos, canais e playlists dentro das intervencoes de contraponto
- registrar a query usada para a curadoria no painel operacional

Sem essa chave, o sistema continua funcionando com fallback local de curadoria manual.

## Persistencia

O volume persistente precisa estar montado em:

- `/pb/pb_data`

No `render.yaml` isso ja foi definido.

## Primeiro acesso

Depois do deploy:

1. abra `https://seu-servico.onrender.com/_/`
2. crie o primeiro superuser
3. valide o sistema em:
   - `/`
   - `/api/health`
   - `/_/`

## Resultado final

Com esse modelo, voce nao precisa:

- fazer deploy separado no Firebase
- manter duas publicacoes diferentes
- apontar o front manualmente para outro backend

Se quiser, ainda da para manter Firebase Hosting depois, mas o caminho mais simples agora e **subir tudo no Render com um unico servico**.
