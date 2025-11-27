import React, { useEffect, useState } from "react";
import { DollarSign, Package, Users, Activity, TrendingUp, Loader2, AlertCircle } from "lucide-react"; 
import { useNavigate } from "react-router-dom";
import Sidebar from "../../widgets/side_bar.tsx"; 

const API_BASE_URL = "http://localhost:8000";

/**
 * Interface que define a estrutura de dados esperada da API /api/reports/relatorio_geral/
 */
interface RelatorioData {
  vendas_totais: {
    valor: number;
    quantidade: number;
    comparativo: string;
  };
  produtos_vendidos: {
    quantidade: number;
    comparativo: string;
  };
  clientes_ativos: {
    quantidade: number;
    comparativo: string;
  };
  vendas_recentes: Array<{
    data: string;
    cliente: string;
    pagamento: string;
    valor: number;
  }>;
  estoque_produtos: Array<{
    produto: string;
    estoque: number;
    vendidos: number;
  }>;
}

export default function Relatorios() {
  const navigate = useNavigate();
  const [data, setData] = useState<RelatorioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usuarioLogado, setUsuarioLogado] = useState<string>("Admin"); 
  const [nivelAcesso, setNivelAcesso] = useState<string>("admin"); 

  useEffect(() => {
    // Recupera dados do usuário para o Sidebar
    const user = localStorage.getItem("usuarioLogado");
    const nivel = localStorage.getItem("nivelAcesso");
    if (user) setUsuarioLogado(user);
    if (nivel) setNivelAcesso(nivel);

    fetchRelatorio();
  }, []);

  const fetchRelatorio = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`${API_BASE_URL}/api/reports/relatorio_geral/`);
      
      if (!res.ok) {
          const statusText = res.statusText || 'Falha Desconhecida';
          throw new Error(`Erro ${res.status}: ${statusText}. O servidor pode estar desligado ou a rota não existe.`);
      }

      const json = await res.json();
      setData(json);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao carregar dados";
      console.error("Erro na API de Relatórios:", err);
      setError("Erro de Conexão ou Rota: " + message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("usuarioLogado");
    localStorage.removeItem("nivelAcesso");
    navigate("/");
  };
  
  const formatCurrency = (v: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

  const getComparativoStyle = (comparativo: string): React.CSSProperties => {
      const isPositive = comparativo.startsWith('+');
      return { 
          fontSize: '13px', 
          color: isPositive ? '#10b981' : '#ef4444', 
          fontWeight: 500,
          marginTop: '6px'
      };
  }

  // Se estiver carregando, mostra um loader na tela inteira
  if (loading && !data) {
      return (
          <div style={loadingContainerStyle}>
              <Loader2 size={36} style={spinIconStyle} />
              <p>Carregando Relatório...</p>
          </div>
      );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
      
      <Sidebar 
        usuarioLogado={usuarioLogado}
        nivelAcesso={nivelAcesso}
        onLogout={handleLogout}
      />

      {/* Conteúdo Principal */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        
        {/* Header - Padrão das telas de Listagem */}
        <header style={headerStyle}>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: "24px", fontWeight: 600, color: "#1e293b", marginBottom: "4px" }}>Relatórios</h1>
            <p style={{ fontSize: "14px", color: "#64748b" }}>Resumo geral do negócio</p>
          </div>

          {/* Bloco do Administrador Logado (Reutilizado das outras telas) */}
          <div style={userBlockStyle}>
              <div style={userAvatarStyle}>{usuarioLogado.charAt(0).toUpperCase()}</div>
              <div>
                  <p style={{ fontSize: "14px", fontWeight: 500, margin: 0, color: "#1e293b" }}>{usuarioLogado}</p>
                  <p style={{ fontSize: "11px", color: "#64748b", margin: 0 }}>Administrador</p>
              </div>
          </div>
        </header>

        {/* Conteúdo */}
        <div style={{ padding: "30px 50px" }}>
            
            {/* Mensagem de Erro (se houver) */}
            {error && (
                <div style={errorContainerStyle}>
                    <AlertCircle size={20} />
                    <p>{error}</p>
                </div>
            )}

            {/* Cards de Métricas (Top Bar) */}
            <div style={metricGridStyle}>
                
                {/* 1. Vendas Totais */}
                <div style={metricCardStyle}>
                    <div style={metricHeaderStyle}>
                        <h3 style={metricTitleStyle}>Vendas Totais</h3>
                        <DollarSign size={20} style={{ color: '#1e88e5' }} />
                    </div>
                    <p style={metricValueStyle}>{formatCurrency(data?.vendas_totais.valor || 0)}</p>
                    <p style={getComparativoStyle(data?.vendas_totais.comparativo || '+0%')}>
                       {data?.vendas_totais.comparativo || '+0%'} em relação ao mês anterior
                    </p>
                </div>

                {/* 2. Produtos Vendidos */}
                <div style={metricCardStyle}>
                    <div style={metricHeaderStyle}>
                        <h3 style={metricTitleStyle}>Produtos Vendidos</h3>
                        <Package size={20} style={{ color: '#ff9800' }} />
                    </div>
                    <p style={metricValueStyle}>{data?.produtos_vendidos.quantidade || 0}</p>
                    <p style={getComparativoStyle(data?.produtos_vendidos.comparativo || '+0%')}>
                       {data?.produtos_vendidos.comparativo || '+0%'} em relação ao mês anterior
                    </p>
                </div>

                {/* 3. Clientes Ativos */}
                <div style={metricCardStyle}>
                    <div style={metricHeaderStyle}>
                        <h3 style={metricTitleStyle}>Clientes Ativos</h3>
                        <Users size={20} style={{ color: '#4caf50' }} />
                    </div>
                    <p style={metricValueStyle}>{data?.clientes_ativos.quantidade || 0}</p>
                    <p style={getComparativoStyle(data?.clientes_ativos.comparativo || '+0%')}>
                       {data?.clientes_ativos.comparativo || '+0%'} em relação ao mês anterior
                    </p>
                </div>

            </div>
            
            {/* Tabelas de Detalhes (Vendas Recentes + Estoque) */}
            <div style={detailsGridStyle}>
                
                {/* Tabela de Vendas Recentes */}
                <div style={cardStyle}>
                    <h2 style={sectionTitleStyle}><TrendingUp size={18} /> Vendas Recentes</h2>
                    <table style={tableStyle}>
                        <thead>
                            <tr style={tableRowHeaderStyle}>
                                <th style={tableHeaderStyle}>Data</th>
                                <th style={tableHeaderStyle}>Cliente</th>
                                <th style={tableHeaderStyle}>Pagamento</th>
                                <th style={{ ...tableHeaderStyle, textAlign: 'right' }}>Valor</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(data?.vendas_recentes || []).map((venda, index) => (
                                <tr key={index} style={tableRowStyle}>
                                    <td style={tableCellStyle}>{venda.data}</td>
                                    <td style={tableCellStyle}>{venda.cliente}</td>
                                    <td style={tableCellStyle}>{venda.pagamento}</td>
                                    <td style={{ ...tableCellStyle, fontWeight: 600, textAlign: 'right' }}>
                                        {formatCurrency(venda.valor)}
                                    </td>
                                </tr>
                            ))}
                            {(data?.vendas_recentes || []).length === 0 && (
                                <tr>
                                    <td colSpan={4} style={{ textAlign: 'center', padding: '20px', color: '#999' }}>Nenhuma venda recente.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Tabela de Estoque de Produtos */}
                <div style={cardStyle}>
                    <h2 style={sectionTitleStyle}><Package size={18} /> Estoque de Produtos</h2>
                    <table style={tableStyle}>
                        <thead>
                            <tr style={tableRowHeaderStyle}>
                                <th style={tableHeaderStyle}>Produto</th>
                                <th style={{ ...tableHeaderStyle, textAlign: 'right' }}>Estoque</th>
                                <th style={{ ...tableHeaderStyle, textAlign: 'right' }}>Vendidos</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(data?.estoque_produtos || []).map((prod, index) => (
                                <tr key={index} style={tableRowStyle}>
                                    <td style={tableCellStyle}>{prod.produto}</td>
                                    <td style={{ ...tableCellStyle, textAlign: 'right' }}>
                                        <span style={{ color: prod.estoque < 10 ? '#ef4444' : '#333', fontWeight: 500 }}>
                                            {prod.estoque}
                                        </span>
                                    </td>
                                    <td style={{ ...tableCellStyle, textAlign: 'right' }}>{prod.vendidos}</td>
                                </tr>
                            ))}
                            {(data?.estoque_produtos || []).length === 0 && (
                                <tr>
                                    <td colSpan={3} style={{ textAlign: 'center', padding: '20px', color: '#999' }}>Nenhum produto em estoque.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

            </div>

        </div>
      </main>
    </div>
  );
}


// --- ESTILOS CSS REUTILIZADOS / ADAPTADOS ---
const loadingContainerStyle: React.CSSProperties = { minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#1e88e5' };
const spinIconStyle: React.CSSProperties = { animation: "spin 1s linear infinite" };
const headerStyle: React.CSSProperties = { backgroundColor: "#fff", padding: "20px 50px", borderBottom: "1px solid #e0e0e0", display: "flex", justifyContent: "space-between", alignItems: "center" };
const userBlockStyle: React.CSSProperties = { backgroundColor: "#f8f9fa", padding: "8px 16px", borderRadius: "8px", display: "flex", alignItems: "center", gap: "10px" };
const userAvatarStyle: React.CSSProperties = { width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "#1e88e5", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 600, fontSize: "14px" };
const metricGridStyle: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px", marginBottom: "30px" };
const metricCardStyle: React.CSSProperties = { backgroundColor: "#fff", padding: "25px", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" };
const metricHeaderStyle: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' };
const metricTitleStyle: React.CSSProperties = { fontSize: "14px", color: "#64748b", fontWeight: 500 };
const metricValueStyle: React.CSSProperties = { fontSize: "30px", fontWeight: 700, color: "#1e293b", margin: 0 };

const detailsGridStyle: React.CSSProperties = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" };
const cardStyle: React.CSSProperties = { backgroundColor: "#fff", borderRadius: "12px", padding: "25px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" };
const sectionTitleStyle: React.CSSProperties = { fontSize: "18px", fontWeight: 600, color: "#1e293b", borderBottom: "1px solid #e0e0e0", paddingBottom: "10px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" };
const tableStyle: React.CSSProperties = { width: "100%", borderCollapse: "collapse" };
const tableRowHeaderStyle: React.CSSProperties = { backgroundColor: "#f8f9fa", borderBottom: "1px solid #e0e0e0" };
const tableHeaderStyle: React.CSSProperties = { padding: "12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#475569", textTransform: "uppercase" };
const tableRowStyle: React.CSSProperties = { borderBottom: "1px solid #f0f0f0", transition: "background-color 0.1s" };
const tableCellStyle: React.CSSProperties = { padding: "12px", fontSize: "14px", color: "#333" };
const errorContainerStyle: React.CSSProperties = { 
    backgroundColor: "#fee2e2", 
    border: "1px solid #fecaca", 
    borderRadius: "8px", 
    padding: "15px", 
    marginBottom: "20px", 
    display: "flex", 
    alignItems: "center", 
    gap: "10px", 
    color: "#991b1b" 
};