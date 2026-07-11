namespace Backend.Models;

public class RolePermission
{
    public string RoleId { get; set; } = default!;
    public string PermissionId { get; set; } = default!;

    public SystemRole Role { get; set; } = default!;
    public Permission Permission { get; set; } = default!;
}
