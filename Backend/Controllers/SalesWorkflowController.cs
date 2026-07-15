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
[Route("api/sales")]
[Authorize(Roles = EmployeePosition.Sales)]
public class SalesWorkflowController : ControllerBase
{
    private readonly ISalesWorkflowService _salesService;

    public SalesWorkflowController(ISalesWorkflowService salesService)
    {
        _salesService = salesService;
    }

    [HttpGet("dashboard")]
    public async Task<ActionResult<SalesDashboardDto>> GetDashboard()
    {
        var data = await _salesService.GetDashboardDataAsync(User.GetAccountId());
        return Ok(data);
    }

    [HttpGet("applications")]
    public async Task<ActionResult<List<SalesApplicationDto>>> GetApplications()
    {
        var apps = await _salesService.GetApplicationsAsync();
        return Ok(apps);
    }

    [HttpGet("deposit-slips")]
    public async Task<ActionResult<List<SalesDepositSlipDto>>> GetDepositSlips()
    {
        var slips = await _salesService.GetDepositSlipsAsync();
        return Ok(slips);
    }

    [HttpGet("contracts")]
    public async Task<ActionResult<List<SalesRentalContractDto>>> GetContracts()
    {
        var contracts = await _salesService.GetContractsAsync();
        return Ok(contracts);
    }

    [HttpPost("applications")]
    public async Task<ActionResult<SalesApplicationDto>> CreateApplication([FromBody] CreateApplicationRequest request)
    {
        var app = await _salesService.CreateApplicationAsync(request);
        return Ok(app);
    }

    [HttpPost("applications/{applicationId}/schedules")]
    public async Task<ActionResult<SalesApplicationDto>> CreateViewingSchedule(string applicationId, [FromBody] CreateViewingScheduleRequest request)
    {
        var app = await _salesService.CreateViewingScheduleAsync(applicationId, request, User.GetAccountId());
        return Ok(app);
    }

    [HttpPost("schedules/{scheduleId}/complete")]
    public async Task<IActionResult> CompleteViewingSchedule(string scheduleId)
    {
        await _salesService.CompleteViewingScheduleAsync(scheduleId);
        return Ok();
    }

    [HttpPost("schedules/{scheduleId}/cancel")]
    public async Task<IActionResult> CancelViewingSchedule(string scheduleId)
    {
        await _salesService.CancelViewingScheduleAsync(scheduleId);
        return Ok();
    }

    [HttpPost("applications/{applicationId}/cancel")]
    public async Task<IActionResult> CancelApplication(string applicationId, [FromBody] SalesStatusReasonRequest request)
    {
        await _salesService.CancelApplicationAsync(applicationId, request.Reason);
        return Ok();
    }

    [HttpPost("applications/{applicationId}/request-revision")]
    public async Task<IActionResult> RequestApplicationRevision(string applicationId, [FromBody] SalesStatusReasonRequest request)
    {
        await _salesService.RequestApplicationRevisionAsync(applicationId, request.Reason);
        return Ok();
    }

    [HttpPost("deposit-slips")]
    public async Task<ActionResult<SalesDepositSlipDto>> CreateDepositSlip([FromBody] CreateDepositRequest request)
    {
        var slip = await _salesService.CreateDepositSlipAsync(request, User.GetAccountId());
        return Ok(slip);
    }

    [HttpPost("deposit-slips/{depositId}/expire")]
    public async Task<IActionResult> ExpireDepositSlip(string depositId, [FromBody] SalesStatusReasonRequest request)
    {
        await _salesService.ExpireDepositSlipAsync(depositId, request.Reason);
        return Ok();
    }

    [HttpPost("deposit-slips/{depositId}/cancel")]
    public async Task<IActionResult> CancelDepositSlip(string depositId, [FromBody] SalesStatusReasonRequest request)
    {
        await _salesService.CancelDepositSlipAsync(depositId, request.Reason);
        return Ok();
    }

    [HttpPost("contracts")]
    public async Task<ActionResult<SalesRentalContractDto>> CreateRentalContract([FromBody] CreateRentalRequest request)
    {
        var contract = await _salesService.CreateRentalContractAsync(request, User.GetAccountId());
        return Ok(contract);
    }

    [HttpPost("contracts/{contractId}/checkout")]
    public async Task<IActionResult> CheckoutContract(string contractId, [FromBody] CheckoutContractRequest request)
    {
        await _salesService.CheckoutContractAsync(contractId, request, User.GetAccountId());
        return Ok();
    }

    [HttpPost("applications/{applicationId}/review-deposit")]
    public async Task<IActionResult> ReviewDeposit(string applicationId)
    {
        await _salesService.ReviewDepositRequestAsync(applicationId);
        return Ok();
    }

    [HttpPost("applications/{applicationId}/review-checkin")]
    public async Task<IActionResult> ReviewCheckIn(string applicationId)
    {
        await _salesService.ReviewCheckInDocumentsAsync(applicationId);
        return Ok();
    }

    [HttpPost("deposit-slips/{depositId}/accept-refund")]
    public async Task<IActionResult> AcceptDepositRefund(string depositId)
    {
        await _salesService.AcceptDepositRefundAsync(depositId);
        return Ok();
    }
}
