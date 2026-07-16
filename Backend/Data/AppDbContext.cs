using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Branch> Branches => Set<Branch>();
    public DbSet<Room> Rooms => Set<Room>();
    public DbSet<Bed> Beds => Set<Bed>();
    public DbSet<Employee> Employees => Set<Employee>();
    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<SystemRole> SystemRoles => Set<SystemRole>();
    public DbSet<Permission> Permissions => Set<Permission>();
    public DbSet<RolePermission> RolePermissions => Set<RolePermission>();
    public DbSet<Account> Accounts => Set<Account>();
    public DbSet<SystemParameter> SystemParameters => Set<SystemParameter>();
    public DbSet<Service> Services => Set<Service>();
    public DbSet<ServiceRate> ServiceRates => Set<ServiceRate>();
    public DbSet<RoomImage> RoomImages => Set<RoomImage>();
    public DbSet<Amenity> Amenities => Set<Amenity>();
    public DbSet<RoomAmenity> RoomAmenities => Set<RoomAmenity>();
    public DbSet<Asset> Assets => Set<Asset>();
    public DbSet<RentalApplication> RentalApplications => Set<RentalApplication>();
    public DbSet<RoomViewingSchedule> RoomViewingSchedules => Set<RoomViewingSchedule>();
    public DbSet<RoomViewingScheduleRoom> RoomViewingScheduleRooms => Set<RoomViewingScheduleRoom>();
    public DbSet<DepositSlip> DepositSlips => Set<DepositSlip>();
    public DbSet<DepositBed> DepositBeds => Set<DepositBed>();
    public DbSet<RentalContract> RentalContracts => Set<RentalContract>();
    public DbSet<ResidenceRule> ResidenceRules => Set<ResidenceRule>();
    public DbSet<TenantMember> TenantMembers => Set<TenantMember>();
    public DbSet<HandoverReport> HandoverReports => Set<HandoverReport>();
    public DbSet<HandoverDetail> HandoverDetails => Set<HandoverDetail>();
    public DbSet<Reconciliation> Reconciliations => Set<Reconciliation>();
    public DbSet<AdditionalCost> AdditionalCosts => Set<AdditionalCost>();
    public DbSet<CheckoutReport> CheckoutReports => Set<CheckoutReport>();
    public DbSet<CheckoutRequest> CheckoutRequests => Set<CheckoutRequest>();
    public DbSet<Invoice> Invoices => Set<Invoice>();
    public DbSet<InvoiceServiceDetail> InvoiceServiceDetails => Set<InvoiceServiceDetail>();
    public DbSet<AdminAuditLog> AdminAuditLogs => Set<AdminAuditLog>();
    public DbSet<Notification> Notifications => Set<Notification>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // ---------------- chi_nhanh ----------------
        modelBuilder.Entity<Branch>(e =>
        {
            e.ToTable("chi_nhanh");
            e.HasKey(x => x.BranchId).HasName("pk_chi_nhanh");
            e.Property(x => x.BranchId).HasColumnName("ma_chi_nhanh").HasMaxLength(10);
            e.Property(x => x.BranchName).HasColumnName("ten_chi_nhanh").HasMaxLength(100).IsRequired();
            e.Property(x => x.Address).HasColumnName("dia_chi").HasMaxLength(200).IsRequired();
            e.Property(x => x.PhoneNumber).HasColumnName("so_dien_thoai").HasMaxLength(15);
            e.Property(x => x.Email).HasColumnName("email").HasMaxLength(100);
        });

        // ---------------- phong ----------------
        modelBuilder.Entity<Room>(e =>
        {
            e.ToTable("phong", t => t.HasCheckConstraint("chk_phong_suc_chua", "[suc_chua] > 0"));
            e.HasKey(x => x.RoomId).HasName("pk_phong");
            e.Property(x => x.RoomId).HasColumnName("ma_phong").HasMaxLength(10);
            e.Property(x => x.BranchId).HasColumnName("ma_chi_nhanh").HasMaxLength(10).IsRequired();
            e.Property(x => x.RoomName).HasColumnName("ten_phong").HasMaxLength(50).IsRequired();
            e.Property(x => x.RoomType).HasColumnName("loai_phong").HasMaxLength(30).IsRequired();
            e.Property(x => x.Capacity).HasColumnName("suc_chua");
            e.Property(x => x.Area).HasColumnName("khu_vuc").HasMaxLength(50);
            e.Property(x => x.RoomPrice).HasColumnName("gia_phong").HasColumnType("decimal(12,2)");
            e.Property(x => x.Floor).HasColumnName("tang");
            e.Property(x => x.AreaSquareMeters).HasColumnName("dien_tich_m2").HasColumnType("decimal(6,2)");
            e.Property(x => x.Description).HasColumnName("mo_ta");
            e.Property(x => x.AllowedGender).HasColumnName("gioi_tinh_cho_phep").HasMaxLength(20);
            e.Property(x => x.RequiresQuietLifestyle).HasColumnName("yeu_cau_yen_tinh").HasDefaultValue(false);
            e.Property(x => x.CurfewTime).HasColumnName("gio_gioi_nghiem").HasColumnType("time");
            e.Property(x => x.HasAirConditioner).HasColumnName("co_dieu_hoa").HasDefaultValue(false);
            e.Property(x => x.HasParking).HasColumnName("co_gui_xe").HasDefaultValue(false);
            e.Property(x => x.Status).HasColumnName("trang_thai").HasMaxLength(20).HasDefaultValue(RoomBedStatus.Empty);
            e.Property(x => x.UpdatedAt).HasColumnName("ngay_cap_nhat");
            e.Property(x => x.UpdatedByAccountId).HasColumnName("ma_nguoi_sua").HasMaxLength(12);

            e.HasOne(x => x.Branch)
                .WithMany(b => b.Rooms)
                .HasForeignKey(x => x.BranchId)
                .HasConstraintName("fk_phong_chinhanh")
                .OnDelete(DeleteBehavior.Restrict);

            e.HasOne(x => x.UpdatedByAccount)
                .WithMany()
                .HasForeignKey(x => x.UpdatedByAccountId)
                .HasConstraintName("fk_phong_nguoisua")
                .OnDelete(DeleteBehavior.SetNull);

            e.HasIndex(x => new { x.BranchId, x.Status }).HasDatabaseName("idx_phong_cn");
        });

        // ---------------- hinh_anh_phong ----------------
        modelBuilder.Entity<RoomImage>(e =>
        {
            e.ToTable("hinh_anh_phong");
            e.HasKey(x => x.RoomImageId).HasName("pk_hinh_anh_phong");
            e.Property(x => x.RoomImageId).HasColumnName("ma_hinh_anh").HasMaxLength(12);
            e.Property(x => x.RoomId).HasColumnName("ma_phong").HasMaxLength(10).IsRequired();
            e.Property(x => x.ImageUrl).HasColumnName("duong_dan").HasMaxLength(500).IsRequired();
            e.Property(x => x.Description).HasColumnName("mo_ta").HasMaxLength(200);
            e.Property(x => x.DisplayOrder).HasColumnName("thu_tu_hien_thi");
            e.Property(x => x.IsPrimary).HasColumnName("la_anh_dai_dien").HasDefaultValue(false);
            e.HasOne(x => x.Room).WithMany(x => x.Images).HasForeignKey(x => x.RoomId)
                .HasConstraintName("fk_hinhanh_phong").OnDelete(DeleteBehavior.Cascade);
            e.HasIndex(x => new { x.RoomId, x.DisplayOrder }).HasDatabaseName("idx_hinhanh_phong_thutu");
        });

        // ---------------- tien_nghi ----------------
        modelBuilder.Entity<Amenity>(e =>
        {
            e.ToTable("tien_nghi");
            e.HasKey(x => x.AmenityId).HasName("pk_tien_nghi");
            e.Property(x => x.AmenityId).HasColumnName("ma_tien_nghi").HasMaxLength(20);
            e.Property(x => x.AmenityName).HasColumnName("ten_tien_nghi").HasMaxLength(100).IsRequired();
            e.Property(x => x.Description).HasColumnName("mo_ta").HasMaxLength(300);
            e.Property(x => x.IsActive).HasColumnName("is_active").HasDefaultValue(true);
            e.HasIndex(x => x.AmenityName).IsUnique().HasDatabaseName("uq_tiennghi_ten");
        });

        // ---------------- phong_tien_nghi ----------------
        modelBuilder.Entity<RoomAmenity>(e =>
        {
            e.ToTable("phong_tien_nghi");
            e.HasKey(x => new { x.RoomId, x.AmenityId }).HasName("pk_phong_tien_nghi");
            e.Property(x => x.RoomId).HasColumnName("ma_phong").HasMaxLength(10);
            e.Property(x => x.AmenityId).HasColumnName("ma_tien_nghi").HasMaxLength(20);
            e.Property(x => x.Quantity).HasColumnName("so_luong").HasDefaultValue((short)1);
            e.Property(x => x.Note).HasColumnName("ghi_chu").HasMaxLength(200);
            e.HasOne(x => x.Room).WithMany(x => x.RoomAmenities).HasForeignKey(x => x.RoomId)
                .HasConstraintName("fk_ptn_phong").OnDelete(DeleteBehavior.Cascade);
            e.HasOne(x => x.Amenity).WithMany(x => x.RoomAmenities).HasForeignKey(x => x.AmenityId)
                .HasConstraintName("fk_ptn_tiennghi").OnDelete(DeleteBehavior.Restrict);
        });

        // ---------------- giuong ----------------
        modelBuilder.Entity<Bed>(e =>
        {
            e.ToTable("giuong", t => t.HasCheckConstraint("chk_giuong_gia", "[gia_thue_thang] > 0"));
            e.HasKey(x => x.BedId).HasName("pk_giuong");
            e.Property(x => x.BedId).HasColumnName("ma_giuong").HasMaxLength(12);
            e.Property(x => x.RoomId).HasColumnName("ma_phong").HasMaxLength(10).IsRequired();
            e.Property(x => x.BedNumber).HasColumnName("so_thu_tu");
            e.Property(x => x.MonthlyRent).HasColumnName("gia_thue_thang").HasColumnType("decimal(12,2)");
            e.Property(x => x.Status).HasColumnName("trang_thai").HasMaxLength(20).HasDefaultValue(RoomBedStatus.Empty);
            e.Property(x => x.UpdatedAt).HasColumnName("ngay_cap_nhat");
            e.Property(x => x.UpdatedByAccountId).HasColumnName("ma_nguoi_sua").HasMaxLength(12);

            e.HasOne(x => x.Room)
                .WithMany(r => r.Beds)
                .HasForeignKey(x => x.RoomId)
                .HasConstraintName("fk_giuong_phong")
                .OnDelete(DeleteBehavior.Restrict);

            e.HasOne(x => x.UpdatedByAccount)
                .WithMany()
                .HasForeignKey(x => x.UpdatedByAccountId)
                .HasConstraintName("fk_giuong_nguoisua")
                .OnDelete(DeleteBehavior.SetNull);

            e.HasIndex(x => new { x.RoomId, x.BedNumber }).IsUnique().HasDatabaseName("uq_giuong_phong_stt");
            e.HasIndex(x => x.Status).HasDatabaseName("idx_giuong_tt");
            e.HasIndex(x => x.RoomId).HasDatabaseName("idx_giuong_phong");
        });

        // ---------------- nhan_vien ----------------
        modelBuilder.Entity<Employee>(e =>
        {
            e.ToTable("nhan_vien");
            e.HasKey(x => x.EmployeeId).HasName("pk_nhan_vien");
            e.Property(x => x.EmployeeId).HasColumnName("ma_nv").HasMaxLength(10);
            e.Property(x => x.BranchId).HasColumnName("ma_chi_nhanh").HasMaxLength(10);
            e.Property(x => x.FullName).HasColumnName("ho_ten").HasMaxLength(100).IsRequired();
            e.Property(x => x.PhoneNumber).HasColumnName("so_dien_thoai").HasMaxLength(15);
            e.Property(x => x.Email).HasColumnName("email").HasMaxLength(100);
            e.Property(x => x.Position).HasColumnName("vai_tro").HasMaxLength(20).IsRequired();
            e.Property(x => x.HireDate).HasColumnName("ngay_vao_lam").HasColumnType("date");
            e.Property(x => x.IsActive).HasColumnName("is_active").HasDefaultValue(true);

            e.HasOne(x => x.Branch)
                .WithMany(b => b.Employees)
                .HasForeignKey(x => x.BranchId)
                .HasConstraintName("fk_nhanvien_chinhanh")
                .OnDelete(DeleteBehavior.SetNull);

            e.HasIndex(x => x.Email).IsUnique().HasDatabaseName("uq_nhanvien_email");
            e.HasIndex(x => x.Position).HasDatabaseName("idx_nv_vaitro");
        });

        // ---------------- khach_hang ----------------
        modelBuilder.Entity<Customer>(e =>
        {
            e.ToTable("khach_hang");
            e.HasKey(x => x.CustomerId).HasName("pk_khach_hang");
            e.Property(x => x.CustomerId).HasColumnName("ma_kh").HasMaxLength(12);
            e.Property(x => x.FullName).HasColumnName("ho_ten").HasMaxLength(100).IsRequired();
            e.Property(x => x.NationalId).HasColumnName("cccd").HasMaxLength(20).IsRequired();
            e.Property(x => x.PhoneNumber).HasColumnName("so_dien_thoai").HasMaxLength(15).IsRequired();
            e.Property(x => x.Email).HasColumnName("email").HasMaxLength(100);
            e.Property(x => x.Gender).HasColumnName("gioi_tinh").HasMaxLength(3);
            e.Property(x => x.Nationality).HasColumnName("quoc_tich").HasMaxLength(50).HasDefaultValue("Việt Nam");
            e.Property(x => x.DateOfBirth).HasColumnName("ngay_sinh").HasColumnType("date");
            e.Property(x => x.Address).HasColumnName("dia_chi").HasMaxLength(200);
            e.Property(x => x.CreatedAt).HasColumnName("ngay_tao").HasDefaultValueSql("SYSUTCDATETIME()");

            e.HasIndex(x => x.NationalId).IsUnique().HasDatabaseName("uq_kh_cccd");
        });

        // ---------------- vai_tro_he_thong ----------------
        modelBuilder.Entity<SystemRole>(e =>
        {
            e.ToTable("vai_tro_he_thong");
            e.HasKey(x => x.RoleId).HasName("pk_vai_tro_he_thong");
            e.Property(x => x.RoleId).HasColumnName("ma_vai_tro").HasMaxLength(30);
            e.Property(x => x.RoleName).HasColumnName("ten_vai_tro").HasMaxLength(100).IsRequired();
            e.Property(x => x.Description).HasColumnName("mo_ta");
        });

        // ---------------- quyen_he_thong ----------------
        modelBuilder.Entity<Permission>(e =>
        {
            e.ToTable("quyen_he_thong");
            e.HasKey(x => x.PermissionId).HasName("pk_quyen_he_thong");
            e.Property(x => x.PermissionId).HasColumnName("ma_quyen").HasMaxLength(50);
            e.Property(x => x.PermissionName).HasColumnName("ten_quyen").HasMaxLength(100).IsRequired();
            e.Property(x => x.Description).HasColumnName("mo_ta");
        });

        // ---------------- vai_tro_quyen ----------------
        modelBuilder.Entity<RolePermission>(e =>
        {
            e.ToTable("vai_tro_quyen");
            e.HasKey(x => new { x.RoleId, x.PermissionId }).HasName("pk_vai_tro_quyen");
            e.Property(x => x.RoleId).HasColumnName("ma_vai_tro").HasMaxLength(30);
            e.Property(x => x.PermissionId).HasColumnName("ma_quyen").HasMaxLength(50);

            e.HasOne(x => x.Role)
                .WithMany(r => r.RolePermissions)
                .HasForeignKey(x => x.RoleId)
                .HasConstraintName("fk_vtq_vaitro")
                .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(x => x.Permission)
                .WithMany(p => p.RolePermissions)
                .HasForeignKey(x => x.PermissionId)
                .HasConstraintName("fk_vtq_quyen")
                .OnDelete(DeleteBehavior.Cascade);
        });

        // ---------------- tai_khoan ----------------
        modelBuilder.Entity<Account>(e =>
        {
            e.ToTable("tai_khoan", t => t.HasCheckConstraint(
                "chk_taikhoan_chusohuu",
                "([ma_nv] IS NOT NULL AND [ma_kh] IS NULL) OR ([ma_nv] IS NULL AND [ma_kh] IS NOT NULL)"));
            e.HasKey(x => x.AccountId).HasName("pk_tai_khoan");
            e.Property(x => x.AccountId).HasColumnName("ma_tai_khoan").HasMaxLength(12);
            e.Property(x => x.Username).HasColumnName("ten_dang_nhap").HasMaxLength(50).IsRequired();
            e.Property(x => x.PasswordHash).HasColumnName("mat_khau_hash").HasMaxLength(255).IsRequired();
            e.Property(x => x.RoleId).HasColumnName("ma_vai_tro").HasMaxLength(30).IsRequired();
            e.Property(x => x.EmployeeId).HasColumnName("ma_nv").HasMaxLength(10);
            e.Property(x => x.CustomerId).HasColumnName("ma_kh").HasMaxLength(12);
            e.Property(x => x.VerifiedEmail).HasColumnName("email_xac_thuc").HasMaxLength(100);
            e.Property(x => x.Status).HasColumnName("trang_thai").HasMaxLength(20).HasDefaultValue(AccountStatus.Active);
            e.Property(x => x.LastLoginAt).HasColumnName("lan_dang_nhap_cuoi");
            e.Property(x => x.CreatedAt).HasColumnName("ngay_tao").HasDefaultValueSql("SYSUTCDATETIME()");
            e.Property(x => x.UpdatedAt).HasColumnName("ngay_cap_nhat");
            e.Property(x => x.CreatedByAccountId).HasColumnName("ma_nguoi_tao").HasMaxLength(12);
            e.Property(x => x.ResetTokenHash).HasColumnName("reset_token_hash").HasMaxLength(255);
            e.Property(x => x.ResetTokenExpiresAt).HasColumnName("reset_token_het_han");

            e.HasOne(x => x.Role)
                .WithMany(r => r.Accounts)
                .HasForeignKey(x => x.RoleId)
                .HasConstraintName("fk_taikhoan_vaitro")
                .OnDelete(DeleteBehavior.Restrict);

            e.HasOne(x => x.Employee)
                .WithOne(nv => nv.Account)
                .HasForeignKey<Account>(x => x.EmployeeId)
                .HasConstraintName("fk_taikhoan_nv")
                .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(x => x.Customer)
                .WithOne(kh => kh.Account)
                .HasForeignKey<Account>(x => x.CustomerId)
                .HasConstraintName("fk_taikhoan_kh")
                .OnDelete(DeleteBehavior.Cascade);

            // Self-referencing FK: SQL Server rejects a cascading action here because it would
            // combine with the incoming cascades from Employee/Customer into a multi-path cycle.
            e.HasOne(x => x.CreatedByAccount)
                .WithMany()
                .HasForeignKey(x => x.CreatedByAccountId)
                .HasConstraintName("fk_taikhoan_nguoitao")
                .OnDelete(DeleteBehavior.ClientSetNull);

            e.HasIndex(x => x.Username).IsUnique().HasDatabaseName("uq_taikhoan_username");
            e.HasIndex(x => x.EmployeeId).IsUnique().HasDatabaseName("uq_taikhoan_nv").HasFilter("[ma_nv] IS NOT NULL");
            e.HasIndex(x => x.CustomerId).IsUnique().HasDatabaseName("uq_taikhoan_kh").HasFilter("[ma_kh] IS NOT NULL");
            e.HasIndex(x => new { x.RoleId, x.Status }).HasDatabaseName("idx_taikhoan_vaitro");
        });

        // ---------------- tham_so_he_thong ----------------
        modelBuilder.Entity<SystemParameter>(e =>
        {
            e.ToTable("tham_so_he_thong");
            e.HasKey(x => x.ParameterId).HasName("pk_tham_so_he_thong");
            e.Property(x => x.ParameterId).HasColumnName("ma_tham_so").HasMaxLength(50);
            e.Property(x => x.ParameterName).HasColumnName("ten_tham_so").HasMaxLength(100).IsRequired();
            e.Property(x => x.ParameterGroup).HasColumnName("nhom_tham_so").HasMaxLength(50).IsRequired();
            e.Property(x => x.Value).HasColumnName("gia_tri").IsRequired();
            e.Property(x => x.DataType).HasColumnName("kieu_du_lieu").HasMaxLength(20).IsRequired();
            e.Property(x => x.Description).HasColumnName("mo_ta");
            e.Property(x => x.IsActive).HasColumnName("is_active").HasDefaultValue(true);
            e.Property(x => x.UpdatedAt).HasColumnName("ngay_cap_nhat");
            e.Property(x => x.UpdatedByAccountId).HasColumnName("ma_nguoi_sua").HasMaxLength(12);

            e.HasOne(x => x.UpdatedByAccount)
                .WithMany()
                .HasForeignKey(x => x.UpdatedByAccountId)
                .HasConstraintName("fk_thamso_nguoisua")
                .OnDelete(DeleteBehavior.SetNull);

            e.HasIndex(x => new { x.ParameterGroup, x.IsActive }).HasDatabaseName("idx_thamso_nhom");
        });

        // ---------------- dich_vu ----------------
        modelBuilder.Entity<Service>(e =>
        {
            e.ToTable("dich_vu", t => t.HasCheckConstraint("chk_dichvu_dongia", "[don_gia] >= 0"));
            e.HasKey(x => x.ServiceId).HasName("pk_dich_vu");
            e.Property(x => x.ServiceId).HasColumnName("ma_dich_vu").HasMaxLength(12);
            e.Property(x => x.ServiceName).HasColumnName("ten_dich_vu").HasMaxLength(100).IsRequired();
            e.Property(x => x.ServiceType).HasColumnName("loai_dich_vu").HasMaxLength(30).IsRequired();
            e.Property(x => x.Unit).HasColumnName("don_vi_tinh").HasMaxLength(30).IsRequired();
            e.Property(x => x.UnitPrice).HasColumnName("don_gia").HasColumnType("decimal(12,2)").IsRequired();
            e.Property(x => x.Description).HasColumnName("mo_ta");
            e.Property(x => x.IsActive).HasColumnName("is_active").HasDefaultValue(true);
            e.Property(x => x.UpdatedAt).HasColumnName("ngay_cap_nhat");
            e.Property(x => x.UpdatedByAccountId).HasColumnName("ma_nguoi_sua").HasMaxLength(12);

            e.HasOne(x => x.UpdatedByAccount)
                .WithMany()
                .HasForeignKey(x => x.UpdatedByAccountId)
                .HasConstraintName("fk_dichvu_nguoisua")
                .OnDelete(DeleteBehavior.SetNull);

            e.HasIndex(x => x.ServiceName).IsUnique().HasDatabaseName("uq_dichvu_ten");
            e.HasIndex(x => new { x.ServiceType, x.IsActive }).HasDatabaseName("idx_dichvu_loai");
        });

        modelBuilder.Entity<ServiceRate>(e =>
        {
            e.ToTable("gia_dich_vu_ap_dung", t =>
            {
                t.HasCheckConstraint("chk_giadv_dongia", "[don_gia] >= 0");
                t.HasCheckConstraint("chk_giadv_phamvi", "([ma_chi_nhanh] IS NOT NULL AND [ma_phong] IS NULL) OR ([ma_chi_nhanh] IS NULL AND [ma_phong] IS NOT NULL)");
            });
            e.HasKey(x => x.ServiceRateId).HasName("pk_gia_dich_vu_ap_dung");
            e.Property(x => x.ServiceRateId).HasColumnName("ma_gia_ap_dung").HasMaxLength(12);
            e.Property(x => x.ServiceId).HasColumnName("ma_dich_vu").HasMaxLength(12).IsRequired();
            e.Property(x => x.BranchId).HasColumnName("ma_chi_nhanh").HasMaxLength(10);
            e.Property(x => x.RoomId).HasColumnName("ma_phong").HasMaxLength(10);
            e.Property(x => x.UnitPrice).HasColumnName("don_gia").HasColumnType("decimal(12,2)");
            e.Property(x => x.IsActive).HasColumnName("is_active").HasDefaultValue(true);
            e.HasOne(x => x.Service).WithMany().HasForeignKey(x => x.ServiceId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(x => x.Branch).WithMany().HasForeignKey(x => x.BranchId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(x => x.Room).WithMany().HasForeignKey(x => x.RoomId).OnDelete(DeleteBehavior.Restrict);
            e.HasIndex(x => new { x.ServiceId, x.BranchId }).IsUnique().HasFilter("[ma_chi_nhanh] IS NOT NULL").HasDatabaseName("uq_giadv_dichvu_chinhanh");
            e.HasIndex(x => new { x.ServiceId, x.RoomId }).IsUnique().HasFilter("[ma_phong] IS NOT NULL").HasDatabaseName("uq_giadv_dichvu_phong");
        });

        modelBuilder.ConfigureWorkflowModels();
    }
}
