using Backend.Common;
using Backend.Dtos;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Route("api/notifications")]
[Authorize]
public class NotificationsController : ControllerBase
{
    private readonly INotificationService _service;
    public NotificationsController(INotificationService service) => _service = service;

    [HttpGet("mine")]
    public async Task<ActionResult<NotificationListDto>> GetMine() => Ok(await _service.GetMineAsync(User.GetAccountId()));

    [HttpPut("{notificationId}/read")]
    public async Task<IActionResult> MarkRead(string notificationId) { await _service.MarkReadAsync(User.GetAccountId(), notificationId); return NoContent(); }

    [HttpPut("read-all")]
    public async Task<IActionResult> MarkAllRead() { await _service.MarkAllReadAsync(User.GetAccountId()); return NoContent(); }
}
