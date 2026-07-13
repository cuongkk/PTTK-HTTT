using System.Collections.Generic;
using System.Threading.Tasks;
using Backend.Dtos;

namespace Backend.Services;

public interface ISalesWorkflowService
{
    Task<SalesDashboardDto> GetDashboardDataAsync(string salesEmployeeAccountId);
    Task<List<SalesApplicationDto>> GetApplicationsAsync();
    Task<List<SalesDepositSlipDto>> GetDepositSlipsAsync();
    Task<List<SalesRentalContractDto>> GetContractsAsync();
    Task<SalesApplicationDto> CreateApplicationAsync(CreateApplicationRequest request);
    Task<SalesApplicationDto> CreateViewingScheduleAsync(string applicationId, CreateViewingScheduleRequest request, string salesEmployeeAccountId);
    Task CompleteViewingScheduleAsync(string scheduleId);
    Task<SalesDepositSlipDto> CreateDepositSlipAsync(CreateDepositRequest request, string salesEmployeeAccountId);
    Task<SalesRentalContractDto> CreateRentalContractAsync(CreateRentalRequest request, string salesEmployeeAccountId);
    Task CheckoutContractAsync(string contractId, CheckoutContractRequest request, string salesEmployeeAccountId);
}
