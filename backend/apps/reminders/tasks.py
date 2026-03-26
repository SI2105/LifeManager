from celery import shared_task
from django.core.mail import send_mail
from django.utils import timezone
from datetime import timedelta
from apps.reminders.models import Reminder
from django.conf import settings


@shared_task
def send_reminder_notification(reminder_id):
    """Send email notification for a reminder"""
    try:
        reminder = Reminder.objects.get(id=reminder_id)
        
        subject = f"Reminder: {reminder.title}"
        message = f"""
        Hi {reminder.user.first_name or reminder.user.username},
        
        This is your reminder: {reminder.title}
        
        Description: {reminder.description or 'No description'}
        
        Best regards,
        LifeManager
        """
        
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [reminder.user.email],
            fail_silently=False,
        )
        
        reminder.is_sent = True
        reminder.save()
        
        return f"Reminder {reminder_id} notification sent"
    except Reminder.DoesNotExist:
        return f"Reminder {reminder_id} not found"
    except Exception as e:
        return f"Error sending reminder {reminder_id}: {str(e)}"


@shared_task
def check_and_send_reminders():
    """Check for reminders that should be sent today"""
    from datetime import date, datetime, time
    
    today = date.today()
    now = datetime.now().time()
    
    # Get all unsent reminders for today
    pending_reminders = Reminder.objects.filter(
        reminder_date=today,
        is_sent=False,
        trigger_time__lte=now  # Only send if trigger time has passed
    )
    
    for reminder in pending_reminders:
        send_reminder_notification.delay(reminder.id)
    
    return f"Checked {pending_reminders.count()} reminders"


@shared_task
def cleanup_old_reminders():
    """Archive old sent reminders (older than 30 days)"""
    from datetime import date, timedelta
    
    thirty_days_ago = date.today() - timedelta(days=30)
    
    old_reminders = Reminder.objects.filter(
        reminder_date__lt=thirty_days_ago,
        is_sent=True
    )
    
    count = old_reminders.count()
    # For now, we just track them. In a real app, you might archive or delete them.
    
    return f"Found {count} old reminders to archive"
