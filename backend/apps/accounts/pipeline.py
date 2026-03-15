from .models import Profile


def save_profile(backend, user, response, *args, **kwargs):
    """
    Called after every OAuth login. Creates the Profile row if it
    doesn't exist yet, and fills in the display name from the
    provider response.
    """
    profile, created = Profile.objects.get_or_create(user=user)

    if not profile.display_name:
        if backend.name == 'google-oauth2':
            profile.display_name = response.get('name', '')
        elif backend.name == 'github':
            profile.display_name = response.get('name', '') or user.username

    if created or not profile.display_name:
        profile.save()
