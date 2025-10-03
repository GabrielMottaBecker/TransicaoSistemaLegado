import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function EditarUsuario() {
  const { id } = useParams(); // pega o ID da rota
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState({
    nome: "",
    email: "",
    cep: "",
    celular: "",
    telefone: "",
    telefone_fixo: "",
    endereco: "",
    numero_casa: "",
    bairro: "",
    cidade: "",
    complemento: "",
    uf: "",
    rg: "",
    cpf: "",
    cargo: "",
    senha: "",
    nivel_acesso: "",
  });
  const [erro, setErro] = useState("");

  // 🔒 Bloqueia usuários não-admin
  useEffect(() => {
    const nivelAcesso = localStorage.getItem("nivelAcesso");
    if (nivelAcesso !== "admin") {
      alert("Acesso negado! Apenas administradores podem acessar esta página.");
      navigate("/home");
    }
  }, [navigate]);

  // Buscar usuário pelo ID ao carregar
  useEffect(() => {
    fetch(`http://127.0.0.1:8000/api/usuarios/${id}/`)
      .then((res) => {
        if (!res.ok) throw new Error("Usuário não encontrado");
        return res.json();
      })
      .then((data) => setUsuario(data))
      .catch((err) => setErro(err.message));
  }, [id]);

  const handleChange = (e) => {
    setUsuario({ ...usuario, [e.target.name]: e.target.value });
  };

  // Salvar alterações
  const handleSalvar = async () => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/usuarios/${id}/`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(usuario),
      });
      if (!res.ok) {
        const data = await res.json();
        console.error("Erro ao salvar:", data);
        alert("Erro ao salvar usuário. Veja o console.");
        return;
      }
      alert("Usuário atualizado com sucesso!");
      navigate("/listar_usuarios");
    } catch (err) {
      console.error("Erro de rede:", err);
      alert("Erro de rede ao salvar usuário.");
    }
  };

  const handleVoltar = () => {
    navigate("/listar_usuarios");
  };

  // Deletar usuário
  const handleDeletar = async () => {
    if (!window.confirm("Tem certeza que deseja deletar este usuário?")) return;

    try {
      const res = await fetch(`http://127.0.0.1:8000/api/usuarios/${id}/`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Erro ao deletar usuário");
      alert("Usuário deletado com sucesso!");
      navigate("/listar_usuarios");
    } catch (err) {
      console.error(err);
      alert("Erro ao deletar usuário.");
    }
  };

  if (erro) return <p style={{ color: "red" }}>{erro}</p>;

  return (
    <div>
      <h2>Editar Usuário</h2>
      <form onSubmit={(e) => e.preventDefault()}>
        <input type="text" name="id" value={id} readOnly placeholder="Código" />
        {/* ...seus campos do formulário continuam iguais... */}
        <div style={{ marginTop: "10px", display: "flex", gap: "10px" }}>
          <button type="button" onClick={handleSalvar}>Salvar</button>
          <button type="button" onClick={handleDeletar} style={{ backgroundColor: "red", color: "white" }}>Deletar</button>
          <button type="button" onClick={handleVoltar}>Voltar</button>
        </div>
      </form>
    </div>
  );
}

export default EditarUsuario;