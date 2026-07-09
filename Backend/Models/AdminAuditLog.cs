namespace Backend.Models;

public static class AdminActionType
{
    public const string CreateAccount = "tao_tk";
    public const string UpdateAccount = "sua_tk";
    public const string DeleteAccount = "xoa_tk";
    public const string LockAccount = "khoa_tk";
    public const string UnlockAccount = "mo_khoa_tk";
    public const string GrantRole = "cap_quyen";
    public const string ChangePassword = "doi_mat_khau";
    public const string UpdateSystemParameter = "cap_nhat_thamso";
    public const string UpdateRoom = "cap_nhat_phong";
    public const string UpdateBed = "cap_nhat_giuong";
    public const string UpdateService = "cap_nhat_dichvu";
}

public class AdminAuditLog
{
    public string LogId { get; set; } = default!;
    public string ActorAccountId { get; set; } = default!;
    public string? TargetAccountId { get; set; }
    public string ActionType { get; set; } = default!;
    public string? OldValue { get; set; }
    public string? NewValue { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    public string? Note { get; set; }

    public Account ActorAccount { get; set; } = default!;
    public Account? TargetAccount { get; set; }
}
