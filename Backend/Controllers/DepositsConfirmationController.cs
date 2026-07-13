// Backend/Controllers/DepositConfirmationController.cs
using Backend.Dtos;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Authorize(Roles = "quan_ly")]
[Route("api/manager/deposit-confirmations")]
public class DepositConfirmationController : ControllerBase
{
    private readonly IDepositConfirmationService _depositConfirmationService;

    public DepositConfirmationController(IDepositConfirmationService depositConfirmationService)
    {
        _depositConfirmationService = depositConfirmationService;
    }

    [HttpGet]
    public async Task<ActionResult<List<DepositConfirmationDto>>> GetDepositConfirmations()
    {
        var result = await _depositConfirmationService.GetDepositConfirmationsAsync();
        return Ok(result);
    }
}