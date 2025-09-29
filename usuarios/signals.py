# usuarios/signals.py
from django.db.models.signals import post_migrate
from django.dispatch import receiver
from .models import Usuario

@receiver(post_migrate)
def criar_admin_padrao(sender, **kwargs):
    if not Usuario.objects.filter(nome="admin").exists():
        Usuario.objects.create(
            nome="admin",
            senha="admin",       # ⚠️ apenas para teste
            nivel_acesso="admin",
            email="admin@teste.com",
            cpf="00000000000",
            rg="0000000",
            cargo="Administrador",
            cep="00000000",
            celular="00000000000",
            telefone="",
            telefone_fixo="",
            endereco="Endereço padrão",
            numero_casa="0",
            bairro="Bairro padrão",
            cidade="Cidade padrão",
            complemento="",
            uf="SP"
        )
        print("Usuário admin criado: admin/admin")
