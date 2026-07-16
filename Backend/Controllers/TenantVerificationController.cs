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

    [HttpPut("review/{ApplicationId}")]
    public async Task<ActionResult<object>> ReviewTenantVerification(string ApplicationId, [FromBody] ReviewTenantVerificationDto dto)
    {
        try
        {
            var newStatus = await _tenantVerificationService.ReviewTenantVerificationAsync(ApplicationId, dto.IsApproved);
            return Ok(new { applicationStatus = newStatus });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

}