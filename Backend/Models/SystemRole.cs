namespace Backend.Models;

public class SystemRole
{
    public string RoleId { get; set; } = default!;
    public string RoleName { get; set; } = default!;
    public string? Description { get; set; }

    public ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>();
    public ICollection<Account> Accounts { get; set; } = new List<Account>();
}
