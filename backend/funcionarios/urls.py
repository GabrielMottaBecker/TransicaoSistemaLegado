# funcionarios/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UsuarioViewSet

router = DefaultRouter()
# Define o prefixo do CRUD como 'usuarios'
router.register(r'usuarios', UsuarioViewSet, basename='usuario') 

urlpatterns = [
    # Inclui apenas o CRUD do ViewSet
    path('', include(router.urls)), 
]