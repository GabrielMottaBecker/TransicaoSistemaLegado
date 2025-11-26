from rest_framework import serializers
from django.db import transaction
from .models import Venda, ItemVenda  # Models de vendas
from produtos.models import Produto   # ← CORRIJA: import do app produtos
from clientes.models import Cliente   # ← Verifique se Cliente também está no app correto


class ItemVendaSerializer(serializers.ModelSerializer):
    produto = serializers.PrimaryKeyRelatedField(
        queryset=Produto.objects.all()  # Agora vai funcionar!
    )
    produto_nome = serializers.CharField(source="produto.descricao", read_only=True)
    subtotal = serializers.SerializerMethodField()

    class Meta:
        model = ItemVenda
        fields = [
            "id",
            "produto",
            "produto_nome",
            "quantidade",
            "preco_unitario",
            "desconto_percentual",
            "subtotal",
        ]
        read_only_fields = ["id", "subtotal", "produto_nome"]
        extra_kwargs = {
            "preco_unitario": {"required": False},
            "desconto_percentual": {"required": False},
        }

    def get_subtotal(self, obj):
        return obj.subtotal

    def validate_quantidade(self, value):
        if value <= 0:
            raise serializers.ValidationError("A quantidade deve ser maior que 0.")
        return value

    def validate(self, data):
        produto = data.get("produto")
        quantidade = data.get("quantidade")

        if produto and quantidade:
            if produto.quantidade_estoque < quantidade:
                raise serializers.ValidationError({
                    "quantidade": f"Estoque insuficiente para {produto.descricao}. "
                                f"Disponível: {produto.quantidade_estoque}"
                })

        return data


class VendaSerializer(serializers.ModelSerializer):
    itens = ItemVendaSerializer(many=True)
    cliente = serializers.PrimaryKeyRelatedField(
        queryset=Cliente.objects.all()
    )
    cliente_nome = serializers.CharField(source="cliente.nome", read_only=True)
    vendedor_nome = serializers.CharField(source="vendedor.username", read_only=True)

    class Meta:
        model = Venda
        fields = [
            "id",
            "cliente",
            "cliente_nome",
            "vendedor",
            "vendedor_nome",
            "data_venda",
            "desconto_percentual",
            "total_venda",
            "itens",
        ]
        read_only_fields = ["id", "data_venda", "total_venda", "vendedor", "vendedor_nome", "cliente_nome"]
        extra_kwargs = {
            "desconto_percentual": {"required": False, "default": 0},
        }

    def validate_itens(self, value):
        if not value:
            raise serializers.ValidationError("A venda deve ter pelo menos 1 item.")
        return value

    def create(self, validated_data):
        request = self.context.get("request")
        
        if request and request.user.is_authenticated:
            validated_data["vendedor"] = request.user
        else:
            # Se não houver usuário autenticado, use um padrão ou deixe None
            validated_data["vendedor"] = None

        with transaction.atomic():
            itens_data = validated_data.pop("itens")
            venda = Venda.objects.create(**validated_data)

            for item_data in itens_data:
                produto = item_data["produto"]
                quantidade = item_data["quantidade"]
                preco_unitario = item_data.get("preco_unitario", produto.preco)
                desconto_item = item_data.get("desconto_percentual", 0)

                ItemVenda.objects.create(
                    venda=venda,
                    produto=produto,
                    quantidade=quantidade,
                    preco_unitario=preco_unitario,
                    desconto_percentual=desconto_item,
                )

                produto.quantidade_estoque -= quantidade
                produto.save()

            venda.calcular_total()
            return venda

    def update(self, instance, validated_data):
        raise serializers.ValidationError("Vendas não podem ser modificadas após criadas.")


class VendaListSerializer(serializers.ModelSerializer):
    cliente_nome = serializers.CharField(source="cliente.nome", read_only=True)
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

    def get_quantidade_itens(self, obj):
        return obj.itens.count()