from rest_framework.pagination import PageNumberPagination


class ActivityPagination(PageNumberPagination):
    """Pagination for the account activity feed. Replaces the old hard
    cap of 50 rows with real pages so long-lived accounts can page back
    through their full history instead of losing anything past the 50th
    most recent entry."""
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100
