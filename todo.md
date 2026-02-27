# Sistema de Identificação Facial para Escolas Infantis - TODO

## Banco de Dados
- [x] Criar tabela de crianças (children) com foto facial e informações
- [x] Criar tabela de responsáveis (guardians) com foto facial e dados
- [x] Criar tabela de autorizações (authorizations) vinculando responsáveis a crianças
- [x] Criar tabela de histórico de saídas (exit_logs) com detalhes completos
- [x] Criar tabela de embeddings faciais para otimização de busca
- [x] Executar migrações do banco de dados

## Backend - APIs
- [x] Criar endpoints de cadastro de crianças
- [x] Criar endpoints de cadastro de responsáveis
- [x] Criar endpoints de gestão de autorizações
- [x] Criar endpoints de consulta de histórico de saídas
- [x] Criar endpoints de reconhecimento facial
- [x] Implementar autenticação e autorização de usuários

## Módulo de Captura Facial
- [x] Integrar biblioteca de reconhecimento facial (face-api.js)
- [x] Implementar captura de foto via webcam
- [x] Implementar geração de embeddings faciais
- [x] Criar interface de captura para crianças
- [x] Criar interface de captura para responsáveis
- [x] Validar qualidade da foto capturada

## Reconhecimento Facial em Tempo Real
- [x] Implementar matching de embeddings faciais
- [x] Criar algoritmo de comparação de similaridade
- [x] Otimizar performance para tempo real
- [ ] Implementar cache de embeddings

## Painel Administrativo
- [x] Criar layout do painel de administração
- [x] Implementar listagem de crianças
- [ ] Implementar CRUD completo de crianças
- [x] Implementar listagem de responsáveis
- [ ] Implementar CRUD completo de responsáveis
- [x] Implementar gestão de autorizações
- [x] Adicionar filtros e busca

## Interface de Portaria
- [x] Criar interface dedicada para portaria
- [x] Implementar câmera ao vivo
- [x] Implementar captura e reconhecimento em tempo real
- [x] Exibir resultado da identificação
- [x] Exibir informações de autorização
- [x] Implementar botão de liberação/bloqueio
- [ ] Adicionar feedback visual e sonoro

## Histórico e Dashboard
- [x] Criar página de histórico de saídas
- [x] Implementar filtros (criança, responsável, status)
- [ ] Implementar paginação avançada
- [x] Criar dashboard com estatísticas básicas
- [ ] Implementar gráficos de saídas diárias
- [ ] Adicionar alertas de tentativas não autorizadas

## Sistema de Notificações
- [ ] Integrar sistema de notificações built-in
- [ ] Implementar notificação em caso de acesso não autorizado
- [ ] Implementar notificação de saída bem-sucedida
- [ ] Configurar alertas para administradores

## Testes e Otimizações
- [ ] Escrever testes unitários
- [ ] Testar fluxo completo de identificação
- [ ] Otimizar performance de reconhecimento facial
- [ ] Testar em diferentes navegadores
- [ ] Validar segurança de dados
- [ ] Criar checkpoint final


## Ajustes Solicitados
- [x] Permitir upload de arquivo de foto no cadastro de crianças
- [x] Permitir upload de arquivo de foto no cadastro de responsáveis
- [x] Corrigir câmera que não abre imagem no FaceCapture
- [x] Criar script de mock data com 150 crianças
- [x] Criar 10 salas de aula
- [x] Criar 350 responsáveis com autorizações
- [x] Gerar 5 dias de registros de saída (entrada e saída)
- [x] Testar sistema com dados realistas (1056 registros gerados)
