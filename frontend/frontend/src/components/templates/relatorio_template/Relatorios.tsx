import React, { useEffect, useState } from "react";

const API_BASE_URL = "http://localhost:8000"; // Seu backend Django

interface RelatorioData {
  vendas_hoje: {
    quantidade: number;
    valor: number;
  };
  clientes_ativos: number;
  produtos_total: number;
  vendas_totais: {
    quantidade: number;
    valor: number;
  };
}

export default function Relatorios() {
  const [data, setData] = useState<RelatorioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRelatorio();
  }, []);

  const fetchRelatorio = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`${API_BASE_URL}/api/relatorio_geral/`);
      if (!res.ok) throw new Error(`Erro ${res.status}`);

      const json = await res.json();
      setData(json);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao carregar dados";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Carregando...</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  if (!data) return <p>Nenhum dado disponível</p>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Relatórios</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <p className="text-gray-500">Vendas Hoje</p>
          <p className="font-bold">{data.vendas_hoje.quantidade}</p>
          <p className="text-green-600 font-semibold">R$ {data.vendas_hoje.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <p className="text-gray-500">Clientes Ativos</p>
          <p className="font-bold">{data.clientes_ativos}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <p className="text-gray-500">Produtos</p>
          <p className="font-bold">{data.produtos_total}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <p className="text-gray-500">Vendas Totais</p>
          <p className="font-bold">{data.vendas_totais.quantidade}</p>
          <p className="text-green-600 font-semibold">R$ {data.vendas_totais.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </div>
      </div>
    </div>
  );
}
