import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Users, ShoppingCart, Package, DollarSign, Loader2, AlertCircle, TrendingUp } from "lucide-react";
import Sidebar from '../../widgets/side_bar.tsx';

const API_BASE_URL = "http://localhost:8000";

interface RelatorioData {
  vendas_totais: {
    valor: number;
    quantidade: number;
  };
  produtos_vendidos: {
    quantidade: number;
  };
  clientes_ativos: {
    quantidade: number;
  };
  vendas_recentes: Array<{
    data: string;
    cliente: string;
    pagamento: string;
    valor: number;
  }>;
}

export default function SalesFlowDashboard() {
  const [usuarioLogado, setUsuarioLogado] = useState<string>("Admin");
  const [nivelAcesso, setNivelAcesso] = useState<string>("admin");
  const [data, setData] = useState<RelatorioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
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
        throw new Error(`Erro ${res.status}: Falha ao carregar dados. Verifique se o servidor está rodando.`);
      }

      const json = await res.json();
      setData(json);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao carregar dados";
      console.error("Erro na API:", err);
      setError(message);
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

  if (loading) {
    return (
      <div style={loadingContainerStyle}>
        <Loader2 size={36} style={{ animation: "spin 1s linear infinite" }} />
        <p>Carregando Dashboard...</p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f5f5f5", fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
      <Sidebar 
        usuarioLogado={usuarioLogado}
        nivelAcesso={nivelAcesso}
        onLogout={handleLogout}
      />

      <main style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <header style={{
          backgroundColor: "#1e88e5",
          background: "linear-gradient(135deg, #1e88e5 0%, #1565c0 100%)",
          color: "#fff",
          padding: "40px 50px",
          position: "relative"
        }}>
          {/* Avatar e nome do usuário */}
          <div style={{
            position: "absolute",
            top: "20px",
            right: "50px",
            display: "flex",
            alignItems: "center",
            gap: "12px"
          }}>
            <div style={{
              backgroundColor: "rgba(255,255,255,0.2)",
              padding: "8px 16px",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              gap: "10px"
            }}>
              <div style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                backgroundColor: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#1e88e5",
                fontWeight: 600,
                fontSize: "14px"
              }}>
                {usuarioLogado.charAt(0).toUpperCase()}
              </div>
              <div>
                <p style={{ fontSize: "14px", fontWeight: 500, margin: 0 }}>{usuarioLogado}</p>
                <p style={{ fontSize: "11px", opacity: 0.8, margin: 0 }}>
                  {nivelAcesso === "admin" ? "Administrador" : "Usuário"}
                </p>
              </div>
            </div>
          </div>

          <h1 style={{ fontSize: "28px", fontWeight: 600, marginBottom: "8px", marginTop: "20px" }}>
            Olá, {usuarioLogado}! 👋
          </h1>
          <p style={{ fontSize: "15px", opacity: 0.95 }}>
            Veja seu desempenho de hoje e continue fazendo um ótimo trabalho!
          </p>
          
          <div style={{ marginTop: "25px", display: "flex", gap: "15px" }}>
            <button
              onClick={() => navigate("/pdv")}
              style={{
                backgroundColor: "#fff",
                color: "#1e88e5",
                border: "none",
                padding: "12px 24px",
                borderRadius: "6px",
                fontWeight: 600,
                cursor: "pointer",
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}
            >
              <ShoppingCart size={18} />
              Nova Venda
            </button>
          </div>
        </header>

        <div style={{ padding: "30px 50px" }}>
          {/* Mensagem de Erro */}
          {error && (
            <div style={{
              backgroundColor: "#fee2e2",
              border: "1px solid #fecaca",
              borderRadius: "8px",
              padding: "15px",
              marginBottom: "20px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              color: "#991b1b"
            }}>
              <AlertCircle size={20} />
              <div>
                <p style={{ margin: 0, fontWeight: 600 }}>Erro ao carregar dados</p>
                <p style={{ margin: "4px 0 0 0", fontSize: "13px" }}>{error}</p>
                <button 
                  onClick={fetchRelatorio}
                  style={{
                    marginTop: "8px",
                    padding: "6px 12px",
                    backgroundColor: "#dc2626",
                    color: "#fff",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "12px"
                  }}
                >
                  Tentar Novamente
                </button>
              </div>
            </div>
          )}

          {/* Título da seção */}
          <div style={{ marginBottom: "25px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: 600, color: "#333", margin: "0 0 8px 0", display: "flex", alignItems: "center", gap: "10px" }}>
              <TrendingUp size={22} color="#1e88e5" />
              Seu Desempenho Hoje
            </h2>
            <p style={{ fontSize: "14px", color: "#666", margin: 0 }}>
              Acompanhe suas vendas e atendimentos realizados hoje
            </p>
          </div>

          {/* Cards de Performance do Usuário */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px", marginBottom: "30px" }}>
            
            {/* Card 1 - Vendas Hoje */}
            <div style={performanceCardStyle}>
              <div style={{
                width: "50px",
                height: "50px",
                backgroundColor: "#e3f2fd",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "16px"
              }}>
                <DollarSign size={26} color="#1e88e5" />
              </div>
              <p style={{ fontSize: "14px", color: "#666", marginBottom: "8px", fontWeight: 500 }}>
                Total Vendido Hoje
              </p>
              <h3 style={{ fontSize: "32px", fontWeight: 700, color: "#1e88e5", margin: 0 }}>
                {formatCurrency(data?.vendas_totais?.valor || 0)}
              </h3>
            </div>

            {/* Card 2 - Produtos Vendidos */}
            <div style={performanceCardStyle}>
              <div style={{
                width: "50px",
                height: "50px",
                backgroundColor: "#fff3e0",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "16px"
              }}>
                <Package size={26} color="#ff9800" />
              </div>
              <p style={{ fontSize: "14px", color: "#666", marginBottom: "8px", fontWeight: 500 }}>
                Produtos Vendidos
              </p>
              <h3 style={{ fontSize: "32px", fontWeight: 700, color: "#ff9800", margin: 0 }}>
                {data?.produtos_vendidos?.quantidade || 0}
              </h3>
            </div>

            {/* Card 3 - Clientes Atendidos */}
            <div style={performanceCardStyle}>
              <div style={{
                width: "50px",
                height: "50px",
                backgroundColor: "#e8f5e9",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "16px"
              }}>
                <Users size={26} color="#4caf50" />
              </div>
              <p style={{ fontSize: "14px", color: "#666", marginBottom: "8px", fontWeight: 500 }}>
                Clientes Atendidos
              </p>
              <h3 style={{ fontSize: "32px", fontWeight: 700, color: "#4caf50", margin: 0 }}>
                {data?.clientes_ativos?.quantidade || 0}
              </h3>
            </div>
          </div>

          {/* Mensagem Motivacional */}
          <div style={{
            backgroundColor: "#fff",
            borderRadius: "12px",
            padding: "30px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            textAlign: "center",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "#fff"
          }}>
            <h3 style={{ fontSize: "22px", fontWeight: 600, marginBottom: "10px" }}>
              {data?.vendas_totais?.valor && data.vendas_totais.valor > 0 
                ? "Parabéns! Você está indo muito bem! 🎉" 
                : "Vamos começar o dia com tudo! 💪"}
            </h3>
            <p style={{ fontSize: "15px", opacity: 0.95, margin: 0 }}>
              {data?.vendas_totais?.valor && data.vendas_totais.valor > 0
                ? "Continue assim e alcance suas metas!"
                : "Sua primeira venda está a um clique de distância!"}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

const loadingContainerStyle: React.CSSProperties = {
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  color: '#1e88e5'
};

const performanceCardStyle: React.CSSProperties = {
  backgroundColor: "#fff",
  borderRadius: "12px",
  padding: "28px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  transition: "transform 0.2s, box-shadow 0.2s",
  cursor: "default"
};      