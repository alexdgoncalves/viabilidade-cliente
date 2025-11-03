# Viabilidade do Cliente

Aplicação em Next.js para apoiar o time de crédito na análise de clientes. O fluxo simula as etapas de pré-análise (bureau, faturamento, histórico de pagamento), validação de notas fiscais e emissão de parecer final, oferecendo uma visão consolidada da elegibilidade antes da liberação.

## Requisitos
- Node.js 18 ou superior
- npm (ou outro gerenciador compatível)

## Como rodar localmente
1. Instale as dependências:
   ```bash
   npm install
   ```
2. Copie o arquivo de exemplo de variáveis de ambiente, ajustando os valores conforme necessário:
   ```bash
   cp .env.example .env.local
   ```
3. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
4. Acesse `http://localhost:3000` no navegador para utilizar a aplicação.

## Scripts úteis
- `npm run dev`: inicia o ambiente de desenvolvimento.
- `npm run build`: gera a versão de produção.
- `npm run start`: sobe o servidor com o build gerado.
