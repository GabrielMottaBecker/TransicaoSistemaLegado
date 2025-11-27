from django.urls import path, include
from rest_framework import routers
from .views import FornecedorViewSet

router = routers.DefaultRouter()
router.register(r'', FornecedorViewSet) 

urlpatterns = router.urls
