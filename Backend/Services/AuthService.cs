using Backend.Common;
using Backend.Dtos;
using Backend.Models;
using Backend.Repositories;

namespace Backend.Services;

public class AuthService : IAuthService
{
    private readonly IAccountRepository _accountRepository;
    private readonly IJwtTokenGenerator _jwtTokenGenerator;

    public AuthService(IAccountRepository accountRepository, IJwtTokenGenerator jwtTokenGenerator)
    {
        _accountRepository = accountRepository;
        _jwtTokenGenerator = jwtTokenGenerator;
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
            throw new UnauthorizedAppException("Tài khoản đã bị khóa hoặc vô hiệu hóa.");
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
}
