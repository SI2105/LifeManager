from django.contrib.auth.models import Group
from rest_framework import permissions, status, viewsets
from rest_framework.generics import GenericAPIView
from rest_framework.response import Response

from drf_spectacular.utils import OpenApiResponse, extend_schema
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User
from users.serializers import (
    AuthSuccessSerializer,
    GroupSerializer,
    LoginSerializer,
    LogoutSerializer,
    MeSerializer,
    RegisterSerializer,
    UserSerializer,
)


class UserViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """

    queryset = User.objects.all().order_by("-date_joined")
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]


class GroupViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows groups to be viewed or edited.
    """

    queryset = Group.objects.all().order_by("name")
    serializer_class = GroupSerializer
    permission_classes = [permissions.IsAdminUser]


class RegisterAPIView(GenericAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer

    @extend_schema(
        summary="Register a new user",
        description="Creates a user account and returns JWT access/refresh tokens.",
        request=RegisterSerializer,
        responses={
            201: OpenApiResponse(
                response=AuthSuccessSerializer,
                description="User registered successfully.",
            ),
        },
    )
    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True) # As per docs, is_valid called before attempting to access validated data, or save an object instance. In our case it is the latter. Docs: https://www.django-rest-framework.org/api-guide/serializers/#validation
        user = serializer.save()
        refresh = RefreshToken.for_user(user)

        return Response(
            {
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": MeSerializer(user).data,
            },
            status=status.HTTP_201_CREATED,
        )


class LoginAPIView(GenericAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = LoginSerializer

    @extend_schema(
        summary="Log in",
        description="Authenticates a user and returns JWT access/refresh tokens.",
        request=LoginSerializer,
        responses={
            200: OpenApiResponse(
                response=AuthSuccessSerializer,
                description="Authentication successful.",
            ),
        },
    )
    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]
        refresh = RefreshToken.for_user(user)

        return Response(
            {
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": MeSerializer(user).data,
            },
            status=status.HTTP_200_OK,
        )


class MeAPIView(GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = MeSerializer

    @extend_schema(
        summary="Get current user",
        description="Returns profile details for the authenticated user.",
        responses={
            200: OpenApiResponse(
                response=MeSerializer,
                description="Current user profile returned.",
            ),
        },
    )
    def get(self, request):
        serializer = self.get_serializer(instance=request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @extend_schema(
        summary="Update current user",
        description="Partially updates profile details for the authenticated user.",
        request=MeSerializer,
        responses={
            200: OpenApiResponse(
                response=MeSerializer,
                description="Current user profile updated.",
            ),
        },
    )
    def patch(self, request):
        serializer = self.get_serializer(
            instance=request.user,
            data=request.data,
            partial=True,
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)


class LogoutAPIView(GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = LogoutSerializer

    @extend_schema(
        summary="Log out",
        description="Blacklists the provided refresh token.",
        request=LogoutSerializer,
        responses={
            204: OpenApiResponse(description="Logout successful."),
        },
    )
    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(status=status.HTTP_204_NO_CONTENT)