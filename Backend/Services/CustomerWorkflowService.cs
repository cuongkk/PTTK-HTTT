using Backend.Common;
using Backend.Data;
using Backend.Dtos;
using Backend.Models;
using Backend.Utilities;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services;

public interface ICustomerWorkflowService
{
    Task<CreateCustomerRentalApplicationResponse> CreateRentalApplicationAsync(string accountId, CreateCustomerRentalApplicationRequest request);
    Task<List<ViewedRoomDto>> GetViewedRoomsAsync(string accountId);
    Task ConfirmRoomInformationViewedAsync(string accountId, string scheduleId);
    Task<List<CustomerServiceItemDto>> GetAvailableServicesAsync();
    Task<List<CustomerRoomSummaryDto>> GetDepositedRoomsAsync(string accountId);
    Task<List<CustomerRoomSummaryDto>> GetRentingRoomsAsync(string accountId);
    Task<DepositRequestDetailDto> GetDepositRequestDetailAsync(string accountId, string applicationId, string roomId);
    Task<SubmitDepositResponse> SubmitDepositRequestAsync(string accountId, string applicationId, string roomId, SubmitDepositRequest request);
    Task<CustomerContractDetailDto> GetContractDetailAsync(string accountId, string roomId);
    Task<CustomerHandoverDetailDto> GetHandoverDetailAsync(string accountId, string roomId);
    Task ConfirmHandoverAsync(string accountId, string roomId);
    Task<CustomerCheckoutDetailDto> GetCheckoutDetailAsync(string accountId, string roomId);
    Task<CustomerRoomContextDto> GetRoomContextAsync(string accountId, string roomId);
    Task<List<CustomerPaymentDto>> GetPaymentsAsync(string accountId);
}

public class CustomerWorkflowService : ICustomerWorkflowService
{
    private readonly AppDbContext _db;

    public CustomerWorkflowService(AppDbContext db) => _db = db;

    public async Task<CreateCustomerRentalApplicationResponse> CreateRentalApplicationAsync(string accountId, CreateCustomerRentalApplicationRequest request)
    {
        var customerId = await GetCustomerIdAsync(accountId);
        var customer = await _db.Customers.FirstAsync(x => x.CustomerId == customerId);
        Room? room = null;
        if (!string.IsNullOrWhiteSpace(request.RoomId))
        {
            room = await _db.Rooms.FirstOrDefaultAsync(x => x.RoomId == request.RoomId)
                ?? throw new NotFoundException("Không tìm thấy phòng/giường đã chọn.");
            if (room.Status != RoomBedStatus.Empty) throw new ConflictException("Phòng/giường này hiện không còn nhận đăng ký mới.");
            if (request.NumberOfPeople > room.Capacity) throw new ValidationException("Số người đăng ký không phù hợp sức chứa của phòng.");
        }
        if (request.NumberOfPeople < 1) throw new ValidationException("Số người đăng ký phải lớn hơn 0.");

        if (!string.IsNullOrWhiteSpace(request.FullName)) customer.FullName = request.FullName.Trim();
        if (!string.IsNullOrWhiteSpace(request.Phone)) customer.PhoneNumber = request.Phone.Trim();
        if (!string.IsNullOrWhiteSpace(request.Email)) customer.Email = request.Email.Trim();
        if (!string.IsNullOrWhiteSpace(request.Gender)) customer.Gender = request.Gender;
        if (!string.IsNullOrWhiteSpace(request.Nationality)) customer.Nationality = request.Nationality;
        if (!string.IsNullOrWhiteSpace(request.DocumentNumber)) customer.NationalId = request.DocumentNumber.Trim();
        if (request.DateOfBirth is not null) customer.DateOfBirth = request.DateOfBirth;
        if (!string.IsNullOrWhiteSpace(request.PermanentAddress)) customer.Address = request.PermanentAddress;

        var application = new RentalApplication
        {
            ApplicationId = IdGenerator.Generate("HS", 12),
            CustomerId = customerId,
            DesiredRoomId = room?.RoomId,
            NumberOfPeople = request.NumberOfPeople,
            ExpectedMoveInDate = request.ExpectedMoveInDate,
            ExpectedRentalMonths = request.ExpectedRentalMonths,
            DesiredArea = room?.Area ?? request.DesiredArea,
            DesiredRoomType = room?.RoomType ?? request.DesiredRoomType,
            MinimumPrice = room?.RoomPrice ?? request.MinimumPrice,
            MaximumPrice = room?.RoomPrice ?? request.MaximumPrice,
            Gender = request.Gender ?? customer.Gender,
            LivingSchedule = request.LivingSchedule,
            RequiresQuietLifestyle = request.RequiresQuietLifestyle,
            RequiresParking = request.RequiresParking,
            RequiresAirConditioner = request.RequiresAirConditioner,
            OtherRequirements = request.OtherRequirements,
            Status = "moi",
            CreatedAt = DateTime.UtcNow
        };
        _db.RentalApplications.Add(application);
        _db.TenantMembers.Add(new TenantMember
        {
            TenantMemberId = IdGenerator.Generate("TV", 12),
            ApplicationId = application.ApplicationId,
            CustomerId = customerId,
            FullName = customer.FullName,
            NationalId = customer.NationalId,
            Gender = customer.Gender,
            Nationality = customer.Nationality,
            DateOfBirth = customer.DateOfBirth,
            DocumentType = request.DocumentType ?? "CCCD",
            DocumentImageUrl = request.DocumentImageUrl ?? "/demo/demo-document.png",
            FinancialDocumentUrl = request.FinancialDocumentUrl,
            PermanentAddress = customer.Address,
            IsPrimaryTenant = true,
            IsEligible = true
        });

        var salesAccount = await _db.Accounts
            .Include(x => x.Employee)
            .Where(x => x.RoleId == EmployeePosition.Sales && x.Status == AccountStatus.Active && (room == null || x.Employee!.BranchId == room.BranchId))
            .OrderBy(x => x.AccountId)
            .FirstOrDefaultAsync();
        if (salesAccount != null)
            _db.Notifications.Add(new Notification
            {
                NotificationId = IdGenerator.Generate("NT", 12),
                RecipientAccountId = salesAccount.AccountId,
                Title = "Có đăng ký thuê mới cần xếp lịch",
                Content = $"Hồ sơ {application.ApplicationId} của {customer.FullName} đã gửi nhu cầu thuê và đang chờ Sale tìm phòng phù hợp, xếp lịch xem.",
                NotificationType = "dang_ky_thue",
                CreatedAt = DateTime.UtcNow
            });

        await _db.SaveChangesAsync();
        return new CreateCustomerRentalApplicationResponse(application.ApplicationId, application.Status, "Đăng ký đã được tiếp nhận và chuyển Sale xếp lịch.");
    }

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
            where application.CustomerId == customerId && schedule.Status != "huy"
                && (application.Status == "moi" || application.Status == "da_xem_phong" || application.Status == "cho_sale_ra_soat_coc"
                    || application.Status == "cho_quan_ly_xac_nhan_coc" || application.Status == "cho_khach_thanh_toan_coc"
                    || application.Status == "cho_ke_toan_xac_nhan_coc")
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
                            select new { deposit, application, room, branch, ContractStatus = _db.RentalContracts.Where(contract => contract.DepositId == deposit.DepositId).Select(contract => contract.Status).FirstOrDefault() }).ToListAsync();
          return rows.Select(x => new CustomerRoomSummaryDto(x.room.RoomId, x.room.RoomName, null, null, x.branch.BranchName,
              x.room.RoomPrice ?? 0, x.deposit.PaidAt ?? x.deposit.CreatedAt, x.deposit.DepositId, x.ContractStatus ?? x.deposit.Status, x.application.Status)).ToList();
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
        if (viewed.ViewingStatus != "hoan_thanh")
            throw new ValidationException("Sale chưa xác nhận hoàn thành buổi xem phòng.");
        if (viewed.ApplicationStatus is "da_dat_coc" or "cho_sale_ra_soat_coc" or "cho_quan_ly_xac_nhan_coc"
            or "cho_khach_thanh_toan_coc" or "cho_ke_toan_xac_nhan_coc")
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
            if (request.PrimaryTenant.Gender != requiredGender || request.AccompanyingTenants.Any(x => x.Gender != requiredGender))
                throw new ValidationException("Giới tính của một hoặc nhiều người ở không phù hợp điều kiện của phòng.");
        }

        customer.Gender = request.PrimaryTenant.Gender;
        customer.Nationality = request.PrimaryTenant.Nationality;
        customer.NationalId = request.PrimaryTenant.DocumentNumber;
        customer.DateOfBirth = request.PrimaryTenant.DateOfBirth;
        customer.Address = request.PrimaryTenant.PermanentAddress;
        application.Status = "cho_sale_ra_soat_coc";

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
        member.DateOfBirth = request.PrimaryTenant.DateOfBirth;
        member.Nationality = request.PrimaryTenant.Nationality;
        member.DocumentType = request.PrimaryTenant.DocumentType;
        member.DocumentImageUrl = request.PrimaryTenant.DocumentImageUrl;
        member.PermanentAddress = request.PrimaryTenant.PermanentAddress;
        member.OccupationOrSchool = request.PrimaryTenant.OccupationOrSchool;
        member.FinancialDocumentUrl = request.PrimaryTenant.FinancialDocumentUrl;
        member.IsEligible = true;
        member.Note = $"Yêu cầu đặt cọc phòng {roomId}; chờ rà soát";
        foreach (var person in request.AccompanyingTenants)
            _db.TenantMembers.Add(new TenantMember
            {
                TenantMemberId = IdGenerator.Generate("TV", 12), ApplicationId = applicationId,
                FullName = person.FullName, Gender = person.Gender, Nationality = person.Nationality,
                DocumentType = person.DocumentType, NationalId = person.DocumentNumber,
                DocumentImageUrl = person.DocumentImageUrl, DateOfBirth = person.DateOfBirth,
                PermanentAddress = person.PermanentAddress, OccupationOrSchool = person.OccupationOrSchool,
                FinancialDocumentUrl = person.FinancialDocumentUrl, RelationshipToPrimary = person.RelationshipToPrimary,
                IsPrimaryTenant = false, IsEligible = true
            });
        var salesAccount = await _db.Accounts
            .Include(x => x.Employee)
            .Where(x => x.RoleId == EmployeePosition.Sales && x.Status == AccountStatus.Active
                && (application.SalesEmployeeId == null
                    ? x.Employee!.BranchId == room.BranchId
                    : x.Employee!.EmployeeId == application.SalesEmployeeId))
            .OrderBy(x => x.AccountId)
            .FirstOrDefaultAsync();
        if (salesAccount != null)
            _db.Notifications.Add(new Notification
            {
                NotificationId = IdGenerator.Generate("NT", 12),
                RecipientAccountId = salesAccount.AccountId,
                Title = "Có yêu cầu đặt cọc mới",
                Content = $"Hồ sơ {application.ApplicationId} của {customer.FullName} đã gửi yêu cầu đặt cọc phòng {room.RoomName} và đang chờ Sale rà soát.",
                NotificationType = "dat_coc",
                CreatedAt = DateTime.UtcNow
            });
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
        var costs = reconciliation is null
            ? new List<CustomerReconciliationCostDto>()
            : await _db.AdditionalCosts
                .Where(x => x.ReconciliationId == reconciliation.ReconciliationId)
                .OrderBy(x => x.CostType)
                .Select(x => new CustomerReconciliationCostDto(x.CostType, x.Description ?? "Khoản khấu trừ", x.Amount))
                .ToListAsync();
        return new CustomerCheckoutDetailDto(
            room.RoomId, room.RoomName, contract.ContractId, contract.Status,
            request?.Status, request?.RequestedCheckoutAt, request?.ConfirmedInspectionAt, request?.Reason,
            report?.CheckoutReportId, report?.RoomCondition, report?.FinalElectricityReading, report?.FinalWaterReading, report?.KeysReturned,
            reconciliation?.ReconciliationId, reconciliation?.CreatedDate, reconciliation?.Status,
            reconciliation?.RefundRate, reconciliation?.OriginalDeposit, reconciliation?.BaseRefund, reconciliation?.TotalDeductions,
            reconciliation?.RefundAmount, reconciliation?.AdditionalPaymentAmount, invoice?.Status, costs);
    }

    public async Task<List<CustomerServiceItemDto>> GetAvailableServicesAsync() => await _db.Services
        .Where(x => x.IsActive)
        .OrderBy(x => x.ServiceName)
        .Select(x => new CustomerServiceItemDto(x.ServiceId, x.ServiceName, x.Unit, x.UnitPrice, x.Description))
        .ToListAsync();

    public async Task ConfirmRoomInformationViewedAsync(string accountId, string scheduleId)
    {
        var customerId = await GetCustomerIdAsync(accountId);
        var schedule = await _db.RoomViewingSchedules
            .Include(x => x.Application)
            .FirstOrDefaultAsync(x => x.ScheduleId == scheduleId && x.Application.CustomerId == customerId)
            ?? throw new NotFoundException("Không tìm thấy lịch xem phòng của khách hàng.");
        if (schedule.Status != "sap_den")
            throw new ConflictException("Chỉ lịch sắp đến mới có thể xác nhận xem thông tin phòng.");
        schedule.Status = "dang_xem";
        await _db.SaveChangesAsync();
    }

    public async Task<CustomerHandoverDetailDto> GetHandoverDetailAsync(string accountId, string roomId)
    {
        var customerId = await GetCustomerIdAsync(accountId);
        var contract = await _db.RentalContracts.Include(x => x.Room)
            .FirstOrDefaultAsync(x => x.CustomerId == customerId && x.RoomId == roomId)
            ?? throw new NotFoundException("Không tìm thấy hợp đồng của phòng cần bàn giao.");
        var report = await _db.HandoverReports.FirstOrDefaultAsync(x => x.ContractId == contract.ContractId)
            ?? throw new NotFoundException("Quản lý chưa lập biên bản bàn giao cho phòng này.");
        var managerName = await _db.Employees.Where(x => x.EmployeeId == report.ManagerEmployeeId).Select(x => x.FullName).FirstAsync();
        var assets = await (from detail in _db.HandoverDetails
                            join asset in _db.Assets on detail.AssetId equals asset.AssetId
                            where detail.HandoverId == report.HandoverId
                            orderby asset.AssetName
                            select new CustomerHandoverAssetDto(asset.AssetId, asset.AssetName, detail.Quantity, detail.Condition ?? asset.Condition, detail.Note)).ToListAsync();
        return new CustomerHandoverDetailDto(report.HandoverId, contract.ContractId, roomId, contract.Room.RoomName,
            report.HandoverDate, managerName, report.RoomCondition, report.InitialElectricityReading,
            report.InitialWaterReading, report.Note, assets);
    }

    public async Task ConfirmHandoverAsync(string accountId, string roomId)
    {
        var customerId = await GetCustomerIdAsync(accountId);
        var contract = await _db.RentalContracts.Include(x => x.Room)
            .FirstOrDefaultAsync(x => x.CustomerId == customerId && x.RoomId == roomId)
            ?? throw new NotFoundException("Không tìm thấy hợp đồng của phòng cần bàn giao.");
        if (contract.Status != "cho_xac_nhan_ban_giao")
            throw new ConflictException("Hợp đồng không ở trạng thái chờ khách xác nhận bàn giao.");
        if (!await _db.HandoverReports.AnyAsync(x => x.ContractId == contract.ContractId))
            throw new ValidationException("Quản lý chưa lập biên bản bàn giao.");
        if (!await _db.Invoices.AnyAsync(x => x.ContractId == contract.ContractId && x.InvoiceType == "tien_thue" && x.Status == "da_thanh_toan"))
            throw new ValidationException("Khoản thanh toán nhận phòng chưa được Kế toán xác nhận.");

        contract.Status = "hieu_luc";
        contract.Room.Status = RoomBedStatus.Rented;
        contract.Room.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
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

    public async Task<List<CustomerPaymentDto>> GetPaymentsAsync(string accountId)
    {
        var customerId = await GetCustomerIdAsync(accountId);
        var invoices = await _db.Invoices.Where(x => x.CustomerId == customerId).OrderByDescending(x => x.CreatedAt).ToListAsync();
        var result = new List<CustomerPaymentDto>();
        foreach (var invoice in invoices)
        {
            string? roomId = null;
            if (invoice.ContractId is not null) roomId = await _db.RentalContracts.Where(x => x.ContractId == invoice.ContractId).Select(x => x.RoomId).FirstOrDefaultAsync();
            if (roomId is null && invoice.DepositId is not null)
            {
                var applicationId = await _db.DepositSlips.Where(x => x.DepositId == invoice.DepositId).Select(x => x.ApplicationId).FirstOrDefaultAsync();
                roomId = await (from schedule in _db.RoomViewingSchedules join link in _db.RoomViewingScheduleRooms on schedule.ScheduleId equals link.ScheduleId where schedule.ApplicationId == applicationId select link.RoomId).FirstOrDefaultAsync();
            }
            if (roomId is null) continue;
            if (roomId is not ("PHONG_10" or "PHONG_16" or "PHONG_38")) continue;
            var roomName = await _db.Rooms.Where(x => x.RoomId == roomId).Select(x => x.RoomName).FirstAsync();
            var type = invoice.InvoiceType switch { "tien_coc" => "Tiền cọc", "tien_thue" => "Khoản nhận phòng", "thu_them" => "Khoản phát sinh", "hoan_coc" => "Hoàn cọc", _ => "Thanh toán dịch vụ" };
            result.Add(new CustomerPaymentDto(invoice.InvoiceId, type, roomId, roomName, invoice.TotalAmount, invoice.CreatedAt, invoice.PaidAt, invoice.Status, invoice.PaymentMethod, invoice.BankName ?? "Vietcombank", invoice.BankAccountNumber ?? "0123456789", invoice.BankAccountHolder ?? "HOMESTAY DORM", $"{invoice.InvoiceType.ToUpperInvariant()} {roomId}", invoice.ProofImageUrl));
        }
        return result;
    }

    private async Task<string> GetCustomerIdAsync(string accountId) =>
        await _db.Accounts.Where(x => x.AccountId == accountId && x.CustomerId != null).Select(x => x.CustomerId!).FirstOrDefaultAsync()
        ?? throw new UnauthorizedAccessException("Tài khoản không thuộc khách hàng.");

    private static ViewedRoomDto ToViewedRoom(RentalApplication a, Customer c, RoomViewingSchedule s, Room r, Branch b, Bed? bed, decimal rent, TenantMember? primaryTenant) => new(
        a.ApplicationId, s.ScheduleId, r.RoomId, r.RoomName, bed?.BedId, bed?.BedNumber, b.BranchName, r.RoomType, rent,
        s.AppointmentAt, s.Status, a.Status,
        new InitialRentalInformationDto(c.FullName, c.PhoneNumber, c.Email, primaryTenant?.Nationality ?? c.Nationality, primaryTenant?.DocumentType ?? "CCCD", primaryTenant?.NationalId ?? c.NationalId, primaryTenant?.DocumentImageUrl, primaryTenant?.DateOfBirth ?? c.DateOfBirth, primaryTenant?.PermanentAddress ?? c.Address, primaryTenant?.OccupationOrSchool, primaryTenant?.FinancialDocumentUrl, a.NumberOfPeople, a.Gender, a.DesiredArea, a.DesiredRoomType, a.MinimumPrice, a.MaximumPrice, a.ExpectedMoveInDate, a.ExpectedRentalMonths, a.LivingSchedule, a.RequiresQuietLifestyle, a.RequiresParking, a.RequiresAirConditioner, a.OtherRequirements));
}
