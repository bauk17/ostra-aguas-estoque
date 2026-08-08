import { useEffect, useMemo, useState } from "react";
import { confirm, save, open } from "@tauri-apps/plugin-dialog";
import { invoke } from "@tauri-apps/api/core";
import {
  Database,
  Download,
  ChevronLeft,
  ChevronRight,
  Trash2,
  RotateCcw,
  Share,
  Upload
} from "lucide-react";
import { appConfigDir, join } from "@tauri-apps/api/path"; 
const ITENS_POR_PAGINA = 5;

interface BackupInfo {
  nome: string;
  data: string;
  tamanho_bytes: number;
}

export default function BackupsPage() {
  const [backups, setBackups] = useState<BackupInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [paginaAtual, setPaginaAtual] = useState(1);

  async function carregarBackups() {
    try {
      const resultado = await invoke<BackupInfo[]>("listar_backups");
      
      setBackups(resultado);
    } catch (error) {
      console.error(error);
      alert("Erro ao carregar backups");
    }
  }

  async function criarNovoBackup() {
    try {
      setLoading(true);
      await invoke("criar_backup");
      
      await carregarBackups();
      alert("Backup criado com sucesso!");
    } catch (error) {
      console.error(error);
      alert("Erro ao criar backup");
    } finally {
      setLoading(false);
    }
  }

  async function importarBackup() {
    try {
      setLoading(true);
      
      const arquivo = await open({
        multiple: false,
        directory: false,
        filters: [
          {
            name: "Banco de Dados SQLite",
            extensions: ["db"],
          },
        ],
      });
          
        
      if (!arquivo) return;

      await invoke("importar_backup", {
        backupPath: arquivo,
      })

      await carregarBackups();
    } catch (error) {
      console.error(error);
      alert("Erro ao importar backup");
    } finally {
      setLoading(false);
    }
  }

  async function excluirBackup(nome: string) {
    const confirmar = await confirm(`Deseja realmente excluir o backup "${nome}"?`);
    if (!confirmar) return;

    try {
      await invoke("excluir_backup", {
        nome,
      });
      await carregarBackups();
    } catch (error) {
      console.error(error);
      alert("Erro ao excluir backup");
    }
  }   

  function formatarTamanho(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
    return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
  }

  async function restaurarBackup(nome: string) {
    const confirmar = await confirm(
      `Deseja restaurar o backup "${nome}"?\n\nO banco atual será substituído.`
    );
    if (!confirmar) return;

    try {
      // Resolve dinamicamente: C:\Users\Nome\AppData\Roaming\sua.app\backups\nome ou ~/.config/sua.app/backups/nome
      const configDir = await appConfigDir();
      const caminhoCompletoBackup = await join(configDir, "backups", nome);

      await invoke("restaurar_backup", {
        backupPath: caminhoCompletoBackup, // 👈 Envia o caminho nativo correto do SO atual
      });

      alert("Backup restaurado com sucesso!\nReinicie o sistema.");
    } catch (error) {
      console.error(error);
      alert("Erro ao restaurar backup");
    }
  }

  async function exportarBackup(nomeArquivo: string) {
    try {
      const destino = await save({
        defaultPath: nomeArquivo,
        filters: [
          {
            name: "Banco SQLite",
            extensions: ["db"],
          },
        ],
      });

      if (!destino) return;

      // Resolve dinamicamente o caminho de origem do backup interno
      const configDir = await appConfigDir();
      const caminhoOrigemBackup = await join(configDir, "backups", nomeArquivo);

      await invoke("exportar_backup", {
        origem: caminhoOrigemBackup, // 👈 Envia a origem dinâmica
        destino,
      });

      alert("Backup exportado com sucesso!");
    } catch (error) {
      console.error(error);
      alert("Erro ao exportar backup");
    }
  }

  useEffect(() => {
    carregarBackups();
  }, []);

  const totalPaginas = Math.ceil(backups.length / ITENS_POR_PAGINA);

  const backupsPaginados = useMemo(() => {
    const inicio = (paginaAtual - 1) * ITENS_POR_PAGINA;
    return backups.slice(inicio, inicio + ITENS_POR_PAGINA);
  }, [backups, paginaAtual]);

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#001e40]">Backups</h1>
          <p className="text-slate-500 text-sm">Gerencie os backups do banco local.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 sm:justify-end">
          <button
            onClick={criarNovoBackup}
            disabled={loading}
            className="bg-[#00658d] hover:bg-[#005577] disabled:opacity-60 disabled:cursor-not-allowed text-white px-5 py-3 rounded-xl font-semibold flex items-center gap-2"
          >
            <Download size={18} />
            {loading ? "Criando..." : "Criar Backup"}
          </button>

          <button
            onClick={importarBackup}
            disabled={loading}
            className="bg-white hover:bg-slate-50 disabled:opacity-60 disabled:cursor-not-allowed text-[#00658d] border border-[#00658d] px-5 py-3 rounded-xl font-semibold flex items-center gap-2"
          >
            <Upload size={18} />
            Importar Backup
          </button>
        </div>
      </header>

      {/* Estatísticas */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border p-5 border-slate-200">
          <p className="text-xs uppercase text-slate-400 font-bold">Total de Backups</p>
          <p className="text-3xl font-bold text-[#001e40] mt-2">{backups.length}</p>
        </div>

        <div className="bg-white rounded-2xl border p-5 border-slate-200">
          <p className="text-xs uppercase text-slate-400 font-bold">Espaço Utilizado</p>
          <p className="text-3xl font-bold text-[#001e40] mt-2">
            {formatarTamanho(backups.reduce((acc, curr) => acc + curr.tamanho_bytes, 0))}
          </p>
        </div>

        <div className="bg-white rounded-2xl border p-5 border-slate-200">
          <p className="text-xs uppercase text-slate-400 font-bold">Último Backup</p>
          <p className="text-lg font-bold text-[#001e40] mt-2">{backups[0]?.data ?? "-"}</p>
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left px-6 py-4 text-xs uppercase text-slate-500">Arquivo</th>
              <th className="text-left px-6 py-4 text-xs uppercase text-slate-500">Data</th>
              <th className="text-left px-6 py-4 text-xs uppercase text-slate-500">Tamanho</th>
              <th className="text-left px-6 py-4 text-xs uppercase text-slate-500">Ações</th>
            </tr>
          </thead>

          <tbody>
            {backupsPaginados.length > 0 ? (
              backupsPaginados.map((backup) => (
                <tr key={backup.nome} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Database size={18} className="text-blue-600" />
                      <span className="font-medium">{backup.nome}</span>
                    </div>
                  </td>

                  <td className="px-6 py-4 text-slate-500">{backup.data}</td>
                  <td className="px-6 py-4 text-slate-500">{formatarTamanho(backup.tamanho_bytes)}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => restaurarBackup(backup.nome)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition-all"
                      >
                        <RotateCcw size={16} />
                        Restaurar
                      </button>

                      <button
                        onClick={() => excluirBackup(backup.nome)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                      
                      <button
                        onClick={() => exportarBackup(backup.nome)}
                        className="px-3 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-all"
                      >
                        <Share size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="text-center py-10 text-slate-400">
                  Nenhum backup encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Paginação */}
        <div className="flex justify-between items-center px-6 py-4 border-t border-slate-200 bg-slate-50">
          <span className="text-sm text-slate-500">
            Página {paginaAtual} de {Math.max(totalPaginas, 1)}
          </span>

          <div className="flex gap-2">
            <button
              onClick={() => setPaginaAtual((p) => Math.max(1, p - 1))}
              disabled={paginaAtual === 1}
              className="p-2 border rounded-lg disabled:opacity-50"
            >
              <ChevronLeft size={18} />
            </button>

            <button
              onClick={() => setPaginaAtual((p) => Math.min(totalPaginas, p + 1))}
              disabled={paginaAtual === totalPaginas || totalPaginas === 0}
              className="p-2 border rounded-lg disabled:opacity-50"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}