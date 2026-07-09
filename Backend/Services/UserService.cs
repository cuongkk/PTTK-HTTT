using System.Text.Json;
using Backend.Common;
using Backend.Dtos;
using Backend.Models;
using Backend.Repositories;
using Backend.Utilities;

namespace Backend.Services;

public class UserService : IUserService
{
    private readonly IAccountRepository _accountRepository;
    private readonly ISystemRoleRepository _roleRepository;
    private readonly IEmployeeRepository _employeeRepository;
    private readonly ICustomerRepository _customerRepository;
    private readonly IAdminAuditLogRepository _auditLogRepository;

    public UserService(
        IAccountRepository accountRepository,
        ISystemRoleRepository roleRepository,
        IEmployeeRepository employeeRepository,
        ICustomerRepository customerRepository,
        IAdminAuditLogRepository auditLogRepository)
    {
        _accountRepository = accountRepository;
        _roleRepository = roleRepository;
        _employeeRepository = employeeRepository;
        _customerRepository = customerRepository;
        _auditLogRepository = auditLogRepository;
    }

    public async Task<List<UserListItemDto>> GetAllAsync()
    {
        var accounts = await _accountRepository.GetAllWithDetailsAsync();
        return accounts.Select(ToDto).ToList();
    }

    public async Task<CreateUserResponse> CreateAsync(CreateUserRequest request, string actorAccountId)
    {
        var role = await _roleRepository.GetByIdAsync(request.RoleId)
            ?? throw new ValidationException($"Vai trò '{request.RoleId}' không tồn tại.");

        if (await _accountRepository.FindAsync(a => a.VerifiedEmail == request.Email) is { Count: > 0 })
        {
            throw new ConflictException("Email đã được sử dụng cho tài khoản khác.");
        }

        var temporaryPassword = "Tmp" + IdGenerator.Generate(string.Empty, 8);
        var account = new Account
        {
            AccountId = IdGenerator.Generate("TK", 12),
            Username = GenerateUsername(request.Email),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(temporaryPassword),
            RoleId = request.RoleId,
            VerifiedEmail = request.Email,
            Status = AccountStatus.Active,
            CreatedByAccountId = actorAccountId,
        };

        if (request.RoleId == "khach_hang")
        {
            var customer = new Customer
            {
                CustomerId = IdGenerator.Generate("KH", 12),
                FullName = request.FullName,
                NationalId = IdGenerator.Generate(string.Empty, 12),
                PhoneNumber = request.PhoneNumber ?? string.Empty,
                Email = request.Email,
            };
            account.CustomerId = customer.CustomerId;
            await _customerRepository.AddAsync(customer);
            await _accountRepository.AddAsync(account);
            account.Customer = customer;
        }
        else
        {
            var employee = new Employee
            {
                EmployeeId = IdGenerator.Generate("NV", 10),
                FullName = request.FullName,
                PhoneNumber = request.PhoneNumber,
                Email = request.Email,
                Position = request.RoleId,
                IsActive = true,
                HireDate = DateOnly.FromDateTime(DateTime.UtcNow),
            };
            account.EmployeeId = employee.EmployeeId;
            await _employeeRepository.AddAsync(employee);
            await _accountRepository.AddAsync(account);
            account.Employee = employee;
        }

        account.Role = role;

        var createdDto = ToDto(account);
        await LogAsync(actorAccountId, account.AccountId, AdminActionType.CreateAccount, null, createdDto);
        await _accountRepository.SaveChangesAsync();

        return new CreateUserResponse(createdDto, temporaryPassword);
    }

    public async Task<UserListItemDto> UpdateAsync(string accountId, UpdateUserRequest request, string actorAccountId)
    {
        var account = await _accountRepository.GetByIdWithDetailsAsync(accountId)
            ?? throw new NotFoundException("Không tìm thấy tài khoản.");

        var role = await _roleRepository.GetByIdAsync(request.RoleId)
            ?? throw new ValidationException($"Vai trò '{request.RoleId}' không tồn tại.");

        var oldSnapshot = ToDto(account);

        account.RoleId = request.RoleId;
        account.Role = role;
        account.Status = request.Status;
        account.UpdatedAt = DateTime.UtcNow;

        if (account.Employee is not null)
        {
            account.Employee.FullName = request.FullName;
            account.Employee.PhoneNumber = request.PhoneNumber;
            account.Employee.Position = request.RoleId;
        }
        else if (account.Customer is not null)
        {
            account.Customer.FullName = request.FullName;
            account.Customer.PhoneNumber = request.PhoneNumber ?? account.Customer.PhoneNumber;
        }

        _accountRepository.Update(account);
        await LogAsync(actorAccountId, account.AccountId, AdminActionType.UpdateAccount, oldSnapshot, ToDto(account));
        await _accountRepository.SaveChangesAsync();

        return ToDto(account);
    }

    public async Task DeleteAsync(string accountId, string actorAccountId)
    {
        var account = await _accountRepository.GetByIdWithDetailsAsync(accountId)
            ?? throw new NotFoundException("Không tìm thấy tài khoản.");

        var oldSnapshot = ToDto(account);
        _accountRepository.Remove(account);
        await LogAsync(actorAccountId, accountId, AdminActionType.DeleteAccount, oldSnapshot, null);
        await _accountRepository.SaveChangesAsync();
    }

    public async Task<ResetPasswordResponse> ResetPasswordAsync(string accountId, string actorAccountId)
    {
        var account = await _accountRepository.GetByIdAsync(accountId)
            ?? throw new NotFoundException("Không tìm thấy tài khoản.");

        var newPassword = "Tmp" + IdGenerator.Generate(string.Empty, 8);
        account.PasswordHash = BCrypt.Net.BCrypt.HashPassword(newPassword);
        account.UpdatedAt = DateTime.UtcNow;
        _accountRepository.Update(account);

        await LogAsync(actorAccountId, accountId, AdminActionType.ChangePassword, null, null);
        await _accountRepository.SaveChangesAsync();

        return new ResetPasswordResponse(newPassword);
    }

    private async Task LogAsync(string actorAccountId, string? targetAccountId, string actionType, object? oldValue, object? newValue)
    {
        await _auditLogRepository.AddAsync(new AdminAuditLog
        {
            LogId = IdGenerator.Generate("NK", 12),
            ActorAccountId = actorAccountId,
            TargetAccountId = targetAccountId,
            ActionType = actionType,
            OldValue = oldValue is null ? null : JsonSerializer.Serialize(oldValue, AuditJsonOptions.Default),
            NewValue = newValue is null ? null : JsonSerializer.Serialize(newValue, AuditJsonOptions.Default),
        });
    }

    private static string GenerateUsername(string email) =>
        email.Split('@')[0].ToLowerInvariant() + IdGenerator.Generate(string.Empty, 4).ToLowerInvariant();

    private static UserListItemDto ToDto(Account account) => new(
        account.AccountId,
        account.Employee?.FullName ?? account.Customer?.FullName ?? account.Username,
        account.VerifiedEmail ?? account.Employee?.Email ?? account.Customer?.Email,
        account.RoleId,
        account.Role?.RoleName ?? account.RoleId,
        account.Status,
        account.LastLoginAt,
        account.EmployeeId is not null ? "employee" : "customer"
    );
}
