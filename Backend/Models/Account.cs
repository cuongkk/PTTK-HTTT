namespace Backend.Models;

public static class AccountStatus
{
    public const string Active = "kich_hoat";
    public const string Locked = "khoa";
    public const string Disabled = "vo_hieu_hoa";
}

public class Account
{
    public string AccountId { get; set; } = default!;
    public string Username { get; set; } = default!;
    public string PasswordHash { get; set; } = default!;
    public string RoleId { get; set; } = default!;
    public string? EmployeeId { get; set; }
    public string? CustomerId { get; set; }
    public string? VerifiedEmail { get; set; }
    public string Status { get; set; } = AccountStatus.Active;
    public DateTime? LastLoginAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public string? CreatedByAccountId { get; set; }
    public string? ResetTokenHash { get; set; }
    public DateTime? ResetTokenExpiresAt { get; set; }

    public SystemRole Role { get; set; } = default!;
    public Employee? Employee { get; set; }
    public Customer? Customer { get; set; }
    public Account? CreatedByAccount { get; set; }
}
