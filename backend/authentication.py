from rest_framework.authentication import SessionAuthentication
from django.contrib.sessions.models import Session
from django.contrib.auth import get_user_model
from django.contrib.sessions.backends.db import SessionStore

User = get_user_model()

class MultiSessionAuthentication(SessionAuthentication):
    def authenticate(self, request):
        # Check for admin session cookie
        admin_session_key = request.COOKIES.get('admin_sessionid')
        if admin_session_key:
            try:
                session_store = SessionStore(session_key=admin_session_key)
                user_id = session_store.get('_auth_user_id')
                if user_id:
                    user = User.objects.get(pk=user_id)
                    if user.is_active and user.is_staff:
                        request.session = session_store
                        return (user, None)
            except (User.DoesNotExist, KeyError):
                pass
        
        # Check for user session cookie
        user_session_key = request.COOKIES.get('user_sessionid')
        if user_session_key:
            try:
                session_store = SessionStore(session_key=user_session_key)
                user_id = session_store.get('_auth_user_id')
                if user_id:
                    user = User.objects.get(pk=user_id)
                    if user.is_active:
                        request.session = session_store
                        return (user, None)
            except (User.DoesNotExist, KeyError):
                pass
        
        # Fall back to default session authentication
        return super().authenticate(request)