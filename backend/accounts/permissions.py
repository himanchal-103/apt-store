from rest_framework.permissions import BasePermission


class IsUser(BasePermission):
    message = "Access restricted to users only."

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            request.user.is_user()
        )


class IsReviewer(BasePermission):
    message = "Access restricted to reviewers only."

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            request.user.is_reviewer()
        )


class IsAdmin(BasePermission):
    message = "Access restricted to admins only."

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            request.user.role == request.user.Role.ADMIN
        )
    

class IsUserOrReviewer(BasePermission):
    message = "Access restricted to users and reviewers only."

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            (request.user.is_user() or request.user.is_reviewer())
        )