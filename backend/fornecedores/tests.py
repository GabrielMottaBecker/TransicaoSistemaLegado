from rest_framework.test import APITestCase
from django.urls import reverse
from rest_framework import status
from fornecedores.models import Fornecedor

class FornecedorAPITest(APITestCase):

    def setUp(self):
        # Fornecedor padrão para testes
        self.fornecedor = Fornecedor.objects.create(
            nome="Fornecedor Teste",
            email="teste@fornecedor.com",
            cnpj="11.111.111/0001-11",
            celular="(45) 99999-9999",
            cidade="Toledo",
            uf="PR"
        )

        self.list_url = reverse("fornecedor-list")
        self.detail_url = reverse("fornecedor-detail", args=[self.fornecedor.id])

    # LISTAR FORNECEDORES (GET /)
    def test_listar_fornecedores(self):
        response = self.client.get(self.list_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["nome"], "Fornecedor Teste")

    # CRIAR FORNECEDOR (POST /)
    def test_criar_fornecedor(self):
        dados = {
            "nome": "Novo Fornecedor",
            "email": "novo@fornecedor.com",
            "cnpj": "22.222.222/0001-22",
            "telefone_fixo": "(45) 3333-3333",
            "cidade": "Cascavel",
            "uf": "PR"
        }

        response = self.client.post(self.list_url, dados, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["nome"], "Novo Fornecedor")
        self.assertTrue(Fornecedor.objects.filter(nome="Novo Fornecedor").exists())

    # BUSCAR FORNECEDOR POR ID (GET /<id>/)
    def test_buscar_fornecedor_por_id(self):
        response = self.client.get(self.detail_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["nome"], "Fornecedor Teste")

    # ATUALIZAR FORNECEDOR (PUT /<id>/)
    def test_atualizar_fornecedor(self):
        dados = {
            "nome": "Fornecedor Atualizado",
            "email": "atualizado@fornecedor.com",
            "cnpj": "11.111.111/0001-11",
            "cidade": "Curitiba",
            "uf": "PR",
            "celular": "(45) 90000-0000",
        }

        response = self.client.put(self.detail_url, dados, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["nome"], "Fornecedor Atualizado")

        fornecedor = Fornecedor.objects.get(id=self.fornecedor.id)
        self.assertEqual(fornecedor.nome, "Fornecedor Atualizado")

    # EXCLUIR FORNECEDOR (DELETE /<id>/)
    def test_excluir_fornecedor(self):
        response = self.client.delete(self.detail_url)

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Fornecedor.objects.filter(id=self.fornecedor.id).exists())
