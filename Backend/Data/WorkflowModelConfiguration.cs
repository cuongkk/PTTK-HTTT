using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Data;

public static class WorkflowModelConfiguration
{
    public static void ConfigureWorkflowModels(this ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Asset>(e =>
        {
            e.ToTable("tai_san"); e.HasKey(x => x.AssetId).HasName("pk_tai_san");
            e.Property(x => x.AssetId).HasColumnName("ma_tai_san").HasMaxLength(12);
            e.Property(x => x.RoomId).HasColumnName("ma_phong").HasMaxLength(10).IsRequired();
            e.Property(x => x.AssetName).HasColumnName("ten_tai_san").HasMaxLength(100).IsRequired();
            e.Property(x => x.Description).HasColumnName("mo_ta");
            e.Property(x => x.Condition).HasColumnName("tinh_trang").HasMaxLength(50).HasDefaultValue("tot");
            e.HasOne<Room>().WithMany().HasForeignKey(x => x.RoomId).HasConstraintName("fk_taisan_phong").OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<RentalApplication>(e =>
        {
            e.ToTable("ho_so_dang_ky", t => { t.HasCheckConstraint("chk_hoso_songuoi", "[so_nguoi] > 0"); t.HasCheckConstraint("chk_hoso_trangthai", "[trang_thai] IN ('moi','da_xem_phong','cho_ra_soat_coc','da_dat_coc','cho_kiem_tra_nhan_phong','du_dieu_kien_nhan_phong','huy')"); });
            e.HasKey(x => x.ApplicationId).HasName("pk_ho_so");
            e.Property(x => x.ApplicationId).HasColumnName("ma_ho_so").HasMaxLength(12); e.Property(x => x.CustomerId).HasColumnName("ma_kh").HasMaxLength(12).IsRequired(); e.Property(x => x.SalesEmployeeId).HasColumnName("ma_sale").HasMaxLength(10);
            e.Property(x => x.NumberOfPeople).HasColumnName("so_nguoi"); e.Property(x => x.ExpectedMoveInDate).HasColumnName("thoi_gian_du_kien_thue").HasColumnType("date"); e.Property(x => x.ExpectedRentalMonths).HasColumnName("thoi_han_thue_thang");
            e.Property(x => x.DesiredArea).HasColumnName("khu_vuc_mong_muon").HasMaxLength(100); e.Property(x => x.DesiredRoomType).HasColumnName("loai_phong_mong_muon").HasMaxLength(30); e.Property(x => x.MinimumPrice).HasColumnName("gia_toi_thieu").HasColumnType("decimal(12,2)"); e.Property(x => x.MaximumPrice).HasColumnName("gia_toi_da").HasColumnType("decimal(12,2)");
            e.Property(x => x.Gender).HasColumnName("gioi_tinh").HasMaxLength(20); e.Property(x => x.LivingSchedule).HasColumnName("gio_giac_sinh_hoat").HasMaxLength(200); e.Property(x => x.RequiresQuietLifestyle).HasColumnName("yeu_cau_yen_tinh").HasDefaultValue(false); e.Property(x => x.RequiresParking).HasColumnName("yeu_cau_gui_xe").HasDefaultValue(false); e.Property(x => x.RequiresAirConditioner).HasColumnName("yeu_cau_dieu_hoa").HasDefaultValue(false);
            e.Property(x => x.OtherRequirements).HasColumnName("yeu_cau_khac"); e.Property(x => x.Status).HasColumnName("trang_thai").HasMaxLength(40).HasDefaultValue("moi"); e.Property(x => x.CreatedAt).HasColumnName("ngay_tao").HasDefaultValueSql("SYSUTCDATETIME()");
            e.HasOne(x => x.Customer).WithMany().HasForeignKey(x => x.CustomerId).HasConstraintName("fk_hoso_kh").OnDelete(DeleteBehavior.Restrict); e.HasOne(x => x.SalesEmployee).WithMany().HasForeignKey(x => x.SalesEmployeeId).HasConstraintName("fk_hoso_sale").OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<RoomViewingSchedule>(e =>
        {
            e.ToTable("lich_xem_phong", t => t.HasCheckConstraint("chk_lich_trangthai", "[trang_thai] IN ('sap_den','hoan_thanh','huy')")); e.HasKey(x => x.ScheduleId).HasName("pk_lich_xem");
            e.Property(x => x.ScheduleId).HasColumnName("ma_lich").HasMaxLength(12); e.Property(x => x.ApplicationId).HasColumnName("ma_ho_so").HasMaxLength(12).IsRequired(); e.Property(x => x.SalesEmployeeId).HasColumnName("ma_sale").HasMaxLength(10).IsRequired(); e.Property(x => x.AppointmentAt).HasColumnName("ngay_gio_hen"); e.Property(x => x.Status).HasColumnName("trang_thai").HasMaxLength(20).HasDefaultValue("sap_den"); e.Property(x => x.Note).HasColumnName("ghi_chu");
            e.HasOne(x => x.Application).WithMany(x => x.RoomViewingSchedules).HasForeignKey(x => x.ApplicationId).HasConstraintName("fk_lichxem_hoso").OnDelete(DeleteBehavior.Cascade); e.HasOne(x => x.SalesEmployee).WithMany().HasForeignKey(x => x.SalesEmployeeId).HasConstraintName("fk_lichxem_sale").OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<RoomViewingScheduleRoom>(e =>
        {
            e.ToTable("lich_xem_phong_phong"); e.HasKey(x => new { x.ScheduleId, x.RoomId }).HasName("pk_lxp"); e.Property(x => x.ScheduleId).HasColumnName("ma_lich").HasMaxLength(12); e.Property(x => x.RoomId).HasColumnName("ma_phong").HasMaxLength(10);
            e.HasOne<RoomViewingSchedule>().WithMany(x => x.Rooms).HasForeignKey(x => x.ScheduleId).HasConstraintName("fk_lxp_lich").OnDelete(DeleteBehavior.Cascade); e.HasOne<Room>().WithMany().HasForeignKey(x => x.RoomId).HasConstraintName("fk_lxp_phong").OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<DepositSlip>(e =>
        {
            e.ToTable("phieu_dat_coc", t => { t.HasCheckConstraint("chk_coc_sotien", "[so_tien_coc] > 0"); t.HasCheckConstraint("chk_coc_trangthai", "[trang_thai] IN ('cho_thanh_toan','hoan_thanh','het_han','huy')"); }); e.HasKey(x => x.DepositId).HasName("pk_phieu_coc");
            e.Property(x => x.DepositId).HasColumnName("ma_coc").HasMaxLength(12); e.Property(x => x.ApplicationId).HasColumnName("ma_ho_so").HasMaxLength(12).IsRequired(); e.Property(x => x.SalesEmployeeId).HasColumnName("ma_sale").HasMaxLength(10).IsRequired(); e.Property(x => x.ManagerEmployeeId).HasColumnName("ma_quan_ly").HasMaxLength(10); e.Property(x => x.DepositAmount).HasColumnName("so_tien_coc").HasColumnType("decimal(12,2)"); e.Property(x => x.CreatedAt).HasColumnName("ngay_lap").HasDefaultValueSql("SYSUTCDATETIME()"); e.Property(x => x.PaymentDueAt).HasColumnName("han_thanh_toan"); e.Property(x => x.PaidAt).HasColumnName("ngay_thanh_toan"); e.Property(x => x.Status).HasColumnName("trang_thai").HasMaxLength(20).HasDefaultValue("cho_thanh_toan");
            e.HasOne(x => x.Application).WithMany(x => x.DepositSlips).HasForeignKey(x => x.ApplicationId).HasConstraintName("fk_coc_hoso").OnDelete(DeleteBehavior.Restrict); e.HasOne(x => x.SalesEmployee).WithMany().HasForeignKey(x => x.SalesEmployeeId).HasConstraintName("fk_coc_sale").OnDelete(DeleteBehavior.Restrict); e.HasOne(x => x.ManagerEmployee).WithMany().HasForeignKey(x => x.ManagerEmployeeId).HasConstraintName("fk_coc_quanly").OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<DepositBed>(e =>
        {
            e.ToTable("dat_coc_giuong"); e.HasKey(x => new { x.DepositId, x.BedId }).HasName("pk_dcg"); e.Property(x => x.DepositId).HasColumnName("ma_coc").HasMaxLength(12); e.Property(x => x.BedId).HasColumnName("ma_giuong").HasMaxLength(12); e.HasOne<DepositSlip>().WithMany(x => x.Beds).HasForeignKey(x => x.DepositId).HasConstraintName("fk_dcg_coc").OnDelete(DeleteBehavior.Cascade); e.HasOne<Bed>().WithMany().HasForeignKey(x => x.BedId).HasConstraintName("fk_dcg_giuong").OnDelete(DeleteBehavior.Restrict);
        });

        ConfigureContractAndSettlement(modelBuilder);
        ConfigureInvoiceAndAdministration(modelBuilder);
    }

    private static void ConfigureContractAndSettlement(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<RentalContract>(e =>
        {
            e.ToTable("hop_dong_thue", t => t.HasCheckConstraint("chk_hd_trangthai", "[trang_thai] IN ('hieu_luc','het_han','thanh_ly')")); e.HasKey(x => x.ContractId).HasName("pk_hop_dong");
            e.Property(x => x.ContractId).HasColumnName("ma_hop_dong").HasMaxLength(12); e.Property(x => x.DepositId).HasColumnName("ma_coc").HasMaxLength(12).IsRequired(); e.Property(x => x.CustomerId).HasColumnName("ma_kh").HasMaxLength(12).IsRequired(); e.Property(x => x.SalesEmployeeId).HasColumnName("ma_sale").HasMaxLength(10).IsRequired(); e.Property(x => x.RoomId).HasColumnName("ma_phong").HasMaxLength(10).IsRequired(); e.Property(x => x.NumberOfBeds).HasColumnName("so_giuong_thue"); e.Property(x => x.MonthlyRent).HasColumnName("gia_thue_thang").HasColumnType("decimal(12,2)"); e.Property(x => x.PaymentCycle).HasColumnName("ky_thanh_toan").HasMaxLength(20).HasDefaultValue("hang_thang"); e.Property(x => x.SignedDate).HasColumnName("ngay_ky").HasColumnType("date"); e.Property(x => x.StartDate).HasColumnName("ngay_bat_dau").HasColumnType("date"); e.Property(x => x.EndDate).HasColumnName("ngay_ket_thuc").HasColumnType("date"); e.Property(x => x.Status).HasColumnName("trang_thai").HasMaxLength(20).HasDefaultValue("hieu_luc"); e.HasIndex(x => x.DepositId).IsUnique().HasDatabaseName("uq_hopdong_coc");
            e.HasOne(x => x.Deposit).WithOne(x => x.Contract).HasForeignKey<RentalContract>(x => x.DepositId).HasConstraintName("fk_hd_coc").OnDelete(DeleteBehavior.Restrict); e.HasOne(x => x.Customer).WithMany().HasForeignKey(x => x.CustomerId).HasConstraintName("fk_hd_kh").OnDelete(DeleteBehavior.Restrict); e.HasOne(x => x.SalesEmployee).WithMany().HasForeignKey(x => x.SalesEmployeeId).HasConstraintName("fk_hd_sale").OnDelete(DeleteBehavior.Restrict); e.HasOne(x => x.Room).WithMany().HasForeignKey(x => x.RoomId).HasConstraintName("fk_hd_phong").OnDelete(DeleteBehavior.Restrict);
        });
        modelBuilder.Entity<ResidenceRule>(e =>
        {
            e.ToTable("noi_quy_luu_tru");
            e.HasKey(x => x.ResidenceRuleId).HasName("pk_noi_quy_luu_tru");
            e.Property(x => x.ResidenceRuleId).HasColumnName("ma_noi_quy").HasMaxLength(12);
            e.Property(x => x.BranchId).HasColumnName("ma_chi_nhanh").HasMaxLength(10).IsRequired();
            e.Property(x => x.Title).HasColumnName("tieu_de").HasMaxLength(200).IsRequired();
            e.Property(x => x.Content).HasColumnName("noi_dung").IsRequired();
            e.Property(x => x.RuleType).HasColumnName("loai_noi_quy").HasMaxLength(30).IsRequired();
            e.Property(x => x.ViolationLevel).HasColumnName("muc_do_vi_pham").HasMaxLength(20).HasDefaultValue("nhac_nho");
            e.Property(x => x.DefaultPenaltyAmount).HasColumnName("muc_phat_mac_dinh").HasColumnType("decimal(12,2)");
            e.Property(x => x.EffectiveFrom).HasColumnName("ngay_hieu_luc").HasColumnType("date");
            e.Property(x => x.EffectiveTo).HasColumnName("ngay_het_hieu_luc").HasColumnType("date");
            e.Property(x => x.Status).HasColumnName("trang_thai").HasMaxLength(20).HasDefaultValue("hieu_luc");
            e.Property(x => x.CreatedAt).HasColumnName("ngay_tao").HasDefaultValueSql("SYSUTCDATETIME()");
            e.Property(x => x.UpdatedAt).HasColumnName("ngay_cap_nhat");
            e.HasOne<Branch>().WithMany().HasForeignKey(x => x.BranchId).HasConstraintName("fk_noiquy_chinhanh").OnDelete(DeleteBehavior.Restrict);
            e.HasIndex(x => new { x.BranchId, x.Status, x.EffectiveFrom }).HasDatabaseName("idx_noiquy_chinhanh_hieuluc");
        });
        modelBuilder.Entity<TenantMember>(e =>
        {
            e.ToTable("thanh_vien_thue", t => t.HasCheckConstraint("chk_tv_gioitinh", "[gioi_tinh] IS NULL OR [gioi_tinh] IN ('Nam','Nu')")); e.HasKey(x => x.TenantMemberId).HasName("pk_thanh_vien"); e.Property(x => x.TenantMemberId).HasColumnName("ma_tv").HasMaxLength(12); e.Property(x => x.ApplicationId).HasColumnName("ma_ho_so").HasMaxLength(12); e.Property(x => x.CustomerId).HasColumnName("ma_kh").HasMaxLength(12); e.Property(x => x.ContractId).HasColumnName("ma_hop_dong").HasMaxLength(12); e.Property(x => x.FullName).HasColumnName("ho_ten").HasMaxLength(100).IsRequired(); e.Property(x => x.NationalId).HasColumnName("cccd").HasMaxLength(20); e.Property(x => x.Gender).HasColumnName("gioi_tinh").HasMaxLength(3); e.Property(x => x.DateOfBirth).HasColumnName("ngay_sinh").HasColumnType("date"); e.Property(x => x.Nationality).HasColumnName("quoc_tich").HasMaxLength(50); e.Property(x => x.DocumentType).HasColumnName("loai_giay_to").HasMaxLength(30); e.Property(x => x.DocumentImageUrl).HasColumnName("anh_giay_to").HasMaxLength(500); e.Property(x => x.PermanentAddress).HasColumnName("dia_chi_thuong_tru").HasMaxLength(200); e.Property(x => x.OccupationOrSchool).HasColumnName("nghe_nghiep_truong_hoc").HasMaxLength(150); e.Property(x => x.FinancialDocumentUrl).HasColumnName("tai_lieu_tai_chinh").HasMaxLength(500); e.Property(x => x.IsPrimaryTenant).HasColumnName("la_nguoi_dung_ten").HasDefaultValue(false); e.Property(x => x.RelationshipToPrimary).HasColumnName("quan_he_nguoi_dung_ten").HasMaxLength(50); e.Property(x => x.IsEligible).HasColumnName("dat_dieu_kien").HasDefaultValue(true); e.Property(x => x.Note).HasColumnName("ghi_chu"); e.HasOne<RentalApplication>().WithMany(x => x.TenantMembers).HasForeignKey(x => x.ApplicationId).HasConstraintName("fk_tv_hoso").OnDelete(DeleteBehavior.NoAction); e.HasOne<Customer>().WithMany().HasForeignKey(x => x.CustomerId).HasConstraintName("fk_tv_kh").OnDelete(DeleteBehavior.SetNull); e.HasOne<RentalContract>().WithMany(x => x.TenantMembers).HasForeignKey(x => x.ContractId).HasConstraintName("fk_tv_hopdong").OnDelete(DeleteBehavior.Cascade);
        });
        modelBuilder.Entity<HandoverReport>(e =>
        {
            e.ToTable("bien_ban_ban_giao"); e.HasKey(x => x.HandoverId).HasName("pk_bbgiao"); e.Property(x => x.HandoverId).HasColumnName("ma_bb").HasMaxLength(12); e.Property(x => x.ContractId).HasColumnName("ma_hop_dong").HasMaxLength(12).IsRequired(); e.Property(x => x.ManagerEmployeeId).HasColumnName("ma_quan_ly").HasMaxLength(10).IsRequired(); e.Property(x => x.HandoverDate).HasColumnName("ngay_ban_giao").HasColumnType("date"); e.Property(x => x.RoomCondition).HasColumnName("tinh_trang_phong"); e.Property(x => x.InitialElectricityReading).HasColumnName("chi_so_dien_dau").HasColumnType("decimal(12,2)"); e.Property(x => x.InitialWaterReading).HasColumnName("chi_so_nuoc_dau").HasColumnType("decimal(12,2)"); e.Property(x => x.Note).HasColumnName("ghi_chu"); e.HasIndex(x => x.ContractId).IsUnique().HasDatabaseName("uq_bbgiao_hd"); e.HasOne<RentalContract>().WithMany().HasForeignKey(x => x.ContractId).HasConstraintName("fk_bbgiao_hd").OnDelete(DeleteBehavior.Restrict); e.HasOne<Employee>().WithMany().HasForeignKey(x => x.ManagerEmployeeId).HasConstraintName("fk_bbgiao_ql").OnDelete(DeleteBehavior.Restrict);
        });
        modelBuilder.Entity<HandoverDetail>(e =>
        {
            e.ToTable("chi_tiet_ban_giao"); e.HasKey(x => new { x.HandoverId, x.AssetId }).HasName("pk_ctbg"); e.Property(x => x.HandoverId).HasColumnName("ma_bb").HasMaxLength(12); e.Property(x => x.AssetId).HasColumnName("ma_tai_san").HasMaxLength(12); e.Property(x => x.Quantity).HasColumnName("so_luong").HasDefaultValue((short)1); e.Property(x => x.Condition).HasColumnName("tinh_trang").HasMaxLength(50); e.Property(x => x.Note).HasColumnName("ghi_chu"); e.HasOne<HandoverReport>().WithMany().HasForeignKey(x => x.HandoverId).HasConstraintName("fk_ctbg_bb").OnDelete(DeleteBehavior.Cascade); e.HasOne<Asset>().WithMany().HasForeignKey(x => x.AssetId).HasConstraintName("fk_ctbg_taisan").OnDelete(DeleteBehavior.Restrict);
        });
        modelBuilder.Entity<Reconciliation>(e =>
        {
            e.ToTable("bang_doi_soat", t => { t.HasCheckConstraint("chk_ds_tyle", "[ty_le_hoan] IN (50,70,80,100)"); t.HasCheckConstraint("chk_ds_trangthai", "[trang_thai] IN ('cho_xac_nhan','da_xac_nhan','hoan_tat')"); }); e.HasKey(x => x.ReconciliationId).HasName("pk_doi_soat"); e.Property(x => x.ReconciliationId).HasColumnName("ma_doi_soat").HasMaxLength(12); e.Property(x => x.ContractId).HasColumnName("ma_hop_dong").HasMaxLength(12).IsRequired(); e.Property(x => x.AccountantEmployeeId).HasColumnName("ma_ke_toan").HasMaxLength(10).IsRequired(); e.Property(x => x.ManagerEmployeeId).HasColumnName("ma_quan_ly").HasMaxLength(10); e.Property(x => x.CreatedDate).HasColumnName("ngay_lap").HasColumnType("date"); e.Property(x => x.RefundRate).HasColumnName("ty_le_hoan").HasColumnType("decimal(5,2)"); e.Property(x => x.OriginalDeposit).HasColumnName("so_tien_coc_goc").HasColumnType("decimal(12,2)"); e.Property(x => x.BaseRefund).HasColumnName("so_tien_hoan_co_ban").HasColumnType("decimal(12,2)"); e.Property(x => x.TotalDeductions).HasColumnName("tong_khau_tru").HasColumnType("decimal(12,2)").HasDefaultValue(0); e.Property(x => x.RefundAmount).HasColumnName("so_tien_hoan").HasColumnType("decimal(12,2)"); e.Property(x => x.AdditionalPaymentAmount).HasColumnName("so_tien_thu_them").HasColumnType("decimal(12,2)"); e.Property(x => x.Status).HasColumnName("trang_thai").HasMaxLength(20).HasDefaultValue("cho_xac_nhan"); e.HasIndex(x => x.ContractId).IsUnique().HasDatabaseName("uq_doisoat_hd"); e.HasOne<RentalContract>().WithMany().HasForeignKey(x => x.ContractId).HasConstraintName("fk_ds_hopdong").OnDelete(DeleteBehavior.Restrict); e.HasOne<Employee>().WithMany().HasForeignKey(x => x.AccountantEmployeeId).HasConstraintName("fk_ds_ketoan").OnDelete(DeleteBehavior.Restrict); e.HasOne<Employee>().WithMany().HasForeignKey(x => x.ManagerEmployeeId).HasConstraintName("fk_ds_quanly").OnDelete(DeleteBehavior.SetNull);
        });
        modelBuilder.Entity<AdditionalCost>(e =>
        {
            e.ToTable("chi_phi_phat_sinh", t => { t.HasCheckConstraint("chk_cpps_loai", "[loai_chi_phi] IN ('no_tien_thue','dien_nuoc','hu_hong','phat_vi_pham','khac')"); t.HasCheckConstraint("chk_cpps_sotien", "[so_tien] >= 0"); }); e.HasKey(x => x.AdditionalCostId).HasName("pk_cpps"); e.Property(x => x.AdditionalCostId).HasColumnName("ma_chi_phi").HasMaxLength(12); e.Property(x => x.ReconciliationId).HasColumnName("ma_doi_soat").HasMaxLength(12).IsRequired(); e.Property(x => x.CostType).HasColumnName("loai_chi_phi").HasMaxLength(30).IsRequired(); e.Property(x => x.Amount).HasColumnName("so_tien").HasColumnType("decimal(12,2)"); e.Property(x => x.Description).HasColumnName("mo_ta"); e.HasOne<Reconciliation>().WithMany().HasForeignKey(x => x.ReconciliationId).HasConstraintName("fk_cpps_doisoat").OnDelete(DeleteBehavior.Cascade);
        });
        modelBuilder.Entity<CheckoutReport>(e =>
        {
            e.ToTable("bien_ban_tra_phong"); e.HasKey(x => x.CheckoutReportId).HasName("pk_bbtra"); e.Property(x => x.CheckoutReportId).HasColumnName("ma_bb_tra").HasMaxLength(12); e.Property(x => x.ReconciliationId).HasColumnName("ma_doi_soat").HasMaxLength(12).IsRequired(); e.Property(x => x.ManagerEmployeeId).HasColumnName("ma_quan_ly").HasMaxLength(10).IsRequired(); e.Property(x => x.CheckoutDate).HasColumnName("ngay_tra").HasColumnType("date"); e.Property(x => x.RoomCondition).HasColumnName("tinh_trang_phong"); e.Property(x => x.FinalElectricityReading).HasColumnName("chi_so_dien_cuoi").HasColumnType("decimal(12,2)"); e.Property(x => x.FinalWaterReading).HasColumnName("chi_so_nuoc_cuoi").HasColumnType("decimal(12,2)"); e.Property(x => x.KeysReturned).HasColumnName("da_thu_khoa").HasDefaultValue(false); e.Property(x => x.Note).HasColumnName("ghi_chu"); e.HasIndex(x => x.ReconciliationId).IsUnique().HasDatabaseName("uq_bbtra_doisoat"); e.HasOne<Reconciliation>().WithMany().HasForeignKey(x => x.ReconciliationId).HasConstraintName("fk_bbtra_doisoat").OnDelete(DeleteBehavior.Restrict); e.HasOne<Employee>().WithMany().HasForeignKey(x => x.ManagerEmployeeId).HasConstraintName("fk_bbtra_quanly").OnDelete(DeleteBehavior.Restrict);
        });
    }

    private static void ConfigureInvoiceAndAdministration(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Invoice>(e =>
        {
            e.ToTable("hoa_don", t => { t.HasCheckConstraint("chk_hd2_loai", "[loai_hoa_don] IN ('tien_coc','tien_thue','dich_vu','hoan_coc','thu_them')"); t.HasCheckConstraint("chk_hd2_chungtu", "[loai_chung_tu] IN ('thu','chi')"); t.HasCheckConstraint("chk_hd2_pt", "[phuong_thuc] IN ('tien_mat','chuyen_khoan')"); t.HasCheckConstraint("chk_hd2_trangthai", "[trang_thai] IN ('cho_thanh_toan','da_thanh_toan','huy')"); }); e.HasKey(x => x.InvoiceId).HasName("pk_hoa_don"); e.Property(x => x.InvoiceId).HasColumnName("ma_hoa_don").HasMaxLength(12); e.Property(x => x.CustomerId).HasColumnName("ma_kh").HasMaxLength(12).IsRequired(); e.Property(x => x.AccountantEmployeeId).HasColumnName("ma_ke_toan").HasMaxLength(10); e.Property(x => x.DepositId).HasColumnName("ma_coc").HasMaxLength(12); e.Property(x => x.ContractId).HasColumnName("ma_hop_dong").HasMaxLength(12); e.Property(x => x.ReconciliationId).HasColumnName("ma_doi_soat").HasMaxLength(12); e.Property(x => x.InvoiceType).HasColumnName("loai_hoa_don").HasMaxLength(20).IsRequired(); e.Property(x => x.DocumentType).HasColumnName("loai_chung_tu").HasMaxLength(10).HasDefaultValue("thu"); e.Property(x => x.TotalAmount).HasColumnName("tong_tien").HasColumnType("decimal(12,2)"); e.Property(x => x.PaymentMethod).HasColumnName("phuong_thuc").HasMaxLength(20).HasDefaultValue("chuyen_khoan"); e.Property(x => x.BankName).HasColumnName("ten_ngan_hang").HasMaxLength(100); e.Property(x => x.BankAccountNumber).HasColumnName("so_tai_khoan").HasMaxLength(50); e.Property(x => x.BankAccountHolder).HasColumnName("chu_tai_khoan").HasMaxLength(100); e.Property(x => x.TransactionId).HasColumnName("ma_giao_dich").HasMaxLength(100); e.Property(x => x.ProofImageUrl).HasColumnName("anh_minh_chung"); e.Property(x => x.CreatedAt).HasColumnName("ngay_lap").HasDefaultValueSql("SYSUTCDATETIME()"); e.Property(x => x.PaidAt).HasColumnName("ngay_thanh_toan"); e.Property(x => x.Status).HasColumnName("trang_thai").HasMaxLength(20).HasDefaultValue("cho_thanh_toan"); e.Property(x => x.BillingPeriod).HasColumnName("ky_thanh_toan").HasColumnType("date"); e.Property(x => x.Note).HasColumnName("ghi_chu");
            e.HasOne<Customer>().WithMany().HasForeignKey(x => x.CustomerId).HasConstraintName("fk_hd2_kh").OnDelete(DeleteBehavior.Restrict); e.HasOne<Employee>().WithMany().HasForeignKey(x => x.AccountantEmployeeId).HasConstraintName("fk_hd2_ketoan").OnDelete(DeleteBehavior.SetNull); e.HasOne<DepositSlip>().WithMany().HasForeignKey(x => x.DepositId).HasConstraintName("fk_hd2_coc").OnDelete(DeleteBehavior.SetNull); e.HasOne<RentalContract>().WithMany().HasForeignKey(x => x.ContractId).HasConstraintName("fk_hd2_hopdong").OnDelete(DeleteBehavior.NoAction); e.HasOne<Reconciliation>().WithMany().HasForeignKey(x => x.ReconciliationId).HasConstraintName("fk_hd2_doisoat").OnDelete(DeleteBehavior.NoAction);
        });
        modelBuilder.Entity<InvoiceServiceDetail>(e =>
        {
            e.ToTable("chi_tiet_hoa_don_dich_vu", t => { t.HasCheckConstraint("chk_cthddv_soluong", "[so_luong] > 0"); t.HasCheckConstraint("chk_cthddv_dongia", "[don_gia] >= 0"); t.HasCheckConstraint("chk_cthddv_thanhtien", "[thanh_tien] >= 0"); }); e.HasKey(x => new { x.InvoiceId, x.ServiceId }).HasName("pk_cthddv"); e.Property(x => x.InvoiceId).HasColumnName("ma_hoa_don").HasMaxLength(12); e.Property(x => x.ServiceId).HasColumnName("ma_dich_vu").HasMaxLength(12); e.Property(x => x.Quantity).HasColumnName("so_luong").HasColumnType("decimal(12,2)").HasDefaultValue(1); e.Property(x => x.UnitPrice).HasColumnName("don_gia").HasColumnType("decimal(12,2)"); e.Property(x => x.Amount).HasColumnName("thanh_tien").HasColumnType("decimal(12,2)"); e.Property(x => x.Note).HasColumnName("ghi_chu"); e.HasOne<Invoice>().WithMany().HasForeignKey(x => x.InvoiceId).HasConstraintName("fk_cthddv_hoadon").OnDelete(DeleteBehavior.Cascade); e.HasOne<Service>().WithMany().HasForeignKey(x => x.ServiceId).HasConstraintName("fk_cthddv_dichvu").OnDelete(DeleteBehavior.Restrict);
        });
        modelBuilder.Entity<AdminAuditLog>(e =>
        {
            e.ToTable("nhat_ky_quan_tri"); e.HasKey(x => x.AuditLogId).HasName("pk_nhat_ky_qt"); e.Property(x => x.AuditLogId).HasColumnName("ma_nk").HasMaxLength(12); e.Property(x => x.ActorAccountId).HasColumnName("ma_nguoi_thuc").HasMaxLength(12).IsRequired(); e.Property(x => x.TargetAccountId).HasColumnName("ma_doi_tuong").HasMaxLength(12); e.Property(x => x.ActionType).HasColumnName("loai_hanh_dong").HasMaxLength(30).IsRequired(); e.Property(x => x.OldValue).HasColumnName("gia_tri_cu"); e.Property(x => x.NewValue).HasColumnName("gia_tri_moi"); e.Property(x => x.OccurredAt).HasColumnName("thoi_diem").HasDefaultValueSql("SYSUTCDATETIME()"); e.Property(x => x.Note).HasColumnName("ghi_chu"); e.HasOne<Account>().WithMany().HasForeignKey(x => x.ActorAccountId).HasConstraintName("fk_nkqt_nguoithuc").OnDelete(DeleteBehavior.Restrict); e.HasOne<Account>().WithMany().HasForeignKey(x => x.TargetAccountId).HasConstraintName("fk_nkqt_doituong").OnDelete(DeleteBehavior.SetNull); e.HasIndex(x => new { x.ActorAccountId, x.OccurredAt }).HasDatabaseName("idx_nkqt_nguoithuc"); e.HasIndex(x => new { x.TargetAccountId, x.OccurredAt }).HasDatabaseName("idx_nkqt_doituong"); e.HasIndex(x => new { x.ActionType, x.OccurredAt }).HasDatabaseName("idx_nkqt_hanhdong");
        });
        modelBuilder.Entity<Notification>(e =>
        {
            e.ToTable("thong_bao"); e.HasKey(x => x.NotificationId).HasName("pk_thong_bao"); e.Property(x => x.NotificationId).HasColumnName("ma_thong_bao").HasMaxLength(12); e.Property(x => x.SenderAccountId).HasColumnName("ma_nguoi_gui").HasMaxLength(12); e.Property(x => x.RecipientAccountId).HasColumnName("ma_nguoi_nhan").HasMaxLength(12).IsRequired(); e.Property(x => x.Title).HasColumnName("tieu_de").HasMaxLength(200).IsRequired(); e.Property(x => x.Content).HasColumnName("noi_dung").IsRequired(); e.Property(x => x.NotificationType).HasColumnName("loai_thong_bao").HasMaxLength(30).HasDefaultValue("he_thong"); e.Property(x => x.CreatedAt).HasColumnName("ngay_tao").HasDefaultValueSql("SYSUTCDATETIME()"); e.Property(x => x.IsRead).HasColumnName("da_doc").HasDefaultValue(false); e.Property(x => x.ReadAt).HasColumnName("ngay_doc"); e.HasOne<Account>().WithMany().HasForeignKey(x => x.SenderAccountId).HasConstraintName("fk_tb_nguoigui").OnDelete(DeleteBehavior.NoAction); e.HasOne<Account>().WithMany().HasForeignKey(x => x.RecipientAccountId).HasConstraintName("fk_tb_nguoinhan").OnDelete(DeleteBehavior.Cascade); e.HasIndex(x => new { x.RecipientAccountId, x.IsRead, x.CreatedAt }).HasDatabaseName("idx_tb_nguoinhan");
        });
    }
}
