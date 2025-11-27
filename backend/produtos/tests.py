from rest_framework.test import APITestCase
from rest_framework import status
from decimal import Decimal
from produtos.models import Produto
from django.urls import reverse

class ProdutoAPITest(APITestCase):

    def setUp(self):
        self.url_list = reverse('produto-list')

    def test_criar_produto(self):
        data = {
            "descricao": "Notebook Dell",
            "preco": "3500.00",
            "quantidade_estoque": 10,
            "desconto_percentual": "5.00",
            "codigo_barras": "123456789"
        }
        response = self.client.post(self.url_list, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Produto.objects.count(), 1)

    def test_listar_produtos(self):
        Produto.objects.create(descricao="Produto A", preco=10)
        Produto.objects.create(descricao="Produto B", preco=20)

        response = self.client.get(self.url_list)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_atualizar_produto(self):
        produto = Produto.objects.create(
            descricao="Produto X",
            preco=100
        )
        url_detail = reverse('produto-detail', args=[produto.id])

        response = self.client.put(url_detail, {
            "descricao": "Produto X Atualizado",
            "preco": "150.00",
            "quantidade_estoque": 5,
            "desconto_percentual": "0.00",
            "codigo_barras": "9999"
        }, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        produto.refresh_from_db()
        self.assertEqual(produto.descricao, "Produto X Atualizado")

    def test_deletar_produto(self):
        produto = Produto.objects.create(descricao="Apagar", preco=10)
        url_detail = reverse('produto-detail', args=[produto.id])

        response = self.client.delete(url_detail)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Produto.objects.count(), 0)

    def test_criar_produto_com_campos_nulos(self):
        data = {
            "descricao": None,
            "preco": None,
            "quantidade_estoque": None,
            "desconto_percentual": "0.00",
            "codigo_barras": None
        }
        response = self.client.post(self.url_list, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Produto.objects.count(), 1)
