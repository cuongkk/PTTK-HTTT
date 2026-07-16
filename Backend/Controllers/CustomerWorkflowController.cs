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

    [HttpPost("rental-applications")]
    public async Task<ActionResult<CreateCustomerRentalApplicationResponse>> CreateRentalApplication(CreateCustomerRentalApplicationRequest request) =>
        Ok(await _service.CreateRentalApplicationAsync(User.GetAccountId(), request));

    [HttpGet("viewed-rooms")]
    public async Task<ActionResult<List<ViewedRoomDto>>> GetViewedRooms() => Ok(await _service.GetViewedRoomsAsync(User.GetAccountId()));

    [HttpGet("services")]
    public async Task<ActionResult<List<CustomerServiceItemDto>>> GetServices() => Ok(await _service.GetAvailableServicesAsync());

    [HttpPost("viewing-schedules/{scheduleId}/confirm-room-information")]
    public async Task<IActionResult> ConfirmRoomInformationViewed(string scheduleId)
    {
        await _service.ConfirmRoomInformationViewedAsync(User.GetAccountId(), scheduleId);
        return NoContent();
    }

    [HttpGet("deposited-rooms")]
    public async Task<ActionResult<List<CustomerRoomSummaryDto>>> GetDepositedRooms() => Ok(await _service.GetDepositedRoomsAsync(User.GetAccountId()));

    [HttpGet("renting-rooms")]
    public async Task<ActionResult<List<CustomerRoomSummaryDto>>> GetRentingRooms() => Ok(await _service.GetRentingRoomsAsync(User.GetAccountId()));

    [HttpGet("applications/{applicationId}/rooms/{roomId}/deposit-request")]
    public async Task<ActionResult<DepositRequestDetailDto>> GetDepositRequest(string applicationId, string roomId) => Ok(await _service.GetDepositRequestDetailAsync(User.GetAccountId(), applicationId, roomId));

    [HttpPost("applications/{applicationId}/rooms/{roomId}/deposit-request")]
    public async Task<ActionResult<SubmitDepositResponse>> SubmitDepositRequest(string applicationId, string roomId) => Ok(await _service.SubmitDepositRequestAsync(User.GetAccountId(), applicationId, roomId));

    [HttpGet("applications/{applicationId}/rooms/{roomId}/deposit-terms")]
    public async Task<ActionResult<ViewedRoomDto>> GetDepositTerms(string applicationId, string roomId) => Ok(await _service.GetDepositTermsAsync(User.GetAccountId(), applicationId, roomId));

    [HttpPost("applications/{applicationId}/rooms/{roomId}/deposit-terms/confirm")]
    public async Task<ActionResult<SubmitDepositResponse>> ConfirmDepositTerms(string applicationId, string roomId) => Ok(await _service.ConfirmDepositTermsAsync(User.GetAccountId(), applicationId, roomId));

    [HttpPost("rooms/{roomId}/deposit-refund")]
    public async Task<ActionResult<SubmitDepositRefundResponse>> SubmitDepositRefund(string roomId, SubmitDepositRefundRequest request) =>
        Ok(await _service.SubmitDepositRefundAsync(User.GetAccountId(), roomId, request));

    [HttpGet("rooms/{roomId}/contract")]
    public async Task<ActionResult<CustomerContractDetailDto>> GetContract(string roomId) => Ok(await _service.GetContractDetailAsync(User.GetAccountId(), roomId));

    [HttpGet("rooms/{roomId}/handover")]
    public async Task<ActionResult<CustomerHandoverDetailDto>> GetHandover(string roomId) => Ok(await _service.GetHandoverDetailAsync(User.GetAccountId(), roomId));

    [HttpPost("rooms/{roomId}/handover/confirm")]
    public async Task<IActionResult> ConfirmHandover(string roomId)
    {
        await _service.ConfirmHandoverAsync(User.GetAccountId(), roomId);
        return NoContent();
    }

    [HttpGet("rooms/{roomId}/checkout")]
    public async Task<ActionResult<CustomerCheckoutDetailDto>> GetCheckout(string roomId) => Ok(await _service.GetCheckoutDetailAsync(User.GetAccountId(), roomId));

    [HttpPost("rooms/{roomId}/checkout/confirm")]
    public async Task<IActionResult> ConfirmCheckout(string roomId, ConfirmCheckoutReconciliationRequest request)
    {
        await _service.ConfirmCheckoutReconciliationAsync(User.GetAccountId(), roomId, request);
        return NoContent();
    }

    [HttpGet("rooms/{roomId}/context")]
    public async Task<ActionResult<CustomerRoomContextDto>> GetRoomContext(string roomId) => Ok(await _service.GetRoomContextAsync(User.GetAccountId(), roomId));

    [HttpGet("payments")]
    public async Task<ActionResult<List<CustomerPaymentDto>>> GetPayments() => Ok(await _service.GetPaymentsAsync(User.GetAccountId()));
}
