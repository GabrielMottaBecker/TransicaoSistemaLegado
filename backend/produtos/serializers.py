from rest_framework import serializers
from decimal import Decimal
from .models import Produto

class ProdutoSerializer(serializers.ModelSerializer):
    preco_com_desconto = serializers.ReadOnlyField() 
    
    descricao = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    
    preco = serializers.DecimalField(max_digits=10, decimal_places=2, required=False, allow_null=True)
    quantidade_estoque = serializers.IntegerField(required=False, allow_null=True)
    desconto_percentual = serializers.DecimalField(max_digits=5, decimal_places=2, default=0, required=False, allow_null=True)
    
    codigo_barras = serializers.CharField(required=False, allow_null=True, allow_blank=True)

    class Meta:
        model = Produto
        fields = '__all__'

    def to_internal_value(self, data):
        for field_name in ['preco', 'quantidade_estoque', 'desconto_percentual']:
            value = data.get(field_name)
            if value is not None and isinstance(value, str) and not value.replace('.', '', 1).isdigit():
                data[field_name] = None
                
        return super().to_internal_value(data)