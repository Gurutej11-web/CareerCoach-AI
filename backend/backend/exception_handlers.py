from rest_framework.views import exception_handler


def api_exception_handler(exc, context):
    """
    Wraps DRF's default exception handling to add a consistent `error` object
    alongside whatever shape the view/serializer already returns (`detail`,
    field-specific validation errors, etc.) — additive only, so existing
    frontend code reading `response.data.detail` or `response.data.<field>`
    keeps working unchanged.
    """
    response = exception_handler(exc, context)

    if response is not None and isinstance(response.data, dict):
        message = response.data.get('detail')
        if message is None:
            # Serializer validation errors are usually {field: [messages]} —
            # flatten to a single readable string for the `error` summary.
            first_value = next(iter(response.data.values()), None)
            if isinstance(first_value, list) and first_value:
                message = str(first_value[0])
            else:
                message = str(first_value) if first_value is not None else 'Request failed.'

        response.data['error'] = {
            'message': str(message),
            'status_code': response.status_code,
        }

    return response
