from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator


class Transaction(models.Model):
    TYPE_CHOICES = [
        ('income', 'Income'),
        ('expense', 'Expense'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='transactions')
    transaction_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    amount = models.DecimalField(max_digits=12, decimal_places=2, validators=[MinValueValidator(0)])
    category = models.CharField(max_length=100)
    date = models.DateField()
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-date', '-created_at']
        indexes = [
            models.Index(fields=['user', '-date']),
            models.Index(fields=['user', 'category']),
            models.Index(fields=['user', 'transaction_type']),
        ]
    
    def __str__(self):
        return f"{self.get_transaction_type_display()} - {self.amount} ({self.category})"


class Budget(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='budgets')
    category = models.CharField(max_length=100)
    monthly_limit = models.DecimalField(max_digits=12, decimal_places=2, validators=[MinValueValidator(0)])
    year_month = models.DateField()  # First day of the month
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-year_month']
        unique_together = ('user', 'category', 'year_month')
        indexes = [
            models.Index(fields=['user', '-year_month']),
        ]
    
    def __str__(self):
        return f"{self.category} - ${self.monthly_limit}"
