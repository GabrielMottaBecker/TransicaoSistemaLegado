# backend/vendas/views.py
from django.db import transaction
from django.http import HttpResponse
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from io import BytesIO
from datetime import datetime
from .models import Venda, ItemVenda
# ⚠️ CORREÇÃO: Importamos apenas os serializers que existem no arquivo serializers.py
from .serializers import VendaSerializer, VendaListSerializer, ItemVendaSerializer

# Importações para PDF (só importa se reportlab estiver instalado)
try:
    from reportlab.lib.pagesizes import A4
    from reportlab.lib import colors
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
    from reportlab.lib.enums import TA_CENTER, TA_RIGHT
    REPORTLAB_AVAILABLE = True
except ImportError:
    REPORTLAB_AVAILABLE = False


class VendaViewSet(viewsets.ModelViewSet):
    queryset = Venda.objects.select_related('cliente', 'vendedor').prefetch_related('itens__produto').order_by('-data_venda')
    
    def get_serializer_class(self):
        """Usa serializer simplificado para listagem"""
        if self.action == 'list':
            return VendaListSerializer
        # Para criar, atualizar ou ver detalhes, usa o serializer completo
        return VendaSerializer

    def create(self, request, *args, **kwargs):
        """
        Cria venda com validação completa e transação atômica
        """
        with transaction.atomic():
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            venda = serializer.save()
            
            # Garante que os cálculos de totais estejam atualizados
            venda.refresh_from_db()
            
            # Retorna a venda criada com todos os dados
            output_serializer = VendaSerializer(venda)
            headers = self.get_success_headers(output_serializer.data)
            return Response(
                output_serializer.data, 
                status=status.HTTP_201_CREATED, 
                headers=headers
            )

    def update(self, request, *args, **kwargs):
        """Bloqueia atualização de vendas"""
        return Response(
            {"detail": "Vendas não podem ser modificadas após criadas."},
            status=status.HTTP_403_FORBIDDEN
        )

    def partial_update(self, request, *args, **kwargs):
        """Bloqueia atualização parcial de vendas"""
        return Response(
            {"detail": "Vendas não podem ser modificadas após criadas."},
            status=status.HTTP_403_FORBIDDEN
        )

    @action(detail=True, methods=['get'])
    def nota_fiscal(self, request, pk=None):
        """Gera nota fiscal em PDF"""
        if not REPORTLAB_AVAILABLE:
            return Response(
                {"detail": "ReportLab não está instalado. Execute: pip install reportlab"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        venda = self.get_object()
        buffer = BytesIO()
        
        # Configuração do PDF
        doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=30, leftMargin=30, topMargin=30, bottomMargin=30)
        elements = []
        styles = getSampleStyleSheet()
        
        # Título
        elements.append(Paragraph(f"NOTA FISCAL #{venda.id:06d}", styles['Heading1']))
        elements.append(Spacer(1, 12))
        
        # Dados da Venda
        cliente_nome = venda.cliente.nome if venda.cliente else "Consumidor Final"
        vendedor_nome = venda.vendedor.username if venda.vendedor else "N/A"
        
        texto_info = f"""
        <b>Data:</b> {venda.data_venda.strftime("%d/%m/%Y %H:%M")}<br/>
        <b>Cliente:</b> {cliente_nome}<br/>
        <b>Vendedor:</b> {vendedor_nome}
        """
        elements.append(Paragraph(texto_info, styles['Normal']))
        elements.append(Spacer(1, 20))
        
        # Tabela de Itens
        data = [['Produto', 'Qtd', 'Preço Unit.', 'Subtotal']]
        for item in venda.itens.all():
            data.append([
                item.produto.descricao,
                str(item.quantidade),
                f"R$ {item.preco_unitario:.2f}",
                f"R$ {item.subtotal:.2f}"
            ])
        
        # Totais
        data.append(['', '', 'Total:', f"R$ {venda.total_venda:.2f}"])
        
        t = Table(data, colWidths=[250, 50, 100, 100])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        elements.append(t)
        
        doc.build(elements)
        buffer.seek(0)
        response = HttpResponse(buffer.getvalue(), content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="nota_fiscal_{venda.id}.pdf"'
        return response

    @action(detail=True, methods=['get'])
    def nota_fiscal_html(self, request, pk=None):
        """Gera nota fiscal em HTML para impressão"""
        venda = self.get_object()
        cliente_nome = venda.cliente.nome if venda.cliente else "Consumidor Final"
        
        html = f"""
        <html>
        <head>
            <style>
                body {{ font-family: monospace; width: 300px; margin: 0 auto; }}
                h2 {{ text-align: center; border-bottom: 1px dashed #000; }}
                table {{ width: 100%; }}
                .text-right {{ text-align: right; }}
            </style>
        </head>
        <body>
            <h2>VENDIFY SISTEMA</h2>
            <p>
                Venda: #{venda.id:06d}<br/>
                Data: {venda.data_venda.strftime("%d/%m/%Y %H:%M")}<br/>
                Cliente: {cliente_nome}
            </p>
            <hr/>
            <table>
                <tr>
                    <th align="left">Item</th>
                    <th align="right">Qtd</th>
                    <th align="right">Valor</th>
                </tr>
        """
        
        for item in venda.itens.all():
            html += f"""
                <tr>
                    <td>{item.produto.descricao}</td>
                    <td align="right">{item.quantidade}</td>
                    <td align="right">{item.subtotal:.2f}</td>
                </tr>
            """
            
        html += f"""
            </table>
            <hr/>
            <p class="text-right"><strong>TOTAL: R$ {venda.total_venda:.2f}</strong></p>
            <script>window.print();</script>
        </body>
        </html>
        """
        return HttpResponse(html)

    @action(detail=True, methods=['post'])
    def cancelar(self, request, pk=None):
        """Cancela venda e estorna estoque"""
        venda = self.get_object()
        with transaction.atomic():
            for item in venda.itens.all():
                produto = item.produto
                produto.quantidade_estoque += item.quantidade
                produto.save()
            venda.delete()
            
        return Response({"detail": "Venda cancelada com sucesso."}, status=status.HTTP_200_OK)


class ItemVendaViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ItemVenda.objects.select_related('produto', 'venda').all()
    serializer_class = ItemVendaSerializer