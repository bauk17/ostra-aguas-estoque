
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Sidebar } from "./components/layout/Sidebar";
import DashboardPage from "./app/dashboard/DashboardPage";
import CargasPage from "./app/cargas/CargasPage";
import ClientesPage from "./app/clientes/ClientesPage";
import PedidosPage from "./app/pedidos/PedidosPage";

function App() {

  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-background">
        {/* Sidebar fixa em todas as páginas */}
        <Sidebar />

        {/* Conteúdo dinâmico (com margem à esquerda para não ficar sob a sidebar) */}
        <main className="flex-1 ml-64">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/cargas" element={<CargasPage />} />
            
            {/* Rota para Clientes (você pode criar o ClientesPage depois) */}
            <Route path="/clientes" element={<ClientesPage />} />
            <Route path="/pedidos" element={<PedidosPage />} />
            {/* Fallback para rotas não encontradas */}
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;