using Backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Route("api/manager/room-inspection-condition")]
public class RoomInspectionConditionController : ControllerBase
{
    private readonly IRoomInspectionConditionService _service;

    public RoomInspectionConditionController(IRoomInspectionConditionService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetRoomInspectionConditions()
    {
        var result = await _service.GetRoomInspectionConditionsAsync();

        return Ok(result);
    }
}