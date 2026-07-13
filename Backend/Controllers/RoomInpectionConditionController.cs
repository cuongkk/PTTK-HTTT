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
}