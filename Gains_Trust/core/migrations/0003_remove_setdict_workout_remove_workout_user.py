# Generated by Django 5.1.5 on 2025-02-10 14:38

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0002_initial"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="setdict",
            name="workout",
        ),
        migrations.RemoveField(
            model_name="workout",
            name="user",
        ),
    ]
