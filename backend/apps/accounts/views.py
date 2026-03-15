from django.shortcuts import render

# Create your views here.
from django.shortcuts import redirect
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
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
    class OAuthCallbackView(APIView): 
            permission_classes = [AllowAny]
            def get(self, request):
           
                return redirect(
                f"{settings.FRONTEND_URL}/login?error=auth_failed" 
                )
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
                            ser = UserSerializer(request.user, data=request.data, 
                            partial=True)
                            ser.is_valid(raise_exception=True) 
                            ser.save()
                            return Response(ser.data) 
                            class ProfileView(APIView):
                                permission_classes = [IsAuthenticated] 
                                def get(self, request):
                                    return Response(
                                    ProfileSerializer(request.user.profile).data 
                                    )
                                    def patch(self, request):
                                        ser = ProfileSerializer(request.user.profile, 
                                        data=request.data, partial=True)
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