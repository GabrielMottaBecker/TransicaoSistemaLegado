# Transição de Sistema Legado — Java ➜ Python/Django + React

### Um sistema legado de vendas originalmente em Java, agora migrado para uma arquitetura moderna utilizando Python (Django) no backend e React no frontend. O objetivo deste projeto é modernizar a base de código, melhorar a escalabilidade, facilitar manutenção e integrar novas funcionalidades com maior velocidade.


## Pré-requisitos

Antes de rodar o projeto, instale:

Python 3.10+

pip e venv

Node.js 18+

npm ou yarn


## Como rodar o projeto
1. Rodando o Backend (Django)

Abra o terminal e entre na pasta:

cd backend

### Crie e ative um ambiente virtual:

python -m venv venv

venv\Scripts\activate      

### Instale as dependências:

pip install -r requirements.txt


### Execute as migrações:

python manage.py migrate


### Inicie o servidor:

python manage.py runserver


### O backend rodará em:
http://127.0.0.1:8000/

## 2. Rodando o Frontend (React)

Em outro terminal, entre na pasta do frontend:

cd frontend/frontend


### Instale as dependências:

npm install


### Inicie o front:

npm start


### O frontend abrirá automaticamente em:
http://localhost:3000/

## Fluxo de Comunicação

O React consome a API criada no Django:

React (3000) → Django REST API (8000)
