// Backend/Dtos/DepositConfirmationDto.cs
namespace Backend.Dtos;

public class DepositConfirmationDto
{
    public string Id { get; set; } = default!;
    public string DepositCode { get; set; } = default!;
    public string Customer { get; set; } = default!;
    public string RoomId { get; set; } = string.Empty; 
    public string Room { get; set; } = default!;
    public string Bed { get; set; } = default!;
    public string Branch { get; set; } = default!;
    public string DepositAmount { get; set; } = default!;
    public string Status { get; set; } = default!;
    public bool IsValid { get; set; }
    public string ConfirmedBy { get; set; } = default!;
    public string ConfirmedAt { get; set; } = default!;
    public string ExpectedCheckIn { get; set; } = default!;
    public string Date { get; set; } = default!;
}

public class ReviewDepositDto
{
    public bool IsApproved { get; set; }
}