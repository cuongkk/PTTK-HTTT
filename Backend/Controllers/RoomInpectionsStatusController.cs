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

    [HttpPut("review/{applicationId}")]
    public async Task<ActionResult<ReviewRoomStatusResultDto>> ReviewRoomStatus(
        string applicationId,
        [FromBody] ReviewRoomStatusDto dto)
    {
         try
        {
            var result = await _roomInspectionStatusService.ReviewRoomStatusAsync(applicationId, dto.IsApproved);
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
    }

}