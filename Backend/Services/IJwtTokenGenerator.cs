using Backend.Models;

namespace Backend.Services;

public interface IJwtTokenGenerator
{
    (string Token, DateTime ExpiresAt) GenerateToken(Account account);
}
