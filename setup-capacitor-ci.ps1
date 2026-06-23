<# 
.SYNOPSIS
    Configura Capacitor + GitHub Actions (Android Build + Vercel Deploy) em qualquer repositório React/Capacitor

.DESCRIPTION
    Copia workflows, configura capacitor.config.ts, AndroidManifest.xml e plugins necessários.
    Deve ser executado DENTRO da pasta do repositório alvo.

.PARAMETER AppId
    Bundle ID do app (ex: com.seuapp.nome)

.PARAMETER AppName
    Nome do app (ex: "Meu App")

.PARAMETER Scheme
    Deep link scheme (ex: meuapp)

.PARAMETER VercelProject
    Se true, adiciona workflow de deploy Vercel

.EXAMPLE
    .\setup-capacitor-ci.ps1 -AppId "com.meuapp" -AppName "Meu App" -Scheme "meuapp"

.EXAMPLE
    .\setup-capacitor-ci.ps1 -AppId "com.restaurante.pdv" -AppName "Restaurante PDV" -Scheme "restaurantepdv" -VercelProject $true
#>

param(
    [Parameter(Mandatory=$true)]
    [string]$AppId,

    [Parameter(Mandatory=$true)]
    [string]$AppName,

    [Parameter(Mandatory=$true)]
    [string]$Scheme,

    [Parameter(Mandatory=$false)]
    [bool]$VercelProject = $true
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

Write-Host "🚀 Configurando Capacitor CI para: $AppName ($AppId)" -ForegroundColor Cyan

# 1. Verificar se está em um repositório git
if (-not (Test-Path ".git")) {
    Write-Host "❌ Erro: Execute este script DENTRO da pasta do repositório (precisa ter .git)" -ForegroundColor Red
    exit 1
}

# 2. Verificar se é projeto Capacitor/React
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Erro: package.json não encontrado. É um projeto Node/React?" -ForegroundColor Red
    exit 1
}

$sourceDir = "C:\Users\NexaCore\Desktop\tableflow-mt"
$targetDir = Get-Location

Write-Host "📁 Origem: $sourceDir" -ForegroundColor Gray
Write-Host "📁 Destino: $targetDir" -ForegroundColor Gray

# 3. Criar pastas necessárias
$dirs = @(
    ".github/workflows",
    "android/app/src/main/java/com/$(($AppId -replace '\.', '/'))"
)
foreach ($dir in $dirs) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "📂 Criado: $dir" -ForegroundColor Green
    }
}

# 4. Copiar workflows
Copy-Item "$sourceDir\.github\workflows\android.yml" ".\.github\workflows\" -Force
Write-Host "✅ Copiado: android.yml" -ForegroundColor Green

if ($VercelProject) {
    Copy-Item "$sourceDir\.github\workflows\vercel.yml" ".\.github\workflows\" -Force
    Write-Host "✅ Copiado: vercel.yml" -ForegroundColor Green
}

# 5. Atualizar capacitor.config.ts
$capacitorConfig = @"
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: '$AppId',
  appName: '$AppName',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: true
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true,
    buildOptions: {
      keystorePath: undefined,
      keystorePassword: undefined,
      keystoreAlias: undefined,
      keystoreAliasPassword: undefined,
    }
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#0f172a',
      showSpinner: false
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#0f172a'
    },
    Keyboard: {
      resize: 'body',
      style: 'dark',
      resizeOnFullScreen: true
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert']
    },
    LocalNotifications: {
      smallIcon: 'ic_launcher',
      iconColor: '#F59E0B',
      sound: 'beep.wav'
    },
    Geolocation: {
      skipPermissionRequests: false
    },
    App: {
      launchUrl: '$Scheme://'
    }
  }
};

export default config;
"@

$capacitorConfig | Set-Content -Path "capacitor.config.ts" -Encoding UTF8
Write-Host "✅ Atualizado: capacitor.config.ts" -ForegroundColor Green

# 6. Atualizar AndroidManifest.xml
$manifestPath = "android/app/src/main/AndroidManifest.xml"
if (Test-Path $manifestPath) {
    $manifest = Get-Content $manifestPath -Raw
    
    # Atualizar package name no manifest
    $manifest = $manifest -replace 'package="[^"]*"', "package=`"$AppId`""
    $manifest = $manifest -replace 'android:name="com\.tableflow\.mt\.', "android:name=`"$AppId."
    
    # Atualizar deep link scheme
    $manifest = $manifest -replace 'android:scheme="tableflowmt"', "android:scheme=`"$Scheme`""
    
    $manifest | Set-Content -Path $manifestPath -Encoding UTF8
    Write-Host "✅ Atualizado: AndroidManifest.xml" -ForegroundColor Green
} else {
    Write-Host "⚠️ AndroidManifest.xml não encontrado - execute 'npx cap add android' primeiro" -ForegroundColor Yellow
}

# 7. Copiar arquivos Java (serviços nativos)
$javaSourceDir = "$sourceDir\android\app\src\main\java\com\tableflow\mt"
$javaTargetDir = "android\app\src\main\java\com\$(($AppId -replace '\.', '\'))"

if (Test-Path $javaSourceDir) {
    # Criar estrutura de pastas do package
    $packagePath = $AppId -replace '\.', '\'
    $fullJavaTargetDir = "android\app\src\main\java\$packagePath"
    if (-not (Test-Path $fullJavaTargetDir)) {
        New-Item -ItemType Directory -Path $fullJavaTargetDir -Force | Out-Null
    }
    
    $javaFiles = @("TableFlowFirebaseMessagingService.java", "BootReceiver.java", "LocationForegroundService.java")
    foreach ($file in $javaFiles) {
        $content = Get-Content "$javaSourceDir\$file" -Raw
        # Atualizar package declaration
        $content = $content -replace 'package com\.tableflow\.mt;', "package $AppId;"
        $content = $content -replace 'import com\.tableflow\.mt\.', "import $AppId."
        
        $content | Set-Content -Path "$fullJavaTargetDir\$file" -Encoding UTF8
        Write-Host "✅ Copiado: $file" -ForegroundColor Green
    }
}

# 8. Copiar cores.xml
if (Test-Path "$sourceDir\android\app\src\main\res\values\colors.xml") {
    Copy-Item "$sourceDir\android\app\src\main\res\values\colors.xml" "android\app\src\main\res\values\" -Force
    Write-Host "✅ Copiado: colors.xml" -ForegroundColor Green
}

# 9. Instalar dependências npm necessárias
Write-Host "📦 Instalando plugins Capacitor..." -ForegroundColor Cyan
npm install @capacitor/push-notifications @capacitor/local-notifications @capacitor/geolocation @capacitor/app --save

# 10. Sync Capacitor
Write-Host "🔄 Sincronizando Capacitor..." -ForegroundColor Cyan
npx cap sync android

# 11. Git commit
Write-Host "📝 Commitando alterações..." -ForegroundColor Cyan
git add -A
git commit -m "ci: add Android build + Vercel deploy workflows + Capacitor native plugins

- GitHub Actions: Android debug APK + Release AAB
- GitHub Actions: Vercel preview/production deploy
- Capacitor: PushNotifications, LocalNotifications, Geolocation, App
- Native: FCM service, Boot receiver, Location foreground service
- Deep linking: $Scheme:// + Universal Links
- PWA install prompt + APK download component"

Write-Host ""
Write-Host "✅ CONFIGURAÇÃO CONCLUÍDA!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 PRÓXIMOS PASSOS:" -ForegroundColor Yellow
Write-Host "   1. Configure secrets no GitHub (Settings → Secrets → Actions):"
Write-Host "      - VERCEL_TOKEN"
Write-Host "      - VERCEL_ORG_ID"  
Write-Host "      - VERCEL_PROJECT_ID"
Write-Host "   2. Para release assinado (Play Store), adicione também:"
Write-Host "      - KEYSTORE_BASE64"
Write-Host "      - KEYSTORE_PASSWORD"
Write-Host "      - KEY_ALIAS"
Write-Host "      - KEY_PASSWORD"
Write-Host "   3. Push para disparar build:"
Write-Host "      git push origin main"
Write-Host "   4. Baixe APK em: GitHub → Actions → Artifacts"
Write-Host ""
Write-Host "🔗 Deep link: $Scheme://" -ForegroundColor Cyan