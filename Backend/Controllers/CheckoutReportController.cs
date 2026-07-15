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
    public async Task<IActionResult> CreateCheckoutReport([FromBody] CreateCheckoutReportDto dto)
    {
        if (dto == null)
        {
            return BadRequest(new { message = "Dữ liệu yêu cầu không hợp lệ!" });
        }

        // 1. Lấy accountId (ví dụ: "TK00000002") từ Token do FE gửi lên
        var accountId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                        ?? User.FindFirst("accountId")?.Value;

        if (string.IsNullOrEmpty(accountId))
        {
            return Unauthorized(new { message = "Không tìm thấy thông tin tài khoản đăng nhập từ phiên!" });
        }

        // 2. Truyền thẳng accountId xuống Service. 
        // Mọi việc tìm Account, lấy EmployeeId và Insert dữ liệu hãy để Service lo.
        var result = await _checkoutReportService.CreateReportAndReconciliationAsync(dto, accountId);

        if (!result.Success)
        {
            return StatusCode(500, new { message = result.Message });
        }

        return Ok(result);
    }
}