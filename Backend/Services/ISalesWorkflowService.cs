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
    Task CancelViewingScheduleAsync(string scheduleId);
    Task CancelApplicationAsync(string applicationId, string reason);
    Task RequestApplicationRevisionAsync(string applicationId, string reason);
    Task<SalesDepositSlipDto> CreateDepositSlipAsync(CreateDepositRequest request, string salesEmployeeAccountId);
    Task ExpireDepositSlipAsync(string depositId, string reason);
    Task CancelDepositSlipAsync(string depositId, string reason);
    Task<SalesRentalContractDto> CreateRentalContractAsync(CreateRentalRequest request, string salesEmployeeAccountId);
    Task CheckoutContractAsync(string contractId, CheckoutContractRequest request, string salesEmployeeAccountId);
    Task ReviewDepositRequestAsync(string applicationId);
    Task ReviewCheckInDocumentsAsync(string applicationId);
    Task AcceptDepositRefundAsync(string depositId);
}
