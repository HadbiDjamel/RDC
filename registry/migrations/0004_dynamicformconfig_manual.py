from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ('registry', '0003_habitquestionnaire_userprofile'),
    ]

    operations = [
        migrations.CreateModel(
            name='DynamicFormConfig',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('form_name', models.CharField(max_length=100)),
                ('field_id', models.CharField(max_length=100)),
                ('label', models.CharField(max_length=200)),
                ('is_required', models.BooleanField(default=False)),
                ('is_visible', models.BooleanField(default=True)),
                ('role_restriction', models.CharField(blank=True, max_length=50, null=True)),
            ],
            options={
                'unique_together': {('form_name', 'field_id')},
            },
        ),
    ]
