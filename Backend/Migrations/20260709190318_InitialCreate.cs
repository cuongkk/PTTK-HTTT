using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "chi_nhanh",
                columns: table => new
                {
                    ma_chi_nhanh = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    ten_chi_nhanh = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    dia_chi = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    so_dien_thoai = table.Column<string>(type: "nvarchar(15)", maxLength: 15, nullable: true),
                    email = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_chi_nhanh", x => x.ma_chi_nhanh);
                });

            migrationBuilder.CreateTable(
                name: "khach_hang",
                columns: table => new
                {
                    ma_kh = table.Column<string>(type: "nvarchar(12)", maxLength: 12, nullable: false),
                    ho_ten = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    cccd = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    so_dien_thoai = table.Column<string>(type: "nvarchar(15)", maxLength: 15, nullable: false),
                    email = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    gioi_tinh = table.Column<string>(type: "nvarchar(3)", maxLength: 3, nullable: true),
                    quoc_tich = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false, defaultValue: "Việt Nam"),
                    ngay_sinh = table.Column<DateOnly>(type: "date", nullable: true),
                    dia_chi = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    ngay_tao = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSUTCDATETIME()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_khach_hang", x => x.ma_kh);
                });

            migrationBuilder.CreateTable(
                name: "quyen_he_thong",
                columns: table => new
                {
                    ma_quyen = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    ten_quyen = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    mo_ta = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_quyen_he_thong", x => x.ma_quyen);
                });

            migrationBuilder.CreateTable(
                name: "vai_tro_he_thong",
                columns: table => new
                {
                    ma_vai_tro = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    ten_vai_tro = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    mo_ta = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_vai_tro_he_thong", x => x.ma_vai_tro);
                });

            migrationBuilder.CreateTable(
                name: "nhan_vien",
                columns: table => new
                {
                    ma_nv = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    ma_chi_nhanh = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: true),
                    ho_ten = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    so_dien_thoai = table.Column<string>(type: "nvarchar(15)", maxLength: 15, nullable: true),
                    email = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    vai_tro = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    ngay_vao_lam = table.Column<DateOnly>(type: "date", nullable: true),
                    is_active = table.Column<bool>(type: "bit", nullable: false, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_nhan_vien", x => x.ma_nv);
                    table.ForeignKey(
                        name: "fk_nhanvien_chinhanh",
                        column: x => x.ma_chi_nhanh,
                        principalTable: "chi_nhanh",
                        principalColumn: "ma_chi_nhanh",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "vai_tro_quyen",
                columns: table => new
                {
                    ma_vai_tro = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    ma_quyen = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_vai_tro_quyen", x => new { x.ma_vai_tro, x.ma_quyen });
                    table.ForeignKey(
                        name: "fk_vtq_quyen",
                        column: x => x.ma_quyen,
                        principalTable: "quyen_he_thong",
                        principalColumn: "ma_quyen",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_vtq_vaitro",
                        column: x => x.ma_vai_tro,
                        principalTable: "vai_tro_he_thong",
                        principalColumn: "ma_vai_tro",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "tai_khoan",
                columns: table => new
                {
                    ma_tai_khoan = table.Column<string>(type: "nvarchar(12)", maxLength: 12, nullable: false),
                    ten_dang_nhap = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    mat_khau_hash = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    ma_vai_tro = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    ma_nv = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: true),
                    ma_kh = table.Column<string>(type: "nvarchar(12)", maxLength: 12, nullable: true),
                    email_xac_thuc = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    trang_thai = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false, defaultValue: "kich_hoat"),
                    lan_dang_nhap_cuoi = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ngay_tao = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSUTCDATETIME()"),
                    ngay_cap_nhat = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ma_nguoi_tao = table.Column<string>(type: "nvarchar(12)", maxLength: 12, nullable: true),
                    reset_token_hash = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    reset_token_het_han = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_tai_khoan", x => x.ma_tai_khoan);
                    table.CheckConstraint("chk_taikhoan_chusohuu", "([ma_nv] IS NOT NULL AND [ma_kh] IS NULL) OR ([ma_nv] IS NULL AND [ma_kh] IS NOT NULL)");
                    table.ForeignKey(
                        name: "fk_taikhoan_kh",
                        column: x => x.ma_kh,
                        principalTable: "khach_hang",
                        principalColumn: "ma_kh",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_taikhoan_nguoitao",
                        column: x => x.ma_nguoi_tao,
                        principalTable: "tai_khoan",
                        principalColumn: "ma_tai_khoan");
                    table.ForeignKey(
                        name: "fk_taikhoan_nv",
                        column: x => x.ma_nv,
                        principalTable: "nhan_vien",
                        principalColumn: "ma_nv",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_taikhoan_vaitro",
                        column: x => x.ma_vai_tro,
                        principalTable: "vai_tro_he_thong",
                        principalColumn: "ma_vai_tro",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "dich_vu",
                columns: table => new
                {
                    ma_dich_vu = table.Column<string>(type: "nvarchar(12)", maxLength: 12, nullable: false),
                    ten_dich_vu = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    loai_dich_vu = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    don_vi_tinh = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    don_gia = table.Column<decimal>(type: "decimal(12,2)", nullable: false),
                    mo_ta = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    is_active = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    ngay_cap_nhat = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ma_nguoi_sua = table.Column<string>(type: "nvarchar(12)", maxLength: 12, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_dich_vu", x => x.ma_dich_vu);
                    table.CheckConstraint("chk_dichvu_dongia", "[don_gia] >= 0");
                    table.ForeignKey(
                        name: "fk_dichvu_nguoisua",
                        column: x => x.ma_nguoi_sua,
                        principalTable: "tai_khoan",
                        principalColumn: "ma_tai_khoan",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "nhat_ky_quan_tri",
                columns: table => new
                {
                    ma_nk = table.Column<string>(type: "nvarchar(12)", maxLength: 12, nullable: false),
                    ma_nguoi_thuc = table.Column<string>(type: "nvarchar(12)", maxLength: 12, nullable: false),
                    ma_doi_tuong = table.Column<string>(type: "nvarchar(12)", maxLength: 12, nullable: true),
                    loai_hanh_dong = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    gia_tri_cu = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    gia_tri_moi = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    thoi_diem = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSUTCDATETIME()"),
                    ghi_chu = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_nhat_ky_qt", x => x.ma_nk);
                    table.ForeignKey(
                        name: "fk_nkqt_doituong",
                        column: x => x.ma_doi_tuong,
                        principalTable: "tai_khoan",
                        principalColumn: "ma_tai_khoan",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "fk_nkqt_nguoithuc",
                        column: x => x.ma_nguoi_thuc,
                        principalTable: "tai_khoan",
                        principalColumn: "ma_tai_khoan",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "phong",
                columns: table => new
                {
                    ma_phong = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    ma_chi_nhanh = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    ten_phong = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    loai_phong = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    suc_chua = table.Column<short>(type: "smallint", nullable: false),
                    khu_vuc = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    gia_phong = table.Column<decimal>(type: "decimal(12,2)", nullable: true),
                    co_dieu_hoa = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    co_gui_xe = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    trang_thai = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false, defaultValue: "trong"),
                    ngay_cap_nhat = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ma_nguoi_sua = table.Column<string>(type: "nvarchar(12)", maxLength: 12, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_phong", x => x.ma_phong);
                    table.CheckConstraint("chk_phong_suc_chua", "[suc_chua] > 0");
                    table.ForeignKey(
                        name: "fk_phong_chinhanh",
                        column: x => x.ma_chi_nhanh,
                        principalTable: "chi_nhanh",
                        principalColumn: "ma_chi_nhanh",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_phong_nguoisua",
                        column: x => x.ma_nguoi_sua,
                        principalTable: "tai_khoan",
                        principalColumn: "ma_tai_khoan",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "tham_so_he_thong",
                columns: table => new
                {
                    ma_tham_so = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    ten_tham_so = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    nhom_tham_so = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    gia_tri = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    kieu_du_lieu = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    mo_ta = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    is_active = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    ngay_cap_nhat = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ma_nguoi_sua = table.Column<string>(type: "nvarchar(12)", maxLength: 12, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_tham_so_he_thong", x => x.ma_tham_so);
                    table.ForeignKey(
                        name: "fk_thamso_nguoisua",
                        column: x => x.ma_nguoi_sua,
                        principalTable: "tai_khoan",
                        principalColumn: "ma_tai_khoan",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "giuong",
                columns: table => new
                {
                    ma_giuong = table.Column<string>(type: "nvarchar(12)", maxLength: 12, nullable: false),
                    ma_phong = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    so_thu_tu = table.Column<short>(type: "smallint", nullable: false),
                    gia_thue_thang = table.Column<decimal>(type: "decimal(12,2)", nullable: false),
                    trang_thai = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false, defaultValue: "trong"),
                    ngay_cap_nhat = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ma_nguoi_sua = table.Column<string>(type: "nvarchar(12)", maxLength: 12, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_giuong", x => x.ma_giuong);
                    table.CheckConstraint("chk_giuong_gia", "[gia_thue_thang] > 0");
                    table.ForeignKey(
                        name: "fk_giuong_nguoisua",
                        column: x => x.ma_nguoi_sua,
                        principalTable: "tai_khoan",
                        principalColumn: "ma_tai_khoan",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "fk_giuong_phong",
                        column: x => x.ma_phong,
                        principalTable: "phong",
                        principalColumn: "ma_phong",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "idx_dichvu_loai",
                table: "dich_vu",
                columns: new[] { "loai_dich_vu", "is_active" });

            migrationBuilder.CreateIndex(
                name: "IX_dich_vu_ma_nguoi_sua",
                table: "dich_vu",
                column: "ma_nguoi_sua");

            migrationBuilder.CreateIndex(
                name: "uq_dichvu_ten",
                table: "dich_vu",
                column: "ten_dich_vu",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "idx_giuong_phong",
                table: "giuong",
                column: "ma_phong");

            migrationBuilder.CreateIndex(
                name: "idx_giuong_tt",
                table: "giuong",
                column: "trang_thai");

            migrationBuilder.CreateIndex(
                name: "IX_giuong_ma_nguoi_sua",
                table: "giuong",
                column: "ma_nguoi_sua");

            migrationBuilder.CreateIndex(
                name: "uq_giuong_phong_stt",
                table: "giuong",
                columns: new[] { "ma_phong", "so_thu_tu" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "uq_kh_cccd",
                table: "khach_hang",
                column: "cccd",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "idx_nv_vaitro",
                table: "nhan_vien",
                column: "vai_tro");

            migrationBuilder.CreateIndex(
                name: "IX_nhan_vien_ma_chi_nhanh",
                table: "nhan_vien",
                column: "ma_chi_nhanh");

            migrationBuilder.CreateIndex(
                name: "uq_nhanvien_email",
                table: "nhan_vien",
                column: "email",
                unique: true,
                filter: "[email] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "idx_nkqt_doituong",
                table: "nhat_ky_quan_tri",
                columns: new[] { "ma_doi_tuong", "thoi_diem" });

            migrationBuilder.CreateIndex(
                name: "idx_nkqt_hanhdong",
                table: "nhat_ky_quan_tri",
                columns: new[] { "loai_hanh_dong", "thoi_diem" });

            migrationBuilder.CreateIndex(
                name: "idx_nkqt_nguoithuc",
                table: "nhat_ky_quan_tri",
                columns: new[] { "ma_nguoi_thuc", "thoi_diem" });

            migrationBuilder.CreateIndex(
                name: "idx_phong_cn",
                table: "phong",
                columns: new[] { "ma_chi_nhanh", "trang_thai" });

            migrationBuilder.CreateIndex(
                name: "IX_phong_ma_nguoi_sua",
                table: "phong",
                column: "ma_nguoi_sua");

            migrationBuilder.CreateIndex(
                name: "idx_taikhoan_vaitro",
                table: "tai_khoan",
                columns: new[] { "ma_vai_tro", "trang_thai" });

            migrationBuilder.CreateIndex(
                name: "IX_tai_khoan_ma_nguoi_tao",
                table: "tai_khoan",
                column: "ma_nguoi_tao");

            migrationBuilder.CreateIndex(
                name: "uq_taikhoan_kh",
                table: "tai_khoan",
                column: "ma_kh",
                unique: true,
                filter: "[ma_kh] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "uq_taikhoan_nv",
                table: "tai_khoan",
                column: "ma_nv",
                unique: true,
                filter: "[ma_nv] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "uq_taikhoan_username",
                table: "tai_khoan",
                column: "ten_dang_nhap",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "idx_thamso_nhom",
                table: "tham_so_he_thong",
                columns: new[] { "nhom_tham_so", "is_active" });

            migrationBuilder.CreateIndex(
                name: "IX_tham_so_he_thong_ma_nguoi_sua",
                table: "tham_so_he_thong",
                column: "ma_nguoi_sua");

            migrationBuilder.CreateIndex(
                name: "IX_vai_tro_quyen_ma_quyen",
                table: "vai_tro_quyen",
                column: "ma_quyen");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "dich_vu");

            migrationBuilder.DropTable(
                name: "giuong");

            migrationBuilder.DropTable(
                name: "nhat_ky_quan_tri");

            migrationBuilder.DropTable(
                name: "tham_so_he_thong");

            migrationBuilder.DropTable(
                name: "vai_tro_quyen");

            migrationBuilder.DropTable(
                name: "phong");

            migrationBuilder.DropTable(
                name: "quyen_he_thong");

            migrationBuilder.DropTable(
                name: "tai_khoan");

            migrationBuilder.DropTable(
                name: "khach_hang");

            migrationBuilder.DropTable(
                name: "nhan_vien");

            migrationBuilder.DropTable(
                name: "vai_tro_he_thong");

            migrationBuilder.DropTable(
                name: "chi_nhanh");
        }
    }
}
