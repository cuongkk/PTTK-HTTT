using System.Collections.Generic;
using System.Threading.Tasks;
using Backend.Dtos;

namespace Backend.Services;

public interface IAccountantService
{
    // Payment Requests
    Task<List<ContractInvoiceInfoDto>> GetPendingContractsForInvoiceAsync();
    Task CreateInvoiceRequestAsync(CreateInvoiceRequest request, string accountantId);
    Task<List<InvoiceDto>> GetSentRequestsAsync();

    // Payment Confirmations
    Task<List<InvoiceDto>> GetPendingConfirmationsAsync();
    Task ApprovePaymentAsync(string invoiceId, string accountantId);
    Task RejectPaymentAsync(string invoiceId, string accountantId, string reason);

    // Check-In Charges
    Task<List<CheckInContractDto>> GetPendingCheckInContractsAsync();
    Task SaveCheckInChargesAsync(SaveCheckInChargesDto dto, string accountantId);

    // Reconciliation
    Task<List<ReconciliationListItemDto>> GetReconciliationsAsync();
    Task SaveReconciliationDeductionsAsync(SaveReconciliationDeductionsDto dto, string accountantId);
    Task ProcessRefundAsync(ProcessRefundDto dto, string accountantId);
}
