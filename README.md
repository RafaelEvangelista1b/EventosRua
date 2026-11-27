# EventosRua

Aplicativo para acompanhar o deslocamento de blocos de rua e procissões urbanas pela localização do dispositivo. A tela exibe latitude, longitude, precisão em metros e o estado do rastreamento.

## Tecnologias

React, Vite, JavaScript, CSS, Capacitor para Android e o plugin oficial `@capacitor/geolocation`. O plugin `@capacitor/app` encerra o monitoramento quando a atividade do Android sai do primeiro plano.

## Funcionalidades

- Verificação da permissão de localização e solicitação nativa no Android.
- Início e parada do rastreamento com atualização automática das coordenadas.
- Abertura da última posição capturada no Google Maps, por URL e sem chave de API.
- Mensagens para permissão negada, localização desativada ou indisponível e tempo esgotado.

A última posição fica na memória durante a sessão. Ao voltar ao aplicativo ou à aba, inicie o rastreamento novamente.

## Instalação

Com Node.js 22.12 ou superior e npm, execute na pasta do projeto:

```bash
npm ci
```

## Navegador

```bash
npm run dev
```

Abra o endereço `localhost` mostrado no terminal e permita o acesso à localização. Em outro dispositivo, use HTTPS, pois a geolocalização exige um contexto seguro. O navegador pode usar outras fontes de localização conforme o dispositivo.

## Android

Com o Android Studio 2024.2.1 ou superior, JDK 21 e o SDK Android 35 instalados, execute:

```bash
npm run build
npx cap sync android
npx cap open android
```

No Android Studio, aguarde a sincronização do Gradle, selecione um smartphone com depuração USB habilitada ou um emulador com Google Play Services e clique em **Run**. Repita o build e a sincronização após mudanças na interface.

## Como testar o GPS

1. Em um smartphone Android, ative a localização e abra o EventosRua.
2. Toque em **Iniciar rastreamento** e permita o acesso durante o uso. Se possível, conceda localização precisa.
3. Aguarde a primeira posição, desloque-se e confirme que os valores se atualizam.
4. Toque em **Abrir no Google Maps** e compare o local com a posição exibida.
5. Volte ao app, reinicie o rastreamento e teste **Parar rastreamento**. As últimas coordenadas devem permanecer na tela sem atualizações.
6. Teste novamente com a permissão negada ou com a localização desligada. Verifique a mensagem, restabeleça o acesso nas configurações e tente outra vez.

## Publicação no GitHub

Crie manualmente no site do GitHub um repositório vazio chamado `EventosRua`. Copie o endereço fornecido pelo GitHub e substitua `URL_DO_REPOSITORIO`:

```bash
git remote add origin URL_DO_REPOSITORIO
git push -u origin main
```


## APK pelo GitHub Actions

O workflow **Gerar APK** roda a cada envio à branch `main`. Para rodar manualmente, abra a aba **Actions** do repositório, selecione **Gerar APK** e clique em **Run workflow**.

Quando a execução terminar, abra o resumo e baixe **EventosRua.apk** em **Artifacts**. Abra o arquivo no smartphone Android para instalar. O APK usa a assinatura de depuração do Gradle e pode ser instalado diretamente no aparelho.
