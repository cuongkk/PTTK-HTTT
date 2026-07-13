using Backend.Dtos;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Authorize(Roles = "quan_ly")]
[Route("api/manager/tenant-verifications")]
public class TenantVerificationController : ControllerBase
{
    private readonly ITenantVerificationService _tenantVerificationService;

    public TenantVerificationController(ITenantVerificationService tenantVerificationService)
    {
        _tenantVerificationService = tenantVerificationService;
    }

    [HttpGet]
    public async Task<ActionResult<List<TenantVerificationDto>>> GetTenantVerifications()
    {
        var result = await _tenantVerificationService.GetTenantVerificationsAsync();
        return Ok(result);
    }
}