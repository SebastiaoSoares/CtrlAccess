<p align="center">
<img src="./public/logo.png" alt="CtrlAccess" width="350">
</p>

<p align="center">
Sistema de monitoramento integrado à API da Control iD, projetado para automatizar o ciclo de abertura e trancamento de acessos em rede local (LAN).
</p>

## Sobre o Projeto

Através de uma interface intuitiva Single Page Application (SPA), o usuário agenda horários programados, permitindo que o sistema gerencie remotamente os bloqueios, garantindo segurança operacional e autonomia na gestão de fluxos. O sistema gerencia o ciclo de liberação, bloqueio e rotinas baseadas em regras de horário comunicando-se diretamente via protocolo HTTP local com a API nativa dos equipamentos.

## Funcionalidades

De acordo com a Especificação de Requisitos, o sistema contempla os seguintes módulos:

### Gestão de Dispositivos

- Manutenção: Interface CRUD para gerenciar terminais, catracas e portas (Nome, Setor, IP, Porta, Usuário, Senha).
- Monitoramento de Status: Verificações assíncronas (healthcheck/ping) refletindo o status atual (Online/Offline) em tempo real.
- Atuação Manual: Disparo remoto de comandos para abrir relés (portas) ou reiniciar dispositivos.
- Controle de Estado: Mudança lógica de operação entre Normal (validação biométrica/facial), Liberado (catraca/porta livre) e Trancado (lockdown total).

### Automação e Regras

- Agendamentos (Schedules): Criação de rotinas para dias e horários específicos por grupos de dispositivos.
- Motor de Automação: Worker em background (cron) que avalia regras e aciona fisicamente o hardware de forma autônoma.

### Segurança

- Controle de Acesso ao Sistema: Autenticação protegida por JWT (JSON Web Tokens) e senhas criptografadas (bcrypt). Credenciais de hardware nunca são expostas para o cliente (Frontend).

## Tecnologias e Arquitetura

O projeto adota uma arquitetura Cliente-Servidor Desacoplada organizada fisicamente em um Monorepo, com forte separação de conceitos (SoC).

### Backend (API RESTful)

- Node.js com Express.js (ES Modules)
- Banco de dados: SQLite (via better-sqlite3)
- Agendador de Tarefas: node-cron
- Segurança: jsonwebtoken (JWT) e bcrypt
- Requisições HTTP (Hardware): Axios / Fetch API

### Frontend (SPA)

- HTML5 & CSS3 (Design Responsivo e Componentizado)
- Vanilla JavaScript (ES6+)
- Comunicação via Fetch API Assíncrona (Sem reload de página)

## Organização do Projeto

```bash
/
├── data/               # Instância física do banco de dados relacional (SQLite)
├── docs/               # Diagramas, ERS e documentação do projeto
├── prototype/          # Mockups estáticos e interface de demonstração
├── public/             # Assets globais (favicon, logos)
├── src/
│   ├── backend/        # Servidor Node.js e API
│   │   ├── config/     # Definições de ambiente (ENV) e constantes
│   │   ├── routes/     # Declaração de rotas da API
│   │   ├── controllers/# Validação de I/O (Requests/Responses HTTP)
│   │   ├── services/   # Regras de negócio, Integração de Hardware e Cron
│   │   ├── middlewares/# Interceptadores e validação JWT
│   │   ├── app.js      # Bootstrap da aplicação Express
│   │   └── server.js   # Entrypoint do servidor Node.js
│   └── frontend/       # Interface SPA Client-side
│       ├── index.html  # Entrypoint SPA (DOM Container)
│       ├── css/        # Folhas de estilo global e de componentes
│       ├── js/
│       │   ├── app.js  # Orquestrador de estado e roteamento
│       │   ├── views/  # Controladores de visualização (Telas)
│       │   ├── components/ # Componentes de UI reutilizáveis
│       │   └── services/   # Clientes de API (Fetch requests)
├── .gitignore
├── LICENSE
└── README.md
```

## Como visualizar o protótipo

Atualmente, o repositório contém o protótipo funcional de Frontend com dados mockados.

Clone o repositório:

```bash
git clone https://github.com/SebastiaoSoares/CtrlAccess.git
```

Abra a pasta prototype e execute o arquivo index.html em seu navegador. (Recomendado utilizar uma extensão como Live Server do VSCode).

## Aviso Legal

O CtrlAccess é um software independente. Não possui qualquer vínculo comercial, parceria ou endosso da empresa Control iD. A comunicação com o hardware é realizada estritamente via protocolo HTTP local público (API nativa dos equipamentos), sob administração, segurança e total responsabilidade da infraestrutura do usuário final.

## Licença

Este projeto está sob a [licença MIT](./LICENSE).