using Backend.Common;
using Backend.Data;
using Backend.Dtos;
using Backend.Models;
using Backend.Utilities;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services;

public interface ICustomerWorkflowService
{
    Task<List<ViewedRoomDto>> GetViewedRoomsAsync(string accountId);
    Task<List<CustomerRoomSummaryDto>> GetDepositedRoomsAsync(string accountId);
    Task<List<CustomerRoomSummaryDto>> GetRentingRoomsAsync(string accountId);
    Task<DepositRequestDetailDto> GetDepositRequestDetailAsync(string accountId, string applicationId, string roomId);
    Task<SubmitDepositResponse> SubmitDepositRequestAsync(string accountId, string applicationId, string roomId, SubmitDepositRequest request);
    Task<CustomerContractDetailDto> GetContractDetailAsync(string accountId, string roomId);
    Task<CustomerCheckoutDetailDto> GetCheckoutDetailAsync(string accountId, string roomId);
    Task<CustomerRoomContextDto> GetRoomContextAsync(string accountId, string roomId);
}

public class CustomerWorkflowService : ICustomerWorkflowService
{
    private readonly AppDbContext _db;

    public CustomerWorkflowService(AppDbContext db) => _db = db;

    public async Task<List<ViewedRoomDto>> GetViewedRoomsAsync(string accountId)
    {
        var customerId = await GetCustomerIdAsync(accountId);
        var rows = await (
            from application in _db.RentalApplications
            join customer in _db.Customers on application.CustomerId equals customer.CustomerId
            join schedule in _db.RoomViewingSchedules on application.ApplicationId equals schedule.ApplicationId
            join scheduleRoom in _db.RoomViewingScheduleRooms on schedule.ScheduleId equals scheduleRoom.ScheduleId
            join room in _db.Rooms on scheduleRoom.RoomId equals room.RoomId
            join branch in _db.Branches on room.BranchId equals branch.BranchId
            where application.CustomerId == customerId && schedule.Status == "hoan_thanh"
                && (application.Status == "da_xem_phong" || application.Status == "cho_ra_soat_coc")
            orderby schedule.AppointmentAt descending
            select new { application, customer, schedule, room, branch }
        ).ToListAsync();

        var result = new List<ViewedRoomDto>();
        foreach (var row in rows)
        {
            var bed = row.room.RoomType == RoomType.Shared
                ? await _db.Beds.Where(x => x.RoomId == row.room.RoomId && x.Status == RoomBedStatus.Empty).OrderBy(x => x.BedNumber).FirstOrDefaultAsync()
                : null;
            var rent = bed?.MonthlyRent ?? row.room.RoomPrice ?? 0;
            var primaryTenant = await _db.TenantMembers.FirstOrDefaultAsync(x => x.ApplicationId == row.application.ApplicationId && x.IsPrimaryTenant);
            result.Add(ToViewedRoom(row.application, row.customer, row.schedule, row.room, row.branch, bed, rent, primaryTenant));
        }
        return result;
    }

    public async Task<List<CustomerRoomSummaryDto>> GetDepositedRoomsAsync(string accountId)
    {
        var customerId = await GetCustomerIdAsync(accountId);
        var rows = await (from deposit in _db.DepositSlips
                          join application in _db.RentalApplications on deposit.ApplicationId equals application.ApplicationId
                          join schedule in _db.RoomViewingSchedules on application.ApplicationId equals schedule.ApplicationId
                          join link in _db.RoomViewingScheduleRooms on schedule.ScheduleId equals link.ScheduleId
                          join room in _db.Rooms on link.RoomId equals room.RoomId
                          join branch in _db.Branches on room.BranchId equals branch.BranchId
                          where application.CustomerId == customerId && deposit.Status == "hoan_thanh"
                              && !_db.RentalContracts.Any(contract => contract.DepositId == deposit.DepositId && contract.Status == "hieu_luc")
                          select new { deposit, application, room, branch }).ToListAsync();
        return rows.Select(x => new CustomerRoomSummaryDto(x.room.RoomId, x.room.RoomName, null, null, x.branch.BranchName,
            x.room.RoomPrice ?? 0, x.deposit.PaidAt ?? x.deposit.CreatedAt, x.deposit.DepositId, x.deposit.Status, x.application.Status)).ToList();
    }

    public async Task<List<CustomerRoomSummaryDto>> GetRentingRoomsAsync(string accountId)
    {
        var customerId = await GetCustomerIdAsync(accountId);
        return await (from contract in _db.RentalContracts
                      join room in _db.Rooms on contract.RoomId equals room.RoomId
                      join branch in _db.Branches on room.BranchId equals branch.BranchId
                      where contract.CustomerId == customerId && room.Status == RoomBedStatus.Rented && contract.Status != "thanh_ly" && contract.Status != "het_han"
                      select new CustomerRoomSummaryDto(room.RoomId, room.RoomName, null, null, branch.BranchName,
                          contract.MonthlyRent, contract.StartDate.ToDateTime(TimeOnly.MinValue), contract.ContractId, contract.Status, "dang_thue")).ToListAsync();
    }

    public async Task<DepositRequestDetailDto> GetDepositRequestDetailAsync(string accountId, string applicationId, string roomId)
    {
        var viewed = (await GetViewedRoomsAsync(accountId)).FirstOrDefault(x => x.ApplicationId == applicationId && x.RoomId == roomId)
            ?? throw new ValidationException("Chỉ phòng/giường đã hoàn thành xem phòng mới được yêu cầu đặt cọc.");
        if (viewed.ApplicationStatus is "da_dat_coc" or "cho_ra_soat_coc")
            throw new ConflictException("Hồ sơ này đã gửi yêu cầu đặt cọc.");
        var room = await _db.Rooms.FirstAsync(x => x.RoomId == roomId);
        var requestedPeople = viewed.Applicant.NumberOfPeople;
        var deposit = room.RoomType == RoomType.Shared ? viewed.MonthlyRent * 2 * requestedPeople : viewed.MonthlyRent * 2;
        var formula = room.RoomType == RoomType.Shared ? $"2 tháng × {requestedPeople} giường" : "2 tháng × giá nguyên phòng";
        return new DepositRequestDetailDto(viewed, deposit, formula, "24 giờ sau khi được duyệt");
    }

    public async Task<SubmitDepositResponse> SubmitDepositRequestAsync(string accountId, string applicationId, string roomId, SubmitDepositRequest request)
    {
        _ = await GetDepositRequestDetailAsync(accountId, applicationId, roomId);
        var customerId = await GetCustomerIdAsync(accountId);
        var customer = await _db.Customers.FirstAsync(x => x.CustomerId == customerId);
        var application = await _db.RentalApplications.FirstAsync(x => x.ApplicationId == applicationId && x.CustomerId == customerId);
        if (request.AccompanyingTenants.Count != application.NumberOfPeople - 1)
            throw new ValidationException("Danh sách người ở không khớp với số người đã đăng ký ban đầu.");

        var room = await _db.Rooms.FirstAsync(x => x.RoomId == roomId);
        if (room.AllowedGender is "nam" or "nu")
        {
            var requiredGender = room.AllowedGender == "nam" ? "Nam" : "Nu";
            if (request.PrimaryTenant.Gender != requiredGender)
                throw new ValidationException("Giới tính người ở không phù hợp điều kiện của phòng.");
        }

        customer.Gender = request.PrimaryTenant.Gender;
        customer.Nationality = request.PrimaryTenant.Nationality;
        application.Status = "cho_ra_soat_coc";

        var oldMembers = await _db.TenantMembers.Where(x => x.ApplicationId == applicationId && x.ContractId == null).ToListAsync();
        _db.TenantMembers.RemoveRange(oldMembers);
        var member = new TenantMember
        {
            TenantMemberId = IdGenerator.Generate("TV", 12), ApplicationId = applicationId, CustomerId = customerId,
            FullName = customer.FullName, IsPrimaryTenant = true
        };
        _db.TenantMembers.Add(member);
        member.NationalId = customer.NationalId;
        member.Gender = request.PrimaryTenant.Gender;
        member.DateOfBirth = customer.DateOfBirth;
        member.Nationality = request.PrimaryTenant.Nationality;
        member.DocumentType = "CCCD";
        member.DocumentImageUrl = null;
        member.PermanentAddress = customer.Address;
        member.OccupationOrSchool = null;
        member.IsEligible = true;
        member.Note = $"Yêu cầu đặt cọc phòng {roomId}; chờ rà soát";
        foreach (var person in request.AccompanyingTenants)
            _db.TenantMembers.Add(new TenantMember { TenantMemberId = IdGenerator.Generate("TV", 12), ApplicationId = applicationId, FullName = person.FullName, Gender = person.Gender, Nationality = person.Nationality, IsPrimaryTenant = false, IsEligible = true });
        await _db.SaveChangesAsync();
        return new SubmitDepositResponse(applicationId, application.Status, "Yêu cầu đặt cọc đã được gửi và đang chờ rà soát.");
    }

    public async Task<CustomerContractDetailDto> GetContractDetailAsync(string accountId, string roomId)
    {
        var customerId = await GetCustomerIdAsync(accountId);
        var row = await (from contract in _db.RentalContracts
                         join room in _db.Rooms on contract.RoomId equals room.RoomId
                         join branch in _db.Branches on room.BranchId equals branch.BranchId
                         join customer in _db.Customers on contract.CustomerId equals customer.CustomerId
                         join deposit in _db.DepositSlips on contract.DepositId equals deposit.DepositId
                         join application in _db.RentalApplications on deposit.ApplicationId equals application.ApplicationId
                         where contract.CustomerId == customerId && room.RoomId == roomId
                         select new { contract, room, branch, customer, application }).FirstOrDefaultAsync()
            ?? throw new NotFoundException("Không tìm thấy hợp đồng của phòng này.");
        var invoice = await _db.Invoices.Where(x => x.ContractId == row.contract.ContractId && x.InvoiceType == "tien_thue").OrderByDescending(x => x.CreatedAt).FirstOrDefaultAsync();
        return new CustomerContractDetailDto(row.room.RoomId, row.room.RoomName, row.branch.BranchName, row.room.RoomType, row.contract.MonthlyRent, row.contract.NumberOfBeds, row.contract.StartDate, row.contract.EndDate, row.contract.Status, row.customer.FullName, row.application.Status, invoice?.Status, invoice?.TotalAmount);
    }

    public async Task<CustomerCheckoutDetailDto> GetCheckoutDetailAsync(string accountId, string roomId)
    {
        var customerId = await GetCustomerIdAsync(accountId);
        var contract = await _db.RentalContracts.FirstOrDefaultAsync(x => x.CustomerId == customerId && x.RoomId == roomId)
            ?? throw new NotFoundException("Không tìm thấy hợp đồng của phòng này.");
        var room = await _db.Rooms.FirstAsync(x => x.RoomId == roomId);
        var request = await _db.CheckoutRequests.FirstOrDefaultAsync(x => x.ContractId == contract.ContractId);
        var reconciliation = request?.ReconciliationId is null ? null : await _db.Reconciliations.FirstOrDefaultAsync(x => x.ReconciliationId == request.ReconciliationId);
        var report = reconciliation is null ? null : await _db.CheckoutReports.FirstOrDefaultAsync(x => x.ReconciliationId == reconciliation.ReconciliationId);
        var invoice = reconciliation is null ? null : await _db.Invoices.Where(x => x.ReconciliationId == reconciliation.ReconciliationId).OrderByDescending(x => x.CreatedAt).FirstOrDefaultAsync();
        return new CustomerCheckoutDetailDto(room.RoomId, room.RoomName, contract.ContractId, contract.Status, request?.Status, request?.RequestedCheckoutAt, request?.ConfirmedInspectionAt, request?.Reason, report?.RoomCondition, report?.FinalElectricityReading, report?.FinalWaterReading, reconciliation?.OriginalDeposit, reconciliation?.TotalDeductions, reconciliation?.RefundAmount, reconciliation?.AdditionalPaymentAmount, invoice?.Status);
    }

    public async Task<CustomerRoomContextDto> GetRoomContextAsync(string accountId, string roomId)
    {
        var customerId = await GetCustomerIdAsync(accountId);
        var customer = await _db.Customers.FirstAsync(x => x.CustomerId == customerId);
        var room = await _db.Rooms.FirstOrDefaultAsync(x => x.RoomId == roomId) ?? throw new NotFoundException("Không tìm thấy phòng.");
        var branch = await _db.Branches.FirstAsync(x => x.BranchId == room.BranchId);
        var application = await (from a in _db.RentalApplications join s in _db.RoomViewingSchedules on a.ApplicationId equals s.ApplicationId join l in _db.RoomViewingScheduleRooms on s.ScheduleId equals l.ScheduleId where a.CustomerId == customerId && l.RoomId == roomId orderby a.CreatedAt descending select a).FirstOrDefaultAsync();
        var deposit = application is null ? null : await _db.DepositSlips.Where(x => x.ApplicationId == application.ApplicationId).OrderByDescending(x => x.CreatedAt).FirstOrDefaultAsync();
        var contract = deposit is null ? null : await _db.RentalContracts.FirstOrDefaultAsync(x => x.DepositId == deposit.DepositId);
        var invoice = contract is not null
            ? await _db.Invoices.Where(x => x.ContractId == contract.ContractId).OrderByDescending(x => x.CreatedAt).FirstOrDefaultAsync()
            : deposit is not null ? await _db.Invoices.Where(x => x.DepositId == deposit.DepositId).OrderByDescending(x => x.CreatedAt).FirstOrDefaultAsync() : null;
        var members = application is null ? new List<CustomerTenantDto>() : await _db.TenantMembers.Where(x => x.ApplicationId == application.ApplicationId).Select(x => new CustomerTenantDto(x.FullName, x.Gender, x.Nationality, x.DateOfBirth, x.NationalId, x.DocumentImageUrl, x.PermanentAddress, x.OccupationOrSchool)).ToListAsync();
        return new CustomerRoomContextDto(room.RoomId, room.RoomName, branch.BranchName, room.RoomType, room.RoomPrice ?? 0, room.Status, customer.FullName, customer.PhoneNumber, customer.Email, customer.NationalId, customer.Gender, customer.Nationality, customer.DateOfBirth, customer.Address, application?.ApplicationId, application?.Status, application?.NumberOfPeople, application?.ExpectedMoveInDate, application?.ExpectedRentalMonths, deposit?.DepositId, deposit?.Status, deposit?.DepositAmount, contract?.ContractId, contract?.Status, invoice?.InvoiceId, invoice?.Status, invoice?.TotalAmount, members);
    }

    private async Task<string> GetCustomerIdAsync(string accountId) =>
        await _db.Accounts.Where(x => x.AccountId == accountId && x.CustomerId != null).Select(x => x.CustomerId!).FirstOrDefaultAsync()
        ?? throw new UnauthorizedAccessException("Tài khoản không thuộc khách hàng.");

    private static ViewedRoomDto ToViewedRoom(RentalApplication a, Customer c, RoomViewingSchedule s, Room r, Branch b, Bed? bed, decimal rent, TenantMember? primaryTenant) => new(
        a.ApplicationId, s.ScheduleId, r.RoomId, r.RoomName, bed?.BedId, bed?.BedNumber, b.BranchName, r.RoomType, rent,
        s.AppointmentAt, s.Status, a.Status,
        new InitialRentalInformationDto(c.FullName, c.PhoneNumber, c.Email, primaryTenant?.Nationality ?? c.Nationality, primaryTenant?.DocumentType ?? "CCCD", primaryTenant?.NationalId ?? c.NationalId, primaryTenant?.DocumentImageUrl, primaryTenant?.DateOfBirth ?? c.DateOfBirth, primaryTenant?.PermanentAddress ?? c.Address, primaryTenant?.OccupationOrSchool, primaryTenant?.FinancialDocumentUrl, a.NumberOfPeople, a.Gender, a.DesiredArea, a.DesiredRoomType, a.MinimumPrice, a.MaximumPrice, a.ExpectedMoveInDate, a.ExpectedRentalMonths, a.LivingSchedule, a.RequiresQuietLifestyle, a.RequiresParking, a.RequiresAirConditioner, a.OtherRequirements));
}
