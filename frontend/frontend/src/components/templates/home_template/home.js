import { Link, useNavigate } from "react-router-dom";

function Home() {
  const usuarioLogado = localStorage.getItem("usuarioLogado");
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("usuarioLogado");
    navigate("/"); // volta para a tela de login
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Barra de navegação no topo */}
      <nav
        style={{
          backgroundColor: "#007bff",
          color: "#fff",
          padding: "10px",
          display: "flex",
          gap: "20px",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", gap: "20px" }}>
          <Link to="/listar_usuarios" style={{ color: "#fff", textDecoration: "none" }}>
            Listar Usuários
          </Link>
          <Link to="/cadastrar_usuarios" style={{ color: "#fff", textDecoration: "none" }}>
            Cadastrar Usuário
          </Link>
        </div>
        <button
          onClick={handleLogout}
          style={{
            backgroundColor: "#ff4d4f",
            color: "#fff",
            border: "none",
            padding: "5px 10px",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </nav>

      {/* Conteúdo principal */}
      <div style={{ flex: 1, padding: "20px" }}>
        <h1>Painel de Usuários</h1>
        <p>Escolha uma ação:</p>
        <ul>
          <li>
            <Link to="/listar_usuarios">Listar Usuários</Link>
          </li>
          <li>
            <Link to="/cadastrar_usuarios">Cadastrar Usuário</Link>
          </li>
        </ul>
      </div>

      {/* Rodapé com usuário logado */}
      <footer
        style={{
          backgroundColor: "#f1f1f1",
          padding: "10px",
          textAlign: "left",
        }}
      >
        {usuarioLogado ? `Logado como: ${usuarioLogado}` : "Não logado"}
      </footer>
    </div>
  );
}

export default Home;