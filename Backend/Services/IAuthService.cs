using Backend.Dtos;

namespace Backend.Services;

public interface IAuthService
{
    Task<LoginResponse> LoginAsync(LoginRequest request);
    Task<OtpChallengeResponse> RegisterCustomerAsync(RegisterCustomerRequest request);
    Task<AuthMessageResponse> VerifyRegistrationAsync(VerifyRegistrationRequest request);
    Task<OtpChallengeResponse> ResendRegistrationOtpAsync(ResendRegistrationOtpRequest request);
    Task<OtpChallengeResponse> ForgotPasswordAsync(ForgotPasswordRequest request);
    Task<AuthMessageResponse> ResetPasswordAsync(ResetPasswordRequest request);
}
