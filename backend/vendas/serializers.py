from rest_framework import serializers
from django.db import transaction
from .models import Venda, ItemVenda
from produtos.models import Produto
from clientes.models import Cliente

class ItemVendaSerializer(serializers.ModelSerializer):
    produto = serializers.PrimaryKeyRelatedField(
        queryset=Produto.objects.all(),
        error_messages={'does_not_exist': 'Produto inválido ou não encontrado.'}
    )
    produto_nome = serializers.CharField(source="produto.descricao", read_only=True)
    subtotal = serializers.SerializerMethodField()

    class Meta:
        model = ItemVenda
        fields = [
            "id", "produto", "produto_nome", "quantidade", 
            "preco_unitario", "desconto_percentual", "subtotal",
        ]
        read_only_fields = ["id", "subtotal", "produto_nome"]

    def get_subtotal(self, obj):
        return obj.subtotal

    def validate(self, data):
        produto = data.get("produto")
        quantidade = data.get("quantidade")

        if produto and quantidade:
            # Verifica se tem estoque suficiente
            if produto.quantidade_estoque < quantidade:
                raise serializers.ValidationError({
                    "quantidade": f"Estoque insuficiente para '{produto.descricao}'. Disponível: {produto.quantidade_estoque}"
                })
        return data


class VendaSerializer(serializers.ModelSerializer):
    itens = ItemVendaSerializer(many=True)
    
    # Configuração robusta para aceitar cliente nulo
    cliente = serializers.PrimaryKeyRelatedField(
        queryset=Cliente.objects.all(),
        required=False,
        allow_null=True
    )
    
    cliente_nome = serializers.SerializerMethodField()
    vendedor_nome = serializers.CharField(source="vendedor.username", read_only=True)

    class Meta:
        model = Venda
        fields = [
            "id", "cliente", "cliente_nome", "vendedor", "vendedor_nome",
            "data_venda", "desconto_percentual", "total_venda", "itens",
        ]
        read_only_fields = ["id", "data_venda", "total_venda", "vendedor", "vendedor_nome"]

    def get_cliente_nome(self, obj):
        return obj.cliente.nome if obj.cliente else "Consumidor Final"

    def create(self, validated_data):
        request = self.context.get("request")
        # Pega o usuário logado ou None
        validated_data["vendedor"] = request.user if (request and request.user.is_authenticated) else None

        with transaction.atomic():
            itens_data = validated_data.pop("itens")
            venda = Venda.objects.create(**validated_data)

            for item_data in itens_data:
                produto = item_data["produto"]
                quantidade = item_data["quantidade"]
                preco_unitario = item_data.get("preco_unitario", produto.preco)
                
                ItemVenda.objects.create(
                    venda=venda,
                    produto=produto,
                    quantidade=quantidade,
                    preco_unitario=preco_unitario,
                    desconto_percentual=item_data.get("desconto_percentual", 0),
                )

                # Baixa de Estoque
                produto.quantidade_estoque -= quantidade
                produto.save()

            venda.calcular_total()
            return venda


class VendaListSerializer(serializers.ModelSerializer):
    cliente_nome = serializers.SerializerMethodField()
    vendedor_nome = serializers.CharField(source="vendedor.username", read_only=True)
    quantidade_itens = serializers.SerializerMethodField()

    class Meta:
        model = Venda
        fields = [
            "id",
            "cliente_nome",
            "vendedor_nome",
            "data_venda",
            "total_venda",
            "quantidade_itens",
        ]

    def get_cliente_nome(self, obj):
        return obj.cliente.nome if obj.cliente else "Consumidor Final"

    def get_quantidade_itens(self, obj):
        return obj.itens.count()