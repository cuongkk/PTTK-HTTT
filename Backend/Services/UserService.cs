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

    public UserService(
        IAccountRepository accountRepository,
        ISystemRoleRepository roleRepository,
        IEmployeeRepository employeeRepository,
        ICustomerRepository customerRepository)
    {
        _accountRepository = accountRepository;
        _roleRepository = roleRepository;
        _employeeRepository = employeeRepository;
        _customerRepository = customerRepository;
    }

    private const int MinPasswordLength = 6;

    public async Task<List<UserListItemDto>> GetAllAsync()
    {
        var accounts = await _accountRepository.GetAllWithDetailsAsync();
        return accounts.Select(ToDto).ToList();
    }

    public async Task<UserDetailDto> GetByIdAsync(string accountId)
    {
        var account = await _accountRepository.GetByIdWithDetailsAsync(accountId)
            ?? throw new NotFoundException("Không tìm thấy tài khoản.");

        return ToDetailDto(account);
    }

    public async Task<UserListItemDto> CreateAsync(CreateUserRequest request, string actorAccountId)
    {
        var role = await _roleRepository.GetByIdAsync(request.RoleId)
            ?? throw new ValidationException($"Vai trò '{request.RoleId}' không tồn tại.");

        if (string.IsNullOrWhiteSpace(request.Password) || request.Password.Length < MinPasswordLength)
        {
            throw new ValidationException($"Mật khẩu phải có ít nhất {MinPasswordLength} ký tự.");
        }

        if (await _accountRepository.FindAsync(a => a.VerifiedEmail == request.Email) is { Count: > 0 })
        {
            throw new ConflictException("Email đã được sử dụng cho tài khoản khác.");
        }

        var account = new Account
        {
            AccountId = IdGenerator.Generate("TK", 12),
            Username = GenerateUsername(request.Email),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            RoleId = request.RoleId,
            VerifiedEmail = request.Email,
            Status = AccountStatus.Active,
            CreatedByAccountId = actorAccountId,
        };

        if (request.RoleId == "khach_hang")
        {
            var nationalId = string.IsNullOrWhiteSpace(request.NationalId)
                ? IdGenerator.Generate(string.Empty, 12)
                : request.NationalId;

            if (await _customerRepository.FindAsync(c => c.NationalId == nationalId) is { Count: > 0 })
            {
                throw new ConflictException($"CCCD '{nationalId}' đã được sử dụng cho khách hàng khác.");
            }

            var customer = new Customer
            {
                CustomerId = IdGenerator.Generate("KH", 12),
                FullName = request.FullName,
                NationalId = nationalId,
                PhoneNumber = request.PhoneNumber ?? string.Empty,
                Email = request.Email,
                Gender = request.Gender,
                Nationality = string.IsNullOrWhiteSpace(request.Nationality) ? "Việt Nam" : request.Nationality,
                DateOfBirth = request.DateOfBirth,
                Address = request.Address,
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
                BranchId = request.BranchId,
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
        await _accountRepository.SaveChangesAsync();

        return createdDto;
    }

    public async Task<UserListItemDto> UpdateAsync(string accountId, UpdateUserRequest request, string actorAccountId)
    {
        var account = await _accountRepository.GetByIdWithDetailsAsync(accountId)
            ?? throw new NotFoundException("Không tìm thấy tài khoản.");

        var role = await _roleRepository.GetByIdAsync(request.RoleId)
            ?? throw new ValidationException($"Vai trò '{request.RoleId}' không tồn tại.");

        if (!string.IsNullOrWhiteSpace(request.Password))
        {
            if (request.Password.Length < MinPasswordLength)
            {
                throw new ValidationException($"Mật khẩu phải có ít nhất {MinPasswordLength} ký tự.");
            }

            account.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);
        }

        account.RoleId = request.RoleId;
        account.Role = role;
        account.Status = request.Status;
        account.UpdatedAt = DateTime.UtcNow;

        if (account.Employee is not null)
        {
            account.Employee.FullName = request.FullName;
            account.Employee.PhoneNumber = request.PhoneNumber;
            account.Employee.Position = request.RoleId;
            account.Employee.BranchId = request.BranchId;
            account.Employee.HireDate = request.HireDate;
        }
        else if (account.Customer is not null)
        {
            if (!string.IsNullOrWhiteSpace(request.NationalId) && request.NationalId != account.Customer.NationalId)
            {
                if (await _customerRepository.FindAsync(c => c.NationalId == request.NationalId) is { Count: > 0 })
                {
                    throw new ConflictException($"CCCD '{request.NationalId}' đã được sử dụng cho khách hàng khác.");
                }

                account.Customer.NationalId = request.NationalId;
            }

            account.Customer.FullName = request.FullName;
            account.Customer.PhoneNumber = request.PhoneNumber ?? account.Customer.PhoneNumber;
            account.Customer.Gender = request.Gender;
            account.Customer.Nationality = string.IsNullOrWhiteSpace(request.Nationality) ? account.Customer.Nationality : request.Nationality;
            account.Customer.DateOfBirth = request.DateOfBirth;
            account.Customer.Address = request.Address;
        }

        _accountRepository.Update(account);
        await _accountRepository.SaveChangesAsync();

        return ToDto(account);
    }

    public async Task<ResetPasswordResponse> ResetPasswordAsync(string accountId, string actorAccountId)
    {
        var account = await _accountRepository.GetByIdAsync(accountId)
            ?? throw new NotFoundException("Không tìm thấy tài khoản.");

        var newPassword = "Tmp" + IdGenerator.Generate(string.Empty, 8);
        account.PasswordHash = BCrypt.Net.BCrypt.HashPassword(newPassword);
        account.UpdatedAt = DateTime.UtcNow;
        _accountRepository.Update(account);
        await _accountRepository.SaveChangesAsync();

        return new ResetPasswordResponse(newPassword);
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

    private static UserDetailDto ToDetailDto(Account account) => new(
        account.AccountId,
        account.Username,
        account.VerifiedEmail ?? account.Employee?.Email ?? account.Customer?.Email,
        account.RoleId,
        account.Role?.RoleName ?? account.RoleId,
        account.Status,
        account.LastLoginAt,
        account.CreatedAt,
        account.EmployeeId is not null ? "employee" : "customer",
        account.EmployeeId,
        account.CustomerId,
        account.Employee?.FullName ?? account.Customer?.FullName ?? account.Username,
        account.Employee?.PhoneNumber ?? account.Customer?.PhoneNumber,
        account.Employee?.BranchId,
        account.Employee?.Branch?.BranchName,
        account.Employee?.HireDate,
        account.Customer?.NationalId,
        account.Customer?.Gender,
        account.Customer?.Nationality,
        account.Customer?.DateOfBirth,
        account.Customer?.Address
    );
}
