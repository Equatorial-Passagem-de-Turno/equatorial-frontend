# Equatorial Passagem de Turno - Frontend

Frontend do sistema Equatorial Energia. Projeto em React + TypeScript + Vite, preparado para rodar localmente com o minimo de configuracao.

## Visao geral

- Stack: React 19, TypeScript, Vite, Tailwind CSS
- Perfis principais: operador e supervisor
- Consome uma API HTTP configuravel por variaveis de ambiente
- Navegacao pelo menu lateral, com paginas protegidas por regras de turno

## Requisitos

- Node.js LTS (recomendado 20+)
- NPM (vem junto com o Node)
- Git (opcional, para clonar o repositorio)

## Inicio rapido (1 comando)

Objetivo: baixar o projeto do GitHub, instalar tudo e abrir a aplicacao no navegador.

1) Abra o navegador e entre no GitHub.
2) Procure pelo repositorio e abra a pagina dele.
3) Clique no botao verde Code.
4) Clique em HTTPS e copie o link que aparece.
   - Exemplo de link: https://github.com/Equatorial-Passagem-de-Turno/equatorial-frontend.git

Agora vamos usar o terminal.

5) No Windows, pressione a tecla Windows e digite PowerShell. Abra o PowerShell.
6) Escolha uma pasta para guardar o projeto (exemplo: Documentos).
7) No terminal, digite o comando abaixo para entrar na pasta Documentos:

```bash
cd $HOME\Documents
```

8) Agora cole o link que voce copiou no comando `git clone`:

```bash
git clone https://github.com/Equatorial-Passagem-de-Turno/equatorial-frontend.git
```

9) Entre na pasta do projeto:

```bash
cd equatorial-frontend
```

10) Instale as dependencias (isso pode demorar alguns minutos):

```bash
npm install
```

11) (Opcional) Configure a URL da API em um arquivo chamado .env.local.
	- Abra o Bloco de Notas.
	- Cole o conteudo abaixo.
	- Salve o arquivo com o nome .env.local dentro da pasta do projeto.

```bash
VITE_API_URL=http://SEU_BACKEND:PORTA/api
VITE_ENABLE_SUPERVISOR_ACTIVE_OPERATORS_ENDPOINT=true
```

12) Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

13) Abra o navegador em http://localhost:5173.
14) Para parar o servidor, volte ao terminal e pressione Ctrl+C.

Se algo der errado, veja a secao Problemas comuns.

## Configuracao da API (backend)

Por padrao, a aplicacao tenta acessar a API em http://127.0.0.1:8000/api.
Se sua API estiver em outro endereco, ajuste as variaveis abaixo no arquivo local de variaveis de ambiente (na raiz do projeto):

```bash
VITE_API_URL=http://SEU_BACKEND:PORTA/api
VITE_ENABLE_SUPERVISOR_ACTIVE_OPERATORS_ENDPOINT=true
```

- `VITE_API_URL`: URL base da API. Veja [src/services/api.ts](src/services/api.ts).
- `VITE_ENABLE_SUPERVISOR_ACTIVE_OPERATORS_ENDPOINT`: quando `true`, habilita o endpoint de operadores ativos no supervisor.

Depois de alterar as variaveis, pare e execute `npm run dev` novamente.

## Guia rapido de uso

1) Tela de login: entre com suas credenciais.
2) Se o perfil nao for supervisor, escolha o perfil operacional e a mesa de trabalho.
3) Use o menu lateral para navegar entre os modulos.

### Navegacao por perfil

Operador:

- Dashboard
- Novo Evento
- Controle de Turnos
- Historico de Eventos
- Turno Anterior

Supervisor:

- Dashboard
- Novo Evento
- Linha do Tempo
- Analytics
- Gestao

Observacao: algumas telas dependem do estado do turno e podem ficar bloqueadas ate o turno estar aberto.

## Comandos principais

- `npm run dev`: inicia o ambiente de desenvolvimento
- `npm run build`: gera a build de producao (arquivos estaticos)
- `npm run preview`: serve a build localmente para validacao
- `npm run lint`: valida o codigo com ESLint

## Estrutura do projeto

- Entrada da aplicacao: [src/main.tsx](src/main.tsx)
- Componente raiz: [src/App.tsx](src/App.tsx)
- Rotas: [src/routes/AppRoutes.tsx](src/routes/AppRoutes.tsx)
- Navegacao do menu: [src/config/navigation.ts](src/config/navigation.ts)
- Servicos e integracoes com API: [src/services](src/services)
- Funcionalidades por dominio: [src/features](src/features)
- Componentes reutilizaveis: [src/components](src/components)
- UI compartilhada: [src/shared/ui](src/shared/ui)

## Usabilidade (para quem esta iniciando)

- Se o comando `npm` nao for reconhecido, reinstale o Node e reinicie o computador.
- Se a pagina abrir em branco, verifique o terminal e se a API esta respondendo.
- Para trocar a porta do frontend: `npm run dev -- --port 3000`.
- Se houver erros de rede, confira a URL da API e a permissao de CORS no backend.

## Problemas comuns

- **Erro de CORS**: a API deve permitir acesso do frontend local.
- **Porta ocupada**: use outra porta com `npm run dev -- --port 3000`.
- **Dependencias quebradas**: remova a pasta de dependencias instalada e rode `npm install` novamente.
- **Falha ao carregar dados**: confirme se a API esta disponivel e a autenticacao esta valida.
