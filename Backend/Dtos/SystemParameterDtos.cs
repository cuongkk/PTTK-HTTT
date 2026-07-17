namespace Backend.Dtos;

public record SystemParameterDto(
    string ParameterId,
    string ParameterName,
    string ParameterGroup,
    string Value,
    string DataType,
    string? Description,
    bool IsActive,
    DateTime? UpdatedAt
);

public record UpdateSystemParameterRequest(string Value, bool IsActive);
