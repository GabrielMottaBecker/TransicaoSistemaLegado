from django.db import models

class Usuario(models.Model):

    NIVEIS_ACESSO = [

        ('admin', 'Administrador'),
        ('user', 'Usuário'),
    ]

    ESTADOS = [
        ('AC', 'AC'),
        ('AL', 'AL'),
        ('AP', 'AP'),
        ('AM', 'AM'),
        ('BA', 'BA'),
        ('CE', 'CE'),
        ('DF', 'DF'),
        ('ES', 'ES'),
        ('GO', 'GO'),
        ('MA', 'MA'),
        ('MT', 'MT'),
        ('MS', 'MS'),
        ('MG', 'MG'),
        ('PA', 'PA'),
        ('PB', 'PB'),
        ('PR', 'PR'),
        ('PE', 'PE'),
        ('PI', 'PI'),
        ('RJ', 'RJ'),
        ('RN', 'RN'),
        ('RS', 'RS'),
        ('RO', 'RO'),
        ('RR', 'RR'),
        ('SC', 'SC'),
        ('SP', 'SP'),
        ('SE', 'SE'),
        ('TO', 'TO'),
    ]
    id = models.AutoField(primary_key=True)
    nome = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    cep = models.CharField(max_length=9, verbose_name="CEP")
    celular = models.CharField(max_length=15, verbose_name="Celular")
    telefone = models.CharField(max_length=14, verbose_name="Telefone", blank=True, null=True)
    telefone_fixo = models.CharField(max_length=14, verbose_name="Telefone Fixo", blank=True, null=True)
    endereco = models.CharField(max_length=255)
    numero_casa = models.CharField(max_length=10, verbose_name="Número da Casa")
    bairro = models.CharField(max_length=100)
    cidade = models.CharField(max_length=100)
    complemento = models.CharField(max_length=255, blank=True, null=True)
    uf = models.CharField(max_length=2, choices=ESTADOS, verbose_name="UF")
    rg = models.CharField(max_length=20, unique=True, verbose_name="RG")
    cpf = models.CharField(max_length=14, unique=True, verbose_name="CPF")
    cargo = models.CharField(max_length=100)
    senha = models.CharField(max_length=128)
    nivel_acesso = models.CharField(max_length=50,choices=NIVEIS_ACESSO, verbose_name="Nível de Acesso")

    def __str__(self):
        return self.nome
