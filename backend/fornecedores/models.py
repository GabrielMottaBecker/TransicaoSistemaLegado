from django.db import models

class Fornecedor(models.Model):

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
    celular = models.CharField(max_length=15, verbose_name="Celular")
    telefone_fixo = models.CharField(max_length=14, verbose_name="Telefone Fixo", blank=True, null=True)
    cep = models.CharField(max_length=9, verbose_name="CEP")
    endereco = models.CharField(max_length=255)
    numero_casa = models.CharField(max_length=10, verbose_name="Número da Casa")
    bairro = models.CharField(max_length=100)
    cidade = models.CharField(max_length=100)
    complemento = models.CharField(max_length=255, blank=True, null=True)
    uf = models.CharField(max_length=2, choices=ESTADOS, verbose_name="UF")
    cnpj = models.CharField(max_length=18, unique=True, verbose_name="CNPJ")
    
    def __str__(self):
        return self.nome
    
