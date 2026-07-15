namespace Backend.Dtos;

public class CreateCheckoutReportDto
{
    public string ContractId { get; set; } = string.Empty;
    public string? RoomCondition { get; set; }   // = overallCondition từ FE
    public string? Note { get; set; }            // = damageNotes từ FE
}


public class CheckoutReportResultDto
{
    public string CheckoutReportId { get; set; } = string.Empty;
    public string ReconciliationId { get; set; } = string.Empty;
    public DateOnly CheckoutDate { get; set; }
}