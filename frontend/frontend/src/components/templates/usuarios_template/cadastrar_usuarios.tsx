import React, { useState, useEffect, FormEvent, ChangeEvent } from "react";
import { useNavigate, useParams } from "react-router-dom"; 
import { X, Loader2, AlertCircle, Plus, Edit, User, Briefcase, MapPin, Mail, Lock } from "lucide-react";

/**
 * Interface que define a estrutura do Funcionário/Usuário.
 */
interface Funcionario {
  id: string | null;
  nome: string;
  cpf: string;
  rg: string; 
  email: string;
  celular: string; 
  telefone: string; 
  telefone_fixo: string; 
  cep: string;
  endereco: string;
  numero_casa: string;
  bairro: string;
  cidade: string;
  complemento: string;
  uf: string;
  cargo: string;
  senha: string;
  nivel_acesso: string;
}

const initialFuncionarioState: Funcionario = {
    id: null, nome: "", cpf: "", rg: "", email: "", celular: "", telefone: "",
    telefone_fixo: "", cep: "", endereco: "", numero_casa: "", bairro: "",
    cidade: "", complemento: "", uf: "", cargo: "", senha: "", nivel_acesso: "",
};


// --- Componentes Auxiliares (Modal de Sucesso) ---
interface SavedModalProps {
    isOpen: boolean;
    message: string;
    onClose: () => void;
}

const SavedModal: React.FC<SavedModalProps> = ({ isOpen, message, onClose }) => {
    if (!isOpen) return null;

    return (
        <div style={modalOverlayStyle}>
            <div style={modalContentStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, color: '#10b981', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <AlertCircle size={20} /> Sucesso
                    </h3>
                    <button onClick={onClose} style={closeButtonStyle}>
                        <X size={20} />
                    </button>
                </div>
                <p style={{ marginTop: '15px', color: '#4b5563' }}>{message}</p>
                <div style={{ textAlign: 'right', marginTop: '20px' }}>
                    <button onClick={onClose} style={modalPrimaryButtonStyle}>
                        Fechar e Voltar
                    </button>
                </div>
            </div>
        </div>
    );
};


// --- Componente Principal de Cadastro/Edição de Funcionário ---

export default function CadastrarUsuarios() {
    const { id } = useParams<{ id: string }>(); 
    const isEditMode = !!id;

    const navigate = useNavigate();
    const [funcionario, setFuncionario] = useState<Funcionario>(initialFuncionarioState);
    
    const [loading, setLoading] = useState(false);
    const [isSavedModalOpen, setIsSavedModalOpen] = useState(false);
    const [nivelAcessoLogado, setNivelAcessoLogado] = useState<string>("");

    useEffect(() => {
        const nivel = localStorage.getItem("nivelAcesso");
        setNivelAcessoLogado(nivel || "");
        
        // Bloqueio de acesso se não for admin
        if (nivel !== "admin" && nivel) { 
             alert("Acesso negado! Apenas administradores podem cadastrar/editar usuários.");
             navigate("/home");
             return;
        }

        if (isEditMode && id) {
            carregarFuncionarioParaEdicao(id);
        }
    }, [isEditMode, id, navigate]);

    // Função para carregar dados do funcionário via API (GET)
    const carregarFuncionarioParaEdicao = async (funcionarioId: string) => {
        setLoading(true);
        try {
            const res = await fetch(`http://127.0.0.1:8000/api/usuarios/${funcionarioId}/`);
            if (!res.ok) throw new Error("Funcionário não encontrado.");
            
            const data = await res.json();
            
            setFuncionario({
                ...initialFuncionarioState, 
                id: data.id,
                nome: data.nome || '',
                cpf: data.cpf || '',
                rg: data.rg || '',
                email: data.email || '',
                celular: data.celular || '', 
                telefone: data.telefone || '', 
                telefone_fixo: data.telefone_fixo || '', 
                cep: data.cep || '',
                endereco: data.endereco || '',
                numero_casa: data.numero_casa || '',
                bairro: data.bairro || '',
                cidade: data.cidade || '',
                uf: data.uf || '',
                complemento: data.complemento || '',
                cargo: data.cargo || '',
                nivel_acesso: data.nivel_acesso || '',
            });

        } catch (error) {
            console.error("Erro ao carregar funcionário:", error);
            alert("Erro ao carregar dados. Voltando para a lista.");
            navigate("/listar_usuarios");
        } finally {
            setLoading(false);
        }
    };
    
    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFuncionario(prev => ({ ...prev, [name]: value }));
    };

    const handleBuscarCep = async () => {
        if (funcionario.cep.length !== 8) return;

        setLoading(true);
        try {
            const res = await fetch(`https://viacep.com.br/ws/${funcionario.cep}/json/`);
            const data = await res.json();

            if (data.erro) {
                alert("CEP não encontrado.");
                return;
            }

            setFuncionario(prev => ({
                ...prev,
                endereco: data.logradouro || '',
                bairro: data.bairro || '',
                cidade: data.localidade || '',
                uf: data.uf || '',
                complemento: data.complemento || '',
            }));
        } catch (error) {
            alert("Erro ao buscar CEP.");
        } finally {
            setLoading(false);
        }
    };

    // Função principal de submissão (POST/PUT via API)
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const funcionarioPayload = {
            nome: funcionario.nome,
            email: funcionario.email,
            cargo: funcionario.cargo,
            nivel: funcionario.nivel_acesso,
            senha: funcionario.senha,
            cpf: funcionario.cpf,
            rg: funcionario.rg,
            
            // Contatos
            celular: funcionario.celular,
            telefone: funcionario.telefone_fixo, 
            
            // Endereço
            cep: funcionario.cep,
            endereco: funcionario.endereco,
            numero_casa: funcionario.numero_casa,
            bairro: funcionario.bairro,
            cidade: funcionario.cidade,
            uf: funcionario.uf,
            complemento: funcionario.complemento,
        };
        
        try {
            const url = isEditMode && funcionario.id 
                ? `http://127.0.0.1:8000/api/usuarios/${funcionario.id}/` 
                : `http://127.0.0.1:8000/api/usuarios/`;

            const method = isEditMode ? 'PUT' : 'POST'; 
            
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(funcionarioPayload),
            });
            
            if (!res.ok) {
                const errorData = await res.json();
                console.error("Erro da API:", errorData);
                alert(`Falha na operação: ${isEditMode ? "Atualização" : "Cadastro"}. Verifique o console.`);

                setLoading(false);
                return;
            }

            setLoading(false);
            setIsSavedModalOpen(true); 

        } catch (error) {
            console.error("Erro de rede:", error);
            alert("Erro de rede. Tente novamente.");
            setLoading(false);
        }
    };

    if (loading && isEditMode) {
        return <div style={loadingContainerStyle}>Carregando dados do funcionário...</div>;
    }

    if (nivelAcessoLogado && nivelAcessoLogado !== "admin") {
         return null;
    }

    return (
        <div style={pageContainerStyle}>
            {/* O Sidebar (não incluído, mas faria parte do layout do dashboard) */}
            
            <main style={mainContentStyle}>
                {/* Header (Topo da página) */}
                <header style={headerStyle}>
                    <div style={{ flex: 1 }}>
                        <h1 style={{ fontSize: "24px", fontWeight: 600, color: "#1e293b", marginBottom: "4px" }}>
                            {isEditMode ? `Editar Funcionário (ID: ${id})` : "Cadastro de Funcionário"}
                        </h1>
                        <p style={{ fontSize: "14px", color: "#64748b" }}>
                            {isEditMode ? "Atualize os dados e acesso do funcionário." : "Adicione um novo membro à equipe preenchendo o formulário."}
                        </p>
                    </div>

                    <button onClick={() => navigate("/listar_usuarios")} style={backButtonStyle}>
                        Voltar para Lista
                    </button>
                </header>

                <div style={formWrapperStyle}>
                    <div style={formCardStyle}>
                        <form onSubmit={handleSubmit}>
                            
                            {/* Seção 1: Dados Pessoais e Contato */}
                            <h3 style={sectionTitleStyle}><User size={20} /> Dados Pessoais e Contato</h3>
                            <div style={gridContainerStyle}>
                                {/* Nome */}
                                <input type="text" name="nome" value={funcionario.nome} onChange={handleChange} placeholder="Nome" style={inputStyle} required />
                                
                                {/* Email */}
                                <input type="email" name="email" value={funcionario.email} onChange={handleChange} placeholder="Email" style={inputStyle} required />

                                {/* Celular */}
                                <input type="text" name="celular" value={funcionario.celular} onChange={handleChange} placeholder="Celular" style={inputStyle} required />
                                
                                {/* Telefone */}
                                <input type="text" name="telefone" value={funcionario.telefone} onChange={handleChange} placeholder="Telefone" style={inputStyle} />
                                
                                {/* Telefone Fixo */}
                                <input type="text" name="telefone_fixo" value={funcionario.telefone_fixo} onChange={handleChange} placeholder="Telefone Fixo" style={inputStyle} />
                                
                                {/* RG */}
                                <input type="text" name="rg" value={funcionario.rg} onChange={handleChange} placeholder="RG" style={inputStyle} />
                                
                                {/* CPF */}
                                <input type="text" name="cpf" value={funcionario.cpf} onChange={handleChange} placeholder="CPF" style={inputStyle} required />
                                
                                {/* Cargo */}
                                <input type="text" name="cargo" value={funcionario.cargo} onChange={handleChange} placeholder="Cargo" style={inputStyle} required />
                                
                                {/* Espaço Vazio */}
                                <div />
                            </div>

                            {/* Seção 2: Endereço */}
                            <h3 style={{ ...sectionTitleStyle, marginTop: "30px" }}><MapPin size={20} /> Endereço</h3>
                            
                            <div style={gridContainerSmallStyle}> 
                                {/* CEP */}
                                <div style={{ position: 'relative' }}>
                                    <input 
                                        type="text" name="cep" value={funcionario.cep} onChange={handleChange} 
                                        onBlur={handleBuscarCep} placeholder="CEP" style={{ ...inputStyle, paddingRight: '120px' }}
                                        required maxLength={8}
                                    />
                                    <button type="button" onClick={handleBuscarCep} disabled={loading || funcionario.cep.length !== 8} style={cepButtonStyle}>
                                        {loading ? <Loader2 size={16} className="animate-spin" /> : "Buscar CEP"}
                                    </button>
                                </div>
                                
                                {/* Endereco */}
                                <input type="text" name="endereco" value={funcionario.endereco} onChange={handleChange} placeholder="Endereço (Rua/Avenida)" style={inputStyle} required />
                                
                                {/* Número da Casa */}
                                <input type="text" name="numero_casa" value={funcionario.numero_casa} onChange={handleChange} placeholder="Número" style={inputStyle} required />
                            </div>
                            
                            <div style={gridContainerStyle}>
                                {/* Bairro */}
                                <input type="text" name="bairro" value={funcionario.bairro} onChange={handleChange} placeholder="Bairro" style={inputStyle} required />
                                
                                {/* Cidade */}
                                <input type="text" name="cidade" value={funcionario.cidade} onChange={handleChange} placeholder="Cidade" style={inputStyle} required />
                                
                                {/* UF */}
                                <select name="uf" value={funcionario.uf} onChange={handleChange} style={inputStyle} required>
                                    <option value="">UF</option>
                                    {["AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"].map(uf => (
                                        <option key={uf} value={uf}>{uf}</option>
                                    ))}
                                </select>
                                
                                {/* Complemento */}
                                <input type="text" name="complemento" value={funcionario.complemento} onChange={handleChange} placeholder="Complemento (Opcional)" style={inputStyle} />
                            </div>
                            
                            {/* Seção 3: Acesso */}
                            <h3 style={{ ...sectionTitleStyle, marginTop: "30px" }}><Lock size={20} /> Acesso</h3>
                            <div style={gridContainerStyle}>
                                {/* Senha */}
                                <input type="password" name="senha" value={funcionario.senha} onChange={handleChange} placeholder={isEditMode ? "Nova Senha (Opcional)" : "Senha"} style={inputStyle} required={!isEditMode} />
                                
                                {/* Nível de Acesso */}
                                <select name="nivel_acesso" value={funcionario.nivel_acesso} onChange={handleChange} placeholder="Nível de Acesso" style={inputStyle} required>
                                    <option value="">Nível de Acesso</option>
                                    <option value="admin">Administrador</option>
                                    <option value="user">Usuário Comum</option>
                                </select>

                                {/* Espaço Vazio */}
                                <div />
                            </div>
                            
                            {/* Botão de Submissão */}
                            <div style={{ marginTop: "30px" }}>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    style={submitButtonStyle}
                                >
                                    {loading ? <Loader2 size={24} style={spinIconStyle} /> : (isEditMode ? <Edit size={24} /> : <Plus size={24} />)}
                                    {loading ? "Salvando..." : (isEditMode ? "Salvar Edição" : "Cadastrar Funcionário")}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
            
            <SavedModal 
                isOpen={isSavedModalOpen}
                message={isEditMode ? "O funcionário foi atualizado com sucesso." : "O novo funcionário foi adicionado com sucesso ao sistema."}
                onClose={() => {
                    setIsSavedModalOpen(false);
                    navigate("/listar_usuarios"); // Volta para a lista de funcionários
                }}
            />
        </div>
    );
}

// --- Estilos CSS (Reutilizados do Cliente/Fornecedor) ---
const modalOverlayStyle: React.CSSProperties = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
const modalContentStyle: React.CSSProperties = { backgroundColor: '#fff', padding: '30px', borderRadius: '12px', maxWidth: '400px', width: '100%', boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)' };
const closeButtonStyle: React.CSSProperties = { border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8' };
const modalPrimaryButtonStyle: React.CSSProperties = { backgroundColor: '#1e88e5', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 500, cursor: 'pointer', transition: 'background-color 0.2s' };
const pageContainerStyle: React.CSSProperties = { display: "flex", minHeight: "100vh", backgroundColor: "#f5f5f5", fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" };
const mainContentStyle: React.CSSProperties = { flex: 1, display: "flex", flexDirection: "column" };
const headerStyle: React.CSSProperties = { backgroundColor: "#fff", padding: "20px 50px", borderBottom: "1px solid #e0e0e0", display: "flex", justifyContent: "space-between", alignItems: "center" };
const backButtonStyle: React.CSSProperties = { backgroundColor: "#f1f5f9", color: "#64748b", border: "none", padding: "10px 20px", borderRadius: "8px", fontSize: "14px", fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" };
const formWrapperStyle: React.CSSProperties = { padding: "30px", flexGrow: 1 };
const formCardStyle: React.CSSProperties = { backgroundColor: "#fff", padding: "30px", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", maxWidth: "900px", margin: "0 auto" };
const sectionTitleStyle: React.CSSProperties = { fontSize: "18px", fontWeight: 600, color: "#1e293b", borderBottom: "1px solid #e0e0e0", paddingBottom: "10px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" };
const gridContainerStyle: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "15px", marginBottom: "15px" };
const gridContainerSmallStyle: React.CSSProperties = { display: "grid", gridTemplateColumns: "2fr 3fr 1fr", gap: "15px", marginBottom: "15px" }; // Usado para Endereço
const inputStyle: React.CSSProperties = { padding: "12px", border: "1px solid #e2e8f0", borderRadius: "8px", width: "100%", boxSizing: "border-box", fontSize: "14px" };
const submitButtonStyle: React.CSSProperties = { width: "100%", padding: "14px", backgroundColor: "#10b981", color: "#fff", border: "none", borderRadius: "8px", fontSize: "18px", fontWeight: 600, cursor: "pointer", transition: "background-color 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: "12px" };
const spinIconStyle: React.CSSProperties = { animation: "spin 1s linear infinite" };
const cepButtonStyle: React.CSSProperties = { position: 'absolute', right: '5px', top: '50%', transform: 'translateY(-50%)', backgroundColor: '#1e88e5', color: '#fff', border: 'none', padding: '8px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' };
const loadingContainerStyle: React.CSSProperties = { minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' };