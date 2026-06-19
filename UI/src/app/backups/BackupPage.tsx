import { useEffect, useMemo, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import {
  Database,
  Download,
  ChevronLeft,
  ChevronRight,
  Trash2,
} from "lucide-react";

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
      const resultado = await invoke<BackupInfo[]>(
        "listar_backups"
      );

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


  async function excluirBackup(nome: string) {
  const confirmar = confirm(
    `Deseja realmente excluir o backup "${nome}"?`
  );

  if (!confirmar) return;

  try {
    await invoke("excluir_backup", {
      nomeArquivo: nome,
    });

    await carregarBackups();
  } catch (error) {
    console.error(error);
    alert("Erro ao excluir backup");
  }
 }   

  function formatarTamanho(bytes: number) {
    if (bytes < 1024) {
      return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(2)} KB`;
    }

    if (bytes < 1024 * 1024 * 1024) {
      return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
    }

    return `${(bytes / 1024 / 1024 / 1024).toFixed(
      2
    )} GB`;
  }

  useEffect(() => {
    carregarBackups();
  }, []);

  const totalPaginas = Math.ceil(
    backups.length / ITENS_POR_PAGINA
  );

  const backupsPaginados = useMemo(() => {
    const inicio =
      (paginaAtual - 1) * ITENS_POR_PAGINA;

    return backups.slice(
      inicio,
      inicio + ITENS_POR_PAGINA
    );
  }, [backups, paginaAtual]);

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[#001e40]">
            Backups
          </h1>

          <p className="text-slate-500 text-sm">
            Gerencie os backups do banco local.
          </p>
        </div>

        <button
          onClick={criarNovoBackup}
          disabled={loading}
          className="bg-[#00658d] hover:bg-[#005577] text-white px-5 py-3 rounded-xl font-semibold flex items-center gap-2"
        >
          <Download size={18} />

          {loading
            ? "Criando..."
            : "Criar Backup"}
        </button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border p-5 border-slate-200">
          <p className="text-xs uppercase text-slate-400 font-bold">
            Total de Backups
          </p>

          <p className="text-3xl font-bold text-[#001e40] mt-2">
            {backups.length}
          </p>
        </div>

        <div className="bg-white rounded-2xl border p-5 border-slate-200">
          <p className="text-xs uppercase text-slate-400 font-bold">
            Espaço Utilizado
          </p>

          <p className="text-3xl font-bold text-[#001e40] mt-2">
            {formatarTamanho(
              backups.reduce(
                (acc, curr) => acc + curr.tamanho_bytes,
                0
              )
            )}
          </p>
        </div>

        <div className="bg-white rounded-2xl border p-5 border-slate-200">
          <p className="text-xs uppercase text-slate-400 font-bold">
            Último Backup
          </p>

          <p className="text-lg font-bold text-[#001e40] mt-2">
            {backups[0]?.data ?? "-"}
          </p>
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left px-6 py-4 text-xs uppercase text-slate-500">
                Arquivo
              </th>

              <th className="text-left px-6 py-4 text-xs uppercase text-slate-500">
                Data
              </th>

              <th className="text-left px-6 py-4 text-xs uppercase text-slate-500">
                Tamanho
              </th>
              <th className="text-left px-6 py-4 text-xs uppercase text-slate-500">
                Ações
              </th>
            </tr>
          </thead>

          <tbody>
            {backupsPaginados.length > 0 ? (
              backupsPaginados.map((backup) => (
                <tr
                  key={backup.nome}
                  className="border-b border-slate-100 hover:bg-slate-50"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Database
                        size={18}
                        className="text-blue-600"
                      />

                      <span className="font-medium">
                        {backup.nome}
                      </span>
                    </div>
                  </td>

                  <td className="px-6 py-4 text-slate-500">
                    {backup.data}
                  </td>

                  <td className="px-6 py-4 text-slate-500">
                    {formatarTamanho(
                      backup.tamanho_bytes
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => excluirBackup(backup.nome)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={3}
                  className="text-center py-10 text-slate-400"
                >
                  Nenhum backup encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Paginação */}
        <div className="flex justify-between items-center px-6 py-4 border-t border-slate-200 bg-slate-50">
          <span className="text-sm text-slate-500">
            Página {paginaAtual} de{" "}
            {Math.max(totalPaginas, 1)}
          </span>

          <div className="flex gap-2">
            <button
              onClick={() =>
                setPaginaAtual((p) =>
                  Math.max(1, p - 1)
                )
              }
              disabled={paginaAtual === 1}
              className="p-2 border rounded-lg disabled:opacity-50"
            >
              <ChevronLeft size={18} />
            </button>

            <button
              onClick={() =>
                setPaginaAtual((p) =>
                  Math.min(
                    totalPaginas,
                    p + 1
                  )
                )
              }
              disabled={
                paginaAtual === totalPaginas ||
                totalPaginas === 0
              }
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