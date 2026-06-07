# Playwright - Automação de Testes E2E

Este diretório e configuração são dedicados à execução de testes end-to-end (E2E) utilizando o [Playwright](https://playwright.dev/).

## 📌 Pré-requisitos

Antes de iniciar os testes, certifique-se de ter instalado em sua máquina:
- **Node.js** (versão recomendada LTS)
- **Yarn** ou **NPM** (O projeto está configurado para rodar `yarn dev` internamente, portanto é recomendável usar o Yarn).

## 🚀 Como Iniciar

1. **Instale as dependências do projeto:**
   Na raiz do projeto, execute:
   ```bash
   yarn install
   ```

2. **Instale os navegadores do Playwright:**
   Isso é necessário apenas na primeira vez que for rodar ou quando a versão do pacote for atualizada:
   ```bash
   yarn playwright install --with-deps
   ```

## 💻 Comandos Úteis para Execução dos Testes

O Playwright neste projeto já está configurado para subir automaticamente o servidor de desenvolvimento local (`yarn dev` em `localhost:5173`) antes de rodar os testes, conforme o arquivo `playwright.config.ts`. 

Aqui estão os principais comandos para executar e depurar seus testes (execute sempre na raiz do projeto):

- **Rodar todos os testes em modo headless (sem interface gráfica, roda em background):**
  ```bash
  yarn playwright test
  ```

- **Rodar os testes abrindo o navegador (modo visual):**
  ```bash
  yarn playwright test --headed
  ```

- **Abrir a UI do Playwright (Excelente para desenvolvimento e depuração):**
  Abre uma interface gráfica onde você pode rodar testes individuais, inspecionar os elementos na tela, visualizar logs de rede e navegar pela linha do tempo (time-travel) das execuções.
  ```bash
  yarn playwright test --ui
  ```

- **Rodar um arquivo de teste específico:**
  ```bash
  yarn playwright test playwright/e2e/checkout.spec.ts
  ```

- **Rodar um teste específico filtrando pelo seu título (grep):**
  ```bash
  yarn playwright test -g "nome do cenário de teste"
  ```

### ⚙️ Execução Avançada

- **Controlar quantidade de Workers (processos paralelos):**
  Para limitar ou aumentar o paralelismo da execução. Útil para debugar problemas de concorrência ou poupar consumo de CPU.
  ```bash
  yarn playwright test --workers=2
  ```
  *(Obs: Em ambientes de CI, o projeto já está configurado para usar apenas 1 worker com o intuito de evitar falhas de concorrência / flake tests).*

- **Sharding (dividir testes entre várias instâncias / máquinas):**
  Ideal para paralelizar e acelerar a execução geral do CI. Exemplo de como rodar a fração 1 de 3 partes no total:
  ```bash
  yarn playwright test --shard=1/3
  ```

- **Visualizar o relatório de testes (HTML):**
  Após a execução dos testes, um relatório com o status de cada teste é gerado automaticamente. Para abri-lo:
  ```bash
  yarn playwright show-report
  ```

## 📂 Estrutura de Diretórios (Arquitetura)

Abaixo está um mapa organizacional da pasta de automação (`playwright/`), detalhando a responsabilidade de cada diretório e facilitando a localização de código e arquitetura:

```text
playwright/
├── e2e/                     # Arquivos principais contendo os cenários de testes (.spec.ts)
│   ├── checkout.spec.ts     # Cenários focados no fluxo de checkout (Ex: dados de pagamento, aprovação de crédito)
│   ├── configurator.spec.ts # Validações das configurações e regras de negócio da aplicação
│   ├── online.spec.ts       # Validações de saúde e estado de conectividade da aplicação
│   └── pedidos.spec.ts      # Cenários que envolvem fluxo de visualização e tratativa de pedidos
│
└── support/                 # Camada de suporte, abstração e utilitários
    ├── actions/             # (Feature Actions) Funções que interagem com a interface. Centraliza as ações (clicks, fills) para remover a repetição nos arquivos de testes
    ├── database/            # Scripts e conexões diretas de banco de dados específicos para automação (ex: limpar tabelas ou realizar seeds antes dos testes)
    ├── fixtures/            # Massa de dados estática estruturada, JSONs e mocks passivos usados nos testes
    ├── fixtures.ts          # Arquivo fundamental do Playwright onde injetamos e estendemos as actions e configurações globais no objeto `test`
    ├── helpers.ts           # Funções utilitárias puras (ex: geradores de strings randômicas, formatadores) usadas pontualmente
    └── mock.api.ts          # Abstrações focadas em interceptação de rede (Network Intercepts), ideal para simular APIs (como análises de crédito com score específico)
```

## 🛠️ Sobre a Configuração (`playwright.config.ts`)

O arquivo principal que dita as regras do Playwright está localizado na raiz do projeto (`playwright.config.ts`). Ele conta com algumas configurações importantes definidas:
- **Timeout Geral:** 60 segundos por cada teste completo.
- **Timeout de Expect:** 5 segundos para asserções (verificações como `toBeVisible()`).
- **Navegador Padrão:** Os projetos atualmente focam sua execução usando o motor `chromium` (simulando Desktop Chrome).
- **Rastreabilidade (Trace):** Está ligado (`trace: 'on'`), o que significa que se ocorrerem falhas, você terá um arquivo .zip visualizável da falha no report contendo tudo o que ocorreu (rede, cliques, DOM).
