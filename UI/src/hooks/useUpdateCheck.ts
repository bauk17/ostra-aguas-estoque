import { useEffect, useState } from 'react';
import { check } from '@tauri-apps/plugin-updater';
import { confirm, message } from '@tauri-apps/plugin-dialog';
import { relaunch } from '@tauri-apps/plugin-process';

export const useUpdateCheck = () => {
  const [isChecking, setIsChecking] = useState(false);
  const [progress, setProgress] = useState(0);

  const checkForUpdates = async (autoCheck = false) => {
    setIsChecking(true);
    setProgress(0);

    try {
      const update = await check();

      if (!update) {
        if (!autoCheck) {
          await message('Você já está na versão mais recente.', {
            title: 'Atualizações',
            kind: 'info',
          });
        }
        return;
      }

      const shouldUpdate = await confirm(
        `Nova versão disponível: ${update.version}\n\n${update.body || 'Deseja instalar agora?'}`,
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
      if (!autoCheck) {
        await message('Não foi possível verificar atualizações no momento. Tente novamente mais tarde.', {
          title: 'Erro de atualização',
          kind: 'error',
        });
      }
    } finally {
      setIsChecking(false);
    }
  };

  // Auto-check ao iniciar a aplicação
  useEffect(() => {
    checkForUpdates(true);
  }, []);

  return {
    isChecking,
    progress,
    checkForUpdates,
  };
};
