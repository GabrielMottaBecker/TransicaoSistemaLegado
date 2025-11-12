// editar_fornecedores.tsx
import React from 'react';
// 🚨 CRÍTICO: Importação PADRÃO correta do componente que faz a edição.
import CadastrarFornecedor from './cadastrar_fornecedores.tsx'; 

/**
 * Componente Wrapper para a rota /editar_fornecedor/:id.
 * Ele reutiliza o componente CadastrarFornecedor, que usa o hook useParams
 * para detectar a presença de um ID e carregar os dados para edição.
 */
export default function EditarFornecedorWrapper() {
    return (
        <CadastrarFornecedor />
    );
}