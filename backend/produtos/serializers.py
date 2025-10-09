from rest_framework import serializers
from .models import Produto

class ProdutoSerializer(serializers.ModelSerializer):
    preco_com_desconto = serializers.ReadOnlyField() 
    class Meta:
        model = Produto
        fields = '__all__'
