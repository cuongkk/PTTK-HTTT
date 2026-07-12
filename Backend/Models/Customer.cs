namespace Backend.Models;

public class Customer
{
    public string CustomerId { get; set; } = default!;
    public string FullName { get; set; } = default!;
    public string NationalId { get; set; } = default!;
    public string PhoneNumber { get; set; } = default!;
    public string? Email { get; set; }
    public string? Gender { get; set; }
    public string Nationality { get; set; } = "Việt Nam";
    public DateOnly? DateOfBirth { get; set; }
    public string? Address { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Account? Account { get; set; }
}
