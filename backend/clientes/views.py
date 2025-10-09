from rest_framework import viewsets
from .models import Cliente
from .serializers import ClienteSerializer
from rest_framework.decorators import action
from rest_framework.response import Response

class ClienteViewSet(viewsets.ModelViewSet):
    queryset = Cliente.objects.all()
    serializer_class = ClienteSerializer

    @action(detail=False, methods=['get'], url_path='buscar-por-cpf')
    def buscar_por_cpf(self, request):
        cpf = request.query_params.get('cpf')
        if cpf:
            try:
                cliente = Cliente.objects.get(cpf=cpf)
                serializer = self.get_serializer(cliente)
                return Response(serializer.data)
            except Cliente.DoesNotExist:
                return Response({'detail': 'Cliente não encontrado'}, status=404)
        return Response({'detail': 'CPF não fornecido'}, status=400)
