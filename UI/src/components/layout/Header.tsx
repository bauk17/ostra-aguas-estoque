import { useState } from 'react';
import { Search, Bell, Settings, Download, RefreshCw } from 'lucide-react';
import { confirm, message } from '@tauri-apps/plugin-dialog';
import { check } from '@tauri-apps/plugin-updater';
import { relaunch } from '@tauri-apps/plugin-process';

export const Header = () => {
  const [isChecking, setIsChecking] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleCheckForUpdates = async () => {
    setIsChecking(true);
    setProgress(0);

    try {
      const update = await check();

      if (!update) {
        await message('Você já está na versão mais recente.', {
          title: 'Atualizações',
          kind: 'info',
        });
        return;
      }

      const shouldUpdate = await confirm(
        `Nova versão disponível: ${update.version}\n\n${update.body || 'Deseja instalar agora?'} `,
        {
          title: 'Atualização disponível',
          okLabel: 'Baixar e instalar',
          cancelLabel: 'Agora não',
        }
      );

      if (!shouldUpdate) {
        return;
      }

      let downloaded = 0;
      let contentLength = 0;

      await update.downloadAndInstall((event) => {
        switch (event.event) {
          case 'Started':
            contentLength = event.data.contentLength ?? 0;
            break;
          case 'Progress':
            downloaded += event.data.chunkLength;
            setProgress(contentLength > 0 ? Math.min((downloaded / contentLength) * 100, 100) : 0);
            break;
          case 'Finished':
            setProgress(100);
            break;
          default:
            break;
        }
      });

      await relaunch();
    } catch (error) {
      console.error('Erro ao verificar atualizações:', error);
      await message('Não foi possível verificar atualizações no momento. Tente novamente mais tarde.', {
        title: 'Erro de atualização',
        kind: 'error',
      });
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-slate-100 px-6 h-16 flex justify-between items-center">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-full text-sm focus:ring-2 focus:ring-blue-100 outline-none"
            placeholder="Pesquisar pedidos, clientes, ou estoque..."
            type="text"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleCheckForUpdates}
          disabled={isChecking}
          className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-3 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-blue-400"
        >
          {isChecking ? <RefreshCw size={16} className="animate-spin" /> : <Download size={16} />}
          <span>{isChecking ? (progress > 0 ? `Atualizando ${Math.round(progress)}%` : 'Verificando...') : 'Atualizar'}</span>
        </button>

        <button className="p-2 text-slate-500 hover:bg-blue-50 rounded-full transition-colors relative" type="button" aria-label="Notificações">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
        </button>
        <button className="p-2 text-slate-500 hover:bg-blue-50 rounded-full transition-colors" type="button" aria-label="Configurações">
          <Settings size={20} />
        </button>

        <div className="h-9 w-9 rounded-full overflow-hidden border-2 border-blue-100 shadow-sm">
          <img
            alt="Admin"
            className="w-full h-full object-cover"
            src="https://avatar.vercel.sh/ostra"
          />
        </div>
      </div>
    </header>
  );
};