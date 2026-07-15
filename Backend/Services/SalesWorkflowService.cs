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

    public async Task<SalesDashboardDto> GetDashboardDataAsync(string salesEmployeeAccountId)
    {
        var today = DateTime.Today;

        var vacantRoomsCount = await _db.Rooms.CountAsync(r => r.Status == RoomBedStatus.Empty);
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
            var activeDeposit = app.DepositSlips.FirstOrDefault(d => d.Status != "huy");

            // Look up last schedule
            var lastSchedule = app.RoomViewingSchedules.OrderByDescending(s => s.AppointmentAt).FirstOrDefault();
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
                note
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
            }

            // 2. If not, check deposit beds
            if (roomName == "Chưa rõ" && firstBedLink != null)
            {
                var bed = await _db.Beds.Include(b => b.Room).FirstOrDefaultAsync(b => b.BedId == firstBedLink.BedId);
                if (bed?.Room != null)
                {
                    roomName = bed.Room.RoomName;
                    areaName = bed.Room.Area ?? "Chưa rõ";
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
                contract != null
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

    public async Task<SalesApplicationDto> CreateApplicationAsync(CreateApplicationRequest request)
    {
        var customer = await _db.Customers.FirstOrDefaultAsync(c => c.PhoneNumber == request.Phone);
        if (customer == null)
        {
            customer = new Customer
            {
                CustomerId = IdGenerator.Generate("KH", 12),
                FullName = request.Name,
                PhoneNumber = request.Phone,
                Email = request.Email,
                Gender = request.Gender,
                Nationality = "Việt Nam",
                Address = "TP.HCM"
            };
            _db.Customers.Add(customer);

            var account = new Account
            {
                AccountId = $"TKKH{customer.CustomerId[4..]}",
                Username = request.Phone,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Demo@123"),
                RoleId = "khach_hang",
                CustomerId = customer.CustomerId,
                VerifiedEmail = request.Email,
                Status = AccountStatus.Active
            };
            _db.Accounts.Add(account);
        }

        decimal? minPrice = null;
        decimal? maxPrice = null;
        if (request.PriceRange == "Dưới 1.5 triệu") { minPrice = 0; maxPrice = 1500000; }
        else if (request.PriceRange == "1.5 – 2 triệu") { minPrice = 1500000; maxPrice = 2000000; }
        else if (request.PriceRange == "Trên 2 triệu") { minPrice = 2000000; maxPrice = 10000000; }

        var app = new RentalApplication
        {
            ApplicationId = IdGenerator.Generate("HS", 12),
            CustomerId = customer.CustomerId,
            NumberOfPeople = (short)(request.Capacity ?? 1),
            ExpectedMoveInDate = DateOnly.FromDateTime(DateTime.Today.AddDays(7)),
            ExpectedRentalMonths = 12,
            DesiredArea = request.Area,
            DesiredRoomType = (request.Capacity ?? 1) == 1 ? RoomType.Shared : RoomType.Whole,
            MinimumPrice = minPrice,
            MaximumPrice = maxPrice,
            Gender = request.GenderRequirement,
            RequiresQuietLifestyle = false,
            RequiresParking = false,
            RequiresAirConditioner = false,
            Status = "moi",
            OtherRequirements = request.Note,
            CreatedAt = DateTime.UtcNow
        };
        _db.RentalApplications.Add(app);
        await _db.SaveChangesAsync();

        // Create initial notification for Sale employee
        var salesAccount = await _db.Accounts.FirstOrDefaultAsync(a => a.Username == "sales");
        if (salesAccount != null)
        {
            _db.Notifications.Add(new Notification
            {
                NotificationId = IdGenerator.Generate("NT", 12),
                RecipientAccountId = salesAccount.AccountId,
                Title = "Có đăng ký thuê mới cần tư vấn",
                Content = $"Khách hàng {customer.FullName} đăng ký thuê phòng" + (request.Area != null ? $" tại {request.Area}" : "") + ".",
                NotificationType = "he_thong",
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            });
            await _db.SaveChangesAsync();
        }

        return new SalesApplicationDto(
            app.ApplicationId,
            customer.FullName,
            customer.PhoneNumber,
            customer.Email,
            customer.Gender ?? "Nam",
            app.DesiredArea ?? "Chưa chọn",
            app.NumberOfPeople,
            request.PriceRange ?? "Chưa chọn",
            "Chưa phân phòng",
            null,
            null,
            null,
            false,
            app.Status,
            app.CreatedAt,
            app.OtherRequirements
        );
    }

    public async Task<SalesApplicationDto> CreateViewingScheduleAsync(string applicationId, CreateViewingScheduleRequest request, string salesEmployeeAccountId)
    {
        var app = await _db.RentalApplications.Include(a => a.Customer).FirstOrDefaultAsync(a => a.ApplicationId == applicationId)
            ?? throw new NotFoundException("Không tìm thấy đăng ký thuê.");

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

        var room = await _db.Rooms.FirstOrDefaultAsync(r => r.RoomId == request.RoomId);
        var roomName = room?.RoomName ?? "Chưa rõ";

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
            room?.RoomId,
            schedule.ScheduleId,
            schedule.AppointmentAt,
            true,
            app.Status,
            app.CreatedAt,
            app.OtherRequirements ?? ""
        );
    }

    public async Task CompleteViewingScheduleAsync(string scheduleId)
    {
        var schedule = await _db.RoomViewingSchedules.FirstOrDefaultAsync(s => s.ScheduleId == scheduleId)
            ?? throw new NotFoundException("Không tìm thấy lịch xem phòng.");

        schedule.Status = "hoan_thanh";

        var app = await _db.RentalApplications.FirstOrDefaultAsync(a => a.ApplicationId == schedule.ApplicationId);
        if (app != null)
        {
            app.Status = "da_xem_phong";
        }

        await _db.SaveChangesAsync();
    }

    public async Task<SalesDepositSlipDto> CreateDepositSlipAsync(CreateDepositRequest request, string salesEmployeeAccountId)
    {
        var app = await _db.RentalApplications.Include(a => a.Customer).FirstOrDefaultAsync(a => a.ApplicationId == request.ApplicationId)
            ?? throw new NotFoundException("Không tìm thấy đăng ký.");

        if (app.Status != "cho_khach_thanh_toan_coc")
            throw new ValidationException("Chỉ lập phiếu đặt cọc sau khi Quản lý đã xác nhận điều kiện đặt cọc.");

        var existingActiveDeposit = await _db.DepositSlips.AnyAsync(d => d.ApplicationId == request.ApplicationId && d.Status != "huy");
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
                NotificationType = "he_thong",
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
            false
        );
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
                NotificationType = "he_thong",
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
        var app = await _db.RentalApplications.FirstOrDefaultAsync(a => a.ApplicationId == applicationId)
            ?? throw new NotFoundException("Không tìm thấy đăng ký.");

        if (app.Status != "cho_sale_doi_chieu_nhan_phong")
            throw new ValidationException("Chỉ đối chiếu nhận phòng sau khi khách đã bổ sung hồ sơ nhận phòng.");

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
