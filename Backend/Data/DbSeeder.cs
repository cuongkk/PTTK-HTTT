using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Data;

public static class DbSeeder
{
    public const string DefaultAdminUsername = "admin";
    public const string DefaultAdminPassword = "Admin@123";
    public const string DemoPassword = "Demo@123";

    public static async Task SeedAsync(AppDbContext db)
    {
        await SeedRolesAndPermissionsAsync(db);
        await SeedBranchesAsync(db);
        await SeedUsersAsync(db);
        await SeedSystemParametersAsync(db);
        await SeedServicesAsync(db);
        await SeedResidenceRulesAsync(db);
        await SeedStatePipelineDemoAsync(db);
    }

    private static async Task SeedStatePipelineDemoAsync(AppDbContext db)
    {
        var today = new DateOnly(2026, 7, 12);
        var rooms = new List<Room>();
        void AddRoom(string id, string name, string status) => rooms.Add(new Room { RoomId = id, BranchId = "CN0000001", RoomName = name, RoomType = RoomType.Whole, Capacity = 1, Area = "Khu Demo trạng thái", RoomPrice = 3000000, Floor = 4, AreaSquareMeters = 20, Description = $"Dữ liệu demo: {name}", AllowedGender = "khong_gioi_han", HasAirConditioner = true, HasParking = true, Status = status });

        AddRoom("PHONG_1", "Phòng 1 - chưa đăng ký", RoomBedStatus.Empty);
        AddRoom("PHONG_2", "Phòng 2 - hồ sơ mới", RoomBedStatus.Empty);
        AddRoom("PHONG_3", "Phòng 3 - lịch sắp đến", RoomBedStatus.Empty);
        AddRoom("PHONG_4", "Phòng 4 - đã xem", RoomBedStatus.Empty);

        var depositStates = new[] { "da_xem_phong", "cho_sale_ra_soat", "cho_quan_ly_xac_nhan", "cho_khach_thanh_toan", "cho_ke_toan_xac_nhan", "da_dat_coc" };
        for (var i = 0; i < depositStates.Length; i++) AddRoom($"PHONG_{i + 5}", $"Phòng {i + 5} - {depositStates[i]}", i == 5 ? RoomBedStatus.Deposited : RoomBedStatus.Empty);

        var checkInStates = new[] { "chua_bo_sung", "cho_sale_doi_chieu", "cho_quan_ly_duyet", "cho_sale_lap_hop_dong", "cho_khach_ky", "cho_khach_thanh_toan", "cho_ke_toan_xac_nhan", "dang_thue" };
        for (var i = 0; i < checkInStates.Length; i++) AddRoom($"PHONG_{i + 11}", $"Phòng {i + 11} - {checkInStates[i]}", i == 7 ? RoomBedStatus.Rented : RoomBedStatus.Deposited);

        var refundStates = new[] { "hoan_thanh", "cho_tiep_nhan_hoan_coc", "dang_xac_nhan_hoan_coc", "cho_doi_soat_hoan_coc", "cho_khach_xac_nhan_hoan_coc", "cho_hoan_tien", "da_hoan_coc", "huy" };
        for (var i = 0; i < refundStates.Length; i++) AddRoom($"PHONG_{i + 19}", $"Phòng {i + 19} - {refundStates[i]}", refundStates[i] == "da_hoan_coc" ? RoomBedStatus.Empty : refundStates[i] is "hoan_thanh" or "huy" ? RoomBedStatus.Deposited : "cho_hoan_coc");

        var checkoutStates = new[] { "chua_yeu_cau", "cho_tiep_nhan", "da_xac_nhan_lich", "cho_kiem_tra", "da_kiem_tra", "cho_doi_soat", "cho_khach_xac_nhan", "cho_hoan_tien", "hoan_tat", "huy" };
        for (var i = 0; i < checkoutStates.Length; i++) AddRoom($"PHONG_{i + 27}", $"Phòng {i + 27} - {checkoutStates[i]}", checkoutStates[i] == "hoan_tat" ? RoomBedStatus.Empty : RoomBedStatus.Rented);
        AddRoom("PHONG_37", "Phòng 37 - Kế toán hoàn tiền", RoomBedStatus.Rented);
        AddRoom("PHONG_38", "Phòng 38 - Khách thanh toán thu thêm", RoomBedStatus.Rented);
        AddRoom("PHONG_39", "Phòng 39 - Kế toán xác nhận thu thêm", RoomBedStatus.Rented);
        AddRoom("PHONG_40", "Phòng 40 - Không phát sinh thanh toán", RoomBedStatus.Rented);

        foreach (var room in rooms)
        {
            if (!await db.Rooms.AnyAsync(x => x.RoomId == room.RoomId)) db.Rooms.Add(room);
            var bedId = $"G{room.RoomId.Replace("_", "")}1";
            if (!await db.Beds.AnyAsync(x => x.BedId == bedId)) db.Beds.Add(new Bed { BedId = bedId, RoomId = room.RoomId, BedNumber = 1, MonthlyRent = room.RoomPrice!.Value, Status = room.Status });
        }
        await db.SaveChangesAsync();

        // Các trạng thái xem phòng: phòng vẫn trống, trạng thái nằm ở hồ sơ và lịch xem.
        for (var i = 1; i <= 3; i++)
        {
            var appId = $"HSDXEM{i:000000}";
            if (!await db.RentalApplications.AnyAsync(x => x.ApplicationId == appId)) db.RentalApplications.Add(new RentalApplication { ApplicationId = appId, CustomerId = "KH0000000001", SalesEmployeeId = "NV00000003", NumberOfPeople = 1, ExpectedMoveInDate = today.AddMonths(1), ExpectedRentalMonths = 6, DesiredArea = "Quận 5", DesiredRoomType = RoomType.Whole, Status = i == 3 ? "da_xem_phong" : "moi", CreatedAt = new DateTime(2026, 7, 12, 7 + i, 0, 0, DateTimeKind.Utc) });
            if (i >= 2)
            {
                var scheduleId = $"LXDXEM{i:000000}";
                if (!await db.RoomViewingSchedules.AnyAsync(x => x.ScheduleId == scheduleId)) db.RoomViewingSchedules.Add(new RoomViewingSchedule { ScheduleId = scheduleId, ApplicationId = appId, SalesEmployeeId = "NV00000003", AppointmentAt = new DateTime(2026, 7, 15 + i, 9, 0, 0), Status = i == 3 ? "hoan_thanh" : "sap_den", Note = $"Demo trạng thái xem phòng {i}" });
                await db.SaveChangesAsync();
                if (!await db.RoomViewingScheduleRooms.AnyAsync(x => x.ScheduleId == scheduleId && x.RoomId == $"PHONG_{i + 1}")) db.RoomViewingScheduleRooms.Add(new RoomViewingScheduleRoom { ScheduleId = scheduleId, RoomId = $"PHONG_{i + 1}" });
            }
        }
        await db.SaveChangesAsync();

        // UC2: PHONG_5..PHONG_10 lần lượt từ đã xem đến xác nhận xong tiền cọc.
        for (var i = 0; i < 6; i++)
        {
            var appId = $"HSDDAT{i:000000}"; var scheduleId = $"LXDDAT{i:000000}";
            var appStatus = i == 0 ? "da_xem_phong" : i == 5 ? "da_dat_coc" : "cho_ra_soat_coc";
            if (!await db.RentalApplications.AnyAsync(x => x.ApplicationId == appId)) db.RentalApplications.Add(new RentalApplication { ApplicationId = appId, CustomerId = "KH0000000001", SalesEmployeeId = "NV00000003", NumberOfPeople = 1, ExpectedMoveInDate = today.AddMonths(1), ExpectedRentalMonths = 6, DesiredArea = "Quận 5", DesiredRoomType = RoomType.Whole, Status = appStatus });
            await db.SaveChangesAsync();
            if (!await db.RoomViewingSchedules.AnyAsync(x => x.ScheduleId == scheduleId)) db.RoomViewingSchedules.Add(new RoomViewingSchedule { ScheduleId = scheduleId, ApplicationId = appId, SalesEmployeeId = "NV00000003", AppointmentAt = new DateTime(2026, 7, 10, 9, 0, 0), Status = "hoan_thanh" });
            await db.SaveChangesAsync();
            if (!await db.RoomViewingScheduleRooms.AnyAsync(x => x.ScheduleId == scheduleId && x.RoomId == $"PHONG_{i + 5}")) db.RoomViewingScheduleRooms.Add(new RoomViewingScheduleRoom { ScheduleId = scheduleId, RoomId = $"PHONG_{i + 5}" });
            if (i >= 3)
            {
                var depositId = $"DCDDAT{i:000000}";
                if (!await db.DepositSlips.AnyAsync(x => x.DepositId == depositId)) db.DepositSlips.Add(new DepositSlip { DepositId = depositId, ApplicationId = appId, SalesEmployeeId = "NV00000003", ManagerEmployeeId = "NV00000002", DepositAmount = 6000000, PaymentDueAt = new DateTime(2026, 7, 15, 8, 0, 0), PaidAt = i >= 4 ? new DateTime(2026, 7, 14, 9, 0, 0) : null, Status = i == 5 ? "hoan_thanh" : "cho_thanh_toan" });
                if (i >= 4 && !await db.Invoices.AnyAsync(x => x.InvoiceId == $"HDDDAT{i:000000}")) db.Invoices.Add(new Invoice { InvoiceId = $"HDDDAT{i:000000}", CustomerId = "KH0000000001", DepositId = depositId, AccountantEmployeeId = "NV00000004", InvoiceType = "tien_coc", DocumentType = "thu", TotalAmount = 6000000, ProofImageUrl = "demo/chung-tu/coc.jpg", Status = i == 5 ? "da_thanh_toan" : "cho_thanh_toan" });
            }
        }
        await db.SaveChangesAsync();

        // UC3: PHONG_11..PHONG_18 từ chờ bổ sung hồ sơ đến hợp đồng hiệu lực.
        for (var i = 0; i < 8; i++)
        {
            var appId = $"HSDNHAN{i:00000}"; var depositId = $"DCDNHAN{i:00000}"; var scheduleId = $"LXDNHAN{i:00000}";
            var appStatus = i == 0 ? "da_dat_coc" : i <= 2 ? "cho_kiem_tra_nhan_phong" : "du_dieu_kien_nhan_phong";
            if (!await db.RentalApplications.AnyAsync(x => x.ApplicationId == appId)) db.RentalApplications.Add(new RentalApplication { ApplicationId = appId, CustomerId = "KH0000000001", SalesEmployeeId = "NV00000003", NumberOfPeople = 1, ExpectedMoveInDate = today.AddDays(15), ExpectedRentalMonths = 12, DesiredArea = "Quận 5", DesiredRoomType = RoomType.Whole, Status = appStatus });
            await db.SaveChangesAsync();
            if (!await db.RoomViewingSchedules.AnyAsync(x => x.ScheduleId == scheduleId)) db.RoomViewingSchedules.Add(new RoomViewingSchedule { ScheduleId = scheduleId, ApplicationId = appId, SalesEmployeeId = "NV00000003", AppointmentAt = new DateTime(2026, 7, 5, 9, 0, 0), Status = "hoan_thanh" });
            await db.SaveChangesAsync();
            if (!await db.RoomViewingScheduleRooms.AnyAsync(x => x.ScheduleId == scheduleId && x.RoomId == $"PHONG_{i + 11}")) db.RoomViewingScheduleRooms.Add(new RoomViewingScheduleRoom { ScheduleId = scheduleId, RoomId = $"PHONG_{i + 11}" });
            if (!await db.DepositSlips.AnyAsync(x => x.DepositId == depositId)) db.DepositSlips.Add(new DepositSlip { DepositId = depositId, ApplicationId = appId, SalesEmployeeId = "NV00000003", ManagerEmployeeId = "NV00000002", DepositAmount = 6000000, PaymentDueAt = new DateTime(2026, 7, 10, 8, 0, 0), PaidAt = new DateTime(2026, 7, 9, 9, 0, 0), Status = "hoan_thanh" });
            await db.SaveChangesAsync();
            if (i >= 4)
            {
                var contractId = $"HDNHAN{i:000000}";
                var status = i == 4 ? "cho_ky" : i == 5 ? "cho_thanh_toan_nhan_phong" : i == 6 ? "cho_xac_nhan_thanh_toan" : "hieu_luc";
                if (!await db.RentalContracts.AnyAsync(x => x.ContractId == contractId)) db.RentalContracts.Add(new RentalContract { ContractId = contractId, DepositId = depositId, CustomerId = "KH0000000001", SalesEmployeeId = "NV00000003", RoomId = $"PHONG_{i + 11}", NumberOfBeds = 1, MonthlyRent = 3000000, PaymentCycle = "hang_thang", SignedDate = today, StartDate = today.AddDays(15), EndDate = today.AddYears(1), Status = status });
                if (i >= 5 && !await db.Invoices.AnyAsync(x => x.InvoiceId == $"HDNNHAN{i:00000}")) db.Invoices.Add(new Invoice { InvoiceId = $"HDNNHAN{i:00000}", CustomerId = "KH0000000001", ContractId = contractId, AccountantEmployeeId = "NV00000004", InvoiceType = "tien_thue", DocumentType = "thu", TotalAmount = 3000000, ProofImageUrl = i >= 6 ? "demo/chung-tu/nhan-phong.jpg" : null, Status = i == 7 ? "da_thanh_toan" : "cho_thanh_toan" });
            }
        }
        await db.SaveChangesAsync();

        // Mỗi trạng thái hoàn cọc có một phòng, hồ sơ và phiếu cọc riêng; chưa có hợp đồng.
        for (var i = 0; i < refundStates.Length; i++)
        {
            var appId = $"HSDCOC{i:000000}"; var depositId = $"DCDCOC{i:000000}"; var scheduleId = $"LXDCOC{i:000000}";
            if (!await db.RentalApplications.AnyAsync(x => x.ApplicationId == appId)) db.RentalApplications.Add(new RentalApplication { ApplicationId = appId, CustomerId = "KH0000000001", SalesEmployeeId = "NV00000003", NumberOfPeople = 1, ExpectedMoveInDate = today.AddMonths(1), ExpectedRentalMonths = 6, DesiredArea = "Quận 5", DesiredRoomType = RoomType.Whole, Status = "da_dat_coc", CreatedAt = new DateTime(2026, 7, 1 + i, 8, 0, 0, DateTimeKind.Utc) });
            await db.SaveChangesAsync();
            if (!await db.RoomViewingSchedules.AnyAsync(x => x.ScheduleId == scheduleId)) db.RoomViewingSchedules.Add(new RoomViewingSchedule { ScheduleId = scheduleId, ApplicationId = appId, SalesEmployeeId = "NV00000003", AppointmentAt = new DateTime(2026, 7, 2 + i, 9, 0, 0), Status = "hoan_thanh" });
            await db.SaveChangesAsync();
            if (!await db.RoomViewingScheduleRooms.AnyAsync(x => x.ScheduleId == scheduleId && x.RoomId == $"PHONG_{i + 19}")) db.RoomViewingScheduleRooms.Add(new RoomViewingScheduleRoom { ScheduleId = scheduleId, RoomId = $"PHONG_{i + 19}" });
            if (!await db.DepositSlips.AnyAsync(x => x.DepositId == depositId)) db.DepositSlips.Add(new DepositSlip { DepositId = depositId, ApplicationId = appId, SalesEmployeeId = "NV00000003", ManagerEmployeeId = "NV00000002", DepositAmount = 6000000, CreatedAt = new DateTime(2026, 7, 3 + i, 8, 0, 0, DateTimeKind.Utc), PaymentDueAt = new DateTime(2026, 7, 4 + i, 8, 0, 0, DateTimeKind.Utc), PaidAt = new DateTime(2026, 7, 3 + i, 9, 0, 0, DateTimeKind.Utc), Status = refundStates[i], RefundReason = i > 0 ? "Dữ liệu demo yêu cầu hoàn cọc" : null, RefundRequestedAt = i > 0 ? new DateTime(2026, 7, 10, 8 + i, 0, 0, DateTimeKind.Utc) : null, RefundRate = i >= 3 ? 80 : null, RefundAmount = i >= 3 ? 4800000 : null, RefundedAt = i == 6 ? new DateTime(2026, 7, 11, 10, 0, 0, DateTimeKind.Utc) : null });
            await db.SaveChangesAsync();
        }
        await db.SaveChangesAsync();

        // Bốn nhánh tài chính cuối UC4: hoàn tiền, khách thu thêm, chờ xác nhận thu thêm, không phát sinh.
        for (var i = 0; i < 4; i++)
        {
            var roomNo = i + 37; var appId = $"HSDFIN{i:000000}"; var depositId = $"DCDFIN{i:000000}"; var contractId = $"HDDFIN{i:000000}"; var reconciliationId = $"DSDFIN{i:000000}";
            if (!await db.RentalApplications.AnyAsync(x => x.ApplicationId == appId)) db.RentalApplications.Add(new RentalApplication { ApplicationId = appId, CustomerId = "KH0000000001", SalesEmployeeId = "NV00000003", NumberOfPeople = 1, ExpectedMoveInDate = today.AddMonths(-6), ExpectedRentalMonths = 12, DesiredRoomType = RoomType.Whole, Status = "du_dieu_kien_nhan_phong" });
            await db.SaveChangesAsync();
            if (!await db.DepositSlips.AnyAsync(x => x.DepositId == depositId)) db.DepositSlips.Add(new DepositSlip { DepositId = depositId, ApplicationId = appId, SalesEmployeeId = "NV00000003", DepositAmount = 6000000, PaymentDueAt = DateTime.UtcNow, PaidAt = DateTime.UtcNow, Status = "hoan_thanh" });
            await db.SaveChangesAsync();
            if (!await db.RentalContracts.AnyAsync(x => x.ContractId == contractId)) db.RentalContracts.Add(new RentalContract { ContractId = contractId, DepositId = depositId, CustomerId = "KH0000000001", SalesEmployeeId = "NV00000003", RoomId = $"PHONG_{roomNo}", NumberOfBeds = 1, MonthlyRent = 3000000, PaymentCycle = "hang_thang", SignedDate = today.AddMonths(-6), StartDate = today.AddMonths(-6), EndDate = today.AddMonths(6), Status = i == 0 ? "cho_hoan_coc" : i < 3 ? "cho_khach_xac_nhan" : "cho_doi_soat" });
            await db.SaveChangesAsync();
            if (!await db.Reconciliations.AnyAsync(x => x.ReconciliationId == reconciliationId)) db.Reconciliations.Add(new Reconciliation { ReconciliationId = reconciliationId, ContractId = contractId, AccountantEmployeeId = "NV00000004", ManagerEmployeeId = "NV00000002", CreatedDate = today, RefundRate = i == 0 ? 80 : 0, OriginalDeposit = 6000000, BaseRefund = i == 0 ? 4800000 : 0, TotalDeductions = i is 1 or 2 ? 6500000 : 0, RefundAmount = i == 0 ? 4800000 : 0, AdditionalPaymentAmount = i is 1 or 2 ? 500000 : 0, Status = "da_xac_nhan" });
            await db.SaveChangesAsync();
            var invoiceType = i == 0 ? "hoan_coc" : "thu_them";
            if (i < 3 && !await db.Invoices.AnyAsync(x => x.InvoiceId == $"HDFIN{i:0000000}")) db.Invoices.Add(new Invoice { InvoiceId = $"HDFIN{i:0000000}", CustomerId = "KH0000000001", AccountantEmployeeId = "NV00000004", ContractId = contractId, ReconciliationId = reconciliationId, InvoiceType = invoiceType, DocumentType = i == 0 ? "chi" : "thu", TotalAmount = i == 0 ? 4800000 : 500000, ProofImageUrl = i == 2 ? "demo/chung-tu/thu-them.jpg" : null, Status = "cho_thanh_toan" });
        }
        await db.SaveChangesAsync();

        // Mỗi trạng thái trả phòng có một phòng và hợp đồng riêng.
        for (var i = 0; i < checkoutStates.Length; i++)
        {
            var appId = $"HSDTRA{i:000000}"; var depositId = $"DCDTRA{i:000000}"; var contractId = $"HDDTRA{i:000000}";
            if (!await db.RentalApplications.AnyAsync(x => x.ApplicationId == appId)) db.RentalApplications.Add(new RentalApplication { ApplicationId = appId, CustomerId = "KH0000000001", SalesEmployeeId = "NV00000003", NumberOfPeople = 1, ExpectedMoveInDate = today.AddMonths(-6), ExpectedRentalMonths = 12, DesiredArea = "Quận 5", DesiredRoomType = RoomType.Whole, Status = "du_dieu_kien_nhan_phong", CreatedAt = new DateTime(2026, 1, 2 + i, 8, 0, 0, DateTimeKind.Utc) });
            await db.SaveChangesAsync();
            if (!await db.DepositSlips.AnyAsync(x => x.DepositId == depositId)) db.DepositSlips.Add(new DepositSlip { DepositId = depositId, ApplicationId = appId, SalesEmployeeId = "NV00000003", ManagerEmployeeId = "NV00000002", DepositAmount = 6000000, CreatedAt = new DateTime(2026, 1, 3 + i, 8, 0, 0, DateTimeKind.Utc), PaymentDueAt = new DateTime(2026, 1, 4 + i, 8, 0, 0, DateTimeKind.Utc), PaidAt = new DateTime(2026, 1, 3 + i, 9, 0, 0, DateTimeKind.Utc), Status = "hoan_thanh" });
            await db.SaveChangesAsync();
            var contractStatus = checkoutStates[i] switch { "cho_tiep_nhan" => "cho_tra_phong", "da_xac_nhan_lich" or "cho_kiem_tra" => "cho_kiem_tra_tra_phong", "da_kiem_tra" or "cho_doi_soat" => "cho_doi_soat", "cho_khach_xac_nhan" => "cho_khach_xac_nhan", "cho_hoan_tien" => "cho_hoan_coc", "hoan_tat" => "thanh_ly", _ => "hieu_luc" };
            if (!await db.RentalContracts.AnyAsync(x => x.ContractId == contractId)) db.RentalContracts.Add(new RentalContract { ContractId = contractId, DepositId = depositId, CustomerId = "KH0000000001", SalesEmployeeId = "NV00000003", RoomId = $"PHONG_{i + 27}", NumberOfBeds = 1, MonthlyRent = 3000000, PaymentCycle = "hang_thang", SignedDate = today.AddMonths(-6), StartDate = today.AddMonths(-6), EndDate = today.AddMonths(6), Status = contractStatus });
            await db.SaveChangesAsync();
            var reconciliationId = i >= 4 ? $"DSDTRA{i:000000}" : null;
            if (reconciliationId is not null && !await db.Reconciliations.AnyAsync(x => x.ReconciliationId == reconciliationId)) db.Reconciliations.Add(new Reconciliation { ReconciliationId = reconciliationId, ContractId = contractId, AccountantEmployeeId = "NV00000004", ManagerEmployeeId = "NV00000002", CreatedDate = today, RefundRate = 80, OriginalDeposit = 6000000, BaseRefund = 4800000, TotalDeductions = 200000, RefundAmount = 4600000, AdditionalPaymentAmount = 0, Status = i >= 6 ? "da_xac_nhan" : "cho_xac_nhan" });
            await db.SaveChangesAsync();
            if (reconciliationId is not null && !await db.CheckoutReports.AnyAsync(x => x.CheckoutReportId == $"BTDTRA{i:000000}")) db.CheckoutReports.Add(new CheckoutReport { CheckoutReportId = $"BTDTRA{i:000000}", ReconciliationId = reconciliationId, ManagerEmployeeId = "NV00000002", CheckoutDate = today, RoomCondition = "Phòng sạch, có một khoản vệ sinh cuối kỳ", FinalElectricityReading = 1500 + i, FinalWaterReading = 400 + i, KeysReturned = i >= 4, Note = "Biên bản demo theo trạng thái trả phòng" });
            if (i > 0 && !await db.CheckoutRequests.AnyAsync(x => x.CheckoutRequestId == $"YTPD{i:0000000}")) db.CheckoutRequests.Add(new CheckoutRequest { CheckoutRequestId = $"YTPD{i:0000000}", ContractId = contractId, CustomerId = "KH0000000001", SalesEmployeeId = "NV00000003", ManagerEmployeeId = i >= 2 ? "NV00000002" : null, ReconciliationId = reconciliationId, RequestedCheckoutAt = new DateTime(2026, 8, 10 + i, 9, 0, 0), ConfirmedInspectionAt = i >= 2 ? new DateTime(2026, 8, 10 + i, 10, 0, 0) : null, Reason = "Dữ liệu demo theo trạng thái", Status = checkoutStates[i], CreatedAt = new DateTime(2026, 7, 12, 8 + i, 0, 0, DateTimeKind.Utc) });
            if (i >= 7 && !await db.Invoices.AnyAsync(x => x.InvoiceId == $"HDDTRA{i:000000}")) db.Invoices.Add(new Invoice { InvoiceId = $"HDDTRA{i:000000}", CustomerId = "KH0000000001", AccountantEmployeeId = "NV00000004", ContractId = contractId, ReconciliationId = reconciliationId, InvoiceType = "hoan_coc", DocumentType = "chi", TotalAmount = 4600000, PaymentMethod = "chuyen_khoan", BankName = "Vietcombank", BankAccountNumber = "0123456789", BankAccountHolder = "NGUYEN GIA BAO", CreatedAt = new DateTime(2026, 8, 20, 8, 0, 0, DateTimeKind.Utc), PaidAt = i == 8 ? new DateTime(2026, 8, 20, 10, 0, 0, DateTimeKind.Utc) : null, Status = i == 8 ? "da_thanh_toan" : "cho_thanh_toan", Note = "Hóa đơn hoàn cọc demo theo trạng thái" });
        }
        await db.SaveChangesAsync();
    }

    private static async Task SeedResidenceRulesAsync(AppDbContext db)
    {
        var rules = new[]
        {
            new ResidenceRule { ResidenceRuleId = "NQ_Q5_001", BranchId = "CN0000001", Title = "Giờ ra vào", Content = "Người thuê trở về chi nhánh trước 23:00; trường hợp về muộn phải báo trước cho bộ phận quản lý.", RuleType = "gio_giac", ViolationLevel = "nhac_nho", EffectiveFrom = new DateOnly(2026, 1, 1) },
            new ResidenceRule { ResidenceRuleId = "NQ_Q5_002", BranchId = "CN0000001", Title = "Giữ trật tự", Content = "Không gây tiếng ồn ảnh hưởng người ở khác trong khung giờ 22:00 đến 06:00.", RuleType = "trat_tu", ViolationLevel = "khau_tru_coc", DefaultPenaltyAmount = 200000, EffectiveFrom = new DateOnly(2026, 1, 1) },
            new ResidenceRule { ResidenceRuleId = "NQ_Q5_003", BranchId = "CN0000001", Title = "Người lưu trú", Content = "Chỉ những thành viên có tên trong hồ sơ và hợp đồng được lưu trú; khách đến thăm phải đăng ký.", RuleType = "luu_tru", ViolationLevel = "khau_tru_coc", DefaultPenaltyAmount = 500000, EffectiveFrom = new DateOnly(2026, 1, 1) },
            new ResidenceRule { ResidenceRuleId = "NQ_Q5_004", BranchId = "CN0000001", Title = "Tài sản và vệ sinh", Content = "Giữ gìn tài sản, vệ sinh khu ở; bồi thường thiệt hại theo hiện trạng và biên bản bàn giao.", RuleType = "tai_san", ViolationLevel = "boi_thuong", EffectiveFrom = new DateOnly(2026, 1, 1) },
            new ResidenceRule { ResidenceRuleId = "NQ_TD_001", BranchId = "CN0000002", Title = "Giờ ra vào", Content = "Người thuê trở về chi nhánh trước 23:30; trường hợp về muộn phải đăng ký với quản lý.", RuleType = "gio_giac", ViolationLevel = "nhac_nho", EffectiveFrom = new DateOnly(2026, 1, 1) },
            new ResidenceRule { ResidenceRuleId = "NQ_TD_002", BranchId = "CN0000002", Title = "Giữ trật tự", Content = "Không gây tiếng ồn trong khu lưu trú từ 22:00 đến 06:00.", RuleType = "trat_tu", ViolationLevel = "khau_tru_coc", DefaultPenaltyAmount = 200000, EffectiveFrom = new DateOnly(2026, 1, 1) },
            new ResidenceRule { ResidenceRuleId = "NQ_TD_003", BranchId = "CN0000002", Title = "Người lưu trú và gửi xe", Content = "Thành viên ở cùng phải có trong hồ sơ; phương tiện gửi tại chi nhánh phải được đăng ký.", RuleType = "luu_tru", ViolationLevel = "khau_tru_coc", DefaultPenaltyAmount = 500000, EffectiveFrom = new DateOnly(2026, 1, 1) },
            new ResidenceRule { ResidenceRuleId = "NQ_TD_004", BranchId = "CN0000002", Title = "Tài sản và vệ sinh", Content = "Giữ gìn tài sản, vệ sinh phòng và khu vực chung; bồi thường thiệt hại thực tế nếu làm mất hoặc hư hỏng.", RuleType = "tai_san", ViolationLevel = "boi_thuong", EffectiveFrom = new DateOnly(2026, 1, 1) },
        };
        foreach (var rule in rules)
            if (!await db.ResidenceRules.AnyAsync(x => x.ResidenceRuleId == rule.ResidenceRuleId)) db.ResidenceRules.Add(rule);
        await db.SaveChangesAsync();
    }

    private static async Task SeedRolesAndPermissionsAsync(AppDbContext db)
    {
        var roles = new[]
        {
            new SystemRole { RoleId = EmployeePosition.SystemAdmin, RoleName = "Quản trị hệ thống", Description = "Toàn quyền quản trị hệ thống" },
            new SystemRole { RoleId = EmployeePosition.Manager, RoleName = "Quản lý", Description = "Quản lý chi nhánh và xác nhận nghiệp vụ" },
            new SystemRole { RoleId = EmployeePosition.Sales, RoleName = "Nhân viên kinh doanh", Description = "Tiếp nhận đăng ký và lập hợp đồng" },
            new SystemRole { RoleId = EmployeePosition.Accountant, RoleName = "Kế toán", Description = "Xử lý thanh toán và đối soát" },
            new SystemRole { RoleId = "khach_hang", RoleName = "Khách hàng", Description = "Người đăng ký và thuê chỗ ở" },
        };
        var permissions = new[]
        {
            new Permission { PermissionId = "quan_ly_nguoi_dung", PermissionName = "Quản lý người dùng" },
            new Permission { PermissionId = "quan_ly_danh_muc", PermissionName = "Quản lý phòng, giường và dịch vụ" },
            new Permission { PermissionId = "tiep_nhan_dang_ky", PermissionName = "Tiếp nhận đăng ký thuê" },
            new Permission { PermissionId = "lap_hop_dong", PermissionName = "Lập hợp đồng" },
            new Permission { PermissionId = "phe_duyet_hop_dong", PermissionName = "Phê duyệt hợp đồng" },
            new Permission { PermissionId = "xac_nhan_thanh_toan", PermissionName = "Xác nhận thanh toán" },
            new Permission { PermissionId = "doi_soat_tra_phong", PermissionName = "Đối soát trả phòng" },
            new Permission { PermissionId = "dang_ky_thue", PermissionName = "Đăng ký thuê phòng" },
        };

        foreach (var item in roles)
            if (!await db.SystemRoles.AnyAsync(x => x.RoleId == item.RoleId)) db.SystemRoles.Add(item);
        foreach (var item in permissions)
            if (!await db.Permissions.AnyAsync(x => x.PermissionId == item.PermissionId)) db.Permissions.Add(item);
        await db.SaveChangesAsync();

        var grants = new Dictionary<string, string[]>
        {
            [EmployeePosition.SystemAdmin] = permissions.Select(x => x.PermissionId).ToArray(),
            [EmployeePosition.Manager] = ["phe_duyet_hop_dong", "doi_soat_tra_phong"],
            [EmployeePosition.Sales] = ["tiep_nhan_dang_ky", "lap_hop_dong"],
            [EmployeePosition.Accountant] = ["xac_nhan_thanh_toan", "doi_soat_tra_phong"],
            ["khach_hang"] = ["dang_ky_thue"],
        };
        foreach (var (roleId, permissionIds) in grants)
            foreach (var permissionId in permissionIds)
                if (!await db.RolePermissions.AnyAsync(x => x.RoleId == roleId && x.PermissionId == permissionId))
                    db.RolePermissions.Add(new RolePermission { RoleId = roleId, PermissionId = permissionId });
        await db.SaveChangesAsync();
    }

    private static async Task SeedBranchesAsync(AppDbContext db)
    {
        var branches = new[]
        {
            new Branch { BranchId = "CN0000001", BranchName = "Chi nhánh Quận 5", Address = "227 Nguyễn Văn Cừ, Phường Chợ Quán, TP.HCM", PhoneNumber = "02838354266", Email = "quan5@homestaydorm.vn" },
            new Branch { BranchId = "CN0000002", BranchName = "Chi nhánh Thủ Đức", Address = "12 Võ Văn Ngân, Phường Thủ Đức, TP.HCM", PhoneNumber = "02837221234", Email = "thuduc@homestaydorm.vn" },
        };
        foreach (var item in branches)
            if (!await db.Branches.AnyAsync(x => x.BranchId == item.BranchId)) db.Branches.Add(item);
        await db.SaveChangesAsync();
    }

    private static async Task SeedUsersAsync(AppDbContext db)
    {
        var employees = new[]
        {
            ("NV00000001", "CN0000001", "Nguyễn Hoàng Admin", "admin", EmployeePosition.SystemAdmin, "admin@homestaydorm.vn", "0901000001", DefaultAdminPassword),
            ("NV00000002", "CN0000001", "Trần Minh Quản", "manager", EmployeePosition.Manager, "manager@homestaydorm.vn", "0901000002", DemoPassword),
            ("NV00000003", "CN0000001", "Lê Thu Sale", "sales", EmployeePosition.Sales, "sales@homestaydorm.vn", "0901000003", DemoPassword),
            ("NV00000004", "CN0000001", "Phạm Ngọc Kế Toán", "accountant", EmployeePosition.Accountant, "accountant@homestaydorm.vn", "0901000004", DemoPassword),
            ("NV00000005", "CN0000002", "Võ Hải Nam", "sales.td", EmployeePosition.Sales, "sales.td@homestaydorm.vn", "0901000005", DemoPassword),
        };
        foreach (var e in employees)
        {
            if (!await db.Employees.AnyAsync(x => x.EmployeeId == e.Item1))
                db.Employees.Add(new Employee { EmployeeId = e.Item1, BranchId = e.Item2, FullName = e.Item3, Position = e.Item5, Email = e.Item6, PhoneNumber = e.Item7, HireDate = new DateOnly(2025, 1, 2), IsActive = true });
            if (!await db.Accounts.AnyAsync(x => x.Username == e.Item4))
                db.Accounts.Add(new Account { AccountId = $"TK{e.Item1[2..]}", Username = e.Item4, PasswordHash = BCrypt.Net.BCrypt.HashPassword(e.Item8), RoleId = e.Item5, EmployeeId = e.Item1, VerifiedEmail = e.Item6, Status = AccountStatus.Active });
        }

        var customers = new[]
        {
            ("KH0000000001", "Nguyễn Gia Bảo", "079203000001", "0912000001", "bao.nguyen@example.com", "Nam", new DateOnly(2003, 5, 12), "customer1"),
            ("KH0000000002", "Trần Thảo My", "079204000002", "0912000002", "my.tran@example.com", "Nữ", new DateOnly(2004, 8, 20), "customer2"),
            ("KH0000000003", "Lê Quốc Anh", "079202000003", "0912000003", "anh.le@example.com", "Nam", new DateOnly(2002, 11, 3), "customer3"),
        };
        foreach (var c in customers)
        {
            if (!await db.Customers.AnyAsync(x => x.CustomerId == c.Item1))
                db.Customers.Add(new Customer { CustomerId = c.Item1, FullName = c.Item2, NationalId = c.Item3, PhoneNumber = c.Item4, Email = c.Item5, Gender = c.Item6, DateOfBirth = c.Item7, Nationality = "Việt Nam", Address = "TP.HCM" });
            if (!await db.Accounts.AnyAsync(x => x.Username == c.Item8))
                db.Accounts.Add(new Account { AccountId = $"TKKH{c.Item1[4..]}", Username = c.Item8, PasswordHash = BCrypt.Net.BCrypt.HashPassword(DemoPassword), RoleId = "khach_hang", CustomerId = c.Item1, VerifiedEmail = c.Item5, Status = AccountStatus.Active });
        }
        await db.SaveChangesAsync();
    }

    private static async Task SeedSystemParametersAsync(AppDbContext db)
    {
        var items = new[]
        {
            new SystemParameter { ParameterId = "tien_coc_so_thang", ParameterName = "Số tháng tiền thuê dùng tính cọc", ParameterGroup = "chinh_sach_coc", Value = "2", DataType = SystemParameterDataType.Number, Description = "Tiền cọc bằng tiền thuê hai tháng nhân số giường thuê." },
            new SystemParameter { ParameterId = "han_thanh_toan_coc", ParameterName = "Thời hạn thanh toán cọc", ParameterGroup = "chinh_sach_coc", Value = "24", DataType = SystemParameterDataType.Number, Description = "Số giờ khách được phép hoàn tất thanh toán cọc." },
            new SystemParameter { ParameterId = "hoan_coc_chua_ky", ParameterName = "Hoàn cọc khi chưa ký hợp đồng", ParameterGroup = "chinh_sach_hoan_coc", Value = "80", DataType = SystemParameterDataType.Number },
            new SystemParameter { ParameterId = "hoan_coc_duoi_6_thang", ParameterName = "Hoàn cọc khi ở dưới 6 tháng", ParameterGroup = "chinh_sach_hoan_coc", Value = "50", DataType = SystemParameterDataType.Number },
            new SystemParameter { ParameterId = "hoan_coc_tren_6_thang", ParameterName = "Hoàn cọc khi ở trên 6 tháng", ParameterGroup = "chinh_sach_hoan_coc", Value = "70", DataType = SystemParameterDataType.Number },
            new SystemParameter { ParameterId = "hoan_coc_dung_han", ParameterName = "Hoàn cọc khi hết hạn hợp đồng", ParameterGroup = "chinh_sach_hoan_coc", Value = "100", DataType = SystemParameterDataType.Number },
        };
        foreach (var item in items)
            if (!await db.SystemParameters.AnyAsync(x => x.ParameterId == item.ParameterId)) db.SystemParameters.Add(item);
        await db.SaveChangesAsync();
    }

    private static async Task SeedRoomsAndBedsAsync(AppDbContext db)
    {
        var rooms = new[]
        {
            new Room { RoomId = "P_Q5_101", BranchId = "CN0000001", RoomName = "Phòng 101", RoomType = RoomType.Shared, Capacity = 4, Area = "Khu A - Nam", RoomPrice = 6000000, Floor = 1, AreaSquareMeters = 28, Description = "Phòng ở ghép thoáng, gần khu sinh hoạt chung.", AllowedGender = "nam", RequiresQuietLifestyle = true, CurfewTime = new TimeOnly(23, 0), HasAirConditioner = true, HasParking = true, Status = RoomBedStatus.Empty },
            new Room { RoomId = "P_Q5_102", BranchId = "CN0000001", RoomName = "Phòng 102", RoomType = RoomType.Shared, Capacity = 4, Area = "Khu A - Nữ", RoomPrice = 6200000, Floor = 1, AreaSquareMeters = 30, Description = "Phòng nữ ở ghép, có cửa sổ và điều hòa.", AllowedGender = "nu", RequiresQuietLifestyle = true, CurfewTime = new TimeOnly(23, 0), HasAirConditioner = true, HasParking = true, Status = RoomBedStatus.Rented },
            new Room { RoomId = "P_Q5_201", BranchId = "CN0000001", RoomName = "Phòng 201", RoomType = RoomType.Whole, Capacity = 2, Area = "Khu B", RoomPrice = 4500000, Floor = 2, AreaSquareMeters = 24, Description = "Phòng nguyên căn dành cho tối đa hai người.", AllowedGender = "khong_gioi_han", RequiresQuietLifestyle = false, HasAirConditioner = true, HasParking = false, Status = RoomBedStatus.Deposited },
            new Room { RoomId = "P_Q5_202", BranchId = "CN0000001", RoomName = "Phòng 202", RoomType = RoomType.Whole, Capacity = 2, Area = "Khu B", RoomPrice = 4200000, Floor = 2, AreaSquareMeters = 22, Description = "Phòng nguyên căn tiêu chuẩn dành cho tối đa hai người.", AllowedGender = "khong_gioi_han", RequiresQuietLifestyle = false, HasAirConditioner = false, HasParking = true, Status = RoomBedStatus.Empty },
            new Room { RoomId = "P_TD_101", BranchId = "CN0000002", RoomName = "Phòng 101", RoomType = RoomType.Shared, Capacity = 6, Area = "Khu C - Nam", RoomPrice = 7800000, Floor = 1, AreaSquareMeters = 36, Description = "Phòng ở ghép rộng, phù hợp sinh viên.", AllowedGender = "nam", RequiresQuietLifestyle = false, CurfewTime = new TimeOnly(23, 30), HasAirConditioner = true, HasParking = true, Status = RoomBedStatus.Empty },
            new Room { RoomId = "P_TD_102", BranchId = "CN0000002", RoomName = "Phòng 102", RoomType = RoomType.Shared, Capacity = 4, Area = "Khu C - Nữ", RoomPrice = 5600000, Floor = 1, AreaSquareMeters = 30, Description = "Phòng nữ ở ghép, đầy đủ bàn học và tủ cá nhân.", AllowedGender = "nu", RequiresQuietLifestyle = true, CurfewTime = new TimeOnly(23, 0), HasAirConditioner = true, HasParking = true, Status = RoomBedStatus.Empty },
            new Room { RoomId = "P_TD_201", BranchId = "CN0000002", RoomName = "Phòng 201", RoomType = RoomType.Whole, Capacity = 2, Area = "Khu D", RoomPrice = 4000000, Floor = 2, AreaSquareMeters = 23, Description = "Phòng nguyên căn nhỏ gọn dành cho một đến hai người.", AllowedGender = "khong_gioi_han", RequiresQuietLifestyle = false, HasAirConditioner = true, HasParking = true, Status = RoomBedStatus.Deposited },
            new Room { RoomId = "P_Q5_301", BranchId = "CN0000001", RoomName = "Phòng 301", RoomType = RoomType.Whole, Capacity = 3, Area = "Khu B", RoomPrice = 5800000, Floor = 3, AreaSquareMeters = 32, Description = "Phòng nguyên căn rộng, phù hợp nhóm ba người.", AllowedGender = "khong_gioi_han", RequiresQuietLifestyle = true, CurfewTime = new TimeOnly(23, 30), HasAirConditioner = true, HasParking = true, Status = RoomBedStatus.Empty },
        };
        foreach (var item in rooms)
        {
            var existing = await db.Rooms.FirstOrDefaultAsync(x => x.RoomId == item.RoomId);
            if (existing is null)
            {
                db.Rooms.Add(item);
                continue;
            }

            // Keep seed idempotent while backfilling presentation fields for databases
            // that already contained the original demo rooms.
            existing.Floor = item.Floor;
            existing.AreaSquareMeters = item.AreaSquareMeters;
            existing.Description = item.Description;
            existing.AllowedGender = item.AllowedGender;
            existing.RequiresQuietLifestyle = item.RequiresQuietLifestyle;
            existing.CurfewTime = item.CurfewTime;
        }
        await db.SaveChangesAsync();

        var beds = new List<Bed>();
        foreach (var room in rooms)
            for (short number = 1; number <= room.Capacity; number++)
            {
                var status = room.Status == RoomBedStatus.Empty && number > 1 ? RoomBedStatus.Empty : room.Status;
                if (room.RoomId == "P_Q5_101" && number == 1) status = RoomBedStatus.Rented;
                beds.Add(new Bed { BedId = $"G{room.RoomId.Replace("_", "")}{number}", RoomId = room.RoomId, BedNumber = number, MonthlyRent = room.RoomPrice!.Value / room.Capacity, Status = status });
            }
        foreach (var item in beds)
            if (!await db.Beds.AnyAsync(x => x.BedId == item.BedId)) db.Beds.Add(item);
        await db.SaveChangesAsync();
    }

    private static async Task SeedRoomPresentationDataAsync(AppDbContext db)
    {
        var amenities = new[]
        {
            new Amenity { AmenityId = "wifi", AmenityName = "WiFi", Description = "Internet không dây" },
            new Amenity { AmenityId = "tu_ca_nhan", AmenityName = "Tủ cá nhân", Description = "Tủ riêng cho từng người ở" },
            new Amenity { AmenityId = "ban_hoc", AmenityName = "Bàn học", Description = "Bàn học/làm việc" },
            new Amenity { AmenityId = "nem", AmenityName = "Nệm", Description = "Nệm đi kèm giường" },
            new Amenity { AmenityId = "nuoc_nong", AmenityName = "Nước nóng", Description = "Máy nước nóng dùng chung" },
        };
        foreach (var item in amenities)
            if (!await db.Amenities.AnyAsync(x => x.AmenityId == item.AmenityId)) db.Amenities.Add(item);
        await db.SaveChangesAsync();

        var roomAmenities = new[]
        {
            new RoomAmenity { RoomId = "P_Q5_101", AmenityId = "wifi" },
            new RoomAmenity { RoomId = "P_Q5_101", AmenityId = "tu_ca_nhan", Quantity = 4 },
            new RoomAmenity { RoomId = "P_Q5_101", AmenityId = "ban_hoc", Quantity = 2 },
            new RoomAmenity { RoomId = "P_Q5_101", AmenityId = "nem", Quantity = 4 },
            new RoomAmenity { RoomId = "P_Q5_102", AmenityId = "wifi" },
            new RoomAmenity { RoomId = "P_Q5_102", AmenityId = "tu_ca_nhan", Quantity = 4 },
            new RoomAmenity { RoomId = "P_Q5_201", AmenityId = "wifi" },
            new RoomAmenity { RoomId = "P_Q5_201", AmenityId = "nuoc_nong" },
            new RoomAmenity { RoomId = "P_TD_101", AmenityId = "wifi" },
            new RoomAmenity { RoomId = "P_TD_101", AmenityId = "tu_ca_nhan", Quantity = 6 },
            new RoomAmenity { RoomId = "P_TD_101", AmenityId = "ban_hoc", Quantity = 3 },
            new RoomAmenity { RoomId = "P_TD_102", AmenityId = "wifi" },
            new RoomAmenity { RoomId = "P_TD_102", AmenityId = "tu_ca_nhan", Quantity = 4 },
            new RoomAmenity { RoomId = "P_TD_102", AmenityId = "ban_hoc", Quantity = 2 },
            new RoomAmenity { RoomId = "P_TD_102", AmenityId = "nem", Quantity = 4 },
            new RoomAmenity { RoomId = "P_TD_201", AmenityId = "wifi" },
            new RoomAmenity { RoomId = "P_TD_201", AmenityId = "nuoc_nong" },
            new RoomAmenity { RoomId = "P_Q5_301", AmenityId = "wifi" },
            new RoomAmenity { RoomId = "P_Q5_301", AmenityId = "nuoc_nong" },
            new RoomAmenity { RoomId = "P_Q5_301", AmenityId = "ban_hoc", Quantity = 2 },
        };
        foreach (var item in roomAmenities)
            if (!await db.RoomAmenities.AnyAsync(x => x.RoomId == item.RoomId && x.AmenityId == item.AmenityId)) db.RoomAmenities.Add(item);

        var images = new[]
        {
            new RoomImage { RoomImageId = "HAQ51010101", RoomId = "P_Q5_101", ImageUrl = "/images/rooms/p-q5-101-1.jpg", Description = "Ảnh tổng quan phòng 101", DisplayOrder = 1, IsPrimary = true },
            new RoomImage { RoomImageId = "HAQ51010201", RoomId = "P_Q5_102", ImageUrl = "/images/rooms/p-q5-102-1.jpg", Description = "Ảnh tổng quan phòng 102", DisplayOrder = 1, IsPrimary = true },
            new RoomImage { RoomImageId = "HAQ52010101", RoomId = "P_Q5_201", ImageUrl = "/images/rooms/p-q5-201-1.jpg", Description = "Ảnh tổng quan phòng 201", DisplayOrder = 1, IsPrimary = true },
            new RoomImage { RoomImageId = "HATD101001", RoomId = "P_TD_101", ImageUrl = "/images/rooms/p-td-101-1.jpg", Description = "Ảnh tổng quan phòng TD101", DisplayOrder = 1, IsPrimary = true },
            new RoomImage { RoomImageId = "HATD102001", RoomId = "P_TD_102", ImageUrl = "/images/rooms/p-td-102-1.jpg", Description = "Ảnh tổng quan phòng TD102", DisplayOrder = 1, IsPrimary = true },
            new RoomImage { RoomImageId = "HATD201001", RoomId = "P_TD_201", ImageUrl = "/images/rooms/p-td-201-1.jpg", Description = "Ảnh tổng quan phòng TD201", DisplayOrder = 1, IsPrimary = true },
            new RoomImage { RoomImageId = "HAQ5301001", RoomId = "P_Q5_301", ImageUrl = "/images/rooms/p-q5-301-1.jpg", Description = "Ảnh tổng quan phòng 301", DisplayOrder = 1, IsPrimary = true },
        };
        foreach (var item in images)
            if (!await db.RoomImages.AnyAsync(x => x.RoomImageId == item.RoomImageId)) db.RoomImages.Add(item);

        await db.SaveChangesAsync();
    }

    private static async Task SeedServicesAsync(AppDbContext db)
    {
        var items = new[]
        {
            new Service { ServiceId = "DV00000001", ServiceName = "Điện sinh hoạt", ServiceType = ServiceType.Electricity, Unit = "kWh", UnitPrice = 4000, Description = "Tính theo chỉ số công tơ hàng tháng" },
            new Service { ServiceId = "DV00000002", ServiceName = "Nước sinh hoạt", ServiceType = ServiceType.Water, Unit = "m3", UnitPrice = 20000, Description = "Tính theo chỉ số đồng hồ nước" },
            new Service { ServiceId = "DV00000003", ServiceName = "Internet WiFi", ServiceType = ServiceType.Wifi, Unit = "phòng/tháng", UnitPrice = 150000 },
            new Service { ServiceId = "DV00000004", ServiceName = "Vệ sinh phòng", ServiceType = ServiceType.Cleaning, Unit = "lần", UnitPrice = 80000 },
            new Service { ServiceId = "DV00000005", ServiceName = "Gửi xe máy", ServiceType = ServiceType.Other, Unit = "xe/tháng", UnitPrice = 100000 },
        };
        foreach (var item in items)
            if (!await db.Services.AnyAsync(x => x.ServiceId == item.ServiceId)) db.Services.Add(item);
        await db.SaveChangesAsync();
    }

    private static async Task SeedWorkflowDemoAsync(AppDbContext db)
    {
        var assets = new[]
        {
            new Asset { AssetId = "TS0000000001", RoomId = "P_Q5_101", AssetName = "Giường tầng", Description = "Giường sắt hai tầng", Condition = "tot" },
            new Asset { AssetId = "TS0000000002", RoomId = "P_Q5_101", AssetName = "Tủ cá nhân", Description = "Tủ khóa riêng", Condition = "tot" },
            new Asset { AssetId = "TS0000000003", RoomId = "P_Q5_101", AssetName = "Chìa khóa", Description = "Chìa khóa phòng", Condition = "tot" },
        };
        foreach (var item in assets)
            if (!await db.Assets.AnyAsync(x => x.AssetId == item.AssetId)) db.Assets.Add(item);

        // Sale: hồ sơ mới cần tiếp nhận, tư vấn và sắp lịch xem.
        db.RentalApplications.Add(new RentalApplication
        {
            ApplicationId = "HS0000000004", CustomerId = "KH0000000002", NumberOfPeople = 2,
            ExpectedMoveInDate = new DateOnly(2026, 9, 1), ExpectedRentalMonths = 6, DesiredArea = "Thủ Đức",
            DesiredRoomType = RoomType.Shared, MinimumPrice = 1200000, MaximumPrice = 1700000, Gender = "Nu",
            LivingSchedule = "Về trước 22:30", RequiresQuietLifestyle = true, RequiresParking = true,
            RequiresAirConditioner = true, OtherRequirements = "Cần hai giường cùng phòng", Status = "moi",
            CreatedAt = new DateTime(2026, 7, 12, 7, 30, 0, DateTimeKind.Utc),
        });

        // Quản lý: hồ sơ đã xem và đã gửi yêu cầu cọc, đang chờ rà soát điều kiện lưu trú/phòng.
        db.RentalApplications.Add(new RentalApplication
        {
            ApplicationId = "HS0000000005", CustomerId = "KH0000000002", SalesEmployeeId = "NV00000005",
            NumberOfPeople = 1, ExpectedMoveInDate = new DateOnly(2026, 8, 20), ExpectedRentalMonths = 12,
            DesiredArea = "Thủ Đức", DesiredRoomType = RoomType.Shared, MinimumPrice = 1200000, MaximumPrice = 1600000,
            Gender = "Nu", LivingSchedule = "Về trước 23:00", RequiresQuietLifestyle = true, RequiresParking = false,
            RequiresAirConditioner = true, Status = "cho_ra_soat_coc", CreatedAt = new DateTime(2026, 7, 10, 8, 0, 0, DateTimeKind.Utc),
        });

        // Kế toán: hồ sơ đã được duyệt cọc, có phiếu và hóa đơn chờ xác nhận thanh toán.
        db.RentalApplications.Add(new RentalApplication
        {
            ApplicationId = "HS0000000006", CustomerId = "KH0000000003", SalesEmployeeId = "NV00000003",
            NumberOfPeople = 3, ExpectedMoveInDate = new DateOnly(2026, 8, 10), ExpectedRentalMonths = 12,
            DesiredArea = "Quận 5", DesiredRoomType = RoomType.Whole, MinimumPrice = 5000000, MaximumPrice = 6000000,
            Gender = "Nam", LivingSchedule = "Không yêu cầu", RequiresParking = true, RequiresAirConditioner = true,
            Status = "da_dat_coc", CreatedAt = new DateTime(2026, 7, 9, 9, 0, 0, DateTimeKind.Utc),
        });
        await db.SaveChangesAsync();

        db.RoomViewingSchedules.AddRange(
            new RoomViewingSchedule { ScheduleId = "LX0000000005", ApplicationId = "HS0000000005", SalesEmployeeId = "NV00000005", AppointmentAt = new DateTime(2026, 7, 11, 9, 0, 0), Status = "hoan_thanh", Note = "Khách đồng ý chọn giường tại phòng TD102" },
            new RoomViewingSchedule { ScheduleId = "LX0000000006", ApplicationId = "HS0000000006", SalesEmployeeId = "NV00000003", AppointmentAt = new DateTime(2026, 7, 10, 15, 30, 0), Status = "hoan_thanh", Note = "Khách chọn thuê nguyên phòng 301" });
        await db.SaveChangesAsync();
        db.RoomViewingScheduleRooms.AddRange(
            new RoomViewingScheduleRoom { ScheduleId = "LX0000000005", RoomId = "P_TD_102" },
            new RoomViewingScheduleRoom { ScheduleId = "LX0000000006", RoomId = "P_Q5_301" });
        db.TenantMembers.AddRange(
            new TenantMember { TenantMemberId = "TV0000000005", ApplicationId = "HS0000000005", CustomerId = "KH0000000002", FullName = "Trần Thảo My", NationalId = "079204000002", Gender = "Nu", DateOfBirth = new DateOnly(2004, 8, 20), Nationality = "Việt Nam", DocumentType = "CCCD", DocumentImageUrl = "demo/ho-so/HS0000000005/cccd.jpg", PermanentAddress = "TP.HCM", OccupationOrSchool = "Sinh viên", IsPrimaryTenant = true, IsEligible = true },
            new TenantMember { TenantMemberId = "TV0000000006", ApplicationId = "HS0000000006", CustomerId = "KH0000000003", FullName = "Lê Quốc Anh", NationalId = "079202000003", Gender = "Nam", DateOfBirth = new DateOnly(2002, 11, 3), Nationality = "Việt Nam", DocumentType = "CCCD", DocumentImageUrl = "demo/ho-so/HS0000000006/cccd.jpg", PermanentAddress = "TP.HCM", OccupationOrSchool = "Kỹ sư", IsPrimaryTenant = true, IsEligible = true },
            new TenantMember { TenantMemberId = "TV0000000007", ApplicationId = "HS0000000006", FullName = "Phạm Minh Khang", NationalId = "079202000007", Gender = "Nam", DocumentType = "CCCD", OccupationOrSchool = "Sinh viên", IsPrimaryTenant = false, IsEligible = true },
            new TenantMember { TenantMemberId = "TV0000000008", ApplicationId = "HS0000000006", FullName = "Vũ Hoàng Long", NationalId = "079202000008", Gender = "Nam", DocumentType = "CCCD", OccupationOrSchool = "Nhân viên văn phòng", IsPrimaryTenant = false, IsEligible = true });
        db.DepositSlips.Add(new DepositSlip { DepositId = "DC0000000003", ApplicationId = "HS0000000006", SalesEmployeeId = "NV00000003", ManagerEmployeeId = "NV00000002", DepositAmount = 11600000, CreatedAt = new DateTime(2026, 7, 12, 8, 0, 0, DateTimeKind.Utc), PaymentDueAt = new DateTime(2026, 7, 13, 8, 0, 0, DateTimeKind.Utc), Status = "cho_thanh_toan" });
        await db.SaveChangesAsync();

        if (!await db.RentalApplications.AnyAsync(x => x.ApplicationId == "HS0000000001"))
            db.RentalApplications.Add(new RentalApplication
            {
                ApplicationId = "HS0000000001", CustomerId = "KH0000000001", SalesEmployeeId = "NV00000003",
                NumberOfPeople = 1, ExpectedMoveInDate = new DateOnly(2026, 8, 1), ExpectedRentalMonths = 12,
                DesiredArea = "Quận 5", DesiredRoomType = RoomType.Shared, MinimumPrice = 1000000, MaximumPrice = 2000000,
                Gender = "Nam", LivingSchedule = "Về trước 23:00", RequiresQuietLifestyle = true,
                RequiresParking = true, RequiresAirConditioner = true, OtherRequirements = "Ưu tiên phòng ít người",
                Status = "da_dat_coc", CreatedAt = new DateTime(2026, 7, 8, 8, 0, 0, DateTimeKind.Utc),
            });
        await db.SaveChangesAsync();

        if (!await db.RoomViewingSchedules.AnyAsync(x => x.ScheduleId == "LX0000000001"))
            db.RoomViewingSchedules.Add(new RoomViewingSchedule { ScheduleId = "LX0000000001", ApplicationId = "HS0000000001", SalesEmployeeId = "NV00000003", AppointmentAt = new DateTime(2026, 7, 10, 9, 0, 0), Status = "hoan_thanh", Note = "Khách đã xem phòng" });
        await db.SaveChangesAsync();
        if (!await db.RoomViewingScheduleRooms.AnyAsync(x => x.ScheduleId == "LX0000000001" && x.RoomId == "P_Q5_101"))
            db.RoomViewingScheduleRooms.Add(new RoomViewingScheduleRoom { ScheduleId = "LX0000000001", RoomId = "P_Q5_101" });

        if (!await db.RentalApplications.AnyAsync(x => x.ApplicationId == "HS0000000002"))
            db.RentalApplications.Add(new RentalApplication
            {
                ApplicationId = "HS0000000002", CustomerId = "KH0000000001", SalesEmployeeId = "NV00000003",
                NumberOfPeople = 1, ExpectedMoveInDate = new DateOnly(2026, 8, 15), ExpectedRentalMonths = 12,
                DesiredArea = "Thủ Đức", DesiredRoomType = RoomType.Shared, MinimumPrice = 1000000, MaximumPrice = 1800000,
                Gender = "Nam", LivingSchedule = "Về trước 23:00", RequiresQuietLifestyle = true,
                RequiresParking = true, RequiresAirConditioner = true, OtherRequirements = "Ưu tiên giường gần cửa sổ",
                Status = "da_xem_phong", CreatedAt = new DateTime(2026, 7, 9, 8, 0, 0, DateTimeKind.Utc),
            });
        await db.SaveChangesAsync();
        if (!await db.RoomViewingSchedules.AnyAsync(x => x.ScheduleId == "LX0000000002"))
            db.RoomViewingSchedules.Add(new RoomViewingSchedule { ScheduleId = "LX0000000002", ApplicationId = "HS0000000002", SalesEmployeeId = "NV00000003", AppointmentAt = new DateTime(2026, 7, 11, 14, 0, 0), Status = "hoan_thanh", Note = "Khách đã xem phòng và quan tâm giường còn trống" });
        await db.SaveChangesAsync();
        if (!await db.RoomViewingScheduleRooms.AnyAsync(x => x.ScheduleId == "LX0000000002" && x.RoomId == "P_TD_101"))
            db.RoomViewingScheduleRooms.Add(new RoomViewingScheduleRoom { ScheduleId = "LX0000000002", RoomId = "P_TD_101" });
        if (!await db.TenantMembers.AnyAsync(x => x.TenantMemberId == "TV0000000002"))
            db.TenantMembers.Add(new TenantMember
            {
                TenantMemberId = "TV0000000002", ApplicationId = "HS0000000002", CustomerId = "KH0000000001",
                FullName = "Nguyễn Gia Bảo", Gender = "Nam", Nationality = "Việt Nam", DocumentType = "CCCD",
                NationalId = "079203000001", DateOfBirth = new DateOnly(2003, 5, 12), PermanentAddress = "25 Nguyễn Trãi, Quận 5, TP.HCM",
                DocumentImageUrl = "demo/ho-so/HS0000000002/cccd-nguyen-gia-bao.jpg",
                FinancialDocumentUrl = "demo/ho-so/HS0000000002/xac-nhan-sinh-vien.pdf", OccupationOrSchool = "Sinh viên Đại học Công nghệ",
                IsPrimaryTenant = true, IsEligible = true, Note = "Thông tin người đứng tên nhập khi đăng ký xem phòng",
            });

        if (!await db.RentalApplications.AnyAsync(x => x.ApplicationId == "HS0000000003"))
            db.RentalApplications.Add(new RentalApplication { ApplicationId = "HS0000000003", CustomerId = "KH0000000001", SalesEmployeeId = "NV00000003", NumberOfPeople = 2, ExpectedMoveInDate = new DateOnly(2026, 8, 1), ExpectedRentalMonths = 12, DesiredArea = "Quận 5", DesiredRoomType = RoomType.Whole, MinimumPrice = 4000000, MaximumPrice = 5000000, Gender = "Nam", LivingSchedule = "Không yêu cầu", RequiresParking = true, RequiresAirConditioner = true, Status = "du_dieu_kien_nhan_phong", CreatedAt = new DateTime(2026, 7, 8, 9, 0, 0, DateTimeKind.Utc) });
        await db.SaveChangesAsync();
        if (!await db.RoomViewingSchedules.AnyAsync(x => x.ScheduleId == "LX0000000003"))
            db.RoomViewingSchedules.Add(new RoomViewingSchedule { ScheduleId = "LX0000000003", ApplicationId = "HS0000000003", SalesEmployeeId = "NV00000003", AppointmentAt = new DateTime(2026, 7, 10, 15, 0, 0), Status = "hoan_thanh", Note = "Khách đã xem phòng nguyên căn" });
        await db.SaveChangesAsync();
        if (!await db.RoomViewingScheduleRooms.AnyAsync(x => x.ScheduleId == "LX0000000003" && x.RoomId == "P_Q5_201"))
            db.RoomViewingScheduleRooms.Add(new RoomViewingScheduleRoom { ScheduleId = "LX0000000003", RoomId = "P_Q5_201" });
        if (!await db.TenantMembers.AnyAsync(x => x.TenantMemberId == "TV0000000003"))
            db.TenantMembers.Add(new TenantMember { TenantMemberId = "TV0000000003", ApplicationId = "HS0000000003", CustomerId = "KH0000000001", FullName = "Nguyễn Gia Bảo", Gender = "Nam", Nationality = "Việt Nam", DocumentType = "CCCD", NationalId = "079203000001", DocumentImageUrl = "demo/ho-so/HS0000000003/cccd-nguyen-gia-bao.jpg", DateOfBirth = new DateOnly(2003, 5, 12), PermanentAddress = "25 Nguyễn Trãi, Quận 5, TP.HCM", OccupationOrSchool = "Sinh viên Đại học Công nghệ", IsPrimaryTenant = true, IsEligible = true });
        if (!await db.TenantMembers.AnyAsync(x => x.TenantMemberId == "TV0000000004"))
            db.TenantMembers.Add(new TenantMember { TenantMemberId = "TV0000000004", ApplicationId = "HS0000000003", FullName = "Phạm Minh Khang", Gender = "Nam", Nationality = "Việt Nam", DocumentType = "CCCD", NationalId = "079203000004", DocumentImageUrl = "demo/ho-so/HS0000000003/cccd-pham-minh-khang.jpg", DateOfBirth = new DateOnly(2003, 9, 18), PermanentAddress = "18 Lý Thường Kiệt, Quận 10, TP.HCM", OccupationOrSchool = "Sinh viên Đại học Bách khoa", IsPrimaryTenant = false, IsEligible = true, Note = "Đã được Quản lý xác nhận đủ điều kiện ở cùng" });
        if (!await db.DepositSlips.AnyAsync(x => x.DepositId == "DC0000000002"))
            db.DepositSlips.Add(new DepositSlip { DepositId = "DC0000000002", ApplicationId = "HS0000000003", SalesEmployeeId = "NV00000003", ManagerEmployeeId = "NV00000002", DepositAmount = 9000000, CreatedAt = new DateTime(2026, 7, 11, 8, 0, 0, DateTimeKind.Utc), PaymentDueAt = new DateTime(2026, 7, 12, 8, 0, 0, DateTimeKind.Utc), PaidAt = new DateTime(2026, 7, 11, 10, 0, 0, DateTimeKind.Utc), Status = "hoan_thanh" });

        // Phòng đã cọc nhưng chưa bổ sung hồ sơ nhận phòng, dùng để demo bước UC3 trước khi Quản lý duyệt.
        if (!await db.RentalApplications.AnyAsync(x => x.ApplicationId == "HS0000000007"))
            db.RentalApplications.Add(new RentalApplication { ApplicationId = "HS0000000007", CustomerId = "KH0000000001", SalesEmployeeId = "NV00000005", NumberOfPeople = 1, ExpectedMoveInDate = new DateOnly(2026, 9, 1), ExpectedRentalMonths = 6, DesiredArea = "Thủ Đức", DesiredRoomType = RoomType.Whole, MinimumPrice = 3500000, MaximumPrice = 4500000, Gender = "Nam", LivingSchedule = "Về trước 23:00", RequiresParking = true, RequiresAirConditioner = true, Status = "da_dat_coc", CreatedAt = new DateTime(2026, 7, 12, 10, 0, 0, DateTimeKind.Utc) });
        await db.SaveChangesAsync();
        if (!await db.RoomViewingSchedules.AnyAsync(x => x.ScheduleId == "LX0000000007"))
            db.RoomViewingSchedules.Add(new RoomViewingSchedule { ScheduleId = "LX0000000007", ApplicationId = "HS0000000007", SalesEmployeeId = "NV00000005", AppointmentAt = new DateTime(2026, 7, 12, 9, 0, 0), Status = "hoan_thanh", Note = "Khách đã xem phòng TD201" });
        await db.SaveChangesAsync();
        if (!await db.RoomViewingScheduleRooms.AnyAsync(x => x.ScheduleId == "LX0000000007" && x.RoomId == "P_TD_201"))
            db.RoomViewingScheduleRooms.Add(new RoomViewingScheduleRoom { ScheduleId = "LX0000000007", RoomId = "P_TD_201" });
        if (!await db.DepositSlips.AnyAsync(x => x.DepositId == "DC0000000004"))
            db.DepositSlips.Add(new DepositSlip { DepositId = "DC0000000004", ApplicationId = "HS0000000007", SalesEmployeeId = "NV00000005", ManagerEmployeeId = "NV00000002", DepositAmount = 8000000, CreatedAt = new DateTime(2026, 7, 12, 10, 30, 0, DateTimeKind.Utc), PaymentDueAt = new DateTime(2026, 7, 13, 10, 30, 0, DateTimeKind.Utc), PaidAt = new DateTime(2026, 7, 12, 11, 0, 0, DateTimeKind.Utc), Status = "hoan_thanh" });

        if (!await db.DepositSlips.AnyAsync(x => x.DepositId == "DC0000000001"))
            db.DepositSlips.Add(new DepositSlip { DepositId = "DC0000000001", ApplicationId = "HS0000000001", SalesEmployeeId = "NV00000003", ManagerEmployeeId = "NV00000002", DepositAmount = 3000000, CreatedAt = new DateTime(2026, 7, 11, 8, 0, 0, DateTimeKind.Utc), PaymentDueAt = new DateTime(2026, 7, 12, 8, 0, 0, DateTimeKind.Utc), PaidAt = new DateTime(2026, 7, 11, 10, 0, 0, DateTimeKind.Utc), Status = "hoan_thanh" });
        await db.SaveChangesAsync();
        if (!await db.DepositBeds.AnyAsync(x => x.DepositId == "DC0000000001" && x.BedId == "GPQ51012"))
            db.DepositBeds.Add(new DepositBed { DepositId = "DC0000000001", BedId = "GPQ51012" });

        if (!await db.RentalContracts.AnyAsync(x => x.ContractId == "HD0000000001"))
            db.RentalContracts.Add(new RentalContract { ContractId = "HD0000000001", DepositId = "DC0000000001", CustomerId = "KH0000000001", SalesEmployeeId = "NV00000003", RoomId = "P_Q5_101", NumberOfBeds = 1, MonthlyRent = 1500000, PaymentCycle = "hang_thang", SignedDate = new DateOnly(2026, 7, 12), StartDate = new DateOnly(2026, 8, 1), EndDate = new DateOnly(2027, 7, 31), Status = "hieu_luc" });
        if (!await db.RentalContracts.AnyAsync(x => x.ContractId == "HD0000000002"))
            db.RentalContracts.Add(new RentalContract { ContractId = "HD0000000002", DepositId = "DC0000000002", CustomerId = "KH0000000001", SalesEmployeeId = "NV00000003", RoomId = "P_Q5_201", NumberOfBeds = 2, MonthlyRent = 4500000, PaymentCycle = "hang_thang", SignedDate = new DateOnly(2026, 7, 12), StartDate = new DateOnly(2026, 8, 1), EndDate = new DateOnly(2027, 7, 31), Status = "cho_ky" });
        await db.SaveChangesAsync();

        if (!await db.TenantMembers.AnyAsync(x => x.TenantMemberId == "TV0000000001"))
            db.TenantMembers.Add(new TenantMember { TenantMemberId = "TV0000000001", CustomerId = "KH0000000001", ContractId = "HD0000000001", FullName = "Nguyễn Gia Bảo", NationalId = "079203000001", Gender = "Nam", DateOfBirth = new DateOnly(2003, 5, 12), IsEligible = true });
        if (!await db.HandoverReports.AnyAsync(x => x.HandoverId == "BB0000000001"))
            db.HandoverReports.Add(new HandoverReport { HandoverId = "BB0000000001", ContractId = "HD0000000001", ManagerEmployeeId = "NV00000002", HandoverDate = new DateOnly(2026, 8, 1), RoomCondition = "Phòng sạch, thiết bị hoạt động tốt", InitialElectricityReading = 1245, InitialWaterReading = 382 });
        await db.SaveChangesAsync();

        foreach (var item in new[] { new HandoverDetail { HandoverId = "BB0000000001", AssetId = "TS0000000001", Quantity = 1, Condition = "tot" }, new HandoverDetail { HandoverId = "BB0000000001", AssetId = "TS0000000002", Quantity = 1, Condition = "tot" }, new HandoverDetail { HandoverId = "BB0000000001", AssetId = "TS0000000003", Quantity = 1, Condition = "tot" } })
            if (!await db.HandoverDetails.AnyAsync(x => x.HandoverId == item.HandoverId && x.AssetId == item.AssetId)) db.HandoverDetails.Add(item);

        if (!await db.Reconciliations.AnyAsync(x => x.ReconciliationId == "DS0000000001"))
            db.Reconciliations.Add(new Reconciliation { ReconciliationId = "DS0000000001", ContractId = "HD0000000001", AccountantEmployeeId = "NV00000004", ManagerEmployeeId = "NV00000002", CreatedDate = new DateOnly(2027, 2, 1), RefundRate = 70, OriginalDeposit = 3000000, BaseRefund = 2100000, TotalDeductions = 420000, RefundAmount = 1680000, AdditionalPaymentAmount = 0, Status = "da_xac_nhan" });
        await db.SaveChangesAsync();

        if (!await db.AdditionalCosts.AnyAsync(x => x.AdditionalCostId == "CP0000000001"))
            db.AdditionalCosts.Add(new AdditionalCost { AdditionalCostId = "CP0000000001", ReconciliationId = "DS0000000001", CostType = "dien_nuoc", Amount = 420000, Description = "Điện nước kỳ cuối" });
        if (!await db.CheckoutReports.AnyAsync(x => x.CheckoutReportId == "BT0000000001"))
            db.CheckoutReports.Add(new CheckoutReport { CheckoutReportId = "BT0000000001", ReconciliationId = "DS0000000001", ManagerEmployeeId = "NV00000002", CheckoutDate = new DateOnly(2027, 2, 1), RoomCondition = "Phòng và tài sản đầy đủ", FinalElectricityReading = 1380, FinalWaterReading = 401, KeysReturned = true });
        await db.SaveChangesAsync();

        // Mỗi phòng đại diện một trạng thái để Sale, Quản lý và Kế toán dễ lọc khi demo UC4.
        if (!await db.CheckoutRequests.AnyAsync(x => x.CheckoutRequestId == "YTP000000001"))
            db.CheckoutRequests.Add(new CheckoutRequest { CheckoutRequestId = "YTP000000001", ContractId = "HD0000000001", CustomerId = "KH0000000001", SalesEmployeeId = "NV00000003", ManagerEmployeeId = "NV00000002", ReconciliationId = "DS0000000001", RequestedCheckoutAt = new DateTime(2027, 2, 1, 9, 0, 0), ConfirmedInspectionAt = new DateTime(2027, 2, 1, 9, 0, 0), Reason = "Kết thúc nhu cầu thuê", Status = "cho_khach_xac_nhan", CreatedAt = new DateTime(2027, 1, 25, 8, 0, 0, DateTimeKind.Utc), UpdatedAt = new DateTime(2027, 2, 1, 10, 0, 0, DateTimeKind.Utc), Note = "Phòng 101 Quận 5 - đã kiểm tra và đối soát, khách được xem bảng xác nhận" });
        await db.SaveChangesAsync();

        var invoices = new[]
        {
            new Invoice { InvoiceId = "HDON00000001", CustomerId = "KH0000000001", AccountantEmployeeId = "NV00000004", DepositId = "DC0000000001", InvoiceType = "tien_coc", DocumentType = "thu", TotalAmount = 3000000, PaymentMethod = "chuyen_khoan", TransactionId = "VCB-DEMO-001", CreatedAt = new DateTime(2026, 7, 11, 8, 30, 0, DateTimeKind.Utc), PaidAt = new DateTime(2026, 7, 11, 10, 0, 0, DateTimeKind.Utc), Status = "da_thanh_toan" },
            new Invoice { InvoiceId = "HDON00000002", CustomerId = "KH0000000001", AccountantEmployeeId = "NV00000004", ContractId = "HD0000000001", InvoiceType = "dich_vu", DocumentType = "thu", TotalAmount = 150000, PaymentMethod = "chuyen_khoan", CreatedAt = new DateTime(2026, 8, 1, 8, 0, 0, DateTimeKind.Utc), PaidAt = new DateTime(2026, 8, 1, 8, 30, 0, DateTimeKind.Utc), Status = "da_thanh_toan", BillingPeriod = new DateOnly(2026, 8, 1) },
            new Invoice { InvoiceId = "HDON00000003", CustomerId = "KH0000000001", AccountantEmployeeId = "NV00000004", ReconciliationId = "DS0000000001", InvoiceType = "hoan_coc", DocumentType = "chi", TotalAmount = 1680000, PaymentMethod = "chuyen_khoan", BankName = "Vietcombank", BankAccountNumber = "0123456789", BankAccountHolder = "NGUYEN GIA BAO", CreatedAt = new DateTime(2027, 2, 1, 8, 0, 0, DateTimeKind.Utc), Status = "cho_thanh_toan" },
            new Invoice { InvoiceId = "HDON00000004", CustomerId = "KH0000000003", AccountantEmployeeId = "NV00000004", DepositId = "DC0000000003", InvoiceType = "tien_coc", DocumentType = "thu", TotalAmount = 11600000, PaymentMethod = "chuyen_khoan", TransactionId = "VCB-DEMO-CHO-DOI-SOAT", ProofImageUrl = "demo/chung-tu/HDON00000004.jpg", CreatedAt = new DateTime(2026, 7, 12, 9, 0, 0, DateTimeKind.Utc), Status = "cho_thanh_toan", Note = "Khách đã tải chứng từ, kế toán cần xác nhận" },
        };
        foreach (var item in invoices)
            if (!await db.Invoices.AnyAsync(x => x.InvoiceId == item.InvoiceId)) db.Invoices.Add(item);
        await db.SaveChangesAsync();

        if (!await db.InvoiceServiceDetails.AnyAsync(x => x.InvoiceId == "HDON00000002" && x.ServiceId == "DV00000003"))
            db.InvoiceServiceDetails.Add(new InvoiceServiceDetail { InvoiceId = "HDON00000002", ServiceId = "DV00000003", Quantity = 1, UnitPrice = 150000, Amount = 150000, Note = "WiFi tháng đầu" });
        if (!await db.AdminAuditLogs.AnyAsync(x => x.AuditLogId == "NK0000000001"))
            db.AdminAuditLogs.Add(new AdminAuditLog { AuditLogId = "NK0000000001", ActorAccountId = "TK00000001", TargetAccountId = "TKKH00000001", ActionType = "tao_tk", NewValue = "{\"username\":\"customer1\"}", OccurredAt = new DateTime(2026, 7, 8, 7, 0, 0, DateTimeKind.Utc), Note = "Dữ liệu demo" });
        var notifications = new[]
        {
            new Notification { NotificationId = "TB0000000001", RecipientAccountId = "TKKH00000001", Title = "Lịch xem phòng đã được sắp xếp", Content = "Bạn có lịch xem phòng P_TD_101 lúc 14:00 ngày 11/07/2026.", NotificationType = "lich_xem_phong", CreatedAt = new DateTime(2026, 7, 9, 8, 0, 0, DateTimeKind.Utc), IsRead = true, ReadAt = new DateTime(2026, 7, 9, 9, 0, 0, DateTimeKind.Utc) },
            new Notification { NotificationId = "TB0000000002", RecipientAccountId = "TKKH00000001", Title = "Hồ sơ đã sẵn sàng yêu cầu đặt cọc", Content = "Phòng P_TD_101 đã hoàn thành xem phòng. Bạn có thể gửi yêu cầu đặt cọc.", NotificationType = "dat_coc", CreatedAt = new DateTime(2026, 7, 11, 15, 0, 0, DateTimeKind.Utc) },
            new Notification { NotificationId = "TB0000000003", RecipientAccountId = "TK00000003", Title = "Có hồ sơ đăng ký thuê mới", Content = "Hồ sơ HS0000000004 của khách Trần Thảo My đang chờ tiếp nhận và sắp lịch xem.", NotificationType = "dang_ky_thue", CreatedAt = new DateTime(2026, 7, 12, 7, 31, 0, DateTimeKind.Utc) },
            new Notification { NotificationId = "TB0000000004", RecipientAccountId = "TK00000003", Title = "Phiếu cọc chờ khách thanh toán", Content = "Phiếu DC0000000003 đã được lập và đang trong thời hạn thanh toán.", NotificationType = "dat_coc", CreatedAt = new DateTime(2026, 7, 12, 8, 5, 0, DateTimeKind.Utc) },
            new Notification { NotificationId = "TB0000000005", RecipientAccountId = "TK00000002", Title = "Hồ sơ chờ rà soát đặt cọc", Content = "Hồ sơ HS0000000005 cần kiểm tra điều kiện lưu trú và tình trạng phòng P_TD_102.", NotificationType = "phe_duyet", CreatedAt = new DateTime(2026, 7, 12, 8, 10, 0, DateTimeKind.Utc) },
            new Notification { NotificationId = "TB0000000006", RecipientAccountId = "TK00000002", Title = "Kết quả đối soát cần xác nhận", Content = "Đối soát DS0000000001 đã có biên bản hiện trạng và chi phí cuối kỳ.", NotificationType = "doi_soat", CreatedAt = new DateTime(2027, 2, 1, 9, 0, 0, DateTimeKind.Utc) },
            new Notification { NotificationId = "TB0000000007", RecipientAccountId = "TK00000004", Title = "Chứng từ cọc chờ xác nhận", Content = "Hóa đơn HDON00000004 có chứng từ chuyển khoản 11.600.000 đồng cần đối chiếu.", NotificationType = "thanh_toan", CreatedAt = new DateTime(2026, 7, 12, 9, 1, 0, DateTimeKind.Utc) },
            new Notification { NotificationId = "TB0000000008", RecipientAccountId = "TK00000004", Title = "Khoản hoàn cọc chờ chi", Content = "Hóa đơn HDON00000003 cần thực hiện hoàn 1.680.000 đồng cho khách hàng.", NotificationType = "hoan_coc", CreatedAt = new DateTime(2027, 2, 1, 9, 5, 0, DateTimeKind.Utc) },
            new Notification { NotificationId = "TB0000000009", RecipientAccountId = "TK00000001", Title = "Dữ liệu demo đã được khởi tạo", Content = "Database đã reset và nạp lại dữ liệu mẫu cho tất cả vai trò.", NotificationType = "he_thong", CreatedAt = new DateTime(2026, 7, 12, 7, 0, 0, DateTimeKind.Utc) },
        };
        foreach (var item in notifications)
            if (!await db.Notifications.AnyAsync(x => x.NotificationId == item.NotificationId)) db.Notifications.Add(item);
        await db.SaveChangesAsync();
    }
}
