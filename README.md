# Ostra Águas Estoque

Aplicativo desktop com Tauri + React + TypeScript.

## Auto-updater com GitHub Releases

Este projeto está configurado para usar o updater do Tauri com GitHub Releases.

### Requisitos

1. Ter uma chave de assinatura do Tauri criada localmente.
2. Configurar os secrets no GitHub:
   - `TAURI_SIGNING_PRIVATE_KEY`
   - `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` (opcional)
3. O app deve estar publicado em um repositório do GitHub com Releases habilitados.

### Gerar a chave de assinatura

```bash
cd UI
npm run tauri signer generate -- -w ~/.tauri/ostra-aguas-estoque.key
```

Depois, copie o conteúdo da chave pública para o arquivo `UI/src-tauri/tauri.conf.json` no campo `plugins.updater.pubkey`.

### Publicar uma versão

1. Atualize a versão no `UI/package.json`
2. Atualize a versão no `UI/src-tauri/tauri.conf.json`
3. Faça commit e push para a branch `release`
4. O GitHub Actions vai gerar a release e os artefatos do updater

### Observações

- O GitHub Release cria o `latest.json` automaticamente para o updater.
- O frontend usa o endpoint do GitHub Releases para verificar atualizações.
- A assinatura dos artefatos precisa corresponder à chave pública configurada no Tauri.

### Exemplo de configuração de updater no Tauri

No arquivo `UI/src-tauri/tauri.conf.json`:

```json
{
  "plugins": {
    "updater": {
      "pubkey": "PUBLIC_KEY_HERE",
      "endpoints": [
        "https://github.com/<usuario>/<repositorio>/releases/latest/download/latest.json"
      ]
    }
  }
}
```
