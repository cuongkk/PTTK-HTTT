// Backend/Dtos/TenantVerificationDto.cs
namespace Backend.Dtos;

public class TenantDto
{
    public string Name { get; set; } = default!;
    public string? IdNumber { get; set; }
    public string? Phone { get; set; }
}

public class TenantVerificationDto
{
    public string Id { get; set; } = default!;
    public string ContractCode { get; set; } = default!;
    public string Room { get; set; } = default!;
    public string Building { get; set; } = default!;
    public string CheckInDate { get; set; } = default!;
    public string CheckOutDate { get; set; } = default!;
    public List<TenantDto> Tenants { get; set; } = new();
}