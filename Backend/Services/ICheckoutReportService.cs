using Backend.Dtos;

namespace Backend.Services;

    public interface ICheckoutReportService
    {
        Task<CheckoutReportResultDto> CreateReportAndReconciliationAsync(CreateCheckoutReportDto dto, string managerEmployeeId);
    }
