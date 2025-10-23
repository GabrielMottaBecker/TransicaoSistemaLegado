import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Home() {
  const [usuarioLogado, setUsuarioLogado] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem("usuarioLogado");
    setUsuarioLogado(user);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("usuarioLogado");
    navigate("/"); // volta para a tela de login
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#f9fafb",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* 🔵 Barra de navegação */}
      <nav
        style={{
          backgroundColor: "#2563eb",
          color: "#fff",
          padding: "16px 32px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
        }}
      >
        <h2 style={{ fontWeight: 600, fontSize: "20px" }}>Painel Administrativo</h2>

        <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
          <Link
            to="/listar_usuarios"
            style={{
              color: "#fff",
              textDecoration: "none",
              fontWeight: 500,
              transition: "0.2s",
            }}
            onMouseOver={(e) => (e.currentTarget.style.opacity = "0.8")}
            onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
          >
            Listar Usuários
          </Link>

          <Link
            to="/cadastrar_usuarios"
            style={{
              color: "#fff",
              textDecoration: "none",
              fontWeight: 500,
              transition: "0.2s",
            }}
            onMouseOver={(e) => (e.currentTarget.style.opacity = "0.8")}
            onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
          >
            Cadastrar Usuário
          </Link>

          <Link
            to="/funcionarios"
            style={{
              color: "#fff",
              textDecoration: "none",
              fontWeight: 500,
              transition: "0.2s",
            }}
            onMouseOver={(e) => (e.currentTarget.style.opacity = "0.8")}
            onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
          >
            Funcionários
          </Link>

          <button
            onClick={handleLogout}
            style={{
              backgroundColor: "#ef4444",
              color: "#fff",
              border: "none",
              padding: "8px 14px",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: 500,
              transition: "0.2s",
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#dc2626")}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#ef4444")}
          >
            Sair
          </button>
        </div>
      </nav>

      {/* 🏠 Conteúdo principal */}
      <main
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          padding: "40px",
          textAlign: "center",
        }}
      >
        <h1 style={{ fontSize: "2rem", fontWeight: 600, color: "#1e293b" }}>
          Bem-vindo ao Painel de Controle
        </h1>
        <p style={{ color: "#475569", marginTop: "8px", fontSize: "1.1rem" }}>
          Gerencie usuários, cadastros e funcionários do sistema.
        </p>

        <div
          style={{
            marginTop: "40px",
            display: "flex",
            gap: "20px",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <Link
            to="/listar_usuarios"
            style={cardStyle}
          >
            👥 Listar Usuários
          </Link>

          <Link
            to="/cadastrar_usuarios"
            style={cardStyle}
          >
            ➕ Cadastrar Usuário
          </Link>

          <Link
            to="/funcionarios"
            style={cardStyle}
          >
            🧑‍💼 Funcionários
          </Link>
        </div>
      </main>

      {/* ⚪ Rodapé */}
      <footer
        style={{
          backgroundColor: "#f3f4f6",
          padding: "12px 24px",
          fontSize: "0.9rem",
          color: "#475569",
          textAlign: "center",
          borderTop: "1px solid #e2e8f0",
        }}
      >
        {usuarioLogado ? `Logado como: ${usuarioLogado}` : "Nenhum usuário logado"}
      </footer>
    </div>
  );
}

// 🎨 Estilo dos cards de ação
const cardStyle: React.CSSProperties = {
  backgroundColor: "#fff",
  border: "1px solid #e2e8f0",
  padding: "20px 30px",
  borderRadius: "10px",
  boxShadow: "0 2px 5px rgba(0,0,0,0.08)",
  cursor: "pointer",
  textDecoration: "none",
  color: "#1e293b",
  fontWeight: 500,
  fontSize: "1rem",
  transition: "0.2s ease",
};

