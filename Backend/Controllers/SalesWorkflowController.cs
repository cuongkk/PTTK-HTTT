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

    [HttpPost("deposit-slips")]
    public async Task<ActionResult<SalesDepositSlipDto>> CreateDepositSlip([FromBody] CreateDepositRequest request)
    {
        var slip = await _salesService.CreateDepositSlipAsync(request, User.GetAccountId());
        return Ok(slip);
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
}
