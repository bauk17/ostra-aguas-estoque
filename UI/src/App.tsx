
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Sidebar } from "./components/layout/Sidebar";
import DashboardPage from "./app/dashboard/DashboardPage";
import CargasPage from "./app/cargas/CargasPage";
import ClientesPage from "./app/clientes/ClientesPage";
import PedidosPage from "./app/pedidos/PedidosPage";
import MovimentacoesPage from "./app/movimentacoes/MovimentacoesPage";
import BackupPage from "./app/backups/BackupPage";

function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-background">
        <Sidebar />

        <main className="flex-1 ml-64">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/cargas" element={<CargasPage />} />

            <Route path="/clientes" element={<ClientesPage />} />
            <Route path="/pedidos" element={<PedidosPage />} />
            <Route path="/movimentacoes" element={<MovimentacoesPage />} />
            <Route path="*" element={<Navigate to="/dashboard" />} />

            <Route path="/backups" element={<BackupPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;