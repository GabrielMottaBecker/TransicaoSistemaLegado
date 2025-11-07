import React, { useState, useEffect, FormEvent, ChangeEvent } from "react";
import { useNavigate, useParams } from "react-router-dom"; 
import { Activity, X, Loader2, MapPin, AlertCircle, User, Mail, Phone, Home as HomeIcon, Users, Briefcase, Package, ShoppingCart, DollarSign, Menu, LogOut, Plus, Edit } from "lucide-react";

/**
 * Interface que define a estrutura de um Cliente, mapeada para o modelo Django.
 */
interface Cliente {
  id: number | null;
  nome: string;
  cpf: string;
  rg: string; 
  email: string;
  telefone: string; // Celular (mapeado para 'celular' no Django)
  telefone_fixo: string; // Telefone Fixo (mapeado para 'telefone' no Django)
  cep: string;
  endereco: string;
  numero: string;
  bairro: string;
  cidade: string;
  uf: string;
  complemento: string;
}

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

// --- Componente Principal de Cadastro/Edição de Cliente ---

export default function CadastrarCliente() {
    const { id } = useParams<{ id: string }>(); 
    const isEditMode = !!id;

    const navigate = useNavigate();
    const [cliente, setCliente] = useState<Cliente>({
        id: null, nome: "", cpf: "", rg: "", email: "", telefone: "", 
        telefone_fixo: "", cep: "", endereco: "", numero: "", bairro: "", 
        cidade: "", uf: "", complemento: "",
    });
    
    const [loading, setLoading] = useState(false);
    const [isSavedModalOpen, setIsSavedModalOpen] = useState(false);
    const [nivelAcesso, setNivelAcesso] = useState<string>("admin");

    useEffect(() => {
        const nivel = localStorage.getItem("nivelAcesso");
        if (nivel) setNivelAcesso(nivel);

        if (isEditMode) {
            carregarClienteParaEdicao(Number(id));
        }
    }, [isEditMode, id]);
    
    // Função para carregar dados do cliente via API (GET)
    const carregarClienteParaEdicao = async (clienteId: number) => {
        setLoading(true);
        try {
            const res = await fetch(`http://127.0.0.1:8000/api/clientes/${clienteId}/`);
            if (!res.ok) throw new Error("Cliente não encontrado.");
            
            const data = await res.json();
            
            // Mapeamento: Django -> Frontend
            setCliente({
                id: data.id,
                nome: data.nome,
                cpf: data.cpf,
                rg: data.rg,
                email: data.email,
                telefone: data.celular || '',      // Django 'celular' -> Frontend 'telefone'
                telefone_fixo: data.telefone || '', // Django 'telefone' -> Frontend 'telefone_fixo'
                cep: data.cep,
                endereco: data.endereco,
                numero: data.numero,
                bairro: data.bairro,
                cidade: data.localidade || data.cidade, // Fallback para compatibilidade
                uf: data.uf,
                complemento: data.complemento,
            });

        } catch (error) {
            console.error("Erro ao carregar cliente:", error);
            alert("Erro ao carregar dados. Voltando para a lista.");
            navigate("/clientes");
        } finally {
            setLoading(false);
        }
    };


    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setCliente(prev => ({ ...prev, [name]: value }));
    };

    const handleBuscarCep = async () => {
        if (cliente.cep.length !== 8) return;

        setLoading(true);
        try {
            const res = await fetch(`https://viacep.com.br/ws/${cliente.cep}/json/`);
            const data = await res.json();

            if (data.erro) {
                alert("CEP não encontrado.");
                return;
            }

            setCliente(prev => ({
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

        // 🚀 PAYLOAD COMPLETO
        const clientePayload = {
            nome: cliente.nome, 
            rg: cliente.rg,
            cpf: cliente.cpf.replace(/\D/g, ''), // Envia o CPF limpo (apenas números)
            email: cliente.email, 
            
            telefone: cliente.telefone_fixo, 
            celular: cliente.telefone,     
            
            cep: cliente.cep,
            endereco: cliente.endereco,
            numero: cliente.numero,
            complemento: cliente.complemento,
            bairro: cliente.bairro,
            cidade: cliente.cidade,
            uf: cliente.uf,
        };
        
        try {
            // Define a URL e o método com base no modo
            const url = isEditMode && cliente.id 
                ? `http://127.0.0.1:8000/api/clientes/${cliente.id}/` 
                : `http://127.0.0.1:8000/api/clientes/`;

            const method = isEditMode ? 'PUT' : 'POST'; 
            
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(clientePayload),
            });
            
            if (!res.ok) {
                const errorData = await res.json();
                console.error("Erro da API:", errorData);
                alert(`Falha na operação: ${isEditMode ? "Atualização" : "Cadastro"}. Verifique o console para a resposta exata do backend.`);
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
        return <div style={loadingContainerStyle}>Carregando dados do cliente...</div>;
    }

    return (
        <div style={pageContainerStyle}>
            
            {/* Conteúdo Principal */}
            <main style={mainContentStyle}>
                <header style={headerStyle}>
                    <div style={{ flex: 1 }}>
                        <h1 style={{ fontSize: "24px", fontWeight: 600, color: "#1e293b", marginBottom: "4px" }}>
                            {isEditMode ? `Editar Cliente (ID: ${id})` : "Cadastro de Cliente"}
                        </h1>
                        <p style={{ fontSize: "14px", color: "#64748b" }}>
                            {isEditMode ? "Atualize os dados do cliente e clique em Salvar." : "Adicione um novo cliente ao sistema preenchendo o formulário abaixo."}
                        </p>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <button
                            onClick={() => navigate("/clientes")}
                            style={backButtonStyle}
                        >
                            Voltar para Lista
                        </button>
                    </div>
                </header>

                <div style={formWrapperStyle}>
                    <div style={formCardStyle}>
                        <form onSubmit={handleSubmit}>
                            {/* Seção Dados Pessoais */}
                            <h3 style={sectionTitleStyle}><User size={20} /> Dados Pessoais</h3>
                            <div style={gridContainerStyle}>
                                <input type="text" name="nome" value={cliente.nome} onChange={handleChange} placeholder="Nome Completo" style={inputStyle} required />
                                <input type="text" name="cpf" value={cliente.cpf} onChange={handleChange} placeholder="CPF" style={inputStyle} required />
                                <input type="text" name="rg" value={cliente.rg} onChange={handleChange} placeholder="RG" style={inputStyle} />
                                <input type="email" name="email" value={cliente.email} onChange={handleChange} placeholder="Email" style={inputStyle} required />
                                <input type="text" name="telefone" value={cliente.telefone} onChange={handleChange} placeholder="Celular (Principal)" style={inputStyle} required />
                                <input type="text" name="telefone_fixo" value={cliente.telefone_fixo} onChange={handleChange} placeholder="Telefone Fixo (Opcional)" style={inputStyle} />
                            </div>

                            {/* Seção Endereço */}
                            <h3 style={{ ...sectionTitleStyle, marginTop: "30px" }}><MapPin size={20} /> Endereço</h3>
                            <div style={{ display: "flex", gap: "15px", marginBottom: "15px" }}>
                                <div style={{ flex: 2, position: 'relative' }}>
                                    <input 
                                        type="text" 
                                        name="cep" 
                                        value={cliente.cep} 
                                        onChange={handleChange} 
                                        onBlur={handleBuscarCep}
                                        placeholder="CEP (ex: 12345678)" 
                                        style={{ ...inputStyle, paddingRight: '120px' }}
                                        required 
                                        maxLength={8}
                                    />
                                    <button
                                        type="button"
                                        onClick={handleBuscarCep}
                                        disabled={loading || cliente.cep.length !== 8}
                                        style={cepButtonStyle}
                                    >
                                        {loading ? <Loader2 size={16} className="animate-spin" /> : "Buscar CEP"}
                                    </button>
                                </div>
                                <input type="text" name="endereco" value={cliente.endereco} onChange={handleChange} placeholder="Endereço (Rua/Avenida)" style={{ ...inputStyle, flex: 3 }} required />
                                <input type="text" name="numero" value={cliente.numero} onChange={handleChange} placeholder="Número" style={{ ...inputStyle, flex: 1 }} required />
                            </div>
                            
                            <div style={gridContainerStyle}>
                                <input type="text" name="bairro" value={cliente.bairro} onChange={handleChange} placeholder="Bairro" style={inputStyle} required />
                                <input type="text" name="cidade" value={cliente.cidade} onChange={handleChange} placeholder="Cidade" style={inputStyle} required />
                                <select name="uf" value={cliente.uf} onChange={handleChange} style={inputStyle} required>
                                    <option value="">UF</option>
                                    {["AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"].map(uf => (
                                        <option key={uf} value={uf}>{uf}</option>
                                    ))}
                                </select>
                                <input type="text" name="complemento" value={cliente.complemento} onChange={handleChange} placeholder="Complemento (Opcional)" style={inputStyle} />
                            </div>
                            
                            {/* Botão de Submissão */}
                            <div style={{ marginTop: "30px" }}>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    style={submitButtonStyle}
                                >
                                    {loading ? <Loader2 size={24} style={spinIconStyle} /> : (isEditMode ? <Edit size={24} /> : <Plus size={24} />)}
                                    {loading ? "Salvando..." : (isEditMode ? "Salvar Edição" : "Cadastrar Cliente")}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
            
            <SavedModal 
                isOpen={isSavedModalOpen}
                message={isEditMode ? "O cliente foi atualizado com sucesso." : "O novo cliente foi adicionado com sucesso ao sistema."}
                onClose={() => {
                    setIsSavedModalOpen(false);
                    navigate("/clientes"); // Volta para a lista
                }}
            />
        </div>
    );
}

// --- Estilos CSS (Embutidos) ---
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
const inputStyle: React.CSSProperties = { padding: "12px", border: "1px solid #e2e8f0", borderRadius: "8px", width: "100%", boxSizing: "border-box", fontSize: "14px" };
const submitButtonStyle: React.CSSProperties = { width: "100%", padding: "14px", backgroundColor: "#10b981", color: "#fff", border: "none", borderRadius: "8px", fontSize: "18px", fontWeight: 600, cursor: "pointer", transition: "background-color 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: "12px" };
const spinIconStyle: React.CSSProperties = { animation: "spin 1s linear infinite" };
const cepButtonStyle: React.CSSProperties = { position: 'absolute', right: '5px', top: '50%', transform: 'translateY(-50%)', backgroundColor: '#1e88e5', color: '#fff', border: 'none', padding: '8px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' };
const loadingContainerStyle: React.CSSProperties = { minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' };