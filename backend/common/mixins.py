from rest_framework import permissions
from rest_framework import viewsets


class StaffWritePermissionMixin(viewsets.ModelViewSet):
    def get_permissions(self):
        if self.request.method in permissions.SAFE_METHODS:
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]
