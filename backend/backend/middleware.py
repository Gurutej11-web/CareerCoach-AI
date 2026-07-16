class ContentSecurityPolicyMiddleware:
    """
    Adds a Content-Security-Policy header. Mainly protects the Django admin
    and the legacy server-rendered auth templates (register.html, login.html,
    dashboard.html) — the SPA itself is served separately by Vercel and isn't
    subject to this backend's CSP.
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        response['Content-Security-Policy'] = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline'; "
            "style-src 'self' 'unsafe-inline'; "
            "img-src 'self' data:; "
            "font-src 'self' data:; "
            "frame-ancestors 'none'; "
            "base-uri 'self'; "
            "form-action 'self';"
        )
        return response
