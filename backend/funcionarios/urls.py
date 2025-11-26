from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UsuarioViewSet, login_usuario

router = DefaultRouter()
router.register(r'usuarios', UsuarioViewSet, basename='usuario')

urlpatterns = [
    # Rota de login (já estava correta com api/)
    path('api/login/', login_usuario, name='login_usuario'),
    
    # 🚨 CORREÇÃO: Adicionamos 'api/' aqui para que o CRUD de usuários fique em /api/usuarios/
    path('api/', include(router.urls)),
]