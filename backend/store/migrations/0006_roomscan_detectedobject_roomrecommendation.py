from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('store', '0005_alter_order_payment_method_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='RoomScan',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('uploaded_image', models.ImageField(upload_to='room-scans/uploads/')),
                ('annotated_image', models.ImageField(blank=True, null=True, upload_to='room-scans/annotated/')),
                ('room_type', models.CharField(blank=True, max_length=50)),
                ('room_style', models.CharField(blank=True, max_length=50)),
                ('analysis_payload', models.JSONField(blank=True, default=dict)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('user', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='room_scans', to='auth.user')),
            ],
        ),
        migrations.CreateModel(
            name='DetectedObject',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('label', models.CharField(max_length=100)),
                ('confidence', models.FloatField(default=0)),
                ('bbox_x', models.IntegerField()),
                ('bbox_y', models.IntegerField()),
                ('bbox_w', models.IntegerField()),
                ('bbox_h', models.IntegerField()),
                ('source', models.CharField(default='yolo', max_length=50)),
                ('room_scan', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='detections', to='store.roomscan')),
            ],
            options={
                'ordering': ['-confidence', 'id'],
            },
        ),
        migrations.CreateModel(
            name='RoomRecommendation',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('rank', models.PositiveIntegerField(default=1)),
                ('score', models.FloatField(default=0)),
                ('reason', models.CharField(blank=True, max_length=255)),
                ('product', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='store.product')),
                ('room_scan', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='recommendations', to='store.roomscan')),
            ],
            options={
                'ordering': ['rank', '-score'],
            },
        ),
    ]