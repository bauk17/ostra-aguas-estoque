import { useEffect, useState } from 'react';
import { check } from '@tauri-apps/plugin-updater';
import { confirm, message } from '@tauri-apps/plugin-dialog';
import { relaunch } from '@tauri-apps/plugin-process';

export const useUpdateCheck = () => {
  const [isChecking, setIsChecking] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Pronto para verificar atualizações');

  const checkForUpdates = async (autoCheck = false) => {
    setIsChecking(true);
    setProgress(0);
    setStatusText(autoCheck ? 'Verificando atualizações...' : 'Verificando atualização...');

    try {
      const update = await check();

      if (!update) {
        const messageText = 'Você já está na versão mais recente.';
        setStatusText(messageText);

        if (!autoCheck) {
          await message(messageText, {
            title: 'Atualizações',
            kind: 'info',
          });
        }
        return;
      }

      setStatusText(`Nova versão disponível: ${update.version}`);

      const shouldUpdate = await confirm(
        `Nova versão disponível: ${update.version}\n\n${update.body || 'Deseja instalar agora?'}`,
        {
          title: 'Atualização disponível',
          okLabel: 'Baixar e instalar',
          cancelLabel: 'Agora não',
        }
      );

      if (!shouldUpdate) {
        setStatusText('Atualização cancelada pelo usuário.');
        return;
      }

      setStatusText('Iniciando download da atualização...');

      let downloaded = 0;
      let contentLength = 0;

      await update.downloadAndInstall((event) => {
        switch (event.event) {
          case 'Started':
            contentLength = event.data.contentLength ?? 0;
            setProgress(0);
            setStatusText('Preparando download da atualização...');
            break;
          case 'Progress':
            downloaded += event.data.chunkLength;
            const nextProgress = contentLength > 0 ? Math.min((downloaded / contentLength) * 100, 100) : 0;
            setProgress(nextProgress);
            setStatusText(`Baixando atualização... ${Math.round(nextProgress)}%`);
            break;
          case 'Finished':
            setProgress(100);
            setStatusText('Download concluído. Instalando atualização...');
            break;
          default:
            break;
        }
      });

      setStatusText('Atualização instalada. Reiniciando o aplicativo...');
      await relaunch();
    } catch (error) {
      console.error('Erro ao verificar atualizações:', error);
      setStatusText('Não foi possível verificar atualizações no momento.');

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

  useEffect(() => {
    checkForUpdates(true);
  }, []);

  return {
    isChecking,
    progress,
    statusText,
    checkForUpdates,
  };
};
