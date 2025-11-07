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

// Explicação:
// Este componente atua como um wrapper para a rota de edição de produtos.
// Ele reutiliza o componente CadastrarProduto, que já contém toda a lógica necessária
// para lidar com a criação e edição de produtos. Ao acessar a rota /editar_produto/:id,
// o componente CadastrarProduto será renderizado, permitindo a edição do produto existente.
// terminou
