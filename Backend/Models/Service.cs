namespace Backend.Models;

public static class ServiceType
{
    public const string Electricity = "dien";
    public const string Water = "nuoc";
    public const string Wifi = "wifi";
    public const string Cleaning = "ve_sinh";
    public const string Other = "khac";
}

public class Service
{
    public string ServiceId { get; set; } = default!;
    public string ServiceName { get; set; } = default!;
    public string ServiceType { get; set; } = default!;
    public string Unit { get; set; } = default!;
    public decimal UnitPrice { get; set; }
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime? UpdatedAt { get; set; }
    public string? UpdatedByAccountId { get; set; }

    public Account? UpdatedByAccount { get; set; }
}
