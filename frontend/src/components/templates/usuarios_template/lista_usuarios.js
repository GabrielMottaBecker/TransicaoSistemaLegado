import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function ListarUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [hoveredId, setHoveredId] = useState(null);
  const navigate = useNavigate();

  const usuarioLogado = localStorage.getItem("usuarioLogado");
  const nivelAcesso = localStorage.getItem("nivelAcesso");

  // 🔒 Bloqueia acesso se não for admin
  useEffect(() => {
    if (nivelAcesso !== "admin") {
      alert("Acesso negado! Apenas administradores podem listar usuários.");
      navigate("/home");
    }
  }, [nivelAcesso, navigate]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/usuarios/")
      .then((res) => res.json())
      .then((data) => setUsuarios(data))
      .catch((err) => console.error("Erro ao buscar usuários:", err));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("usuarioLogado");
    localStorage.removeItem("nivelAcesso");
    navigate("/");
  };

  const handleExcluir = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir este usuário?")) return;

    try {
      const res = await fetch(`http://127.0.0.1:8000/api/usuarios/${id}/`, {
        method: "DELETE",
      });

      if (res.ok) {
        alert("Usuário excluído com sucesso!");
        setUsuarios(usuarios.filter((u) => u.id !== id));
      } else {
        alert("Erro ao excluir usuário!");
      }
    } catch (err) {
      console.error("Erro ao excluir:", err);
      alert("Erro de rede ao excluir usuário.");
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Barra de navegação */}
      <nav
        style={{
          backgroundColor: "#007bff",
          color: "#fff",
          padding: "10px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", gap: "20px" }}>
          <Link to="/home" style={{ color: "#fff", textDecoration: "none" }}>
            Home
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
        <h1>Lista de Usuários</h1>
        <button
          onClick={() => navigate("/home")}
          style={{
            marginBottom: "10px",
            padding: "5px 10px",
            borderRadius: "4px",
            cursor: "pointer",
            backgroundColor: "#007bff",
            color: "#fff",
            border: "none",
          }}
        >
          Voltar ao Home
        </button>

        <ul style={{ listStyle: "none", padding: 0 }}>
          {usuarios.length === 0 ? (
            <li>Nenhum usuário encontrado</li>
          ) : (
            usuarios.map((usuario) => (
              <li
                key={usuario.id}
                style={{
                  padding: "10px",
                  marginBottom: "5px",
                  border: "1px solid #ccc",
                  borderRadius: "5px",
                  backgroundColor: hoveredId === usuario.id ? "#cce4ff" : "#fff",
                  transition: "background-color 0.2s",
                }}
                onMouseEnter={() => setHoveredId(usuario.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <strong>Código:</strong> {usuario.id} <br />
                <strong>Nome:</strong> {usuario.nome} <br />
                <strong>Email:</strong> {usuario.email} <br />
                <strong>Nível de Acesso:</strong> {usuario.nivel_acesso} <br />

                {/* Botões só para admin */}
                {nivelAcesso === "admin" && (
                  <div style={{ marginTop: "10px" }}>
                    <button
                      onClick={() => navigate(`/editar/${usuario.id}`)}
                      style={{
                        marginRight: "10px",
                        padding: "5px 10px",
                        borderRadius: "4px",
                        cursor: "pointer",
                        backgroundColor: "#28a745",
                        color: "#fff",
                        border: "none",
                      }}
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleExcluir(usuario.id)}
                      style={{
                        padding: "5px 10px",
                        borderRadius: "4px",
                        cursor: "pointer",
                        backgroundColor: "#dc3545",
                        color: "#fff",
                        border: "none",
                      }}
                    >
                      Excluir
                    </button>
                  </div>
                )}
              </li>
            ))
          )}
        </ul>
      </div>

      {/* Rodapé */}
      <footer
        style={{
          backgroundColor: "#f1f1f1",
          padding: "10px",
          textAlign: "left",
        }}
      >
        {usuarioLogado ? `Logado como: ${usuarioLogado} (${nivelAcesso})` : "Não logado"}
      </footer>
    </div>
  );
}

export default ListarUsuarios;
