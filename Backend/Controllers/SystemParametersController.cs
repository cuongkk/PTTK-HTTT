using Backend.Common;
using Backend.Dtos;
using Backend.Models;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Route("api/system-parameters")]
[Authorize(Roles = EmployeePosition.SystemAdmin)]
public class SystemParametersController : ControllerBase
{
    private readonly ISystemParameterService _systemParameterService;

    public SystemParametersController(ISystemParameterService systemParameterService)
    {
        _systemParameterService = systemParameterService;
    }

    [HttpGet]
    public async Task<ActionResult<List<SystemParameterDto>>> GetAll() =>
        Ok(await _systemParameterService.GetAllAsync());

    [HttpPut("{parameterId}")]
    public async Task<ActionResult<SystemParameterDto>> Update(string parameterId, [FromBody] UpdateSystemParameterRequest request) =>
        Ok(await _systemParameterService.UpdateAsync(parameterId, request, User.GetAccountId()));
}
