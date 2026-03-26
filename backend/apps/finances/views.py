from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.db.models import Sum, Q
from datetime import date
from apps.finances.models import Transaction, Budget
from apps.finances.serializers import TransactionSerializer, BudgetSerializer


class TransactionViewSet(viewsets.ModelViewSet):
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['transaction_type', 'category', 'date']
    search_fields = ['description', 'category']
    ordering_fields = ['date', 'amount', 'created_at']
    ordering = ['-date']
    
    def get_queryset(self):
        return Transaction.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Get monthly income/expense summary"""
        year = request.query_params.get('year')
        month = request.query_params.get('month')
        
        queryset = self.get_queryset()
        
        if year and month:
            queryset = queryset.filter(
                date__year=int(year),
                date__month=int(month)
            )
        
        income = queryset.filter(transaction_type='income').aggregate(
            total=Sum('amount')
        )['total'] or 0
        
        expense = queryset.filter(transaction_type='expense').aggregate(
            total=Sum('amount')
        )['total'] or 0
        
        return Response({
            'income': float(income),
            'expense': float(expense),
            'net': float(income - expense)
        })
    
    @action(detail=False, methods=['get'])
    def by_category(self, request):
        """Get spending breakdown by category"""
        queryset = self.get_queryset().filter(transaction_type='expense')
        
        categories = queryset.values('category').annotate(
            total=Sum('amount')
        ).order_by('-total')
        
        return Response(categories)
    
    @action(detail=False, methods=['get'])
    def categories(self, request):
        """Get all unique categories"""
        categories = self.get_queryset().values_list('category', flat=True).distinct()
        return Response({'categories': list(categories)})


class BudgetViewSet(viewsets.ModelViewSet):
    serializer_class = BudgetSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['category', 'year_month']
    ordering_fields = ['year_month', 'monthly_limit']
    ordering = ['-year_month']
    
    def get_queryset(self):
        return Budget.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
