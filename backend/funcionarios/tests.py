from django.test import TestCase
from funcionarios.models import Usuario
from django.core.exceptions import ValidationError

class UsuarioModelTest(TestCase):

    def setUp(self):
        self.user_data = {
            "nome": "Gabriel",
            "email": "gabriel@example.com",
            "cep": "85900-000",
            "celular": "45 99999-0000",
            "telefone": "",
            "telefone_fixo": "",
            "endereco": "Rua Teste",
            "numero_casa": "123",
            "bairro": "Centro",
            "cidade": "Toledo",
            "complemento": "",
            "uf": "PR",
            "rg": "1234567",
            "cpf": "123.456.789-00",
            "cargo": "Analista",
            "senha": "123456",
            "nivel_acesso": "admin"
        }

    def test_criar_usuario(self):
        """Verifica se um usuário é criado corretamente."""
        usuario = Usuario.objects.create(**self.user_data)
        self.assertEqual(str(usuario), "Gabriel")
        self.assertEqual(usuario.email, "gabriel@example.com")
        self.assertEqual(usuario.uf, "PR")

    def test_campos_obrigatorios(self):
        """Testa se falta de campos obrigatórios gera erro."""
        data = self.user_data.copy()
        data["nome"] = ""  # nome obrigatório

        usuario = Usuario(**data)

        with self.assertRaises(ValidationError):
            usuario.full_clean()  # força validação

    def test_email_unico(self):
        """Testa se o email único está funcionando."""
        Usuario.objects.create(**self.user_data)

        data2 = self.user_data.copy()
        data2["cpf"] = "999.999.999-99"
        data2["rg"] = "0000000"
        data2["email"] = "gabriel@example.com"  # mesmo email

        usuario2 = Usuario(**data2)

        with self.assertRaises(ValidationError):
            usuario2.full_clean()

    def test_cpf_unico(self):
        """Testa se CPF único está funcionando."""
        Usuario.objects.create(**self.user_data)

        data2 = self.user_data.copy()
        data2["email"] = "outro@example.com"
        data2["rg"] = "0000000"
        data2["cpf"] = "123.456.789-00"  # mesmo CPF

        usuario2 = Usuario(**data2)

        with self.assertRaises(ValidationError):
            usuario2.full_clean()

    def test_rg_unico(self):
        """Testa unicidade do RG."""
        Usuario.objects.create(**self.user_data)

        data2 = self.user_data.copy()
        data2["email"] = "outro@example.com"
        data2["cpf"] = "987.654.321-00"
        data2["rg"] = "1234567"  # repetido

        usuario2 = Usuario(**data2)

        with self.assertRaises(ValidationError):
            usuario2.full_clean()

    def test_uf_choices_invalidos(self):
        """Testa se uma UF inválida gera erro."""
        data = self.user_data.copy()
        data["uf"] = "XX"  # inválido

        usuario = Usuario(**data)

        with self.assertRaises(ValidationError):
            usuario.full_clean()

    def test_nivel_acesso_invalido(self):
        """Testa se um nível de acesso inválido gera erro."""
        data = self.user_data.copy()
        data["nivel_acesso"] = "manager"  

        usuario = Usuario(**data)

        with self.assertRaises(ValidationError):
            usuario.full_clean()
