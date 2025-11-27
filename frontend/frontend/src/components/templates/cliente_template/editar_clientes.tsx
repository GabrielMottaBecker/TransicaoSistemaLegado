import React from 'react';
import CadastrarCliente from './cadastrar_clientes.tsx'; 
import { useParams } from 'react-router-dom';

/**
 * Componente Wrapper para a rota /editar_clientes/:id
 * Renderiza o componente CadastrarCliente, que usa o ID da rota para carregar os dados.
 */
export default function EditarClientesWrapper() {
    // O componente CadastrarCliente lê o ID da rota via useParams() internamente.
    // Se um ID for encontrado, ele entra em "Modo Edição".
    return (
        <CadastrarCliente />
    );
}