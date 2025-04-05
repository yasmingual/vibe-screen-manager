# Vibe Screen Manager

Sistema de gerenciamento de conteúdo para exibição em telas digitais.

## Funcionalidades

### Gerenciamento de Conteúdo
- Adição de imagens e vídeos
- Edição e exclusão de conteúdos
- Ativação/desativação de conteúdos
- Reordenação de conteúdos via drag and drop
- Visualização prévia dos conteúdos

### Integrações
- Importação de feeds RSS
- Busca e importação de trailers de filmes e séries
- Integração com resultados de loterias da Caixa

### Interface
- Design moderno e responsivo
- Modais para adição e edição de conteúdos
- Feedback visual durante operações
- Suporte a temas claro/escuro

## Tecnologias Utilizadas

- React
- TypeScript
- Tailwind CSS
- Zustand (gerenciamento de estado)
- Supabase (banco de dados)
- Dnd-kit (drag and drop)
- Lucide Icons
- Sonner (notificações)

## Estrutura do Projeto

```
src/
├── components/         # Componentes React
├── lib/               # Utilitários e lógica de negócio
├── pages/             # Páginas da aplicação
├── public/            # Arquivos estáticos
└── types/             # Definições de tipos TypeScript
```

## Instalação

1. Clone o repositório:
```bash
git clone https://github.com/yasmingual/vibe-screen-manager.git
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```

4. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

## Configuração

### Variáveis de Ambiente

- `VITE_SUPABASE_URL`: URL do projeto Supabase
- `VITE_SUPABASE_ANON_KEY`: Chave anônima do Supabase
- `VITE_TMDB_API_KEY`: Chave da API do TMDB (para trailers)

## Uso

### Adicionando Conteúdo
1. Clique no botão "Adicionar Conteúdo"
2. Preencha os campos necessários
3. Clique em "Salvar"

### Importando RSS
1. Clique no botão "Importar RSS"
2. Insira a URL do feed RSS
3. Selecione os itens desejados
4. Clique em "Importar"

### Buscando Trailers
1. Clique no botão "Buscar Trailers"
2. Digite o nome do filme/série
3. Selecione os trailers desejados
4. Clique em "Importar"

### Reordenando Conteúdos
1. Clique e segure o ícone de arrastar (três linhas verticais)
2. Arraste o conteúdo para a nova posição
3. Solte para confirmar

## Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'feat: adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.
