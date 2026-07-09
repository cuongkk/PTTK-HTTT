namespace Backend.Models;

public static class EmployeePosition
{
    public const string Sales = "sale";
    public const string Manager = "quan_ly";
    public const string Accountant = "ke_toan";
    public const string SystemAdmin = "system_admin";
}

public class Employee
{
    public string EmployeeId { get; set; } = default!;
    public string? BranchId { get; set; }
    public string FullName { get; set; } = default!;
    public string? PhoneNumber { get; set; }
    public string? Email { get; set; }
    public string Position { get; set; } = default!;
    public DateOnly? HireDate { get; set; }
    public bool IsActive { get; set; } = true;

    public Branch? Branch { get; set; }
    public Account? Account { get; set; }
}
