using Backend.Common;
using Backend.Dtos;
using Backend.Models;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Route("api/rooms")]
[Authorize(Roles = EmployeePosition.SystemAdmin)]
public class RoomsController : ControllerBase
{
    private readonly IRoomCatalogService _roomCatalogService;

    public RoomsController(IRoomCatalogService roomCatalogService)
    {
        _roomCatalogService = roomCatalogService;
    }

    [HttpGet]
    public async Task<ActionResult<List<RoomDto>>> GetAll()
    {
        return Ok(await _roomCatalogService.GetAllAsync());
    } 

    [HttpGet("branches")]
    public async Task<ActionResult<List<BranchDto>>> GetBranches()
    {
        return Ok(await _roomCatalogService.GetBranchesAsync());
    }

    [HttpPost]
    public async Task<ActionResult<RoomDto>> Create([FromBody] CreateRoomRequest request)
    {
        var result = await _roomCatalogService.CreateAsync(request, User.GetAccountId());
        return CreatedAtAction(nameof(GetAll), null, result);
    }

    [HttpPut("{roomId}")]
    public async Task<ActionResult<RoomDto>> Update(string roomId, [FromBody] UpdateRoomRequest request)
    {
        return Ok(await _roomCatalogService.UpdateAsync(roomId, request, User.GetAccountId()));
    }

    [HttpDelete("{roomId}")]
    public async Task<IActionResult> Delete(string roomId)
    {
        await _roomCatalogService.DeleteAsync(roomId, User.GetAccountId());
        return NoContent();
    }
}
