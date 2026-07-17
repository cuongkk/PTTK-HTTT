namespace Backend.Dtos;

public record ManagerHandoverAssetDto(string AssetId, string AssetName, short Quantity, string Condition, string? Note);
public record ManagerHandoverContractDto(string ContractId, string RoomId, string RoomName, string CustomerName, DateOnly StartDate, List<ManagerHandoverAssetDto> Assets);

public class CreateManagerHandoverDto
{
    public string ContractId { get; set; } = string.Empty;
    public string RoomCondition { get; set; } = string.Empty;
    public decimal? InitialElectricityReading { get; set; }
    public decimal? InitialWaterReading { get; set; }
    public string? Note { get; set; }
    public List<ManagerHandoverAssetDto> Assets { get; set; } = [];
}
