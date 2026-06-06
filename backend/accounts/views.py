from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny

from django.contrib.auth import authenticate, login, logout

from .serializers import RegisterSerializer, LoginSerializer, UserSerializer

class RegisterView(APIView):
    """
    method: post
    url: accounts/auth/register/
    body: 
    {
        "name": " ",
        "email": " ",
        "phone": " ",
        "password": " ",
        "role": " "
    }

    role = ['user', 'reviewer', 'admin']
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        serializer.save()
        return Response(
            {
                "message": "Account created successfully.",
            },
            status=status.HTTP_201_CREATED,
        )


class LoginView(APIView):
    """
    method: post
    url: accounts/auth/login/
    body: 
    {
        "email": " ",
        "password": " ",
    }
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        user = authenticate(
            request,
            email=serializer.validated_data["email"],
            password=serializer.validated_data["password"],
        )
        if user is None:
            return Response(
                {"error": "Invalid email or password."},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        if not user.is_active:
            return Response(
                {"error": "Account is disabled."},
                status=status.HTTP_403_FORBIDDEN,
            )

        login(request, user)   # creates the session
        return Response(
            {
                "message": "Logged in successfully.",
                "user": UserSerializer(user).data,
            },
            status=status.HTTP_200_OK,
        )


class LogoutView(APIView):
    """
    method: post
    url: accounts/auth/logout/
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        logout(request)   # flushes the session
        return Response(
            {
                "message": "Logged out successfully."
            }, 
            status=status.HTTP_200_OK
        )
