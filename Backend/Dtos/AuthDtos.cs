namespace Backend.Dtos;

public record LoginRequest(string Username, string Password);

public record LoginResponse(
    string Token,
    DateTime ExpiresAt,
    string AccountId,
    string Username,
    string RoleId,
    string RoleName,
    string DisplayName
);

public record RegisterCustomerRequest(
    string FullName,
    string PhoneNumber,
    string Email,
    string Username,
    string Password,
    string ConfirmPassword
);

public record VerifyRegistrationRequest(string Username, string Otp);

public record ResendRegistrationOtpRequest(string Username);

public record ForgotPasswordRequest(string Email);

public record ResetPasswordRequest(
    string Email,
    string Otp,
    string NewPassword,
    string ConfirmPassword
);

public record OtpChallengeResponse(
    string Reference,
    string MaskedEmail,
    DateTime ExpiresAt,
    string? DemoOtp,
    string? DemoResetLink,
    string Message
);

public record AuthMessageResponse(string Message);
