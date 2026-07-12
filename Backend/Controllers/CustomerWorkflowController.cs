using Backend.Common;
using Backend.Dtos;
using Backend.Models;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Route("api/customer-workflow")]
[Authorize(Roles = "khach_hang")]
public class CustomerWorkflowController : ControllerBase
{
    private readonly ICustomerWorkflowService _service;
    public CustomerWorkflowController(ICustomerWorkflowService service) => _service = service;

    [HttpGet("viewed-rooms")]
    public async Task<ActionResult<List<ViewedRoomDto>>> GetViewedRooms() => Ok(await _service.GetViewedRoomsAsync(User.GetAccountId()));

    [HttpGet("deposited-rooms")]
    public async Task<ActionResult<List<CustomerRoomSummaryDto>>> GetDepositedRooms() => Ok(await _service.GetDepositedRoomsAsync(User.GetAccountId()));

    [HttpGet("renting-rooms")]
    public async Task<ActionResult<List<CustomerRoomSummaryDto>>> GetRentingRooms() => Ok(await _service.GetRentingRoomsAsync(User.GetAccountId()));

    [HttpGet("applications/{applicationId}/rooms/{roomId}/deposit-request")]
    public async Task<ActionResult<DepositRequestDetailDto>> GetDepositRequest(string applicationId, string roomId) => Ok(await _service.GetDepositRequestDetailAsync(User.GetAccountId(), applicationId, roomId));

    [HttpPost("applications/{applicationId}/rooms/{roomId}/deposit-request")]
    public async Task<ActionResult<SubmitDepositResponse>> SubmitDepositRequest(string applicationId, string roomId, SubmitDepositRequest request) => Ok(await _service.SubmitDepositRequestAsync(User.GetAccountId(), applicationId, roomId, request));
}
