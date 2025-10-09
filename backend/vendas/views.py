from rest_framework import viewsets, status
from rest_framework.response import Response
from .models import Venda, ItemVenda, Produto
from .serializers import VendaSerializer, ItemVendaSerializer

class VendaViewSet(viewsets.ModelViewSet):
    queryset = Venda.objects.all()
    serializer_class = VendaSerializer

    def create(self, request, *args, **kwargs):

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        venda = serializer.save()
        
        venda.calcular_total()
        
        return Response(VendaSerializer(venda).data, status=status.HTTP_201_CREATED)


class ItemVendaViewSet(viewsets.ModelViewSet):
    queryset = ItemVenda.objects.all()
    serializer_class = ItemVendaSerializer

    def create(self, request, *args, **kwargs):

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        item = serializer.save()

        item.venda.calcular_total()

        return Response(ItemVendaSerializer(item).data, status=status.HTTP_201_CREATED)
