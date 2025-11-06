import { useState } from "react";
import { Home, Users, Briefcase, ShoppingCart, Package, DollarSign, Activity, LogOut, Menu, Search, Plus, X, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Sidebar from '../../widgets/side_bar.tsx';


// Para usar no seu projeto React, adicione este import:
// import { useNavigate } from "react-router-dom";

export default function PDVSalesFlow() {
  // No seu projeto, descomente esta linha:
  // const navigate = useNavigate();
  const navigate = useNavigate();
  const [usuarioLogado] = useState<string>("Admin");
  const [nivelAcesso] = useState<string>("admin");

  const [cpf, setCpf] = useState("");
  const [nomeCliente, setNomeCliente] = useState("");
  const [data] = useState(new Date().toLocaleDateString("pt-BR"));
  
  const [codigoProduto, setCodigoProduto] = useState("");
  const [nomeProduto, setNomeProduto] = useState("");
  const [preco, setPreco] = useState("");
  const [quantidade, setQuantidade] = useState("");
  
  const [carrinho, setCarrinho] = useState<any[]>([]);
  const [totalVenda, setTotalVenda] = useState(0);
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);
  const [showPagamento, setShowPagamento] = useState(false);
  
  const [dinheiro, setDinheiro] = useState("0");
  const [cartao, setCartao] = useState("0");
  const [cheque, setCheque] = useState("0");
  const [troco, setTroco] = useState("0");
  const [obs, setObs] = useState("");

  const pesquisarCliente = () => {
    if (cpf === "123.456.789-00") {
      setNomeCliente("João da Silva");
    } else {
      alert("Cliente não encontrado");
      setNomeCliente("");
    }
  };
  

  const pesquisarProduto = () => {
    if (codigoProduto === "001") {
      setNomeProduto("Notebook Dell Inspiron");
      setPreco("2800.00");
    } else if (codigoProduto === "002") {
      setNomeProduto("Mouse Logitech");
      setPreco("89.90");
    } else {
      alert("Produto não encontrado");
      setNomeProduto("");
      setPreco("");
    }
  };

  const adicionarItem = () => {
    if (!codigoProduto || !nomeProduto || !preco || !quantidade) {
      alert("Preencha todos os campos do produto");
      return;
    }

    const qtd = parseFloat(quantidade);
    const precoUnit = parseFloat(preco);
    const subtotal = qtd * precoUnit;

    const novoItem = {
      codigo: codigoProduto,
      produto: nomeProduto,
      qtd: qtd,
      preco: precoUnit,
      subtotal: subtotal
    };

    const novoCarrinho = [...carrinho, novoItem];
    setCarrinho(novoCarrinho);
    
    const novoTotal = novoCarrinho.reduce((acc, item) => acc + item.subtotal, 0);
    setTotalVenda(novoTotal);

    setCodigoProduto("");
    setNomeProduto("");
    setPreco("");
    setQuantidade("");
  };

  const removerItem = (index: number) => {
    const novoCarrinho = carrinho.filter((_, i) => i !== index);
    setCarrinho(novoCarrinho);
    const novoTotal = novoCarrinho.reduce((acc, item) => acc + item.subtotal, 0);
    setTotalVenda(novoTotal);
  };

  const cancelarVenda = () => {
    setShowConfirmCancel(true);
  };

  const confirmarCancelamento = () => {
    setCarrinho([]);
    setTotalVenda(0);
    setCpf("");
    setNomeCliente("");
    setCodigoProduto("");
    setNomeProduto("");
    setPreco("");
    setQuantidade("");
    setShowConfirmCancel(false);
  };

  const finalizarPagamento = () => {
    if (carrinho.length === 0) {
      alert("Adicione produtos ao carrinho");
      return;
    }
    if (!cpf || !nomeCliente) {
      alert("Informe os dados do cliente");
      return;
    }
    setShowPagamento(true);
  };

  const calcularTroco = () => {
    const totalPago = parseFloat(dinheiro || "0") + parseFloat(cartao || "0") + parseFloat(cheque || "0");
    const trocoCalculado = totalPago - totalVenda;
    setTroco(trocoCalculado.toFixed(2));
  };

  const finalizarVenda = () => {
    const totalPago = parseFloat(dinheiro || "0") + parseFloat(cartao || "0") + parseFloat(cheque || "0");
    
    if (totalPago < totalVenda) {
      alert("O valor pago é menor que o total da venda!");
      return;
    }
    
    alert(`Venda finalizada com sucesso!\nTotal: R$ ${totalVenda.toFixed(2)}\nTroco: R$ ${troco}`);
    setShowPagamento(false);
    confirmarCancelamento();
  };

const handleLogout = () => {
  // Remove os dados do usuário
  localStorage.removeItem("usuarioLogado");
  localStorage.removeItem("nivelAcesso");

  // Garante que não há bloqueios antes de sair (ex: beforeunload)
  window.onbeforeunload = null;

  // Redireciona para a tela de login
  navigate("/");
};

  const navegarPara = (rota: string) => {
    // No seu projeto, use:
    // navigate(rota);
    alert(`Navegando para: ${rota}`);
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f5f5f5", fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
      {showPagamento && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: "#fff",
            borderRadius: "12px",
            padding: "0",
            width: "600px",
            maxHeight: "90vh",
            overflow: "hidden",
            boxShadow: "0 4px 20px rgba(0,0,0,0.2)"
          }}>
            <div style={{
              backgroundColor: "#1e88e5",
              background: "linear-gradient(135deg, #1e88e5 0%, #1565c0 100%)",
              color: "#fff",
              padding: "25px 30px"
            }}>
              <h3 style={{ fontSize: "24px", fontWeight: 600, margin: 0 }}>Pagamentos</h3>
            </div>

            <div style={{ padding: "30px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
                <div>
                  <div style={{ marginBottom: "20px" }}>
                    <label style={labelStyle}>DINHEIRO:</label>
                    <input
                      type="number"
                      value={dinheiro}
                      onChange={(e) => setDinheiro(e.target.value)}
                      onBlur={calcularTroco}
                      step="0.01"
                      style={{ ...inputStyle, fontSize: "16px", padding: "12px" }}
                    />
                  </div>

                  <div style={{ marginBottom: "20px" }}>
                    <label style={labelStyle}>CARTÃO:</label>
                    <input
                      type="number"
                      value={cartao}
                      onChange={(e) => setCartao(e.target.value)}
                      onBlur={calcularTroco}
                      step="0.01"
                      style={{ ...inputStyle, fontSize: "16px", padding: "12px" }}
                    />
                  </div>

                  <div style={{ marginBottom: "20px" }}>
                    <label style={labelStyle}>CHEQUE:</label>
                    <input
                      type="number"
                      value={cheque}
                      onChange={(e) => setCheque(e.target.value)}
                      onBlur={calcularTroco}
                      step="0.01"
                      style={{ ...inputStyle, fontSize: "16px", padding: "12px" }}
                    />
                  </div>

                  <div style={{ marginBottom: "20px" }}>
                    <label style={labelStyle}>TROCO:</label>
                    <input
                      type="text"
                      value={troco}
                      readOnly
                      style={{ ...inputStyle, fontSize: "16px", padding: "12px", backgroundColor: "#f5f5f5", fontWeight: 600 }}
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>TOTAL:</label>
                    <input
                      type="text"
                      value={totalVenda.toFixed(2)}
                      readOnly
                      style={{ 
                        ...inputStyle, 
                        fontSize: "20px", 
                        padding: "12px", 
                        backgroundColor: "#e3f2fd", 
                        fontWeight: 700,
                        color: "#1e88e5",
                        textAlign: "center"
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Obs.:</label>
                  <textarea
                    value={obs}
                    onChange={(e) => setObs(e.target.value)}
                    placeholder="Observações sobre a venda..."
                    style={{
                      ...inputStyle,
                      minHeight: "320px",
                      resize: "none",
                      fontFamily: "inherit"
                    }}
                  />
                </div>
              </div>

              <button 
                onClick={finalizarVenda}
                style={{
                  width: "100%",
                  padding: "16px",
                  backgroundColor: "#4caf50",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "16px",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px"
                }}
              >
                <DollarSign size={20} />
                Finalizar Venda
              </button>
            </div>
          </div>
        </div>
      )}

      {showConfirmCancel && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: "#fff",
            borderRadius: "12px",
            padding: "30px",
            maxWidth: "400px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.2)"
          }}>
            <h3 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "15px", color: "#333" }}>
              Cancelar Venda?
            </h3>
            <p style={{ fontSize: "14px", color: "#666", marginBottom: "25px" }}>
              Deseja realmente cancelar esta venda? Todos os itens serão removidos do carrinho.
            </p>
            <div style={{ display: "flex", gap: "10px" }}>
              <button 
                onClick={() => setShowConfirmCancel(false)}
                style={{
                  flex: 1,
                  padding: "12px",
                  backgroundColor: "#f5f5f5",
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: 500,
                  cursor: "pointer",
                  fontSize: "14px",
                  color: "#666"
                }}
              >
                Não
              </button>
              <button 
                onClick={confirmarCancelamento}
                style={{
                  flex: 1,
                  padding: "12px",
                  backgroundColor: "#e91e63",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: 500,
                  cursor: "pointer",
                  fontSize: "14px"
                }}
              >
                Sim, Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
      
 <Sidebar
  usuarioLogado={usuarioLogado}
  nivelAcesso={nivelAcesso}
  onLogout={handleLogout}
/>

      <main style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <header style={{
          backgroundColor: "#1e88e5",
          background: "linear-gradient(135deg, #1e88e5 0%, #1565c0 100%)",
          color: "#fff",
          padding: "30px 50px",
          position: "relative"
        }}>
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

          <h1 style={{ fontSize: "28px", fontWeight: 600, marginBottom: "4px" }}>Ponto de Vendas</h1>
          <p style={{ fontSize: "15px", opacity: 0.95 }}>
            Sistema de vendas rápido e eficiente
          </p>
        </header>

        <div style={{ padding: "30px 50px", flex: 1 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", height: "100%" }}>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              
              <div style={cardStyle}>
                <h3 style={cardTitleStyle}>Dados do Cliente</h3>
                
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "15px" }}>
                  <div>
                    <label style={labelStyle}>CPF:</label>
                    <input
                      type="text"
                      value={cpf}
                      onChange={(e) => setCpf(e.target.value)}
                      placeholder="000.000.000-00"
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Data:</label>
                    <input
                      type="text"
                      value={data}
                      readOnly
                      style={{ ...inputStyle, backgroundColor: "#f5f5f5" }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: "15px" }}>
                  <label style={labelStyle}>Nome:</label>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <input
                      type="text"
                      value={nomeCliente}
                      onChange={(e) => setNomeCliente(e.target.value)}
                      placeholder="Nome do cliente"
                      style={{ ...inputStyle, flex: 1 }}
                    />
                    <button onClick={pesquisarCliente} style={buttonSearchStyle}>
                      <Search size={18} />
                      Pesquisar
                    </button>
                  </div>
                </div>
              </div>

              <div style={{ ...cardStyle, flex: 1 }}>
                <h3 style={cardTitleStyle}>Dados do Produto</h3>
                
                <div style={{ marginBottom: "15px" }}>
                  <label style={labelStyle}>Código:</label>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <input
                      type="text"
                      value={codigoProduto}
                      onChange={(e) => setCodigoProduto(e.target.value)}
                      placeholder="Código do produto"
                      style={{ ...inputStyle, flex: 1 }}
                    />
                    <button onClick={pesquisarProduto} style={buttonSearchStyle}>
                      <Search size={18} />
                      Pesquisar
                    </button>
                  </div>
                </div>

                <div style={{ marginBottom: "15px" }}>
                  <label style={labelStyle}>Produto:</label>
                  <input
                    type="text"
                    value={nomeProduto}
                    onChange={(e) => setNomeProduto(e.target.value)}
                    placeholder="Nome do produto"
                    style={inputStyle}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "20px" }}>
                  <div>
                    <label style={labelStyle}>Preço:</label>
                    <input
                      type="number"
                      value={preco}
                      onChange={(e) => setPreco(e.target.value)}
                      placeholder="0.00"
                      step="0.01"
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Qtd:</label>
                    <input
                      type="number"
                      value={quantidade}
                      onChange={(e) => setQuantidade(e.target.value)}
                      placeholder="0"
                      style={inputStyle}
                    />
                  </div>
                </div>

                <button onClick={adicionarItem} style={buttonAddStyle}>
                  <Plus size={18} />
                  Adicionar Item
                </button>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              
              <div style={{ ...cardStyle, flex: 1, display: "flex", flexDirection: "column" }}>
                <h3 style={cardTitleStyle}>Carrinho de Compras</h3>
                
                <div style={{ 
                  flex: 1, 
                  overflowY: "auto",
                  border: "1px solid #e0e0e0",
                  borderRadius: "8px",
                  marginBottom: "15px"
                }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ backgroundColor: "#f5f5f5", borderBottom: "2px solid #e0e0e0" }}>
                        <th style={tableHeaderStyle}>Código</th>
                        <th style={tableHeaderStyle}>Produto</th>
                        <th style={tableHeaderStyle}>Qtd</th>
                        <th style={tableHeaderStyle}>Preço</th>
                        <th style={tableHeaderStyle}>Subtotal</th>
                        <th style={{ ...tableHeaderStyle, width: "50px" }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {carrinho.length === 0 ? (
                        <tr>
                          <td colSpan={6} style={{ textAlign: "center", padding: "40px", color: "#999" }}>
                            Nenhum item adicionado
                          </td>
                        </tr>
                      ) : (
                        carrinho.map((item, index) => (
                          <tr key={index} style={{ borderBottom: "1px solid #f0f0f0" }}>
                            <td style={tableCellStyle}>{item.codigo}</td>
                            <td style={tableCellStyle}>{item.produto}</td>
                            <td style={tableCellStyle}>{item.qtd}</td>
                            <td style={tableCellStyle}>R$ {item.preco.toFixed(2)}</td>
                            <td style={{ ...tableCellStyle, fontWeight: 600, color: "#1e88e5" }}>
                              R$ {item.subtotal.toFixed(2)}
                            </td>
                            <td style={tableCellStyle}>
                              <button 
                                onClick={() => removerItem(index)}
                                style={{
                                  background: "none",
                                  border: "none",
                                  color: "#e91e63",
                                  cursor: "pointer",
                                  padding: "5px"
                                }}
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div style={cardStyle}>
                <h3 style={cardTitleStyle}>Total da Venda</h3>
                
                <div style={{
                  backgroundColor: "#f8f9fa",
                  padding: "20px",
                  borderRadius: "8px",
                  marginBottom: "20px"
                }}>
                  <p style={{ fontSize: "14px", color: "#666", marginBottom: "5px" }}>TOTAL DA VENDA:</p>
                  <p style={{ fontSize: "36px", fontWeight: 700, color: "#1e88e5", margin: 0 }}>
                    R$ {totalVenda.toFixed(2)}
                  </p>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <button onClick={finalizarPagamento} style={buttonPaymentStyle}>
                    <DollarSign size={18} />
                    PAGAMENTO
                  </button>
                  <button onClick={cancelarVenda} style={buttonCancelStyle}>
                    <X size={18} />
                    CANCELAR VENDA
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}

const menuItemStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  padding: "12px 20px",
  textDecoration: "none",
  fontSize: "14px",
  fontWeight: 500,
  transition: "all 0.2s",
  cursor: "pointer",
  border: "none",
  width: "100%",
  textAlign: "left"
};

const cardStyle: React.CSSProperties = {
  backgroundColor: "#fff",
  borderRadius: "12px",
  padding: "25px",
  boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
};

const cardTitleStyle: React.CSSProperties = {
  fontSize: "16px",
  fontWeight: 600,
  marginBottom: "20px",
  color: "#333",
  paddingBottom: "10px",
  borderBottom: "2px solid #1e88e5"
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "13px",
  fontWeight: 500,
  color: "#666",
  marginBottom: "6px"
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  fontSize: "14px",
  border: "1px solid #e0e0e0",
  borderRadius: "6px",
  outline: "none",
  transition: "border 0.2s"
};

const buttonSearchStyle: React.CSSProperties = {
  backgroundColor: "#1e88e5",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  padding: "10px 20px",
  fontSize: "14px",
  fontWeight: 500,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: "8px",
  whiteSpace: "nowrap"
};

const buttonAddStyle: React.CSSProperties = {
  backgroundColor: "#4caf50",
  color: "#fff",
  border: "none",
  borderRadius: "8px",
  padding: "12px 20px",
  fontSize: "14px",
  fontWeight: 600,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  width: "100%"
};

const buttonPaymentStyle: React.CSSProperties = {
  backgroundColor: "#1e88e5",
  color: "#fff",
  border: "none",
  borderRadius: "8px",
  padding: "14px 20px",
  fontSize: "14px",
  fontWeight: 600,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px"
};

const buttonCancelStyle: React.CSSProperties = {
  backgroundColor: "#e91e63",
  color: "#fff",
  border: "none",
  borderRadius: "8px",
  padding: "14px 20px",
  fontSize: "14px",
  fontWeight: 600,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px"
};

const tableHeaderStyle: React.CSSProperties = {
  padding: "12px",
  textAlign: "left",
  fontSize: "12px",
  fontWeight: 600,
  color: "#666",
  textTransform: "uppercase"
};

const tableCellStyle: React.CSSProperties = {
  padding: "12px",
  fontSize: "13px",
  color: "#333"
};