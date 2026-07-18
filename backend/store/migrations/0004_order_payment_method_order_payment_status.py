from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ('store', '0003_remove_order_payment_method_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='order',
            name='payment_method',
            field=models.CharField(choices=[('cod', 'Cash on Delivery'), ('card', 'Credit/Debit Card'), ('upi', 'UPI Payment'), ('netbanking', 'Net Banking'), ('wallet', 'Digital Wallet')], default='cod', max_length=20),
        ),
        migrations.AddField(
            model_name='order',
            name='payment_status',
            field=models.CharField(choices=[('pending', 'Pending'), ('completed', 'Completed'), ('failed', 'Failed'), ('refunded', 'Refunded')], default='pending', max_length=20),
        ),
    ]