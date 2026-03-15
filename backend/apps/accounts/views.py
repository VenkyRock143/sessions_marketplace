from django.shortcuts import redirect
from django.conf import settings
from django.utils.decorators import method_decorator
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django_ratelimit.decorators import ratelimit
from .models import User
from .serializers import UserSerializer, ProfileSerializer


def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    refresh['role'] = user.role
    refresh['email'] = user.email
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }


@method_decorator(
    ratelimit(key='ip', rate='10/m', method='GET', block=True),
    name='dispatch'
)
class OAuthCallbackView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        if not request.user.is_authenticated:
            return redirect(f"{settings.FRONTEND_URL}/login?error=auth_failed")
        tokens = get_tokens_for_user(request.user)
        url = (
            f"{settings.FRONTEND_URL}/auth/callback"
            f"?access={tokens['access']}"
            f"&refresh={tokens['refresh']}"
        )
        return redirect(url)


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)

    def patch(self, request):
        ser = UserSerializer(request.user, data=request.data, partial=True)
        ser.is_valid(raise_exception=True)
        ser.save()
        return Response(ser.data)


class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Auto-create profile if it doesn't exist yet
        from .models import Profile
        profile, _ = Profile.objects.get_or_create(user=request.user)
        return Response(ProfileSerializer(profile).data)

    def patch(self, request):
        from .models import Profile
        profile, _ = Profile.objects.get_or_create(user=request.user)
        ser = ProfileSerializer(profile, data=request.data, partial=True)
        ser.is_valid(raise_exception=True)
        ser.save()
        return Response(ser.data)


class SwitchRoleView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        user.role = User.ROLE_CREATOR
        user.save(update_fields=['role'])
        return Response({
            'message': 'Role updated to creator',
            **get_tokens_for_user(user)
        })
