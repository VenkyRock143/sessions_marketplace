from .models import Profile
def save_profile(backend, user, response, *args, **kwargs): 
    profile, _ = Profile.objects.get_or_create(user=user)
    if not profile.display_name:
        if backend.name == 'google-oauth2':
            profile.display_name = response.get('name', '') 
            elif backend.name == 'github':
            profile.display_name = (response.get('name', '') 
            or user.username)
            profile.save()