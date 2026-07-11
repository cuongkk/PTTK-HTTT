using Backend.Common;
using Backend.Dtos;
using Backend.Models;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Route("api/services")]
[Authorize(Roles = EmployeePosition.SystemAdmin)]
public class ServicesController : ControllerBase
{
    private readonly IServiceCatalogService _serviceCatalogService;

    public ServicesController(IServiceCatalogService serviceCatalogService)
    {
        _serviceCatalogService = serviceCatalogService;
    }

    [HttpGet]
    public async Task<ActionResult<List<ServiceDto>>> GetAll()
    {
        return Ok(await _serviceCatalogService.GetAllAsync());
    }

    [HttpPost]
    public async Task<ActionResult<ServiceDto>> Create([FromBody] CreateServiceRequest request)
    {
        var result = await _serviceCatalogService.CreateAsync(request, User.GetAccountId());
        return CreatedAtAction(nameof(GetAll), null, result);
    }

    [HttpPut("{serviceId}")]
    public async Task<ActionResult<ServiceDto>> Update(string serviceId, [FromBody] UpdateServiceRequest request)
    {
        return Ok(await _serviceCatalogService.UpdateAsync(serviceId, request, User.GetAccountId()));
    }

    [HttpDelete("{serviceId}")]
    public async Task<IActionResult> Delete(string serviceId)
    {
        await _serviceCatalogService.DeleteAsync(serviceId, User.GetAccountId());
        return NoContent();
    }
}
