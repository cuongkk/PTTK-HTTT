namespace Backend.Dtos;

public record ServiceDto(
    string ServiceId,
    string ServiceName,
    string ServiceType,
    string Unit,
    decimal UnitPrice,
    string? Description,
    bool IsActive
);

public record CreateServiceRequest(
    string ServiceName,
    string ServiceType,
    string Unit,
    decimal UnitPrice,
    string? Description
);

public record UpdateServiceRequest(
    string ServiceName,
    string ServiceType,
    string Unit,
    decimal UnitPrice,
    string? Description,
    bool IsActive
);
