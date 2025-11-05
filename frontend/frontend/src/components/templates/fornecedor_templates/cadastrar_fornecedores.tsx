import React, { useState, useEffect, FormEvent, ChangeEvent } from "react";
import { useNavigate, useParams } from "react-router-dom"; 
import { Activity, X, Loader2, MapPin, AlertCircle, Package, Mail, Phone, Edit, Plus, Briefcase } from "lucide-react";

/**
 * Interface que define a estrutura de um Fornecedor, baseada no modelo Django.
 */
interface Fornecedor {
  id: number | null;
  nome: string; // Razão Social
  cnpj: string;
  email: string;
  celular: string;
  telefone_fixo: string;
  cep: string;
  endereco: string;
  numero_casa: string; // Django: numero_casa
  bairro: string;
  cidade: string;
  uf: string;
  complemento: string;
  // Campos extras do formulário (não mapeados diretamente no modelo Django)
  nome_fantasia: string; 
  inscricao_estadual: string;
  nome_contato: string;
  telefone_contato: string;
  email_contato: string;
}

const initialFornecedorState: Fornecedor = {
    id: null, nome: "", cnpj: "", email: "", celular: "", telefone_fixo: "", 
    cep: "", endereco: "", numero_casa: "", bairro: "", cidade: "", 
    uf: "", complemento: "", nome_fantasia: "", inscricao_estadual: "",
    nome_contato: "", telefone_contato: "", email_contato: "",
};


// --- Componentes Auxiliares (Modal de Sucesso) ---
// 🚨 CORREÇÃO: Adicionado o componente SavedModal para resolver o erro de compilação
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

export default function CadastrarFornecedor() {
    const { id } = useParams<{ id: string }>(); 
    const isEditMode = !!id;

    const navigate = useNavigate();
    const [fornecedor, setFornecedor] = useState<Fornecedor>(initialFornecedorState);
    
    const [loading, setLoading] = useState(false);
    const [isSavedModalOpen, setIsSavedModalOpen] = useState(false);

    useEffect(() => {
        if (isEditMode) {
            carregarFornecedorParaEdicao(Number(id));
        }
    }, [isEditMode, id]);
    
    // Função para carregar dados do fornecedor via API (GET)
    const carregarFornecedorParaEdicao = async (fornecedorId: number) => {
        setLoading(true);
        try {
            const res = await fetch(`http://127.0.0.1:8000/api/fornecedores/${fornecedorId}/`);
            if (!res.ok) throw new Error("Fornecedor não encontrado.");
            
            const data = await res.json();
            
            setFornecedor({
                ...initialFornecedorState, 
                id: data.id,
                nome: data.nome,
                cnpj: data.cnpj,
                email: data.email,
                celular: data.celular,
                telefone_fixo: data.telefone_fixo || '',
                cep: data.cep,
                endereco: data.endereco,
                numero_casa: data.numero_casa,
                bairro: data.bairro,
                cidade: data.cidade,
                uf: data.uf,
                complemento: data.complemento || '',
                // Campos extras do formulário (que o backend não retorna)
                nome_fantasia: '', 
                inscricao_estadual: '', 
                nome_contato: '',
                telefone_contato: '',
                email_contato: '',
            });

        } catch (error) {
            console.error("Erro ao carregar fornecedor:", error);
            alert("Erro ao carregar dados. Voltando para a lista.");
            navigate("/fornecedores");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFornecedor(prev => ({ ...prev, [name]: value }));
    };

    const handleBuscarCep = async () => {
        if (fornecedor.cep.length !== 8) return;

        setLoading(true);
        try {
            const res = await fetch(`https://viacep.com.br/ws/${fornecedor.cep}/json/`);
            const data = await res.json();

            if (data.erro) {
                alert("CEP não encontrado.");
                return;
            }

            setFornecedor(prev => ({
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

        // Mapeamento: Frontend -> Django (Apenas campos do modelo!)
        const fornecedorPayload = {
            // Campos do Modelo Django
            nome: fornecedor.nome,
            cnpj: fornecedor.cnpj,
            email: fornecedor.email,
            celular: fornecedor.celular,
            cep: fornecedor.cep,
            endereco: fornecedor.endereco,
            numero_casa: fornecedor.numero_casa,
            bairro: fornecedor.bairro,
            cidade: fornecedor.cidade,
            uf: fornecedor.uf,
            telefone_fixo: fornecedor.telefone_fixo || null, 
            complemento: fornecedor.complemento || null,
            // Campos extras do formulário (Nome Fantasia, Contato, etc.) SÃO IGNORADOS
        };
        
        try {
            const url = isEditMode && fornecedor.id 
                ? `http://127.0.0.1:8000/api/fornecedores/${fornecedor.id}/` 
                : `http://127.0.0.1:8000/api/fornecedores/`;

            const method = isEditMode ? 'PUT' : 'POST'; 
            
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(fornecedorPayload),
            });
            
            if (!res.ok) {
                const errorData = await res.json();
                console.error("Erro da API:", errorData);
                // Mensagem customizada para restrições de unicidade
                if (errorData.cnpj) alert(`Erro: CNPJ já cadastrado ou inválido.`);
                else if (errorData.email) alert(`Erro: Email já cadastrado ou inválido.`);
                else alert(`Falha na operação: ${isEditMode ? "Atualização" : "Cadastro"}. Verifique o console.`);

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
        return <div style={loadingContainerStyle}>Carregando dados do fornecedor...</div>;
    }

    return (
        <div style={pageContainerStyle}>
            {/* 🏠 Conteúdo Principal */}
            <main style={mainContentStyle}>
                <header style={headerStyle}>
                    <div style={{ flex: 1 }}>
                        <h1 style={{ fontSize: "24px", fontWeight: 600, color: "#1e293b", marginBottom: "4px" }}>
                            {isEditMode ? `Editar Fornecedor (ID: ${id})` : "Novo Fornecedor"}
                        </h1>
                        <p style={{ fontSize: "14px", color: "#64748b" }}>
                            Preencha os dados da empresa para {isEditMode ? "atualizar o cadastro." : "iniciar o relacionamento."}
                        </p>
                    </div>

                    <button onClick={() => navigate("/fornecedores")} style={backButtonStyle}>
                        Voltar para Lista
                    </button>
                </header>

                <div style={formWrapperStyle}>
                    <div style={formCardStyle}>
                        <form onSubmit={handleSubmit}>
                            
                            {/* Seção 1: Dados da Empresa */}
                            <h3 style={sectionTitleStyle}><Briefcase size={20} /> Dados da Empresa</h3>
                            <div style={gridContainerStyle}>
                                {/* Linha 1 */}
                                <input type="text" name="nome" value={fornecedor.nome} onChange={handleChange} placeholder="Razão Social" style={inputStyle} required />
                                <input type="text" name="cnpj" value={fornecedor.cnpj} onChange={handleChange} placeholder="CNPJ" style={inputStyle} required />
                                
                                {/* Linha 2 (Campos extras do Formulário Original) */}
                                <input type="text" name="nome_fantasia" value={fornecedor.nome_fantasia} onChange={handleChange} placeholder="Nome Fantasia" style={inputStyle} />
                                <input type="text" name="inscricao_estadual" value={fornecedor.inscricao_estadual} onChange={handleChange} placeholder="Inscrição Estadual" style={inputStyle} />
                                
                                {/* Linha 3 */}
                                <input type="email" name="email" value={fornecedor.email} onChange={handleChange} placeholder="Email da Empresa" style={inputStyle} required />
                                <input type="text" name="celular" value={fornecedor.celular} onChange={handleChange} placeholder="Celular (Principal)" style={inputStyle} required />
                                <input type="text" name="telefone_fixo" value={fornecedor.telefone_fixo} onChange={handleChange} placeholder="Telefone Fixo (Opcional)" style={inputStyle} />
                            </div>

                            {/* Seção 2: Endereço */}
                            <h3 style={{ ...sectionTitleStyle, marginTop: "30px" }}><MapPin size={20} /> Endereço</h3>
                            <div style={{ display: "flex", gap: "15px", marginBottom: "15px" }}>
                                <div style={{ flex: 2, position: 'relative' }}>
                                    <input 
                                        type="text" name="cep" value={fornecedor.cep} onChange={handleChange} 
                                        onBlur={handleBuscarCep} placeholder="CEP" style={{ ...inputStyle, paddingRight: '120px' }}
                                        required maxLength={8}
                                    />
                                    <button type="button" onClick={handleBuscarCep} disabled={loading || fornecedor.cep.length !== 8} style={cepButtonStyle}>
                                        {loading ? <Loader2 size={16} className="animate-spin" /> : "Buscar CEP"}
                                    </button>
                                </div>
                                <input type="text" name="endereco" value={fornecedor.endereco} onChange={handleChange} placeholder="Endereço (Rua/Avenida)" style={{ ...inputStyle, flex: 3 }} required />
                                <input type="text" name="numero_casa" value={fornecedor.numero_casa} onChange={handleChange} placeholder="Número" style={{ ...inputStyle, flex: 1 }} required />
                            </div>
                            
                            <div style={gridContainerStyle}>
                                <input type="text" name="bairro" value={fornecedor.bairro} onChange={handleChange} placeholder="Bairro" style={inputStyle} required />
                                <input type="text" name="cidade" value={fornecedor.cidade} onChange={handleChange} placeholder="Cidade" style={inputStyle} required />
                                <select name="uf" value={fornecedor.uf} onChange={handleChange} style={inputStyle} required>
                                    <option value="">UF</option>
                                    {["AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"].map(uf => (
                                        <option key={uf} value={uf}>{uf}</option>
                                    ))}
                                </select>
                                <input type="text" name="complemento" value={fornecedor.complemento} onChange={handleChange} placeholder="Complemento (Opcional)" style={inputStyle} />
                            </div>

                            {/* Seção 3: Contato (Ignorados no Payload do Modelo) */}
                            <h3 style={{ ...sectionTitleStyle, marginTop: "30px" }}><Mail size={20} /> Contato Responsável</h3>
                            <div style={gridContainerStyle}>
                                <input type="text" name="nome_contato" value={fornecedor.nome_contato} onChange={handleChange} placeholder="Nome do Contato" style={inputStyle} />
                                <input type="text" name="telefone_contato" value={fornecedor.telefone_contato} onChange={handleChange} placeholder="Telefone do Contato" style={inputStyle} />
                                <input type="email" name="email_contato" value={fornecedor.email_contato} onChange={handleChange} placeholder="Email do Contato" style={inputStyle} />
                            </div>
                            
                            {/* Botão de Submissão */}
                            <div style={{ marginTop: "30px" }}>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    style={submitButtonStyle}
                                >
                                    {loading ? <Loader2 size={24} style={spinIconStyle} /> : (isEditMode ? <Edit size={24} /> : <Plus size={24} />)}
                                    {loading ? "Salvando..." : (isEditMode ? "Salvar Edição" : "Cadastrar Fornecedor")}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
            
            <SavedModal 
                isOpen={isSavedModalOpen}
                message={isEditMode ? "O fornecedor foi atualizado com sucesso." : "O novo fornecedor foi adicionado com sucesso ao sistema."}
                onClose={() => {
                    setIsSavedModalOpen(false);
                    navigate("/fornecedores"); // Volta para a lista
                }}
            />
        </div>
    );
}

// --- Estilos CSS (Reutilizados de Cliente/Usuário) ---
const modalOverlayStyle: React.CSSProperties = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
const modalContentStyle: React.CSSProperties = { backgroundColor: '#fff', padding: '30px', borderRadius: '12px', maxWidth: '400px', width: '100%', boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)' };
const closeButtonStyle: React.CSSProperties = { border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8' };
const modalPrimaryButtonStyle: React.CSSProperties = { backgroundColor: '#1e88e5', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 500, cursor: 'pointer', transition: 'background-color 0.2s' };
const pageContainerStyle: React.CSSProperties = { display: "flex", minHeight: "100vh", backgroundColor: "#f5f5f5", fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" };
const mainContentStyle: React.CSSProperties = { flex: 1, display: "flex", flexDirection: "column" };
const headerStyle: React.CSSProperties = { backgroundColor: "#fff", padding: "20px 50px", borderBottom: "1px solid #e0e0e0", display: "flex", justifyContent: "space-between", alignItems: "center" };
const backButtonStyle: React.CSSProperties = { backgroundColor: "#ff9800", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "8px", fontSize: "14px", fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" };
const formWrapperStyle: React.CSSProperties = { padding: "30px", flexGrow: 1 };
const formCardStyle: React.CSSProperties = { backgroundColor: "#fff", padding: "30px", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", maxWidth: "1000px", margin: "0 auto" };
const sectionTitleStyle: React.CSSProperties = { fontSize: "18px", fontWeight: 600, color: "#1e293b", borderBottom: "1px solid #e0e0e0", paddingBottom: "10px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" };
const gridContainerStyle: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "15px", marginBottom: "15px" };
const inputStyle: React.CSSProperties = { padding: "12px", border: "1px solid #e2e8f0", borderRadius: "8px", width: "100%", boxSizing: "border-box", fontSize: "14px" };
const submitButtonStyle: React.CSSProperties = { width: "100%", padding: "14px", backgroundColor: "#ff9800", color: "#fff", border: "none", borderRadius: "8px", fontSize: "18px", fontWeight: 600, cursor: "pointer", transition: "background-color 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: "12px" };
const spinIconStyle: React.CSSProperties = { animation: "spin 1s linear infinite" };
const cepButtonStyle: React.CSSProperties = { position: 'absolute', right: '5px', top: '50%', transform: 'translateY(-50%)', backgroundColor: '#1e88e5', color: '#fff', border: 'none', padding: '8px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' };
const loadingContainerStyle: React.CSSProperties = { minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' };