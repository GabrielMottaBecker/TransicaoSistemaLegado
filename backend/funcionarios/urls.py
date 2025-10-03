from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UsuarioViewSet, login_usuario  # <--- aqui é login_usuario

router = DefaultRouter()
router.register(r'usuarios', UsuarioViewSet, basename='usuario')

urlpatterns = [
    path('api/login/', login_usuario),  # <--- use login_usuario
    path('api/', include(router.urls)),
]