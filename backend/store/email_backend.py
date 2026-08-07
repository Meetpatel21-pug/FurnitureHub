"""
Custom email backend that disables SSL certificate verification.
This is needed when running behind a corporate/college network proxy
that performs SSL inspection (MITM), causing self-signed cert errors.

NOTE: Only use this in development. In production, remove this backend
and use the default 'django.core.mail.backends.smtp.EmailBackend'.
"""
import ssl
from django.core.mail.backends.smtp import EmailBackend


class NoVerifyEmailBackend(EmailBackend):
    """
    An SMTP email backend that skips SSL certificate verification.
    Handles corporate proxies that inject self-signed certificates.
    """

    def open(self):
        """
        Override open() to inject a no-verify SSL context before
        the connection is established.
        """
        # Patch the ssl_context that Django will use for STARTTLS
        if not hasattr(self, '_ssl_context_patched'):
            ctx = ssl.create_default_context()
            ctx.check_hostname = False
            ctx.verify_mode = ssl.CERT_NONE
            self.ssl_context = ctx
            self._ssl_context_patched = True
        return super().open()
