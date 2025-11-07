# produtos/serializers.py (Versão Modificada para Teste - FLEXÍVEL)

from rest_framework import serializers
from decimal import Decimal
from .models import Produto

class ProdutoSerializer(serializers.ModelSerializer):
    preco_com_desconto = serializers.ReadOnlyField() 
    
    # ⚠️ FLEXIBILIZADO: Sobrescrevendo campos para desativar a obrigatoriedade e permitir string/nulo
    # (Mesmo que o models.py seja flexível, o serializer precisa ser instruído)
    
    descricao = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    
    # Forçamos required=False para que valores vazios passem.
    # O serializer ainda fará a conversão para Decimal/Integer, 
    # mas o método 'to_internal_value' será ajustado abaixo para lidar com falhas de conversão.
    preco = serializers.DecimalField(max_digits=10, decimal_places=2, required=False, allow_null=True)
    quantidade_estoque = serializers.IntegerField(required=False, allow_null=True)
    desconto_percentual = serializers.DecimalField(max_digits=5, decimal_places=2, default=0, required=False, allow_null=True)
    
    # Código de barras é flexibilizado (unique=False no models.py já ajuda)
    codigo_barras = serializers.CharField(required=False, allow_null=True, allow_blank=True)

    class Meta:
        model = Produto
        fields = '__all__'

    # 🚨 ADICIONADO: Sobrescreve a conversão para garantir que, se um valor for inválido, ele seja None.
    def to_internal_value(self, data):
        # Itera sobre os campos numéricos que podem ter strings de teste inválidas
        for field_name in ['preco', 'quantidade_estoque', 'desconto_percentual']:
            value = data.get(field_name)
            if value is not None and isinstance(value, str) and not value.replace('.', '', 1).isdigit():
                # Se for uma string de teste não-numérica ("teste", "drdasd", etc.), forçamos None.
                data[field_name] = None
                
        # Permite que o método padrão realize o restante da conversão
        return super().to_internal_value(data)