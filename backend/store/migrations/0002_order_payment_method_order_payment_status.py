from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ('store', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='order',
            name='payment_method',
            field=models.CharField(choices=[('cod', 'Cash on Delivery'), ('credit_card', 'Credit Card'), ('debit_card', 'Debit Card'), ('upi', 'UPI'), ('net_banking', 'Net Banking')], default='cod', max_length=20),
        ),
        migrations.AddField(
            model_name='order',
            name='payment_status',
            field=models.BooleanField(default=False),
        ),
    ]