# 🤝 Guia de Contribuição

Obrigado por considerar contribuir com o Sistema de Agendamento para Barbearia! 

## 🚀 Como Contribuir

### 1. Fork e Clone
```bash
# Fork este repositório no GitHub
# Clone seu fork
git clone https://github.com/SEU_USUARIO/agendar-simples-barbearia.git
cd agendar-simples-barbearia
```

### 2. Configuração do Ambiente
```bash
# Instale as dependências
npm install

# Configure o Supabase (veja README.md)
# Execute o projeto
npm run dev
```

### 3. Crie uma Branch
```bash
# Para novas funcionalidades
git checkout -b feature/nome-da-funcionalidade

# Para correções
git checkout -b fix/nome-do-bug

# Para melhorias
git checkout -b improvement/nome-da-melhoria
```

### 4. Faça suas Alterações
- Siga as convenções de código existentes
- Mantenha commits pequenos e específicos
- Escreva mensagens de commit claras
- Teste suas alterações

### 5. Commit e Push
```bash
git add .
git commit -m "feat: adiciona nova funcionalidade"
git push origin sua-branch
```

### 6. Abra um Pull Request
- Use um título claro e descritivo
- Descreva as mudanças feitas
- Referencie issues relacionadas (#123)

## 📋 Padrões de Código

### Commits
Usamos [Conventional Commits](https://www.conventionalcommits.org/):
- `feat:` Nova funcionalidade
- `fix:` Correção de bug
- `docs:` Documentação
- `style:` Formatação
- `refactor:` Refatoração
- `test:` Testes
- `chore:` Tarefas gerais

### TypeScript
- Use tipos explícitos quando necessário
- Evite `any`, prefira tipos específicos
- Use interfaces para objetos complexos

### React
- Componentes funcionais com hooks
- Props tipadas com TypeScript
- Use `memo` quando apropriado para performance

### CSS/Styling
- Use Tailwind CSS para estilização
- Mantenha classes organizadas
- Use componentes shadcn/ui quando possível

## 🐛 Reportando Bugs

Ao reportar bugs, inclua:
- Descrição clara do problema
- Passos para reproduzir
- Comportamento esperado vs atual
- Screenshots/vídeos se aplicável
- Informações do ambiente (OS, browser, etc.)

## 💡 Sugerindo Funcionalidades

Para sugerir novas funcionalidades:
- Descreva claramente a funcionalidade
- Explique o problema que ela resolve
- Considere impactos na performance
- Pense na experiência do usuário

## 🧪 Testes

Antes de enviar seu PR:
- [ ] O projeto builda sem erros (`npm run build`)
- [ ] Não há warnings do ESLint (`npm run lint`)
- [ ] As funcionalidades existentes ainda funcionam
- [ ] Testou em diferentes navegadores
- [ ] Testou responsividade mobile

## 📝 Documentação

Mantenha a documentação atualizada:
- README.md para mudanças gerais
- Comentários no código para lógica complexa
- JSDoc para funções importantes

## 🙋‍♂️ Precisa de Ajuda?

- Abra uma [issue](../../issues) para discussões
- Use o rótulo `question` para dúvidas
- Consulte o README.md para configuração

## 🎯 Áreas Prioritárias

Contribuições são especialmente bem-vindas em:
- 🧪 Testes automatizados
- 📱 Melhorias de responsividade  
- ♿ Acessibilidade
- 🚀 Performance
- 🌐 Internacionalização
- 📊 Novas métricas e relatórios

---

**Obrigado por contribuir! 🚀** 