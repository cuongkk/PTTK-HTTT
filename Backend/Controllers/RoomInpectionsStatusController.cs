using Backend.Dtos;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace Backend.Controllers;

[ApiController]
[Authorize(Roles = "quan_ly")] 
[Route("api/manager/room-inspections-status")]
public class RoomInspectionsStatusController : ControllerBase
{
    private readonly IRoomInspectionStatusService _roomInspectionStatusService;

    public RoomInspectionsStatusController(IRoomInspectionStatusService roomInspectionStatusService)
    {
        _roomInspectionStatusService = roomInspectionStatusService;
    }

    [HttpGet]
    public async Task<IActionResult> GetRoomStatuses([FromQuery] RoomStatusFilterRequest filter)
    {
        var result = await _roomInspectionStatusService.GetRoomStatusesAsync(filter);
        return Ok(result);
    }

    [HttpPut("confirm/{id}")]
    public async Task<IActionResult> ConfirmRoomStatus(string id)
    {
        var isSuccess = await _roomInspectionStatusService.ConfirmRoomStatusAsync(id);
        
        if (!isSuccess)
        {
            return BadRequest(new { message = "Xác nhận thất bại! Phòng không tồn tại hoặc đã ở trạng thái Trống." });
        }

        return Ok(new { message = "Xác nhận phòng trống thành công!", roomId = id });
    }
}