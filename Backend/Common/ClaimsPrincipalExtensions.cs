using System.Security.Claims;

namespace Backend.Common;

public static class ClaimsPrincipalExtensions
{
    public static string GetAccountId(this ClaimsPrincipal user) =>
        user.FindFirstValue(ClaimTypes.NameIdentifier)
        ?? throw new UnauthorizedAppException("Không xác định được tài khoản hiện tại.");
}
