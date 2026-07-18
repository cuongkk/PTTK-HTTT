using Backend.Dtos;
using Backend.Common;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Authorize(Roles = "quan_ly")]
[Route("api/manager/handovers")]
public class ManagerHandoverController(IManagerHandoverService service) : ControllerBase
{
    [HttpGet("pending")]
    public async Task<ActionResult<List<ManagerHandoverContractDto>>> GetPending() => Ok(await service.GetPendingAsync());

    [HttpPost]
    public async Task<ActionResult<object>> Create(CreateManagerHandoverDto dto) => Ok(new { handoverId = await service.CreateAsync(dto, User.GetAccountId()) });
}
