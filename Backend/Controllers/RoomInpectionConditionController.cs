using Backend.Services;
using Microsoft.AspNetCore.Mvc;
using Backend.Dtos;
using Microsoft.AspNetCore.Authorization;

namespace Backend.Controllers;

[ApiController]
[Authorize(Roles = "quan_ly")] 
[Route("api/manager/room-inspection-condition")]
public class RoomInpectionConditionController : ControllerBase
{
    private readonly IRoomInpectionConditionService _roomConditionService;

    public RoomInpectionConditionController(IRoomInpectionConditionService roomConditionService)
    {
        _roomConditionService = roomConditionService;
    }

    [HttpGet]
    public async Task<ActionResult<List<RoomConditionDto>>> GetRoomConditions()
    {
        var result = await _roomConditionService.GetRoomConditionsAsync();
        return Ok(result);
    }

    // [HttpPost]
    // public async Task<ActionResult<RoomInspectionResultDto>> CreateRoomInspection(
    //     [FromBody] CreateRoomInspectionDto dto)
    // {
    //     if (string.IsNullOrWhiteSpace(dto.RoomId))
    //         return BadRequest("Thiếu RoomId.");

    //     var employeeId = User.FindFirstValue(ClaimTypes.NameIdentifier);
    //     if (string.IsNullOrEmpty(employeeId))
    //         return Unauthorized();

    //     try
    //     {
    //         var result = await _roomConditionService.CreateRoomInspectionAsync(dto, employeeId);
    //         return Ok(result);
    //     }
    //     catch (KeyNotFoundException ex)
    //     {
    //         return NotFound(ex.Message);
    //     }
    // }
}