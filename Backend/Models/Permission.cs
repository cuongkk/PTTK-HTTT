namespace Backend.Models;

public class Permission
{
    public string PermissionId { get; set; } = default!;
    public string PermissionName { get; set; } = default!;
    public string? Description { get; set; }

    public ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>();
}
