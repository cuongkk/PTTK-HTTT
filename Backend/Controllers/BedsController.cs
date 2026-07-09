using Backend.Common;
using Backend.Dtos;
using Backend.Models;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Route("api/beds")]
[Authorize(Roles = EmployeePosition.SystemAdmin)]
public class BedsController : ControllerBase
{
    private readonly IBedCatalogService _bedCatalogService;

    public BedsController(IBedCatalogService bedCatalogService)
    {
        _bedCatalogService = bedCatalogService;
    }

    [HttpGet]
    public async Task<ActionResult<List<BedDto>>> GetByRoom([FromQuery] string roomId) =>
        Ok(await _bedCatalogService.GetByRoomIdAsync(roomId));

    [HttpPost]
    public async Task<ActionResult<BedDto>> Create([FromBody] CreateBedRequest request)
    {
        var result = await _bedCatalogService.CreateAsync(request, User.GetAccountId());
        return CreatedAtAction(nameof(GetByRoom), new { roomId = request.RoomId }, result);
    }

    [HttpPut("{bedId}")]
    public async Task<ActionResult<BedDto>> Update(string bedId, [FromBody] UpdateBedRequest request) =>
        Ok(await _bedCatalogService.UpdateAsync(bedId, request, User.GetAccountId()));

    [HttpDelete("{bedId}")]
    public async Task<IActionResult> Delete(string bedId)
    {
        await _bedCatalogService.DeleteAsync(bedId, User.GetAccountId());
        return NoContent();
    }
}
