from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import viewsets
from .models import Usuario
from .serializers import UsuarioSerializer

class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer

@api_view(['POST'])
def login_usuario(request):
    nome = request.data.get('nome')
    senha = request.data.get('senha')

    try:
        usuario = Usuario.objects.get(nome=nome, senha=senha)

        return Response({
            "id": usuario.id,
            "nome": usuario.nome,
            "nivel_acesso": usuario.nivel_acesso  
        })
    except Usuario.DoesNotExist:
        return Response({"error": "Usuário ou senha incorretos"}, status=400)