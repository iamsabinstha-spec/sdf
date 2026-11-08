import React, { useState } from 'react';
import {
  LifeBuoy,
  Download,
  Upload,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Code2,
  FileCode,
  ShieldCheck,
  Server,
  Copy,
  Check,
} from 'lucide-react';
import { exportFullBackup, importFullBackup, resetToSampleData } from '../utils/storage';
import { downloadProjectZip } from '../utils/sourceBundle';
import { OrganizationSettings } from '../types';

interface Props {
  settings: OrganizationSettings;
  onRefreshData: () => void;
}

export const SupportView: React.FC<Props> = ({ settings, onRefreshData }) => {
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [restoreJson, setRestoreJson] = useState<string>('');
  const [isZipping, setIsZipping] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Full Source Code ZIP download
  const handleDownloadSourceZip = async () => {
    try {
      setIsZipping(true);
      await downloadProjectZip();
      setSuccessMessage('सफ्टवेयरको सम्पूर्ण सोर्स कोड (.ZIP) सफलतापूर्वक डाउनलोड भयो!');
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      console.error(err);
      setErrorMessage('सोर्स कोड ZIP तयार गर्दा समस्या आयो।');
    } finally {
      setIsZipping(false);
    }
  };

  // Backup Download Handler
  const handleDownloadBackup = () => {
    try {
      const backupJson = exportFullBackup();
      const blob = new Blob([backupJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `khanepani_erp_full_backup_${settings.currentSystemDateBS.replace(/\//g, '-')}_${Date.now()}.json`;
      link.click();
      setSuccessMessage('संस्थाको सम्पूर्ण डाटाबेस ब्याकअप फाइल (.json) सफलतापूर्वक डाउनलोड भयो!');
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      setErrorMessage('ब्याकअप डाउनलोड गर्दा त्रुटि भयो।');
    }
  };

  // Restore Handler from Text / File
  const handleRestoreFromJson = () => {
    if (!restoreJson.trim()) {
      setErrorMessage('कृपया ब्याकअप JSON कोड पेस्ट गर्नुहोस्।');
      return;
    }
    const success = importFullBackup(restoreJson);
    if (success) {
      setSuccessMessage('डाटाबेस सफलतापूर्वक रिस्टोर भयो!');
      setRestoreJson('');
      onRefreshData();
      setTimeout(() => setSuccessMessage(''), 5000);
    } else {
      setErrorMessage('अमान्य ब्याकअप फाइल! कृपया मान्य JSON फाइल छान्नुहोस्।');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setRestoreJson(content);
        const success = importFullBackup(content);
        if (success) {
          setSuccessMessage('अपलोड गरिएको फाइलबाट डाटाबेस सफलतापूर्वक रिस्टोर भयो!');
          onRefreshData();
          setTimeout(() => setSuccessMessage(''), 5000);
        } else {
          setErrorMessage('अपलोड गरिएको फाइल रिस्टोर गर्न सकिएन।');
        }
      }
    };
    reader.readAsText(file);
  };

  // Factory Reset Handler
  const handleReset = () => {
    if (
      confirm(
        'चेतावनी: के तपाईं सफ्टवेयरलाई सुरुवाती नमुना (Sample Data) मा रिसेट गर्न निश्चित हुनुहुन्छ? नयाँ थपिएका विवरणहरू पुनः पूर्वावस्थामा फर्कनेछन्।'
      )
    ) {
      resetToSampleData();
      onRefreshData();
      setSuccessMessage('सफ्टवेयर सफलतापूर्वक नमुना डाटामा रिसेट भयो!');
      setTimeout(() => setSuccessMessage(''), 5000);
    }
  };

  const handleCopyCurrentBackupCode = () => {
    const jsonStr = exportFullBackup();
    navigator.clipboard.writeText(jsonStr);
    setCopiedCode(true);
    setSuccessMessage('डाटाबेस ब्याकअप कोड क्लिपबोर्डमा कपी भयो!');
    setTimeout(() => {
      setCopiedCode(false);
      setSuccessMessage('');
    }, 4000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-blue-600 p-3 text-white shadow-md shadow-blue-500/20">
            <LifeBuoy className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              सपोर्ट, डाटा ब्याकअप र प्रणाली व्यवस्थापन
            </h2>
            <p className="text-xs text-slate-500">
              सम्पूर्ण डाटा ब्याकअप डाउनलोड, रिस्टोर (अपलोड), नमुना डाटा रिसेट र प्रणाली कोड संरचना
            </p>
          </div>
        </div>

        {/* Alerts */}
        {successMessage && (
          <div className="mt-4 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{successMessage}</span>
          </div>
        )}
        {errorMessage && (
          <div className="mt-4 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-800 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
            <span className="font-semibold">{errorMessage}</span>
          </div>
        )}
      </div>

      {/* Source Code Download for GitHub Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950 p-6 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4 border border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-400/30 px-3 py-0.5 text-xs font-bold">
              GitHub Pages & Free Web Hosting Ready
            </span>
            <h3 className="text-base font-bold text-white">
              सम्पूर्ण सफ्टवेयर कोड (.ZIP) डाउनलोड गर्नुहोस्
            </h3>
          </div>
          <p className="text-xs text-slate-300">
            यसमा सम्पूर्ण React, Tailwind, TypeScript कोड, र स्वचालित GitHub Actions Deployment Workflow (.github/workflows/deploy.yml) समावेश छ।
            यसलाई १-क्लिकमा डाउनलोड गरी GitHub Pages वा Vercel मार्फत १००% सित्तैमा अनलाइन चलाउन सकिन्छ।
          </p>
        </div>
        <button
          onClick={handleDownloadSourceZip}
          disabled={isZipping}
          className="flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-xs font-bold text-slate-950 shadow-md hover:bg-emerald-400 disabled:opacity-50 transition shrink-0"
        >
          <Download className="h-5 w-5" />
          <span>{isZipping ? 'ZIP तयार हुँदैछ...' : 'GitHub-Ready प्रोजेक्ट (.ZIP) डाउनलोड'}</span>
        </button>
      </div>

      {/* GitHub Free Hosting Step-by-Step Guide Box */}
      <div className="rounded-2xl bg-white p-6 border-2 border-indigo-200 shadow-sm space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
          <div className="rounded-xl bg-indigo-50 p-2 text-indigo-600">
            <Code2 className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">
              यो सफ्टवेयरलाई GitHub बाट सित्तैमा (Free) अनलाइन चलाउने सजिलो तरिका
            </h3>
            <p className="text-xs text-slate-500">
              कुनै डोमेन वा होस्टिङ किन्नु पर्दैन — GitHub Pages वा Vercel मार्फत आजीवन नि:शुल्क चल्छ
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Method 1: GitHub Pages */}
          <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-sm text-blue-700">
                विधि १: GitHub Pages मार्फत (100% Free)
              </span>
              <span className="rounded-full bg-blue-100 text-blue-800 px-2.5 py-0.5 text-[10px] font-bold">
                सिफारिस गरिएको
              </span>
            </div>

            <ol className="list-decimal list-inside space-y-1.5 text-slate-700 leading-relaxed">
              <li>
                माथिको बटनबाट <strong>प्रोजेक्ट (.ZIP) डाउनलोड</strong> गर्नुहोस् र कम्प्युटरमा Unzip गर्नुहोस्।
              </li>
              <li>
                <a
                  href="https://github.com/new"
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold text-blue-600 underline"
                >
                  github.com/new
                </a> मा गई Repository name मा <code>khanepani-erp</code> राख्नुहोस् र <strong>Create repository</strong> थिच्नुहोस्।
              </li>
              <li>
                GitHub मा <strong>uploading an existing file</strong> मा क्लिक गरी अनजिप गरिएका सबै फाइलहरू (सहित <code>.github</code> फोल्डर) अपलोड गर्नुहोस् र Commit गर्नुहोस्।
              </li>
              <li>
                रिपोजिटोरीको <strong>Settings</strong> ➔ <strong>Pages</strong> मा जानुहोस्।
              </li>
              <li>
                <strong>Build and deployment</strong> को Source मा <strong>GitHub Actions</strong> छान्नुहोस्।
              </li>
              <li className="font-semibold text-emerald-700">
                १-२ मिनेटमा <code>https://&lt;Username&gt;.github.io/khanepani-erp/</code> मा सफ्टवेयर स्वतः अनलाइन खुल्नेछ!
              </li>
            </ol>
          </div>

          {/* Method 2: Vercel */}
          <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-sm text-indigo-700">
                विधि २: Vercel मार्फत (१-क्लिकमा नि:शुल्क)
              </span>
              <span className="rounded-full bg-indigo-100 text-indigo-800 px-2.5 py-0.5 text-[10px] font-bold">
                सुपर फास्ट
              </span>
            </div>

            <ol className="list-decimal list-inside space-y-1.5 text-slate-700 leading-relaxed">
              <li>
                GitHub मा आफ्नो रिपोजिटोरी बनाइसकेपछि <a href="https://vercel.com" target="_blank" rel="noreferrer" className="font-bold text-indigo-600 underline">vercel.com</a> मा जानुहोस्।
              </li>
              <li>
                <strong>Continue with GitHub</strong> गरी लगइन गर्नुहोस्।
              </li>
              <li>
                <strong>Add New...</strong> ➔ <strong>Project</strong> थिच्नुहोस् र आफ्नो <code>khanepani-erp</code> रिपोजिटोरी छान्नुहोस्।
              </li>
              <li>
                <strong>Deploy</strong> बटनमा १-क्लिक गर्नुहोस्।
              </li>
              <li className="font-semibold text-emerald-700">
                ३० सेकेन्डमै <code>https://khanepani-erp.vercel.app</code> लिंकमा सफ्टवेयर लाइभ हुनेछ!
              </li>
            </ol>
          </div>
        </div>
      </div>

      {/* Offline Usage Step-by-Step Guide Card */}
      <div className="rounded-2xl bg-white p-6 border-2 border-emerald-300 shadow-sm space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
          <div className="rounded-xl bg-emerald-50 p-2 text-emerald-600">
            <Server className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">
              यो सफ्टवेयरलाई १००% अफलाइन (इन्टरनेट बिना) कसरी चलाउने?
            </h3>
            <p className="text-xs text-slate-500">
              गाउँघर वा दुर्गम स्थान जहाँ इन्टरनेट छैन, त्यहाँ पनि यो सफ्टवेयर पूर्ण रूपमा चल्छ
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Offline Option 1: PWA Desktop & Mobile App */}
          <div className="rounded-xl bg-emerald-50/50 p-4 border border-emerald-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-900 text-sm">
                तरिका १: कम्प्युटर वा मोबाइलमा App इन्स्टल गर्ने (सबैभन्दा सजिलो)
              </span>
              <span className="rounded-full bg-emerald-600 text-white px-2 py-0.5 text-[10px] font-bold">
                PWA Ready
              </span>
            </div>

            <ol className="list-decimal list-inside space-y-1.5 text-slate-700 leading-relaxed">
              <li>
                यो वेबसाइटलाई एकपटक Google Chrome वा Edge ब्राउजरमा खोल्नुहोस्।
              </li>
              <li>
                ब्राउजरको ठेगाना बार (Address Bar) को दायाँ छेउमा रहेको <strong>Install App (⬇️)</strong> वा मोबाइलको मेनुमा रहेको <strong>"Add to Home Screen"</strong> मा थिच्नुहोस्।
              </li>
              <li>
                अब तपाईंको मोबाइल वा कम्प्युटरको डेस्कटपमा <strong>"खानेपानी ERP"</strong> को एप आइकन बस्छ।
              </li>
              <li className="font-semibold text-emerald-800">
                ✅ अब इन्टरनेट बन्द (WiFi / Data Off) गर्दा पनि यो एप पुरै चल्छ! सबै रिडिङ, रसिद र स्टेटमेन्टहरू तपाईंको आफ्नै कम्प्युटर/मोबाइलमै सुरक्षित हुन्छन्।
              </li>
            </ol>
          </div>

          {/* Offline Option 2: Localhost Run via START-OFFLINE.bat */}
          <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-sm text-slate-800">
                तरिका २: आफ्नै ल्यापटप/कम्प्युटरमा Offline चलाउने
              </span>
              <span className="rounded-full bg-slate-800 text-white px-2 py-0.5 text-[10px] font-bold">
                1-Click Batch Run
              </span>
            </div>

            <ol className="list-decimal list-inside space-y-1.5 text-slate-700 leading-relaxed">
              <li>
                माथिको <strong>"GitHub-Ready प्रोजेक्ट (.ZIP) डाउनलोड"</strong> हरियो बटन थिच्नुहोस्।
              </li>
              <li>
                डाउनलोड भएको फाइललाई Unzip गर्नुहोस्।
              </li>
              <li>
                फोल्डरभित्र रहेको <strong><code>START-OFFLINE.bat</code></strong> फाइलमा डबल-क्लिक (Double Click) गर्नुहोस्।
              </li>
              <li>
                यसले तपाईंको आफ्नै कम्प्युटरमा स्वतः लोकल सर्भर सुरु गरी ब्राउजरमा <code>http://localhost:5173</code> मा सफ्टवेयर खोलिदिन्छ।
              </li>
              <li className="font-semibold text-slate-900">
                ✅ कुनै पनि इन्टरनेट नभए पनि तपाईंको कार्यालयको कम्प्युटरमा निरन्तर काम गर्न सकिन्छ।
              </li>
            </ol>
          </div>
        </div>
      </div>

      {/* Main Grid Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Action 1: Full Backup Download */}
        <div className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="rounded-xl bg-blue-50 p-3 text-blue-600 w-fit mb-3">
              <Download className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">१. डाटाबेस ब्याकअप डाउनलोड गर्नुहोस्</h3>
            <p className="text-xs text-slate-500 mt-1">
              संस्थाका सम्पूर्ण ग्राहक, युनिट रिडिङ, महसुल, ऋण, बैंक, कर्मचारी, गाडी बिक्री र आम्दानी खर्च विवरणहरू सुरक्षित .json फाइलमा डाउनलोड गर्नुहोस्।
            </p>
          </div>
          <div className="space-y-2">
            <button
              onClick={handleDownloadBackup}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition"
            >
              <Download className="h-4 w-4" />
              <span>सम्पूर्ण ब्याकअप डाउनलोड (Export)</span>
            </button>
            <button
              onClick={handleCopyCurrentBackupCode}
              className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-slate-50 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              {copiedCode ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copiedCode ? 'कपी भयो!' : 'ब्याकअप कोड कपी गर्नुहोस्'}</span>
            </button>
          </div>
        </div>

        {/* Action 2: Restore / Upload */}
        <div className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600 w-fit mb-3">
              <Upload className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">२. ब्याकअप फाइल अपलोड / रिस्टोर</h3>
            <p className="text-xs text-slate-500 mt-1">
              पहिले डाउनलोड गरिएको ब्याकअप .json फाइल छान्नुहोस् र सफ्टवेयरमा सम्पूर्ण डाटा पुनः प्राप्त गर्नुहोस्।
            </p>
          </div>

          <div>
            <label className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-emerald-300 bg-emerald-50/50 p-3 text-xs font-bold text-emerald-800 hover:bg-emerald-100 cursor-pointer transition">
              <Upload className="h-4 w-4" />
              <span>ब्याकअप फाइल छान्नुहोस् (.json)</span>
              <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>
        </div>

        {/* Action 3: Sample Reset */}
        <div className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="rounded-xl bg-rose-50 p-3 text-rose-600 w-fit mb-3">
              <RotateCcw className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">३. नमुना डेटामा रिसेट गर्नुहोस्</h3>
            <p className="text-xs text-slate-500 mt-1">
              यदि कुनै त्रुटि भएमा वा परीक्षण गर्न चाहेमा सफ्टवेयरलाई सुरुवाती आधिकारिक नमुना नेपाली तथ्याङ्कमा फर्काउन सकिन्छ।
            </p>
          </div>
          <button
            onClick={handleReset}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-800 py-2.5 text-xs font-bold text-white hover:bg-slate-900 transition"
          >
            <RotateCcw className="h-4 w-4" />
            <span>फ्याक्ट्री नमुना रिसेट</span>
          </button>
        </div>
      </div>

      {/* JSON Direct Paste Modal Area */}
      <div className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs space-y-3">
        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
          ब्याकअप कोड सिधै पेस्ट गरी रिस्टोर गर्ने वैकल्पिक अप्सन
        </h4>
        <textarea
          rows={3}
          value={restoreJson}
          onChange={(e) => setRestoreJson(e.target.value)}
          placeholder="ब्याकअप कोड यहाँ पेस्ट गर्नुहोस्..."
          className="w-full rounded-xl border border-slate-300 p-2 font-mono text-xs text-slate-800 focus:outline-hidden"
        />
        <div className="flex justify-end">
          <button
            onClick={handleRestoreFromJson}
            disabled={!restoreJson.trim()}
            className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            पेस्ट गरिएको कोडबाट रिस्टोर गर्नुहोस्
          </button>
        </div>
      </div>

      {/* System Integrity & Software Specs */}
      <div className="rounded-2xl bg-slate-900 text-white p-6 shadow-md space-y-4">
        <div className="flex items-center gap-2 text-cyan-400">
          <ShieldCheck className="h-5 w-5" />
          <h3 className="font-bold text-sm">सफ्टवेयर प्रणाली प्राविधिक विवरण</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs text-slate-300">
          <div>
            <span className="text-slate-400 block">सफ्टवेयर भर्सन:</span>
            <span className="font-bold text-white">Khanepani ERP v1.0.0 (Bikram Sambat)</span>
          </div>
          <div>
            <span className="text-slate-400 block">डाटाबेस प्रकार:</span>
            <span className="font-bold text-white">Local-First Storage (High Speed & Offline)</span>
          </div>
          <div>
            <span className="text-slate-400 block">सुरक्षा:</span>
            <span className="font-bold text-emerald-400">१००% सुरक्षित इन्क्रिप्सन & ब्याकअप</span>
          </div>
          <div>
            <span className="text-slate-400 block">सम्पर्क / सहायता:</span>
            <span className="font-bold text-white">support@khanepani.org.np</span>
          </div>
        </div>
      </div>
    </div>
  );
};
