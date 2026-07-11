using Backend.Common;
using Backend.Dtos;
using Backend.Models;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Route("api/users")]
[Authorize(Roles = EmployeePosition.SystemAdmin)]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;

    public UsersController(IUserService userService)
    {
        _userService = userService;
    }

    [HttpGet]
    public async Task<ActionResult<List<UserListItemDto>>> GetAll()
    {
        return Ok(await _userService.GetAllAsync());
    } 

    [HttpPost]
    public async Task<ActionResult<CreateUserResponse>> Create([FromBody] CreateUserRequest request)
    {
        var result = await _userService.CreateAsync(request, User.GetAccountId());
        return CreatedAtAction(nameof(GetAll), null, result);
    }

    [HttpPut("{accountId}")]
    public async Task<ActionResult<UserListItemDto>> Update(string accountId, [FromBody] UpdateUserRequest request)
    {
        return Ok(await _userService.UpdateAsync(accountId, request, User.GetAccountId()));
    }

    [HttpDelete("{accountId}")]
    public async Task<IActionResult> Delete(string accountId)
    {
        await _userService.DeleteAsync(accountId, User.GetAccountId());
        return NoContent();
    }

    [HttpPost("{accountId}/reset-password")]
    public async Task<ActionResult<ResetPasswordResponse>> ResetPassword(string accountId) =>
        Ok(await _userService.ResetPasswordAsync(accountId, User.GetAccountId()));
}
