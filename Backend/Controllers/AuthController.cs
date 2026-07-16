using Backend.Dtos;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<ActionResult<LoginResponse>> Login([FromBody] LoginRequest request)
    {
        var result = await _authService.LoginAsync(request);
        return Ok(result);
    }

    [HttpPost("register")]
    [AllowAnonymous]
    public async Task<ActionResult<OtpChallengeResponse>> Register([FromBody] RegisterCustomerRequest request) =>
        Ok(await _authService.RegisterCustomerAsync(request));

    [HttpPost("register/verify")]
    [AllowAnonymous]
    public async Task<ActionResult<AuthMessageResponse>> VerifyRegistration([FromBody] VerifyRegistrationRequest request) =>
        Ok(await _authService.VerifyRegistrationAsync(request));

    [HttpPost("register/resend-otp")]
    [AllowAnonymous]
    public async Task<ActionResult<OtpChallengeResponse>> ResendRegistrationOtp([FromBody] ResendRegistrationOtpRequest request) =>
        Ok(await _authService.ResendRegistrationOtpAsync(request));

    [HttpPost("forgot-password")]
    [AllowAnonymous]
    public async Task<ActionResult<OtpChallengeResponse>> ForgotPassword([FromBody] ForgotPasswordRequest request) =>
        Ok(await _authService.ForgotPasswordAsync(request));

    [HttpPost("reset-password")]
    [AllowAnonymous]
    public async Task<ActionResult<AuthMessageResponse>> ResetPassword([FromBody] ResetPasswordRequest request) =>
        Ok(await _authService.ResetPasswordAsync(request));

    [HttpPost("logout")]
    [Authorize]
    public IActionResult Logout()
    {
        // JWT is stateless; the client discards the token. Endpoint exists for symmetry / future blacklist support.
        return Ok(new { message = "Đăng xuất thành công." });
    }
}
