from rest_framework import permissions


class IsOwnerOrReadOnly(permissions.BasePermission):
    """Permission class that allows only owner to edit/delete, others can only read."""
    
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        # Check if object has added_by (for tasks) or user (for solutions/reviews)
        owner_id = getattr(obj, "added_by_id", None) or getattr(obj, "user_id", None)
        return owner_id == request.user.id
