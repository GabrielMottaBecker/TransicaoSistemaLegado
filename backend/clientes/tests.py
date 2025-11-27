from rest_framework.test import APITestCase
from django.urls import reverse
from rest_framework import status
from clientes.models import Cliente


class ClienteAPITest(APITestCase):

    def setUp(self):
        # Cliente usado nos testes
        self.cliente = Cliente.objects.create(
            nome="Gabriel Becker",
            cpf="000.000.000-00",
            email="gabriel@example.com"
        )

        self.list_url = reverse("clientes-list")
        self.detail_url = reverse("clientes-detail", args=[self.cliente.id])

        self.buscar_por_cpf_url = reverse("clientes-buscar-por-cpf")

    # LISTAR CLIENTES (GET /)
    def test_listar_clientes(self):
        response = self.client.get(self.list_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["nome"], "Gabriel Becker")

    # CRIAR CLIENTE (POST /)
    def test_criar_cliente(self):
        dados = {
            "nome": "Maria da Silva",
            "cpf": "111.111.111-11",
            "email": "maria@example.com"
        }

        response = self.client.post(self.list_url, dados, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["nome"], "Maria da Silva")
        self.assertTrue(Cliente.objects.filter(nome="Maria da Silva").exists())

    # BUSCAR CLIENTE POR ID (GET /<id>/)
    def test_buscar_cliente_por_id(self):
        response = self.client.get(self.detail_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["nome"], "Gabriel Becker")

    # ATUALIZAR CLIENTE (PUT /<id>/)
    def test_atualizar_cliente(self):
        dados = {
            "nome": "Gabriel Editado",
            "cpf": "000.000.000-00",
            "email": "novo@example.com"
        }

        response = self.client.put(self.detail_url, dados, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["nome"], "Gabriel Editado")

        cliente = Cliente.objects.get(id=self.cliente.id)
        self.assertEqual(cliente.nome, "Gabriel Editado")

    # EXCLUIR CLIENTE (DELETE /<id>/)
    def test_excluir_cliente(self):
        response = self.client.delete(self.detail_url)

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Cliente.objects.filter(id=self.cliente.id).exists())

    # BUSCAR POR CPF — SUCESSO (GET /buscar-por-cpf/?cpf=xxx)
    def test_buscar_por_cpf_sucesso(self):
        response = self.client.get(self.buscar_por_cpf_url, {"cpf": "000.000.000-00"})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["cpf"], "000.000.000-00")
        self.assertEqual(response.data["nome"], "Gabriel Becker")

    # BUSCAR POR CPF — NÃO ENCONTRADO
    def test_buscar_por_cpf_nao_encontrado(self):
        response = self.client.get(self.buscar_por_cpf_url, {"cpf": "999.999.999-99"})

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data["detail"], "Cliente não encontrado")

    # BUSCAR POR CPF — SEM CPF INFORMADO
    def test_buscar_por_cpf_sem_parametro(self):
        response = self.client.get(self.buscar_por_cpf_url)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["detail"], "CPF não fornecido")
