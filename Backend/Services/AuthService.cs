using System.Net.Mail;
using System.Security.Cryptography;
using System.Text.RegularExpressions;
using Backend.Common;
using Backend.Dtos;
using Backend.Models;
using Backend.Repositories;
using Backend.Utilities;

namespace Backend.Services;

public class AuthService : IAuthService
{
    private readonly IAccountRepository _accountRepository;
    private readonly ICustomerRepository _customerRepository;
    private readonly IJwtTokenGenerator _jwtTokenGenerator;
    private readonly IWebHostEnvironment _environment;

    public AuthService(
        IAccountRepository accountRepository,
        ICustomerRepository customerRepository,
        IJwtTokenGenerator jwtTokenGenerator,
        IWebHostEnvironment environment)
    {
        _accountRepository = accountRepository;
        _customerRepository = customerRepository;
        _jwtTokenGenerator = jwtTokenGenerator;
        _environment = environment;
    }

    public async Task<LoginResponse> LoginAsync(LoginRequest request)
    {
        var account = await _accountRepository.GetByUsernameAsync(request.Username);
        if (account is null || !BCrypt.Net.BCrypt.Verify(request.Password, account.PasswordHash))
        {
            throw new UnauthorizedAppException("Sai tên đăng nhập hoặc mật khẩu.");
        }

        if (account.Status != AccountStatus.Active)
        {
            var message = account.Status == AccountStatus.PendingVerification
                ? "Tài khoản chưa được xác thực email."
                : "Tài khoản đã bị khóa hoặc vô hiệu hóa.";
            throw new UnauthorizedAppException(message);
        }

        account.LastLoginAt = DateTime.UtcNow;
        _accountRepository.Update(account);
        await _accountRepository.SaveChangesAsync();

        var (token, expiresAt) = _jwtTokenGenerator.GenerateToken(account);
        var displayName = account.Employee?.FullName ?? account.Customer?.FullName ?? account.Username;

        return new LoginResponse(
            token,
            expiresAt,
            account.AccountId,
            account.Username,
            account.RoleId,
            account.Role.RoleName,
            displayName
        );
    }

    public async Task<OtpChallengeResponse> RegisterCustomerAsync(RegisterCustomerRequest request)
    {
        var fullName = request.FullName.Trim();
        var phone = request.PhoneNumber.Trim();
        var email = NormalizeEmail(request.Email);
        var username = request.Username.Trim().ToLowerInvariant();

        if (fullName.Length is < 2 or > 100)
            throw new ValidationException("Họ và tên phải có từ 2 đến 100 ký tự.");
        if (!Regex.IsMatch(phone, @"^0\d{9}$"))
            throw new ValidationException("Số điện thoại phải gồm 10 chữ số và bắt đầu bằng 0.");
        if (!Regex.IsMatch(username, @"^[a-z0-9._]{4,50}$"))
            throw new ValidationException("Tên đăng nhập phải có từ 4 đến 50 ký tự, chỉ gồm chữ thường, số, dấu chấm hoặc gạch dưới.");
        ValidatePassword(request.Password, request.ConfirmPassword);

        if (await _accountRepository.UsernameExistsAsync(username))
            throw new ConflictException("Tên đăng nhập đã được sử dụng.");
        if ((await _accountRepository.FindAsync(x => x.VerifiedEmail == email)).Count > 0 ||
            (await _customerRepository.FindAsync(x => x.Email == email)).Count > 0)
            throw new ConflictException("Email đã được sử dụng.");
        if ((await _customerRepository.FindAsync(x => x.PhoneNumber == phone)).Count > 0)
            throw new ConflictException("Số điện thoại đã được sử dụng.");

        var otp = GenerateOtp();
        var expiresAt = DateTime.UtcNow.AddMinutes(10);
        var customer = new Customer
        {
            CustomerId = IdGenerator.Generate("KH", 12),
            FullName = fullName,
            NationalId = IdGenerator.Generate("TMP", 16),
            PhoneNumber = phone,
            Email = email,
        };
        var account = new Account
        {
            AccountId = IdGenerator.Generate("TK", 12),
            Username = username,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            RoleId = "khach_hang",
            CustomerId = customer.CustomerId,
            Status = AccountStatus.PendingVerification,
            ResetTokenHash = BCrypt.Net.BCrypt.HashPassword(otp),
            ResetTokenExpiresAt = expiresAt,
        };

        await _customerRepository.AddAsync(customer);
        await _accountRepository.AddAsync(account);
        await _accountRepository.SaveChangesAsync();

        return CreateChallenge(username, email, expiresAt, otp,
            "Mã OTP xác thực tài khoản đã được gửi đến email của bạn.");
    }

    public async Task<AuthMessageResponse> VerifyRegistrationAsync(VerifyRegistrationRequest request)
    {
        var account = await _accountRepository.GetByUsernameAsync(request.Username.Trim().ToLowerInvariant())
            ?? throw new NotFoundException("Không tìm thấy yêu cầu đăng ký.");
        if (account.Status != AccountStatus.PendingVerification)
            throw new ValidationException("Tài khoản không ở trạng thái chờ xác thực.");

        VerifyOtp(account, request.Otp);
        account.VerifiedEmail = account.Customer?.Email
            ?? throw new ValidationException("Tài khoản chưa có email xác thực.");
        account.Status = AccountStatus.Active;
        account.ResetTokenHash = null;
        account.ResetTokenExpiresAt = null;
        account.UpdatedAt = DateTime.UtcNow;
        _accountRepository.Update(account);
        await _accountRepository.SaveChangesAsync();
        return new AuthMessageResponse("Xác thực thành công. Bạn có thể đăng nhập vào hệ thống.");
    }

    public async Task<OtpChallengeResponse> ResendRegistrationOtpAsync(ResendRegistrationOtpRequest request)
    {
        var account = await _accountRepository.GetByUsernameAsync(request.Username.Trim().ToLowerInvariant())
            ?? throw new NotFoundException("Không tìm thấy yêu cầu đăng ký.");
        if (account.Status != AccountStatus.PendingVerification)
            throw new ValidationException("Tài khoản không ở trạng thái chờ xác thực.");

        var otp = GenerateOtp();
        var expiresAt = DateTime.UtcNow.AddMinutes(10);
        account.ResetTokenHash = BCrypt.Net.BCrypt.HashPassword(otp);
        account.ResetTokenExpiresAt = expiresAt;
        account.UpdatedAt = DateTime.UtcNow;
        _accountRepository.Update(account);
        await _accountRepository.SaveChangesAsync();
        return CreateChallenge(account.Username, account.Customer?.Email ?? string.Empty, expiresAt, otp,
            "Mã OTP mới đã được gửi đến email của bạn.");
    }

    public async Task<OtpChallengeResponse> ForgotPasswordAsync(ForgotPasswordRequest request)
    {
        var email = NormalizeEmail(request.Email);
        var account = (await _accountRepository.FindAsync(x => x.VerifiedEmail == email)).FirstOrDefault()
            ?? throw new NotFoundException("Không tìm thấy tài khoản sử dụng email này.");
        if (account.Status != AccountStatus.Active)
            throw new ValidationException("Tài khoản chưa được kích hoạt hoặc đã bị khóa.");

        var otp = GenerateOtp();
        var expiresAt = DateTime.UtcNow.AddMinutes(10);
        account.ResetTokenHash = BCrypt.Net.BCrypt.HashPassword(otp);
        account.ResetTokenExpiresAt = expiresAt;
        account.UpdatedAt = DateTime.UtcNow;
        _accountRepository.Update(account);
        await _accountRepository.SaveChangesAsync();
        return CreateChallenge(email, email, expiresAt, otp,
            "Liên kết và mã OTP đặt lại mật khẩu đã được gửi đến email của bạn.",
            $"/forgot-password?email={Uri.EscapeDataString(email)}&otp={otp}");
    }

    public async Task<AuthMessageResponse> ResetPasswordAsync(ResetPasswordRequest request)
    {
        var email = NormalizeEmail(request.Email);
        ValidatePassword(request.NewPassword, request.ConfirmPassword);
        var account = (await _accountRepository.FindAsync(x => x.VerifiedEmail == email)).FirstOrDefault()
            ?? throw new NotFoundException("Không tìm thấy tài khoản sử dụng email này.");
        VerifyOtp(account, request.Otp);

        account.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        account.ResetTokenHash = null;
        account.ResetTokenExpiresAt = null;
        account.UpdatedAt = DateTime.UtcNow;
        _accountRepository.Update(account);
        await _accountRepository.SaveChangesAsync();
        return new AuthMessageResponse("Đặt lại mật khẩu thành công. Bạn có thể đăng nhập bằng mật khẩu mới.");
    }

    private OtpChallengeResponse CreateChallenge(
        string reference,
        string email,
        DateTime expiresAt,
        string otp,
        string message,
        string? resetLink = null) =>
        new(
            reference,
            MaskEmail(email),
            expiresAt,
            _environment.IsDevelopment() ? otp : null,
            _environment.IsDevelopment() ? resetLink : null,
            message);

    private static string NormalizeEmail(string email)
    {
        var normalized = email.Trim().ToLowerInvariant();
        try
        {
            var parsed = new MailAddress(normalized);
            if (!string.Equals(parsed.Address, normalized, StringComparison.OrdinalIgnoreCase))
                throw new FormatException();
        }
        catch
        {
            throw new ValidationException("Địa chỉ email không hợp lệ.");
        }
        return normalized;
    }

    private static void ValidatePassword(string password, string confirmPassword)
    {
        if (password != confirmPassword)
            throw new ValidationException("Mật khẩu xác nhận không khớp.");
        if (password.Length < 8 || !password.Any(char.IsUpper) || !password.Any(char.IsLower) || !password.Any(char.IsDigit))
            throw new ValidationException("Mật khẩu phải có ít nhất 8 ký tự, gồm chữ hoa, chữ thường và chữ số.");
    }

    private static string GenerateOtp() => RandomNumberGenerator.GetInt32(100000, 1000000).ToString();

    private static void VerifyOtp(Account account, string otp)
    {
        if (account.ResetTokenHash is null || account.ResetTokenExpiresAt is null)
            throw new ValidationException("Chưa có mã OTP hợp lệ. Vui lòng yêu cầu gửi lại mã.");
        if (account.ResetTokenExpiresAt <= DateTime.UtcNow)
            throw new ValidationException("Mã OTP đã hết hạn. Vui lòng gửi lại mã mới.");
        if (!BCrypt.Net.BCrypt.Verify(otp.Trim(), account.ResetTokenHash))
            throw new ValidationException("Mã OTP không đúng.");
    }

    private static string MaskEmail(string email)
    {
        var parts = email.Split('@');
        if (parts.Length != 2 || parts[0].Length < 2) return email;
        return $"{parts[0][0]}***{parts[0][^1]}@{parts[1]}";
    }
}
