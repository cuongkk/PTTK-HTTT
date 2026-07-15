using Backend.Dtos;

namespace Backend.Services;

public interface ICheckoutReportService
{
    Task<CheckoutReportResultDto> CreateCheckoutReportAsync(
        CreateCheckoutReportDto dto,
        string managerEmployeeId);
}