from django.urls import path 
from . import views 
urlpatterns = [
path('me/', views.MeView.as_view()),
path('profile/', views.ProfileView.as_view()),
path('switch-role/', views.SwitchRoleView.as_view()),
path('callback/', views.OAuthCallbackView.as_view()),
]