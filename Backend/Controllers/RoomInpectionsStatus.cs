using Backend.Dtos;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Authorize(Roles = "quan_ly")] // chỉ Quản lý được xem/xác nhận trạng thái phòng
[Route("api/room-inspections")]
public class RoomInspectionsController : ControllerBase
{
    private readonly IRoomInspectionService _roomInspectionService;

    public RoomInspectionsController(IRoomInspectionService roomInspectionService)
    {
        _roomInspectionService = roomInspectionService;
    }

    // GET api/room-inspections?branchId=CN01&status=Reserved
    [HttpGet]
    public async Task<IActionResult> GetRoomStatuses([FromQuery] RoomStatusFilterRequest filter)
    {
        var result = await _roomInspectionService.GetRoomStatusesAsync(filter);
        return Ok(result);
    }
}