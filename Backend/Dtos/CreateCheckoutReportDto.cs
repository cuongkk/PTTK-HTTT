namespace Backend.Dtos;


public class CreateCheckoutReportDto
{
    public string RoomId { get; set; } = null!;      // Khớp roomId
    public string ContractId { get; set; } = null!;  // Khớp contractId
    public string OverallCondition { get; set; } = null!; // Khớp overallCondition
    public string Cleanliness { get; set; } = null!;      // Khớp cleanliness
    public string DamageNotes { get; set; } = null!;      // Khớp damageNotes
    public decimal EstimatedCost { get; set; }            // Khớp estimatedCost
    public bool NeedMaintenance { get; set; }             // Khớp needMaintenance
}

public class CheckoutReportResultDto
{
    public bool Success { get; set; }
    public string Message { get; set; } = default!;
    public string? CheckoutReportId { get; set; }
    public string? ReconciliationId { get; set; }
}
