using Backend.Dtos;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace Backend.Controllers;


[ApiController]
[Route("api/manager/deposit-confirmation")]
public class DepositsConfirmationController : ControllerBase
{
    private readonly IDepositConfirmationService _depositsConfirmationService;

    public DepositsConfirmationController(IDepositConfirmationService depositsConfirmationService)
    {
        _depositsConfirmationService = depositsConfirmationService;
    }

    [HttpGet]
    public async Task<ActionResult<List<DepositConfirmationDto>>> GetDepositConfirmations()
    {
        var result = await _depositsConfirmationService.GetDepositConfirmationsAsync();

        return Ok(result);
    }
}
