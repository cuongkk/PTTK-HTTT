namespace Backend.Models;

public class Branch
{
    public string BranchId { get; set; } = default!;
    public string BranchName { get; set; } = default!;
    public string Address { get; set; } = default!;
    public string? PhoneNumber { get; set; }
    public string? Email { get; set; }

    public ICollection<Room> Rooms { get; set; } = new List<Room>();
    public ICollection<Employee> Employees { get; set; } = new List<Employee>();
}
