using System.Security.Claims;
using Backend.Dtos;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Authorize(Roles = "quan_ly")]
[Route("api/manager/checkout-report")]
public class CheckoutReportController : ControllerBase
{
    private readonly ICheckoutReportService _checkoutReportService;

    public CheckoutReportController(ICheckoutReportService checkoutReportService)
    {
        _checkoutReportService = checkoutReportService;
    }

    [HttpPost]
    public async Task<ActionResult<CheckoutReportResultDto>> CreateCheckoutReport(
        [FromBody] CreateCheckoutReportDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.ContractId))
            return BadRequest("Thiếu ContractId.");

        var managerEmployeeId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(managerEmployeeId))
            return Unauthorized();

        try
        {
            var result = await _checkoutReportService.CreateCheckoutReportAsync(dto, managerEmployeeId);
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
    }
}