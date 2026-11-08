import JSZip from 'jszip';
import { exportFullBackup } from './storage';

export async function downloadProjectZip() {
  const zip = new JSZip();

  // 1. Root configuration files
  zip.file(
    'package.json',
    JSON.stringify(
      {
        name: 'khanepani-erp',
        private: true,
        version: '1.0.0',
        type: 'module',
        scripts: {
          dev: 'vite',
          build: 'vite build',
          preview: 'vite preview',
          lint: 'tsc --noEmit',
        },
        dependencies: {
          'lucide-react': '^0.546.0',
          react: '^19.0.1',
          'react-dom': '^19.0.1',
          jszip: '^3.10.1',
        },
        devDependencies: {
          '@tailwindcss/vite': '^4.3.3',
          '@types/react': '^19.3.0',
          '@types/react-dom': '^19.3.0',
          '@vitejs/plugin-react': '^6.1.1',
          tailwindcss: '^4.3.3',
          typescript: '^7.0.2',
          vite: '^8.3.0',
        },
      },
      null,
      2
    )
  );

  zip.file(
    'vite.config.ts',
    `import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    base: './', // Relative base for GitHub Pages and sub-directory deployment
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
  };
});
`
  );

  zip.file(
    'tsconfig.json',
    JSON.stringify(
      {
        compilerOptions: {
          target: 'ES2022',
          module: 'ESNext',
          moduleResolution: 'bundler',
          jsx: 'react-jsx',
          strict: true,
          skipLibCheck: true,
          paths: {
            '@/*': ['./*'],
          },
        },
        include: ['src'],
      },
      null,
      2
    )
  );

  zip.file(
    '.gitignore',
    `node_modules
dist
dist-ssr
*.local
.DS_Store
.env
`
  );

  // 1-Click Windows Offline Launcher
  zip.file(
    'START-OFFLINE.bat',
    `@echo off
title Khanepani ERP Offline Launcher
echo ========================================================
echo  Khanepani ERP Offline Launcher (खानेपानी तथा सरसफाइ ERP)
echo ========================================================
echo.
echo 1. Checking dependencies...
if not exist node_modules (
    echo Installing required packages for offline use...
    call npm install
)
echo 2. Launching local offline server...
start http://localhost:5173
call npm run dev
pause
`
  );

  // 1-Click Mac/Linux Offline Launcher
  zip.file(
    'START-OFFLINE.sh',
    `#!/bin/bash
echo "Starting Khanepani ERP Offline..."
if [ ! -d "node_modules" ]; then
    npm install
fi
open http://localhost:5173 || xdg-open http://localhost:5173
npm run dev
`
  );

  zip.file(
    'index.html',
    `<!doctype html>
<html lang="ne">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>खानेपानी तथा सरसफाइ उपभोक्ता संस्था व्यवस्थापन प्रणाली (Khanepani ERP)</title>
    <meta name="description" content="नेपाली खानेपानी तथा सरसफाइ उपभोक्ता संस्था र सहकारीको लागि पूर्ण लेखा, युनिट रिडिङ, महसुल, ऋण असुली, बैंक, आम्दानी-खर्च, ट्याङ्कर पानी बिक्री, रिपोर्ट र ह्वाट्सएप सूचना प्रणाली।" />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Mukta:wght@300;400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`
  );

  // 2. GitHub Actions automated workflow for 100% Free Hosting
  zip.file(
    '.github/workflows/deploy.yml',
    `name: Deploy to GitHub Pages

on:
  push:
    branches: ["main", "master"]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build-and-deploy:
    environment:
      name: github-pages
      url: \${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install dependencies
        run: npm ci || npm install

      - name: Build project
        run: npm run build

      - name: Setup Pages
        uses: actions/configure-pages@v5

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
`
  );

  // 3. Clear Step-by-Step Hosting Guide in Nepali & English
  zip.file(
    'README.md',
    `# खानेपानी तथा सरसफाइ उपभोक्ता संस्था व्यवस्थापन प्रणाली (Khanepani ERP)

नेपाली खानेपानी तथा सरसफाइ उपभोक्ता संस्था र बहुउद्देश्यीय सहकारीहरूको लागि निर्मित पूर्ण डिजिटल सफ्टवेयर।

---

## 🚀 GitHub बाट सित्तैमा (Free) अनलाइन चलाउने तरिका:

यो सफ्टवेयरलाई GitHub Pages वा Vercel मार्फत आजीवन १००% सित्तैमा अनलाइन राख्न सकिन्छ। कुनै होस्टिङ वा डोमेन किन्नु पर्दैन।

### विधि १: GitHub Pages मार्फत (सिफारिस गरिएको - १००% Free)
1. **GitHub मा नयाँ Repository बनाउनुहोस्:**
   - [github.com](https://github.com) मा जानुहोस् र लगइन गर्नुहोस्।
   - माथि दायाँ कुनामा **+** थिचेर **New repository** मा जानुहोस्।
   - Repository name मा \`khanepani-erp\` राख्नुहोस् र **Public** छान्नुहोस्।
   - **Create repository** थिच्नुहोस्।

2. **यो प्रोजेक्टका फाइलहरू अपलोड गर्नुहोस्:**
   - यो ZIP फाइललाई आफ्नो कम्प्युटरमा Unzip गर्नुहोस्।
   - GitHub को नयाँ Repository पेजमा **uploading an existing file** लिङ्क देखिनेछ, त्यसमा क्लिक गर्नुहोस्।
   - सबै फाइल र फोल्डरहरू (\`.github\`, \`src\`, \`index.html\`, \`package.json\`, आदि) Drag & Drop गरी **Commit changes** थिच्नुहोस्।
   *(वा Git कमाण्ड लाइन चलाउन जान्नुहुन्छ भने: \`git init\`, \`git add .\`, \`git commit -m "initial commit"\`, \`git branch -M main\`, \`git push -u origin main\`)*

3. **GitHub Pages सक्रिय (Enable) गर्नुहोस्:**
   - GitHub रिपोजिटोरीको **Settings** ट्याबमा जानुहोस्।
   - देब्रेपट्टि रहेको मेनुबाट **Pages** मा क्लिक गर्नुहोस्।
   - **Build and deployment** खण्डमा:
     - **Source**: **GitHub Actions** छान्नुहोस्।
   - अब यस प्रोजेक्टमा पहिल्यै समावेश गरिएको \`.github/workflows/deploy.yml\` ले स्वचालित रूपमा १ देखि २ मिनेटभित्र वेबसाइट बिल्ड गरी अनलाइन गर्दिनेछ!

4. **तपाईंको अनलाइन लिङ्क तयार हुन्छ:**
   - \`https://<तपाईंको-GitHub-Username>.github.io/khanepani-erp/\`
   - अब जुनसुकै मोबाइल वा कम्प्युटरबाट यो लिङ्क खोलेर इन्टरनेटमा सफ्टवेयर चलाउन सक्नुहुन्छ।

---

### विधि २: Vercel मार्फत (१-क्लिकमा Free Domain & Hosting)
1. [vercel.com](https://vercel.com) मा जानुहोस् र **Continue with GitHub** गरी लगइन गर्नुहोस्।
2. **Add New...** -> **Project** मा जानुहोस्।
3. GitHub मा अपलोड गरिएको \`khanepani-erp\` रिपोजिटोरी छानेर **Import** थिच्नुहोस्।
4. **Deploy** बटन थिच्नुहोस्।
5. करिब ३० सेकेन्डमै \`https://khanepani-erp.vercel.app\` जस्तो आकर्षक र छिटो चल्ने निःशुल्क वेबसाइट तयार हुन्छ!

---

## 💻 आफ्नै कम्प्युटरमा Local चलाउने तरिका (Offline/Local Development):
1. Node.js (v18 वा सोभन्दा माथि) इन्स्टल भएको हुनुपर्छ।
2. टर्मिनल वा कमाण्ड प्रम्प्टमा खोल्नुहोस्:
   \`\`\`bash
   npm install
   npm run dev
   \`\`\`
3. ब्राउजरमा \`http://localhost:5173\` खोल्नुहोस्।

---

## 📦 डाटाबेस ब्याकअप र सुरक्षा:
- यस सफ्टवेयरमा भएको सम्पूर्ण डाटाबेस \`backup-database-snapshot.json\` मा ब्याकअप भएर बसेको छ।
- सफ्टवेयरको **"सपोर्ट तथा ब्याकअप"** मेनुबाट जुनसुकै बेला नयाँ ब्याकअप डाउनलोड गर्न र रिस्टोर गर्न सकिन्छ।
`
  );

  // 4. Try to fetch and include actual source files dynamically from runtime
  const filePaths = [
    '/src/main.tsx',
    '/src/index.css',
    '/src/App.tsx',
    '/src/types/index.ts',
    '/src/utils/nepaliDate.ts',
    '/src/utils/storage.ts',
    '/src/utils/whatsapp.ts',
    '/src/utils/sourceBundle.ts',
    '/src/components/Navbar.tsx',
    '/src/components/Sidebar.tsx',
    '/src/components/LoginModal.tsx',
    '/src/components/LoanAlertModal.tsx',
    '/src/components/ReceiptPrintModal.tsx',
    '/src/views/DashboardView.tsx',
    '/src/views/SettingsView.tsx',
    '/src/views/UnitEntryView.tsx',
    '/src/views/AmountEntryView.tsx',
    '/src/views/KycView.tsx',
    '/src/views/LoanView.tsx',
    '/src/views/BankView.tsx',
    '/src/views/IncomeView.tsx',
    '/src/views/ExpenseView.tsx',
    '/src/views/StaffView.tsx',
    '/src/views/TankerSalesView.tsx',
    '/src/views/MeterSheetView.tsx',
    '/src/views/ReportsView.tsx',
    '/src/views/MasterDatabaseView.tsx',
    '/src/views/SupportView.tsx',
  ];

  for (const path of filePaths) {
    try {
      const res = await fetch(path);
      if (res.ok) {
        const text = await res.text();
        // Remove leading slash for zip path
        const relativePath = path.startsWith('/') ? path.slice(1) : path;
        zip.file(relativePath, text);
      }
    } catch (e) {
      console.warn(`Could not fetch ${path} for zip, skipping.`, e);
    }
  }

  // Add exported database snapshot
  zip.file('backup-database-snapshot.json', exportFullBackup());

  // Generate ZIP blob and trigger browser download
  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `khanepani_erp_github_ready_bundle_${Date.now()}.zip`;
  a.click();
  URL.revokeObjectURL(url);
}
