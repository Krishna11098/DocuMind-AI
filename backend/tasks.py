# from celery_worker import celery_app
# from main import send_email, send_otp_email  # using your existing functions

# @celery_app.task
# def send_email_task(receiver_email, password):
#     send_email(receiver_email, password)
#     return "sent"

# @celery_app.task
# def send_otp_email_task(receiver_email, otp):
#     send_otp_email(receiver_email, otp)
#     return "sent"

from celery_worker import celery_app
from email_utils import send_email, send_otp_email

@celery_app.task
def send_email_task(receiver_email, password):
    send_email(receiver_email, password)
    return "sent"

@celery_app.task
def send_otp_email_task(receiver_email, otp):
    send_otp_email(receiver_email, otp)
    return "sent"
