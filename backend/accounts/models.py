from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from .manager import UserManager


# Create your models here.
class User(AbstractBaseUser, PermissionsMixin):
    class Role(models.TextChoices):
        USER = "user", "User"
        REVIEWER  = "reviewer",  "Reviewer"
        ADMIN = "admin", "Admin"

    id = models.BigAutoField(primary_key=True)
    name = models.CharField(max_length=255)
    email = models.CharField(max_length=255, unique=True)
    phone = models.CharField(max_length=10, null=True, blank=True)
    role = models.CharField(max_length=10, choices=Role.choices, default=Role.USER)

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    objects = UserManager()

    USERNAME_FIELD  = "email"
    REQUIRED_FIELDS = ["name"]
 
    class Meta:
        ordering = ["id"]
 
    def __str__(self):
        return f"{self.name} - [{self.role}]"
 
    def is_user(self):
        return self.role == self.Role.USER
 
    def is_reviewer(self):
        return self.role == self.Role.REVIEWER
    
    def is_admin(self):
        return self.role == self.Role.ADMIN