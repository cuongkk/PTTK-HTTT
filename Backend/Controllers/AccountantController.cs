using System.Collections.Generic;
using System.Threading.Tasks;
using Backend.Common;
using Backend.Dtos;
using Backend.Models;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Route("api/accountant")]
[Authorize(Roles = EmployeePosition.Accountant)]
public class AccountantController : ControllerBase
{
    private readonly IAccountantService _accountantService;

    public AccountantController(IAccountantService accountantService)
    {
        _accountantService = accountantService;
    }

    // ==========================================
    // 1. PAYMENT REQUESTS
    // ==========================================

    [HttpGet("payment-requests/contracts")]
    public async Task<ActionResult<List<ContractInvoiceInfoDto>>> GetPendingContractsForInvoice()
    {
        return Ok(await _accountantService.GetPendingContractsForInvoiceAsync());
    }

    [HttpPost("payment-requests")]
    public async Task<IActionResult> CreateInvoiceRequest([FromBody] CreateInvoiceRequest request)
    {
        await _accountantService.CreateInvoiceRequestAsync(request, User.GetAccountId());
        return Ok();
    }

    [HttpGet("payment-requests")]
    public async Task<ActionResult<List<InvoiceDto>>> GetSentRequests()
    {
        return Ok(await _accountantService.GetSentRequestsAsync());
    }

    // ==========================================
    // 2. PAYMENT CONFIRMATIONS
    // ==========================================

    [HttpGet("payment-confirmations")]
    public async Task<ActionResult<List<InvoiceDto>>> GetPendingConfirmations()
    {
        return Ok(await _accountantService.GetPendingConfirmationsAsync());
    }

    [HttpPost("payment-confirmations/{id}/approve")]
    public async Task<IActionResult> ApprovePayment(string id)
    {
        await _accountantService.ApprovePaymentAsync(id, User.GetAccountId());
        return Ok();
    }

    [HttpPost("payment-confirmations/{id}/reject")]
    public async Task<IActionResult> RejectPayment(string id, [FromBody] RejectPaymentRequest request)
    {
        await _accountantService.RejectPaymentAsync(id, User.GetAccountId(), request.Reason);
        return Ok();
    }

    // ==========================================
    // 3. CHECK-IN CHARGES
    // ==========================================

    [HttpGet("check-in-charges/contracts")]
    public async Task<ActionResult<List<CheckInContractDto>>> GetPendingCheckInContracts()
    {
        return Ok(await _accountantService.GetPendingCheckInContractsAsync());
    }

    [HttpPost("check-in-charges")]
    public async Task<IActionResult> SaveCheckInCharges([FromBody] SaveCheckInChargesDto dto)
    {
        await _accountantService.SaveCheckInChargesAsync(dto, User.GetAccountId());
        return Ok();
    }

    // ==========================================
    // 4. RECONCILIATIONS
    // ==========================================

    [HttpGet("reconciliations")]
    public async Task<ActionResult<List<ReconciliationListItemDto>>> GetReconciliations()
    {
        return Ok(await _accountantService.GetReconciliationsAsync());
    }

    [HttpPost("reconciliations/deductions")]
    public async Task<IActionResult> SaveReconciliationDeductions([FromBody] SaveReconciliationDeductionsDto dto)
    {
        await _accountantService.SaveReconciliationDeductionsAsync(dto, User.GetAccountId());
        return Ok();
    }

    [HttpPost("reconciliations/refund")]
    public async Task<IActionResult> ProcessRefund([FromBody] ProcessRefundDto dto)
    {
        await _accountantService.ProcessRefundAsync(dto, User.GetAccountId());
        return Ok();
    }
}
