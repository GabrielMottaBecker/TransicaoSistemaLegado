import React from 'react';
// Importa o componente unificado para fazer a edição
import CadastrarProduto from './cadastrar_produtos.tsx'; 

/**
 * Componente Wrapper para a rota /editar_produto/:id
 */
export default function EditarProdutoWrapper() {
    return (
        <CadastrarProduto />
    );
}