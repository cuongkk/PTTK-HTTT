namespace Backend.Models;

public static class SystemParameterDataType
{
    public const string String = "string";
    public const string Number = "number";
    public const string Boolean = "boolean";
    public const string Json = "json";
    public const string Time = "time";
}

public class SystemParameter
{
    public string ParameterId { get; set; } = default!;
    public string ParameterName { get; set; } = default!;
    public string ParameterGroup { get; set; } = default!;
    public string Value { get; set; } = default!;
    public string DataType { get; set; } = default!;
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime? UpdatedAt { get; set; }
    public string? UpdatedByAccountId { get; set; }

    public Account? UpdatedByAccount { get; set; }
}
