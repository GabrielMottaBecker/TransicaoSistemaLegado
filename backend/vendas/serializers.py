from rest_framework import serializers
from .models import Venda, ItemVenda, Produto

class ItemVendaSerializer(serializers.ModelSerializer):
    class Meta:
        model = ItemVenda
        fields = ['id', 'venda', 'produto', 'quantidade', 'preco_unitario', 'desconto_percentual', 'subtotal']
        read_only_fields = ['subtotal']

class VendaSerializer(serializers.ModelSerializer):
    itens = ItemVendaSerializer(many=True, read_only=True)

    class Meta:
        model = Venda
        fields = ['id', 'cliente', 'vendedor', 'data_venda', 'desconto_percentual', 'total_venda', 'obs', 'itens']
        read_only_fields = ['total_venda', 'data_venda']
