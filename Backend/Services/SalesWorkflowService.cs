using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Backend.Common;
using Backend.Data;
using Backend.Dtos;
using Backend.Models;
using Backend.Utilities;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services;

public class SalesWorkflowService : ISalesWorkflowService
{
    private readonly AppDbContext _db;

    public SalesWorkflowService(AppDbContext db)
    {
        _db = db;
    }

    private static string AppendStatusNote(string? currentNote, string label, string reason)
    {
        var cleanReason = string.IsNullOrWhiteSpace(reason) ? "Không ghi rõ lý do." : reason.Trim();
        var newNote = $"{DateTime.UtcNow:dd/MM/yyyy HH:mm} - {label}: {cleanReason}";
        return string.IsNullOrWhiteSpace(currentNote) ? newNote : $"{currentNote}\n{newNote}";
    }

    private async Task NotifyCustomerAsync(string customerId, string title, string content)
    {
        var customerAccount = await _db.Accounts.FirstOrDefaultAsync(a => a.CustomerId == customerId);
        if (customerAccount == null) return;

        _db.Notifications.Add(new Notification
        {
            NotificationId = IdGenerator.Generate("NT", 12),
            RecipientAccountId = customerAccount.AccountId,
            Title = title,
            Content = content,
            NotificationType = "he_thong",
            IsRead = false,
            CreatedAt = DateTime.UtcNow
        });
    }

    public async Task<SalesDashboardDto> GetDashboardDataAsync(string salesEmployeeAccountId)
    {
        var today = DateTime.Today;

        var vacantRoomsCount = await _db.Rooms.CountAsync(r =>
            (r.RoomType == RoomType.Whole && r.Status == RoomBedStatus.Empty)
            || (r.RoomType == RoomType.Shared && r.Beds.Any(b => b.Status == RoomBedStatus.Empty)));
        var newAppsToday = await _db.RentalApplications.CountAsync(a => a.CreatedAt >= today);
        var pendingDeposits = await _db.DepositSlips.CountAsync(d => d.Status == "cho_thanh_toan");
        var todayAppts = await _db.RoomViewingSchedules.CountAsync(s => s.AppointmentAt >= today && s.AppointmentAt < today.AddDays(1));

        // Recent registrations (limit to 5)
        var recentApps = await _db.RentalApplications
            .Include(a => a.Customer)
            .OrderByDescending(a => a.CreatedAt)
            .Take(5)
            .Select(a => new RecentRegistrationDto(
                a.ApplicationId,
                a.Customer.FullName,
                a.DesiredRoomType ?? "Chưa rõ",
                a.DesiredArea ?? "Chưa rõ",
                a.MinimumPrice,
                a.MaximumPrice,
                a.CreatedAt,
                a.Status
            ))
            .ToListAsync();

        // Upcoming appointments today or future
        var upcomingApptsQuery = await (
            from schedule in _db.RoomViewingSchedules
            join application in _db.RentalApplications on schedule.ApplicationId equals application.ApplicationId
            join customer in _db.Customers on application.CustomerId equals customer.CustomerId
            where schedule.AppointmentAt >= DateTime.UtcNow
            orderby schedule.AppointmentAt ascending
            select new { schedule, customer }
        ).Take(5).ToListAsync();

        var upcomingAppts = new List<UpcomingAppointmentDto>();
        foreach (var item in upcomingApptsQuery)
        {
            var firstRoomLink = await _db.RoomViewingScheduleRooms
                .FirstOrDefaultAsync(l => l.ScheduleId == item.schedule.ScheduleId);

            var roomName = "Chưa rõ";
            var branchName = "Chưa rõ";
            if (firstRoomLink != null)
            {
                var room = await _db.Rooms.Include(r => r.Branch).FirstOrDefaultAsync(r => r.RoomId == firstRoomLink.RoomId);
                if (room != null)
                {
                    roomName = room.RoomName;
                    branchName = room.Branch.BranchName;
                }
            }

            upcomingAppts.Add(new UpcomingAppointmentDto(
                item.schedule.ScheduleId,
                item.customer.FullName,
                roomName,
                branchName,
                item.schedule.AppointmentAt,
                "Xem phòng"
            ));
        }

        // Pending tasks
        var pendingTasksList = new List<PendingTaskDto>();

        // 1. Overdue deposits (pending > 12h)
        var twelveHoursAgo = DateTime.UtcNow.AddHours(-12);
        var overdueDepositsCount = await _db.DepositSlips
            .CountAsync(d => d.Status == "cho_thanh_toan" && d.CreatedAt < twelveHoursAgo);
        if (overdueDepositsCount > 0)
        {
            pendingTasksList.Add(new PendingTaskDto($"{overdueDepositsCount} hợp đồng cọc chờ thanh toán quá 12 giờ", true));
        }

        // 2. Pending checkout requests
        var pendingCheckoutsCount = await _db.CheckoutRequests.CountAsync(c => c.Status == "cho_tiep_nhan");
        if (pendingCheckoutsCount > 0)
        {
            pendingTasksList.Add(new PendingTaskDto($"{pendingCheckoutsCount} yêu cầu trả phòng đang chờ xử lý", false));
        }

        // 3. Unassigned applications
        var unassignedAppsCount = await _db.RentalApplications
            .CountAsync(a => a.Status == "moi" && a.SalesEmployeeId == null);
        if (unassignedAppsCount > 0)
        {
            pendingTasksList.Add(new PendingTaskDto($"{unassignedAppsCount} đăng ký chưa được gửi lịch hẹn", false));
        }

        return new SalesDashboardDto(
            vacantRoomsCount,
            newAppsToday,
            pendingDeposits,
            todayAppts,
            recentApps,
            upcomingAppts,
            pendingTasksList
        );
    }

    public async Task<List<SalesApplicationDto>> GetApplicationsAsync()
    {
        var contractAppIds = await _db.RentalContracts
            .Select(c => c.Deposit!.ApplicationId)
            .Distinct()
            .ToListAsync();

        var applications = await _db.RentalApplications
            .Include(a => a.Customer)
            .Include(a => a.TenantMembers)
            .Include(a => a.RoomViewingSchedules)
                .ThenInclude(s => s.Rooms)
            .Include(a => a.DepositSlips)
                .ThenInclude(d => d.Beds)
            .Where(a => a.Status != "dang_thue" && a.Status != "da_hoan_thanh" && !contractAppIds.Contains(a.ApplicationId))
            .OrderByDescending(a => a.CreatedAt)
            .ToListAsync();

        var result = new List<SalesApplicationDto>();
        foreach (var app in applications)
        {
            string roomName = "Chưa phân phòng";
            string? roomId = null;
            string? scheduleId = null;
            DateTime? apptAt = null;
            bool apptSent = false;
            string note = app.OtherRequirements ?? "";

            // Check if there is a deposit slip mapping to a bed and room
            var activeDeposit = app.DepositSlips.FirstOrDefault(d => d.Status != "huy" && d.Status != "het_han");

            // Look up latest active schedule. Canceled no-show schedules should allow rescheduling.
            var lastSchedule = app.RoomViewingSchedules
                .Where(s => s.Status != "huy")
                .OrderByDescending(s => s.AppointmentAt)
                .FirstOrDefault();
            if (lastSchedule != null)
            {
                scheduleId = lastSchedule.ScheduleId;
            }

            // 1. Check if there is a contract already created for this application's deposit
            var contract = await _db.RentalContracts
                .Include(c => c.Room)
                .FirstOrDefaultAsync(c => c.Deposit!.ApplicationId == app.ApplicationId);
            if (contract != null && contract.Room != null)
            {
                roomName = contract.Room.RoomName;
                roomId = contract.Room.RoomId;
            }

            // 2. If not, check active deposit beds
            if (roomName == "Chưa phân phòng" && activeDeposit != null && activeDeposit.Beds.Any())
            {
                var firstBedId = activeDeposit.Beds.First().BedId;
                var bed = await _db.Beds.Include(b => b.Room).FirstOrDefaultAsync(b => b.BedId == firstBedId);
                if (bed?.Room != null)
                {
                    roomName = $"{bed.Room.RoomName} (Giường {bed.BedNumber})";
                    roomId = bed.Room.RoomId;
                }
            }

            // 3. Fallback to viewing schedule rooms or desired room
            if (roomName == "Chưa phân phòng")
            {
                if (lastSchedule != null)
                {
                    apptAt = lastSchedule.AppointmentAt;
                    apptSent = true;
                    if (lastSchedule.Rooms.Any())
                    {
                        var firstRoomId = lastSchedule.Rooms.First().RoomId;
                        var room = await _db.Rooms.FirstOrDefaultAsync(r => r.RoomId == firstRoomId);
                        if (room != null)
                        {
                            roomName = room.RoomName;
                            roomId = room.RoomId;
                        }
                    }
                }
                else if (!string.IsNullOrEmpty(app.DesiredRoomId))
                {
                    var desiredRoom = await _db.Rooms.FirstOrDefaultAsync(r => r.RoomId == app.DesiredRoomId);
                    if (desiredRoom != null)
                    {
                        roomName = desiredRoom.RoomName;
                        roomId = desiredRoom.RoomId;
                    }
                }
            }

            var priceRangeStr = "Chưa rõ";
            if (app.MinimumPrice == 0 && app.MaximumPrice <= 1500000) priceRangeStr = "Dưới 1.5 triệu";
            else if (app.MinimumPrice >= 1500000 && app.MaximumPrice <= 2000000) priceRangeStr = "1.5 – 2 triệu";
            else if (app.MinimumPrice >= 2000000) priceRangeStr = "Trên 2 triệu";

            result.Add(new SalesApplicationDto(
                app.ApplicationId,
                app.Customer?.FullName ?? "Chưa rõ",
                app.Customer?.PhoneNumber ?? "Chưa rõ",
                app.Customer?.Email ?? "Chưa rõ",
                app.Customer?.Gender ?? "Nam",
                app.DesiredArea ?? "Quận 5",
                app.NumberOfPeople,
                priceRangeStr,
                roomName,
                roomId,
                scheduleId,
                apptAt,
                apptSent,
                app.Status,
                app.CreatedAt,
                note,
                HasContract: false,
                Tenants: app.TenantMembers
                    .OrderByDescending(t => t.IsPrimaryTenant)
                    .ThenBy(t => t.FullName)
                    .Select(t => new SalesTenantMemberDto(
                        t.FullName,
                        t.Gender,
                        t.Nationality,
                        t.DateOfBirth,
                        t.NationalId,
                        t.DocumentType,
                        t.DocumentImageUrl,
                        t.PermanentAddress,
                        t.OccupationOrSchool,
                        t.IsPrimaryTenant,
                        t.IsEligible,
                        t.Note
                    ))
                    .ToList(),
                DesiredRoomType: app.DesiredRoomType,
                ExpectedMoveInDate: app.ExpectedMoveInDate,
                ExpectedRentalMonths: app.ExpectedRentalMonths,
                LivingSchedule: app.LivingSchedule,
                RequiresQuietLifestyle: app.RequiresQuietLifestyle,
                RequiresParking: app.RequiresParking,
                RequiresAirConditioner: app.RequiresAirConditioner,
                MinimumPrice: app.MinimumPrice,
                MaximumPrice: app.MaximumPrice,
                ScheduleStatus: lastSchedule?.Status
            ));
        }

        return result;
    }

    public async Task<List<SalesDepositSlipDto>> GetDepositSlipsAsync()
    {
        var slips = await _db.DepositSlips
            .Include(d => d.Application)
                .ThenInclude(a => a.Customer)
            .OrderByDescending(d => d.CreatedAt)
            .ToListAsync();

        var result = new List<SalesDepositSlipDto>();
        foreach (var slip in slips)
        {
            var roomName = "Chưa rõ";
            var areaName = "Chưa rõ";
            string? roomStatus = null;
            var hasPaymentProof = await _db.Invoices.AnyAsync(invoice =>
                invoice.DepositId == slip.DepositId && !string.IsNullOrWhiteSpace(invoice.ProofImageUrl));

            var firstBedLink = await _db.DepositBeds
                .FirstOrDefaultAsync(db => db.DepositId == slip.DepositId);
            // 1. Check if there is a contract already created for this deposit slip
            var contract = await _db.RentalContracts
                .Include(c => c.Room)
                .FirstOrDefaultAsync(c => c.DepositId == slip.DepositId);
            if (contract != null && contract.Room != null)
            {
                roomName = contract.Room.RoomName;
                areaName = contract.Room.Area ?? "Chưa rõ";
                roomStatus = contract.Room.Status;
            }

            // 2. If not, check deposit beds
            if (roomName == "Chưa rõ" && firstBedLink != null)
            {
                var bed = await _db.Beds.Include(b => b.Room).FirstOrDefaultAsync(b => b.BedId == firstBedLink.BedId);
                if (bed?.Room != null)
                {
                    roomName = bed.Room.RoomName;
                    areaName = bed.Room.Area ?? "Chưa rõ";
                    roomStatus = bed.Room.Status;
                }
            }

            // 3. Fallback to viewing schedule rooms or desired room
            if (roomName == "Chưa rõ")
            {
                var schedule = await _db.RoomViewingSchedules
                    .FirstOrDefaultAsync(s => s.ApplicationId == slip.ApplicationId);
                if (schedule != null)
                {
                    var scheduleRoom = await _db.RoomViewingScheduleRooms
                        .FirstOrDefaultAsync(sr => sr.ScheduleId == schedule.ScheduleId);
                    if (scheduleRoom != null)
                    {
                        var room = await _db.Rooms.FirstOrDefaultAsync(r => r.RoomId == scheduleRoom.RoomId);
                        if (room != null)
                        {
                            roomName = room.RoomName;
                            areaName = room.Area ?? "Chưa rõ";
                            roomStatus = room.Status;
                        }
                    }
                }
                else if (slip.Application != null && !string.IsNullOrEmpty(slip.Application.DesiredRoomId))
                {
                    var desiredRoom = await _db.Rooms.FirstOrDefaultAsync(r => r.RoomId == slip.Application.DesiredRoomId);
                    if (desiredRoom != null)
                    {
                        roomName = desiredRoom.RoomName;
                        areaName = desiredRoom.Area ?? "Chưa rõ";
                        roomStatus = desiredRoom.Status;
                    }
                }
            }

            result.Add(new SalesDepositSlipDto(
                slip.DepositId,
                slip.ApplicationId,
                slip.Application?.Customer?.FullName ?? "Chưa rõ",
                slip.Application?.Customer?.PhoneNumber ?? "Chưa rõ",
                roomName,
                areaName,
                slip.DepositAmount,
                slip.PaymentDueAt,
                slip.Status,
                slip.CreatedAt,
                slip.RefundReason,
                contract != null,
                slip.Application?.Status,
                hasPaymentProof,
                slip.PaidAt,
                slip.RefundRequestedAt,
                roomStatus
            ));
        }

        return result;
    }

    public async Task<List<SalesRentalContractDto>> GetContractsAsync()
    {
        var contracts = await _db.RentalContracts
            .Include(c => c.Customer)
            .Include(c => c.Room)
            .OrderByDescending(c => c.SignedDate)
            .ToListAsync();

        var result = new List<SalesRentalContractDto>();
        foreach (var contract in contracts)
        {
            var checkoutReq = await _db.CheckoutRequests
                .Where(cr => cr.ContractId == contract.ContractId)
                .OrderByDescending(cr => cr.CreatedAt)
                .FirstOrDefaultAsync();

            var checkoutDto = checkoutReq == null ? null : new CheckoutRequestDto(
                checkoutReq.CreatedAt,
                checkoutReq.ConfirmedInspectionAt ?? checkoutReq.RequestedCheckoutAt,
                checkoutReq.Note ?? "",
                checkoutReq.Status
            );

            // Calculate duration in months
            int durationMonths = 12;
            if (contract.EndDate.HasValue)
            {
                durationMonths = ((contract.EndDate.Value.Year - contract.StartDate.Year) * 12) + contract.EndDate.Value.Month - contract.StartDate.Month;
            }

            result.Add(new SalesRentalContractDto(
                contract.ContractId,
                contract.Customer?.FullName ?? "Chưa rõ",
                contract.Customer?.PhoneNumber ?? "Chưa rõ",
                contract.Room?.RoomName ?? "Chưa rõ",
                contract.StartDate.ToDateTime(TimeOnly.MinValue),
                durationMonths,
                contract.MonthlyRent,
                new List<string> { "Điện", "Nước", "Internet" },
                contract.PaymentCycle,
                contract.DepositId ?? "",
                contract.Status,
                contract.SignedDate.ToDateTime(TimeOnly.MinValue),
                checkoutDto
            ));
        }

        return result;
    }

    public async Task<SalesApplicationDto> CreateViewingScheduleAsync(string applicationId, CreateViewingScheduleRequest request, string salesEmployeeAccountId)
    {
        var app = await _db.RentalApplications.Include(a => a.Customer).FirstOrDefaultAsync(a => a.ApplicationId == applicationId)
            ?? throw new NotFoundException("Không tìm thấy đăng ký thuê.");

        if (app.Status != "moi")
            throw new ValidationException("Chỉ được sắp lịch xem cho hồ sơ mới.");

        if (request.AppointmentAt <= DateTime.UtcNow)
            throw new ValidationException("Thời gian xem phòng phải ở tương lai.");

        var hasActiveSchedule = await _db.RoomViewingSchedules.AnyAsync(s =>
            s.ApplicationId == applicationId && (s.Status == "sap_den" || s.Status == "dang_xem"));
        if (hasActiveSchedule)
            throw new ConflictException("Hồ sơ đã có lịch xem đang hoạt động.");

        var room = await _db.Rooms
            .Include(r => r.Branch)
            .Include(r => r.Beds)
            .FirstOrDefaultAsync(r => r.RoomId == request.RoomId)
            ?? throw new NotFoundException("Không tìm thấy phòng được chọn.");

        var incompatibilities = new List<string>();
        if (room.RoomType == RoomType.Whole && room.Status != RoomBedStatus.Empty)
            incompatibilities.Add("phòng không còn trống");
        if (!string.IsNullOrWhiteSpace(app.DesiredArea))
        {
            var desiredArea = app.DesiredArea.Trim();
            var matchesArea = string.Equals(desiredArea, room.Area, StringComparison.OrdinalIgnoreCase)
                || room.Branch.BranchName.Contains(desiredArea, StringComparison.OrdinalIgnoreCase);
            if (!matchesArea)
                incompatibilities.Add("khu vực hoặc chi nhánh không phù hợp");
        }
        if (!string.IsNullOrWhiteSpace(app.DesiredRoomType)
            && !string.Equals(app.DesiredRoomType, room.RoomType, StringComparison.OrdinalIgnoreCase))
            incompatibilities.Add("loại phòng không phù hợp");
        if (!string.IsNullOrWhiteSpace(app.Gender)
            && !string.IsNullOrWhiteSpace(room.AllowedGender)
            && room.AllowedGender != "khong_gioi_han"
            && !string.Equals(room.AllowedGender, app.Gender == "Nam" ? "nam" : app.Gender == "Nữ" ? "nu" : app.Gender, StringComparison.OrdinalIgnoreCase))
            incompatibilities.Add("giới tính không phù hợp");

        var availableCapacity = room.RoomType == RoomType.Shared
            ? room.Beds.Count(b => b.Status == RoomBedStatus.Empty)
            : room.Capacity;
        if (availableCapacity < app.NumberOfPeople)
            incompatibilities.Add("không đủ chỗ hoặc giường trống");
        var roomPrice = room.RoomType == RoomType.Shared && room.Capacity > 0
            ? (room.RoomPrice / room.Capacity)
            : room.RoomPrice;
        if ((app.MinimumPrice.HasValue || app.MaximumPrice.HasValue) && !roomPrice.HasValue)
            incompatibilities.Add("phòng chưa có giá để đối chiếu");
        else
        {
            if (app.MinimumPrice.HasValue && roomPrice < app.MinimumPrice)
                incompatibilities.Add("giá phòng thấp hơn khoảng khách yêu cầu");
            if (app.MaximumPrice.HasValue && roomPrice > app.MaximumPrice)
                incompatibilities.Add("giá phòng vượt mức khách yêu cầu");
        }
        if (app.RequiresQuietLifestyle && !room.RequiresQuietLifestyle)
            incompatibilities.Add("không đáp ứng yêu cầu yên tĩnh");
        if (app.RequiresParking && !room.HasParking)
            incompatibilities.Add("không đáp ứng yêu cầu gửi xe");
        if (app.RequiresAirConditioner && !room.HasAirConditioner)
            incompatibilities.Add("không có điều hòa theo yêu cầu");

        if (incompatibilities.Count > 0)
            throw new ValidationException($"Phòng không phù hợp: {string.Join(", ", incompatibilities)}.");

        var employee = await _db.Employees.FirstOrDefaultAsync(e => e.Account!.AccountId == salesEmployeeAccountId)
            ?? await _db.Employees.FirstOrDefaultAsync(e => e.Position == EmployeePosition.Sales);

        var employeeId = employee?.EmployeeId ?? "NV00000003";

        var schedule = new RoomViewingSchedule
        {
            ScheduleId = IdGenerator.Generate("LX", 12),
            ApplicationId = applicationId,
            SalesEmployeeId = employeeId,
            AppointmentAt = request.AppointmentAt,
            Status = "sap_den",
            Note = request.Note
        };
        _db.RoomViewingSchedules.Add(schedule);

        _db.RoomViewingScheduleRooms.Add(new RoomViewingScheduleRoom
        {
            ScheduleId = schedule.ScheduleId,
            RoomId = request.RoomId
        });

        app.Status = "moi"; // keeps "moi", viewing schedule state manages the subflow
        await _db.SaveChangesAsync();

        // Notify customer
        var customerAccount = await _db.Accounts.FirstOrDefaultAsync(a => a.CustomerId == app.CustomerId);
        if (customerAccount != null)
        {
            _db.Notifications.Add(new Notification
            {
                NotificationId = IdGenerator.Generate("NT", 12),
                RecipientAccountId = customerAccount.AccountId,
                Title = "Lịch xem phòng đã được tạo",
                Content = $"Lịch xem phòng của bạn được lên vào {request.AppointmentAt:dd/MM/yyyy HH:mm}.",
                NotificationType = "he_thong",
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            });
            await _db.SaveChangesAsync();
        }

        var roomName = room.RoomName;

        var priceRangeStr = "Chưa rõ";
        if (app.MinimumPrice == 0 && app.MaximumPrice <= 1500000) priceRangeStr = "Dưới 1.5 triệu";
        else if (app.MinimumPrice >= 1500000 && app.MaximumPrice <= 2000000) priceRangeStr = "1.5 – 2 triệu";
        else if (app.MinimumPrice >= 2000000) priceRangeStr = "Trên 2 triệu";

        return new SalesApplicationDto(
            app.ApplicationId,
            app.Customer.FullName,
            app.Customer.PhoneNumber,
            app.Customer.Email,
            app.Customer.Gender ?? "Nam",
            app.DesiredArea ?? "Quận 5",
            app.NumberOfPeople,
            priceRangeStr,
            roomName,
            room.RoomId,
            schedule.ScheduleId,
            schedule.AppointmentAt,
            true,
            app.Status,
            app.CreatedAt,
            app.OtherRequirements ?? "",
            DesiredRoomType: app.DesiredRoomType,
            ExpectedMoveInDate: app.ExpectedMoveInDate,
            ExpectedRentalMonths: app.ExpectedRentalMonths,
            LivingSchedule: app.LivingSchedule,
            RequiresQuietLifestyle: app.RequiresQuietLifestyle,
            RequiresParking: app.RequiresParking,
            RequiresAirConditioner: app.RequiresAirConditioner,
            MinimumPrice: app.MinimumPrice,
            MaximumPrice: app.MaximumPrice,
            ScheduleStatus: schedule.Status
        );
    }

    public async Task CompleteViewingScheduleAsync(string scheduleId)
    {
        var schedule = await _db.RoomViewingSchedules.FirstOrDefaultAsync(s => s.ScheduleId == scheduleId)
            ?? throw new NotFoundException("Không tìm thấy lịch xem phòng.");

        if (schedule.Status != "dang_xem")
            throw new ValidationException("Chỉ xác nhận đã xem sau khi khách đã xác nhận thông tin phòng.");

        schedule.Status = "hoan_thanh";

        var app = await _db.RentalApplications.FirstOrDefaultAsync(a => a.ApplicationId == schedule.ApplicationId);
        if (app != null)
        {
            app.Status = "da_xem_phong";
        }

        await _db.SaveChangesAsync();
    }

    public async Task CancelViewingScheduleAsync(string scheduleId)
    {
        var schedule = await _db.RoomViewingSchedules.FirstOrDefaultAsync(s => s.ScheduleId == scheduleId)
            ?? throw new NotFoundException("Không tìm thấy lịch xem phòng.");

        if (schedule.Status == "hoan_thanh")
            throw new ValidationException("Không thể hủy lịch xem phòng đã hoàn thành.");

        schedule.Status = "huy";
        schedule.Note = string.IsNullOrWhiteSpace(schedule.Note)
            ? "Khách không đến theo lịch hẹn."
            : $"{schedule.Note} | Khách không đến theo lịch hẹn.";

        var app = await _db.RentalApplications.FirstOrDefaultAsync(a => a.ApplicationId == schedule.ApplicationId);
        if (app != null && app.Status == "moi")
        {
            app.Status = "moi";
        }

        await _db.SaveChangesAsync();
    }

    public async Task CancelApplicationAsync(string applicationId, string reason)
    {
        var app = await _db.RentalApplications
            .Include(a => a.RoomViewingSchedules)
            .Include(a => a.DepositSlips)
            .FirstOrDefaultAsync(a => a.ApplicationId == applicationId)
            ?? throw new NotFoundException("Khong tim thay dang ky.");

        if (app.Status == "huy")
            throw new ValidationException("Ho so da duoc huy truoc do.");

        if (app.Status == "cho_sale_ra_soat_coc")
            throw new ValidationException("Khong huy ho so tai buoc Sale ra soat coc.");

        if (app.Status == "cho_sale_doi_chieu_nhan_phong")
            throw new ValidationException("Khong huy ho so tai buoc Sale doi chieu nhan phong.");

        var depositIds = app.DepositSlips.Select(d => d.DepositId).ToList();
        var hasContract = await _db.RentalContracts.AnyAsync(c => depositIds.Contains(c.DepositId));
        if (hasContract)
            throw new ValidationException("Khong the huy ho so da lap hop dong thue.");

        if (app.DepositSlips.Any(d => d.Status == "hoan_thanh" || d.Status.EndsWith("_hoan_coc") || d.Status == "cho_hoan_tien" || d.Status == "da_hoan_coc"))
            throw new ValidationException("Ho so da co coc hoan thanh hoac dang xu ly hoan coc.");

        app.Status = "huy";
        app.OtherRequirements = AppendStatusNote(app.OtherRequirements, "Sale huy ho so", reason);

        foreach (var schedule in app.RoomViewingSchedules.Where(s => s.Status != "hoan_thanh"))
        {
            schedule.Status = "huy";
            schedule.Note = AppendStatusNote(schedule.Note, "Huy lich do ho so bi huy", reason);
        }

        foreach (var deposit in app.DepositSlips.Where(d => d.Status == "cho_thanh_toan" || d.Status == "het_han"))
        {
            deposit.Status = "huy";
            deposit.RefundReason = AppendStatusNote(deposit.RefundReason, "Huy phieu theo ho so", reason);
        }

        var pendingInvoices = await _db.Invoices
            .Where(i => i.DepositId != null && depositIds.Contains(i.DepositId) && i.Status == "cho_thanh_toan")
            .ToListAsync();
        foreach (var invoice in pendingInvoices)
        {
            invoice.Status = "huy";
            invoice.Note = AppendStatusNote(invoice.Note, "Huy hoa don theo ho so", reason);
        }

        await NotifyCustomerAsync(app.CustomerId, "Ho so thue da duoc huy", $"Ho so {applicationId} da duoc Sale huy. Ly do: {reason}");
        await _db.SaveChangesAsync();
    }

    public async Task<SalesDepositSlipDto> CreateDepositSlipAsync(CreateDepositRequest request, string salesEmployeeAccountId)
    {
        var app = await _db.RentalApplications.Include(a => a.Customer).FirstOrDefaultAsync(a => a.ApplicationId == request.ApplicationId)
            ?? throw new NotFoundException("Không tìm thấy đăng ký.");

        if (app.Status != "cho_khach_thanh_toan_coc")
            throw new ValidationException("Chỉ lập phiếu đặt cọc sau khi Quản lý đã xác nhận điều kiện đặt cọc.");

        var existingActiveDeposit = await _db.DepositSlips.AnyAsync(d => d.ApplicationId == request.ApplicationId && d.Status != "huy" && d.Status != "het_han");
        if (existingActiveDeposit)
            throw new ConflictException("Hồ sơ này đã có phiếu đặt cọc đang xử lý.");

        var employee = await _db.Employees.FirstOrDefaultAsync(e => e.Account!.AccountId == salesEmployeeAccountId)
            ?? await _db.Employees.FirstOrDefaultAsync(e => e.Position == EmployeePosition.Sales);

        var employeeId = employee?.EmployeeId ?? "NV00000003";

        var slip = new DepositSlip
        {
            DepositId = IdGenerator.Generate("DC", 12),
            ApplicationId = request.ApplicationId,
            SalesEmployeeId = employeeId,
            DepositAmount = request.DepositAmount,
            CreatedAt = DateTime.UtcNow,
            PaymentDueAt = request.HoldUntil,
            Status = "cho_thanh_toan"
        };
        _db.DepositSlips.Add(slip);

        var room = await _db.Rooms.Include(r => r.Beds).FirstOrDefaultAsync(r => r.RoomId == request.RoomId);
        if (room != null)
        {
            if (room.RoomType == RoomType.Whole)
            {
                foreach (var bed in room.Beds)
                {
                    _db.DepositBeds.Add(new DepositBed { DepositId = slip.DepositId, BedId = bed.BedId });
                }
            }
            else
            {
                var firstEmptyBed = room.Beds.FirstOrDefault(b => b.Status == RoomBedStatus.Empty);
                if (firstEmptyBed != null)
                {
                    _db.DepositBeds.Add(new DepositBed { DepositId = slip.DepositId, BedId = firstEmptyBed.BedId });
                }
                else if (room.Beds.Any())
                {
                    _db.DepositBeds.Add(new DepositBed { DepositId = slip.DepositId, BedId = room.Beds.First().BedId });
                }
            }
        }

        // Create Invoice
        var invoice = new Invoice
        {
            InvoiceId = IdGenerator.Generate("HD", 12),
            CustomerId = app.CustomerId,
            DepositId = slip.DepositId,
            InvoiceType = "tien_coc",
            DocumentType = "thu",
            TotalAmount = request.DepositAmount,
            Status = "cho_thanh_toan",
            CreatedAt = DateTime.UtcNow
        };
        _db.Invoices.Add(invoice);

        app.Status = "cho_khach_thanh_toan_coc";
        await _db.SaveChangesAsync();

        // Notify Accountant
        var accountant = await _db.Accounts.FirstOrDefaultAsync(a => a.Username == "accountant");
        if (accountant != null)
        {
            _db.Notifications.Add(new Notification
            {
                NotificationId = IdGenerator.Generate("NT", 12),
                RecipientAccountId = accountant.AccountId,
                Title = "Cần tạo yêu cầu thanh toán cọc",
                Content = $"Phiếu cọc {slip.DepositId} của khách hàng {app.Customer.FullName} chờ tạo yêu cầu thanh toán.",
                NotificationType = $"coc|{slip.DepositId}",
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            });
            await _db.SaveChangesAsync();
        }

        return new SalesDepositSlipDto(
            slip.DepositId,
            slip.ApplicationId,
            app.Customer.FullName,
            app.Customer.PhoneNumber,
            room?.RoomName ?? "Chưa rõ",
            room?.Area ?? "Chưa rõ",
            slip.DepositAmount,
            slip.PaymentDueAt,
            slip.Status,
            slip.CreatedAt,
            null,
            false,
            app.Status,
            false,
            null,
            null,
            room?.Status
        );
    }

    public async Task ExpireDepositSlipAsync(string depositId, string reason)
    {
        var deposit = await _db.DepositSlips
            .Include(d => d.Application)
            .FirstOrDefaultAsync(d => d.DepositId == depositId)
            ?? throw new NotFoundException("Khong tim thay phieu dat coc.");

        if (deposit.Status != "cho_thanh_toan")
            throw new ValidationException("Chi danh dau qua han voi phieu coc dang cho thanh toan.");

        if (deposit.Application.Status != "cho_khach_thanh_toan_coc")
            throw new ValidationException("Chi danh dau qua han khi dang cho khach thanh toan coc.");

        var hasPaymentProof = await _db.Invoices.AnyAsync(invoice =>
            invoice.DepositId == depositId && !string.IsNullOrWhiteSpace(invoice.ProofImageUrl));
        if (hasPaymentProof)
            throw new ValidationException("Phieu coc da co minh chung thanh toan, dang cho Ke toan doi chieu.");

        deposit.Status = "het_han";
        deposit.RefundReason = AppendStatusNote(deposit.RefundReason, "Sale danh dau qua han", reason);

        if (deposit.Application.Status == "cho_khach_thanh_toan_coc" || deposit.Application.Status == "cho_ke_toan_xac_nhan_coc")
        {
            deposit.Application.Status = "da_xem_phong";
            deposit.Application.OtherRequirements = AppendStatusNote(deposit.Application.OtherRequirements, "Phieu coc qua han", reason);
        }

        var invoices = await _db.Invoices
            .Where(i => i.DepositId == depositId && i.Status == "cho_thanh_toan")
            .ToListAsync();
        foreach (var invoice in invoices)
        {
            invoice.Status = "huy";
            invoice.Note = AppendStatusNote(invoice.Note, "Huy do phieu coc qua han", reason);
        }

        await NotifyCustomerAsync(deposit.Application.CustomerId, "Phieu coc da qua han", $"Phieu coc {depositId} da duoc danh dau qua han. Ly do: {reason}");
        await _db.SaveChangesAsync();
    }

    public async Task CancelDepositSlipAsync(string depositId, string reason)
    {
        var deposit = await _db.DepositSlips
            .Include(d => d.Application)
            .FirstOrDefaultAsync(d => d.DepositId == depositId)
            ?? throw new NotFoundException("Khong tim thay phieu dat coc.");

        var hasContract = await _db.RentalContracts.AnyAsync(c => c.DepositId == depositId);
        if (hasContract)
            throw new ValidationException("Khong the huy phieu coc da lap hop dong.");

        if (deposit.Status == "hoan_thanh" || deposit.Status.EndsWith("_hoan_coc") || deposit.Status == "cho_hoan_tien" || deposit.Status == "da_hoan_coc")
            throw new ValidationException("Phieu coc da thanh toan hoac dang xu ly hoan coc, khong the huy truc tiep.");

        deposit.Status = "huy";
        deposit.RefundReason = AppendStatusNote(deposit.RefundReason, "Sale huy phieu coc", reason);

        if (deposit.Application.Status == "cho_khach_thanh_toan_coc" || deposit.Application.Status == "cho_ke_toan_xac_nhan_coc")
        {
            deposit.Application.Status = "da_xem_phong";
            deposit.Application.OtherRequirements = AppendStatusNote(deposit.Application.OtherRequirements, "Phieu coc bi huy", reason);
        }

        var invoices = await _db.Invoices
            .Where(i => i.DepositId == depositId && i.Status == "cho_thanh_toan")
            .ToListAsync();
        foreach (var invoice in invoices)
        {
            invoice.Status = "huy";
            invoice.Note = AppendStatusNote(invoice.Note, "Huy theo phieu coc", reason);
        }

        await NotifyCustomerAsync(deposit.Application.CustomerId, "Phieu coc da huy", $"Phieu coc {depositId} da duoc Sale huy. Ly do: {reason}");
        await _db.SaveChangesAsync();
    }

    public async Task<SalesRentalContractDto> CreateRentalContractAsync(CreateRentalRequest request, string salesEmployeeAccountId)
    {
        var deposit = await _db.DepositSlips
            .Include(d => d.Application)
                .ThenInclude(a => a.Customer)
            .Include(d => d.Beds)
            .FirstOrDefaultAsync(d => d.DepositId == request.DepositId)
            ?? throw new NotFoundException("Không tìm thấy thông tin đặt cọc.");

        var employee = await _db.Employees.FirstOrDefaultAsync(e => e.Account!.AccountId == salesEmployeeAccountId)
            ?? await _db.Employees.FirstOrDefaultAsync(e => e.Position == EmployeePosition.Sales);

        var employeeId = employee?.EmployeeId ?? "NV00000003";

        var roomId = request.RoomId;
        if (string.IsNullOrEmpty(roomId) && deposit.Beds.Any())
        {
            var firstBedId = deposit.Beds.First().BedId;
            var bed = await _db.Beds.FirstOrDefaultAsync(b => b.BedId == firstBedId);
            roomId = bed?.RoomId;
        }

        if (string.IsNullOrEmpty(roomId))
        {
            throw new ValidationException("Không xác định được phòng thuê từ hợp đồng cọc.");
        }

        var contract = new RentalContract
        {
            ContractId = IdGenerator.Generate("HD", 12),
            DepositId = request.DepositId,
            CustomerId = deposit.Application.CustomerId,
            SalesEmployeeId = employeeId,
            RoomId = roomId,
            NumberOfBeds = (short)(deposit.Beds.Count > 0 ? deposit.Beds.Count : 1),
            MonthlyRent = request.MonthlyRent,
            PaymentCycle = request.PaymentCycle,
            SignedDate = DateOnly.FromDateTime(DateTime.Today),
            StartDate = DateOnly.FromDateTime(request.MoveInDate),
            EndDate = DateOnly.FromDateTime(request.MoveInDate.AddMonths(request.DurationMonths)),
            Status = "cho_ky"
        };
        _db.RentalContracts.Add(contract);

        // Update application status to "du_dieu_kien_nhan_phong"
        deposit.Application.Status = "du_dieu_kien_nhan_phong";

        // Link TenantMembers to the Contract
        var members = await _db.TenantMembers
            .Where(m => m.ApplicationId == deposit.ApplicationId && m.ContractId == null)
            .ToListAsync();
        foreach (var member in members)
        {
            member.ContractId = contract.ContractId;
        }

        // Create Invoice for first month's rent
        var invoice = new Invoice
        {
            InvoiceId = IdGenerator.Generate("HD", 12),
            CustomerId = deposit.Application.CustomerId,
            ContractId = contract.ContractId,
            InvoiceType = "tien_thue",
            DocumentType = "thu",
            TotalAmount = request.MonthlyRent,
            Status = "cho_thanh_toan",
            CreatedAt = DateTime.UtcNow
        };
        _db.Invoices.Add(invoice);

        await _db.SaveChangesAsync();

        // Notify Accountant
        var accountant = await _db.Accounts.FirstOrDefaultAsync(a => a.Username == "accountant");
        if (accountant != null)
        {
            _db.Notifications.Add(new Notification
            {
                NotificationId = IdGenerator.Generate("NT", 12),
                RecipientAccountId = accountant.AccountId,
                Title = "Cần tạo khoản thu nhận phòng",
                Content = $"Hợp đồng {contract.ContractId} vừa ký, cần tạo các khoản thu nhận phòng đầu kỳ.",
                NotificationType = $"checkin|{contract.ContractId}",
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            });
            await _db.SaveChangesAsync();
        }

        var room = await _db.Rooms.FirstOrDefaultAsync(r => r.RoomId == request.RoomId);

        return new SalesRentalContractDto(
            contract.ContractId,
            deposit.Application.Customer.FullName,
            deposit.Application.Customer.PhoneNumber,
            room?.RoomName ?? "Chưa rõ",
            request.MoveInDate,
            request.DurationMonths,
            contract.MonthlyRent,
            request.Services,
            contract.PaymentCycle,
            contract.DepositId,
            contract.Status,
            DateTime.UtcNow,
            null
        );
    }

    public async Task CheckoutContractAsync(string contractId, CheckoutContractRequest request, string salesEmployeeAccountId)
    {
        var contract = await _db.RentalContracts.FirstOrDefaultAsync(c => c.ContractId == contractId)
            ?? throw new NotFoundException("Không tìm thấy hợp đồng thuê.");

        var employee = await _db.Employees.FirstOrDefaultAsync(e => e.Account!.AccountId == salesEmployeeAccountId)
            ?? await _db.Employees.FirstOrDefaultAsync(e => e.Position == EmployeePosition.Sales);

        var employeeId = employee?.EmployeeId ?? "NV00000003";

        // Check if there is an existing checkout request in status 'cho_tiep_nhan'
        var existingRequest = await _db.CheckoutRequests
            .FirstOrDefaultAsync(cr => cr.ContractId == contractId && cr.Status == "cho_tiep_nhan");

        if (existingRequest != null)
        {
            // Transition: confirm customer's request
            existingRequest.Status = "da_xac_nhan_lich";
            existingRequest.SalesEmployeeId = employeeId;
            existingRequest.ConfirmedInspectionAt = DateTime.UtcNow;
            existingRequest.UpdatedAt = DateTime.UtcNow;

            contract.Status = "cho_kiem_tra_tra_phong";

            await _db.SaveChangesAsync();

            // Notify Manager
            var managerAccount = await _db.Accounts.FirstOrDefaultAsync(a => a.Username == "manager");
            if (managerAccount != null)
            {
                _db.Notifications.Add(new Notification
                {
                    NotificationId = IdGenerator.Generate("NT", 12),
                    RecipientAccountId = managerAccount.AccountId,
                    Title = "Yêu cầu trả phòng đã xác nhận lịch",
                    Content = $"Lịch trả phòng cho hợp đồng {contractId} đã được Sale xác nhận. Quản lý cần kiểm tra phòng.",
                    NotificationType = "he_thong",
                    IsRead = false,
                    CreatedAt = DateTime.UtcNow
                });
                await _db.SaveChangesAsync();
            }
            return;
        }

        // If no request exists, create a new one (original flow)
        contract.Status = "cho_tra_phong";

        var req = new CheckoutRequest
        {
            CheckoutRequestId = IdGenerator.Generate("YTP", 12),
            ContractId = contractId,
            CustomerId = contract.CustomerId,
            SalesEmployeeId = employeeId,
            RequestedCheckoutAt = DateTime.UtcNow,
            Reason = request.Note,
            Status = "cho_tiep_nhan",
            CreatedAt = DateTime.UtcNow,
            Note = request.Note
        };
        _db.CheckoutRequests.Add(req);

        await _db.SaveChangesAsync();

        // Notify Manager
        var manager = await _db.Accounts.FirstOrDefaultAsync(a => a.Username == "manager");
        if (manager != null)
        {
            _db.Notifications.Add(new Notification
            {
                NotificationId = IdGenerator.Generate("NT", 12),
                RecipientAccountId = manager.AccountId,
                Title = "Có yêu cầu kiểm tra trả phòng",
                Content = $"Hợp đồng {contractId} yêu cầu trả phòng dự kiến ngày {request.ExpectedDate:dd/MM/yyyy}.",
                NotificationType = "he_thong",
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            });
            await _db.SaveChangesAsync();
        }
    }

    public async Task ReviewDepositRequestAsync(string applicationId)
    {
        var app = await _db.RentalApplications.FirstOrDefaultAsync(a => a.ApplicationId == applicationId)
            ?? throw new NotFoundException("Không tìm thấy đăng ký.");

        if (app.Status != "cho_sale_ra_soat_coc")
            throw new ValidationException("Chỉ rà soát hồ sơ cọc sau khi khách đã gửi yêu cầu đặt cọc.");

        app.Status = "cho_quan_ly_xac_nhan_coc";

        // Notify Manager
        var managerAccount = await _db.Accounts.FirstOrDefaultAsync(a => a.Username == "manager");
        if (managerAccount != null)
        {
            _db.Notifications.Add(new Notification
            {
                NotificationId = IdGenerator.Generate("NT", 12),
                RecipientAccountId = managerAccount.AccountId,
                Title = "Hồ sơ đăng ký cọc chờ xác nhận",
                Content = $"Hồ sơ {applicationId} đã được Sale rà soát và chuyển Quản lý xác nhận chỗ trống.",
                NotificationType = "he_thong",
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            });
        }

        await _db.SaveChangesAsync();
    }

    public async Task ReviewCheckInDocumentsAsync(string applicationId)
    {
        var app = await _db.RentalApplications
            .Include(a => a.TenantMembers)
            .Include(a => a.DepositSlips)
            .FirstOrDefaultAsync(a => a.ApplicationId == applicationId)
            ?? throw new NotFoundException("Không tìm thấy đăng ký.");

        if (app.Status != "cho_sale_doi_chieu_nhan_phong")
            throw new ValidationException("Chỉ đối chiếu nhận phòng sau khi khách đã bổ sung hồ sơ nhận phòng.");

        if (!app.DepositSlips.Any(x => x.Status == "hoan_thanh" && x.PaidAt != null))
            throw new ValidationException("Chua co phieu coc da duoc xac nhan thanh toan.");

        if (app.TenantMembers.Count != app.NumberOfPeople)
            throw new ValidationException("Danh sách người ở chưa khớp với số người đăng ký.");

        if (app.TenantMembers.Count(x => x.IsPrimaryTenant) != 1)
            throw new ValidationException("Hồ sơ cần đúng một người đại diện đứng tên.");

        if (app.TenantMembers.Any(x => string.IsNullOrWhiteSpace(x.NationalId)
            || string.IsNullOrWhiteSpace(x.DocumentType)
            || string.IsNullOrWhiteSpace(x.DocumentImageUrl)
            || string.IsNullOrWhiteSpace(x.PermanentAddress)
            || string.IsNullOrWhiteSpace(x.OccupationOrSchool)))
            throw new ValidationException("Hồ sơ người ở chưa đủ giấy tờ hoặc thông tin cư trú.");

        if (app.TenantMembers.Any(x => !x.IsEligible))
            throw new ValidationException("Co nguoi thue chua dat dieu kien luu tru.");

        app.Status = "cho_quan_ly_duyet_nhan_phong";

        // Notify Manager
        var managerAccount = await _db.Accounts.FirstOrDefaultAsync(a => a.Username == "manager");
        if (managerAccount != null)
        {
            _db.Notifications.Add(new Notification
            {
                NotificationId = IdGenerator.Generate("NT", 12),
                RecipientAccountId = managerAccount.AccountId,
                Title = "Hồ sơ nhận phòng chờ duyệt",
                Content = $"Hồ sơ {applicationId} đã được Sale đối chiếu thông tin người ở và chuyển Quản lý duyệt.",
                NotificationType = "he_thong",
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            });
        }

        await _db.SaveChangesAsync();
    }

    public async Task AcceptDepositRefundAsync(string depositId)
    {
        var deposit = await _db.DepositSlips.FirstOrDefaultAsync(d => d.DepositId == depositId)
            ?? throw new NotFoundException("Không tìm thấy phiếu đặt cọc.");

        if (deposit.Status != "cho_tiep_nhan_hoan_coc")
            throw new ValidationException("Chỉ tiếp nhận các yêu cầu hoàn cọc mới.");

        deposit.Status = "dang_xac_nhan_hoan_coc";

        // Notify Manager
        var managerAccount = await _db.Accounts.FirstOrDefaultAsync(a => a.Username == "manager");
        if (managerAccount != null)
        {
            _db.Notifications.Add(new Notification
            {
                NotificationId = IdGenerator.Generate("NT", 12),
                RecipientAccountId = managerAccount.AccountId,
                Title = "Yêu cầu hoàn cọc chờ xác nhận",
                Content = $"Yêu cầu hoàn cọc cho phiếu {depositId} đã được Sale tiếp nhận và chờ Quản lý duyệt.",
                NotificationType = "he_thong",
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            });
        }

        await _db.SaveChangesAsync();
    }
}
