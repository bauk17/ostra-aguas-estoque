import { useEffect, useState } from "react";
import { listarClientes, criarCliente } from "./features/clientes/repository";
import { v4 as uuid } from "uuid";
import DashboardPage from "./app/dashboard/DashboardPage";

function App() {
  const [clientes, setClientes] = useState<any[]>([]);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const data = await listarClientes();
    setClientes(data);
  }

  async function adicionarCliente() {
    await criarCliente({
      id: uuid(),
      nome: "Cliente Teste",
      telefone: "22999999999",
      endereco: "Rua X",
      created_at: new Date().toISOString(),
    });

    await load();
  }

  return (
    <div>
      <DashboardPage />
    </div>
  );
}

export default App;