using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class SynchronizeFullHomestaySchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ho_so_dang_ky",
                columns: table => new
                {
                    ma_ho_so = table.Column<string>(type: "nvarchar(12)", maxLength: 12, nullable: false),
                    ma_kh = table.Column<string>(type: "nvarchar(12)", maxLength: 12, nullable: false),
                    ma_sale = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: true),
                    so_nguoi = table.Column<short>(type: "smallint", nullable: false),
                    thoi_gian_du_kien_thue = table.Column<DateOnly>(type: "date", nullable: true),
                    thoi_han_thue_thang = table.Column<short>(type: "smallint", nullable: true),
                    khu_vuc_mong_muon = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    loai_phong_mong_muon = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: true),
                    gia_toi_thieu = table.Column<decimal>(type: "decimal(12,2)", nullable: true),
                    gia_toi_da = table.Column<decimal>(type: "decimal(12,2)", nullable: true),
                    gioi_tinh = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    gio_giac_sinh_hoat = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    yeu_cau_yen_tinh = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    yeu_cau_gui_xe = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    yeu_cau_dieu_hoa = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    yeu_cau_khac = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    trang_thai = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false, defaultValue: "moi"),
                    ngay_tao = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSUTCDATETIME()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_ho_so", x => x.ma_ho_so);
                    table.CheckConstraint("chk_hoso_songuoi", "[so_nguoi] > 0");
                    table.CheckConstraint("chk_hoso_trangthai", "[trang_thai] IN ('moi','da_xem_phong','da_dat_coc','huy')");
                    table.ForeignKey(
                        name: "fk_hoso_kh",
                        column: x => x.ma_kh,
                        principalTable: "khach_hang",
                        principalColumn: "ma_kh",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_hoso_sale",
                        column: x => x.ma_sale,
                        principalTable: "nhan_vien",
                        principalColumn: "ma_nv",
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
                name: "tai_san",
                columns: table => new
                {
                    ma_tai_san = table.Column<string>(type: "nvarchar(12)", maxLength: 12, nullable: false),
                    ma_phong = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    ten_tai_san = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    mo_ta = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    tinh_trang = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false, defaultValue: "tot")
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_tai_san", x => x.ma_tai_san);
                    table.ForeignKey(
                        name: "fk_taisan_phong",
                        column: x => x.ma_phong,
                        principalTable: "phong",
                        principalColumn: "ma_phong",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "thong_bao",
                columns: table => new
                {
                    ma_thong_bao = table.Column<string>(type: "nvarchar(12)", maxLength: 12, nullable: false),
                    ma_nguoi_gui = table.Column<string>(type: "nvarchar(12)", maxLength: 12, nullable: true),
                    ma_nguoi_nhan = table.Column<string>(type: "nvarchar(12)", maxLength: 12, nullable: false),
                    tieu_de = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    noi_dung = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ngay_tao = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSUTCDATETIME()"),
                    da_doc = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    ngay_doc = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_thong_bao", x => x.ma_thong_bao);
                    table.ForeignKey(
                        name: "fk_tb_nguoigui",
                        column: x => x.ma_nguoi_gui,
                        principalTable: "tai_khoan",
                        principalColumn: "ma_tai_khoan");
                    table.ForeignKey(
                        name: "fk_tb_nguoinhan",
                        column: x => x.ma_nguoi_nhan,
                        principalTable: "tai_khoan",
                        principalColumn: "ma_tai_khoan",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "lich_xem_phong",
                columns: table => new
                {
                    ma_lich = table.Column<string>(type: "nvarchar(12)", maxLength: 12, nullable: false),
                    ma_ho_so = table.Column<string>(type: "nvarchar(12)", maxLength: 12, nullable: false),
                    ma_sale = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    ngay_gio_hen = table.Column<DateTime>(type: "datetime2", nullable: false),
                    trang_thai = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false, defaultValue: "sap_den"),
                    ghi_chu = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_lich_xem", x => x.ma_lich);
                    table.CheckConstraint("chk_lich_trangthai", "[trang_thai] IN ('sap_den','hoan_thanh','huy')");
                    table.ForeignKey(
                        name: "fk_lichxem_hoso",
                        column: x => x.ma_ho_so,
                        principalTable: "ho_so_dang_ky",
                        principalColumn: "ma_ho_so",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_lichxem_sale",
                        column: x => x.ma_sale,
                        principalTable: "nhan_vien",
                        principalColumn: "ma_nv",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "phieu_dat_coc",
                columns: table => new
                {
                    ma_coc = table.Column<string>(type: "nvarchar(12)", maxLength: 12, nullable: false),
                    ma_ho_so = table.Column<string>(type: "nvarchar(12)", maxLength: 12, nullable: false),
                    ma_sale = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    ma_quan_ly = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: true),
                    so_tien_coc = table.Column<decimal>(type: "decimal(12,2)", nullable: false),
                    ngay_lap = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSUTCDATETIME()"),
                    han_thanh_toan = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ngay_thanh_toan = table.Column<DateTime>(type: "datetime2", nullable: true),
                    trang_thai = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false, defaultValue: "cho_thanh_toan")
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_phieu_coc", x => x.ma_coc);
                    table.CheckConstraint("chk_coc_sotien", "[so_tien_coc] > 0");
                    table.CheckConstraint("chk_coc_trangthai", "[trang_thai] IN ('cho_thanh_toan','hoan_thanh','het_han','huy')");
                    table.ForeignKey(
                        name: "fk_coc_hoso",
                        column: x => x.ma_ho_so,
                        principalTable: "ho_so_dang_ky",
                        principalColumn: "ma_ho_so",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_coc_quanly",
                        column: x => x.ma_quan_ly,
                        principalTable: "nhan_vien",
                        principalColumn: "ma_nv",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "fk_coc_sale",
                        column: x => x.ma_sale,
                        principalTable: "nhan_vien",
                        principalColumn: "ma_nv",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "lich_xem_phong_phong",
                columns: table => new
                {
                    ma_lich = table.Column<string>(type: "nvarchar(12)", maxLength: 12, nullable: false),
                    ma_phong = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_lxp", x => new { x.ma_lich, x.ma_phong });
                    table.ForeignKey(
                        name: "fk_lxp_lich",
                        column: x => x.ma_lich,
                        principalTable: "lich_xem_phong",
                        principalColumn: "ma_lich",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_lxp_phong",
                        column: x => x.ma_phong,
                        principalTable: "phong",
                        principalColumn: "ma_phong",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "dat_coc_giuong",
                columns: table => new
                {
                    ma_coc = table.Column<string>(type: "nvarchar(12)", maxLength: 12, nullable: false),
                    ma_giuong = table.Column<string>(type: "nvarchar(12)", maxLength: 12, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_dcg", x => new { x.ma_coc, x.ma_giuong });
                    table.ForeignKey(
                        name: "fk_dcg_coc",
                        column: x => x.ma_coc,
                        principalTable: "phieu_dat_coc",
                        principalColumn: "ma_coc",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_dcg_giuong",
                        column: x => x.ma_giuong,
                        principalTable: "giuong",
                        principalColumn: "ma_giuong",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "hop_dong_thue",
                columns: table => new
                {
                    ma_hop_dong = table.Column<string>(type: "nvarchar(12)", maxLength: 12, nullable: false),
                    ma_coc = table.Column<string>(type: "nvarchar(12)", maxLength: 12, nullable: false),
                    ma_kh = table.Column<string>(type: "nvarchar(12)", maxLength: 12, nullable: false),
                    ma_sale = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    ma_phong = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    so_giuong_thue = table.Column<short>(type: "smallint", nullable: false),
                    gia_thue_thang = table.Column<decimal>(type: "decimal(12,2)", nullable: false),
                    ky_thanh_toan = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false, defaultValue: "hang_thang"),
                    ngay_ky = table.Column<DateOnly>(type: "date", nullable: false),
                    ngay_bat_dau = table.Column<DateOnly>(type: "date", nullable: false),
                    ngay_ket_thuc = table.Column<DateOnly>(type: "date", nullable: true),
                    trang_thai = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false, defaultValue: "hieu_luc")
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_hop_dong", x => x.ma_hop_dong);
                    table.CheckConstraint("chk_hd_trangthai", "[trang_thai] IN ('hieu_luc','het_han','thanh_ly')");
                    table.ForeignKey(
                        name: "fk_hd_coc",
                        column: x => x.ma_coc,
                        principalTable: "phieu_dat_coc",
                        principalColumn: "ma_coc",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_hd_kh",
                        column: x => x.ma_kh,
                        principalTable: "khach_hang",
                        principalColumn: "ma_kh",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_hd_phong",
                        column: x => x.ma_phong,
                        principalTable: "phong",
                        principalColumn: "ma_phong",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_hd_sale",
                        column: x => x.ma_sale,
                        principalTable: "nhan_vien",
                        principalColumn: "ma_nv",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "bang_doi_soat",
                columns: table => new
                {
                    ma_doi_soat = table.Column<string>(type: "nvarchar(12)", maxLength: 12, nullable: false),
                    ma_hop_dong = table.Column<string>(type: "nvarchar(12)", maxLength: 12, nullable: false),
                    ma_ke_toan = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    ma_quan_ly = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: true),
                    ngay_lap = table.Column<DateOnly>(type: "date", nullable: false),
                    ty_le_hoan = table.Column<decimal>(type: "decimal(5,2)", nullable: false),
                    so_tien_coc_goc = table.Column<decimal>(type: "decimal(12,2)", nullable: false),
                    so_tien_hoan_co_ban = table.Column<decimal>(type: "decimal(12,2)", nullable: false),
                    tong_khau_tru = table.Column<decimal>(type: "decimal(12,2)", nullable: false, defaultValue: 0m),
                    so_tien_hoan = table.Column<decimal>(type: "decimal(12,2)", nullable: true),
                    so_tien_thu_them = table.Column<decimal>(type: "decimal(12,2)", nullable: true),
                    trang_thai = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false, defaultValue: "cho_xac_nhan")
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_doi_soat", x => x.ma_doi_soat);
                    table.CheckConstraint("chk_ds_trangthai", "[trang_thai] IN ('cho_xac_nhan','da_xac_nhan','hoan_tat')");
                    table.CheckConstraint("chk_ds_tyle", "[ty_le_hoan] IN (50,70,80,100)");
                    table.ForeignKey(
                        name: "fk_ds_hopdong",
                        column: x => x.ma_hop_dong,
                        principalTable: "hop_dong_thue",
                        principalColumn: "ma_hop_dong",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_ds_ketoan",
                        column: x => x.ma_ke_toan,
                        principalTable: "nhan_vien",
                        principalColumn: "ma_nv",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_ds_quanly",
                        column: x => x.ma_quan_ly,
                        principalTable: "nhan_vien",
                        principalColumn: "ma_nv",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "bien_ban_ban_giao",
                columns: table => new
                {
                    ma_bb = table.Column<string>(type: "nvarchar(12)", maxLength: 12, nullable: false),
                    ma_hop_dong = table.Column<string>(type: "nvarchar(12)", maxLength: 12, nullable: false),
                    ma_quan_ly = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    ngay_ban_giao = table.Column<DateOnly>(type: "date", nullable: false),
                    tinh_trang_phong = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    chi_so_dien_dau = table.Column<decimal>(type: "decimal(12,2)", nullable: true),
                    chi_so_nuoc_dau = table.Column<decimal>(type: "decimal(12,2)", nullable: true),
                    ghi_chu = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_bbgiao", x => x.ma_bb);
                    table.ForeignKey(
                        name: "fk_bbgiao_hd",
                        column: x => x.ma_hop_dong,
                        principalTable: "hop_dong_thue",
                        principalColumn: "ma_hop_dong",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_bbgiao_ql",
                        column: x => x.ma_quan_ly,
                        principalTable: "nhan_vien",
                        principalColumn: "ma_nv",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "thanh_vien_thue",
                columns: table => new
                {
                    ma_tv = table.Column<string>(type: "nvarchar(12)", maxLength: 12, nullable: false),
                    ma_kh = table.Column<string>(type: "nvarchar(12)", maxLength: 12, nullable: true),
                    ma_hop_dong = table.Column<string>(type: "nvarchar(12)", maxLength: 12, nullable: true),
                    ho_ten = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    cccd = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    gioi_tinh = table.Column<string>(type: "nvarchar(3)", maxLength: 3, nullable: true),
                    ngay_sinh = table.Column<DateOnly>(type: "date", nullable: true),
                    dat_dieu_kien = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    ghi_chu = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_thanh_vien", x => x.ma_tv);
                    table.CheckConstraint("chk_tv_gioitinh", "[gioi_tinh] IS NULL OR [gioi_tinh] IN ('Nam','Nu')");
                    table.ForeignKey(
                        name: "fk_tv_hopdong",
                        column: x => x.ma_hop_dong,
                        principalTable: "hop_dong_thue",
                        principalColumn: "ma_hop_dong",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_tv_kh",
                        column: x => x.ma_kh,
                        principalTable: "khach_hang",
                        principalColumn: "ma_kh",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "bien_ban_tra_phong",
                columns: table => new
                {
                    ma_bb_tra = table.Column<string>(type: "nvarchar(12)", maxLength: 12, nullable: false),
                    ma_doi_soat = table.Column<string>(type: "nvarchar(12)", maxLength: 12, nullable: false),
                    ma_quan_ly = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    ngay_tra = table.Column<DateOnly>(type: "date", nullable: false),
                    tinh_trang_phong = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    chi_so_dien_cuoi = table.Column<decimal>(type: "decimal(12,2)", nullable: true),
                    chi_so_nuoc_cuoi = table.Column<decimal>(type: "decimal(12,2)", nullable: true),
                    da_thu_khoa = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    ghi_chu = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_bbtra", x => x.ma_bb_tra);
                    table.ForeignKey(
                        name: "fk_bbtra_doisoat",
                        column: x => x.ma_doi_soat,
                        principalTable: "bang_doi_soat",
                        principalColumn: "ma_doi_soat",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_bbtra_quanly",
                        column: x => x.ma_quan_ly,
                        principalTable: "nhan_vien",
                        principalColumn: "ma_nv",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "chi_phi_phat_sinh",
                columns: table => new
                {
                    ma_chi_phi = table.Column<string>(type: "nvarchar(12)", maxLength: 12, nullable: false),
                    ma_doi_soat = table.Column<string>(type: "nvarchar(12)", maxLength: 12, nullable: false),
                    loai_chi_phi = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    so_tien = table.Column<decimal>(type: "decimal(12,2)", nullable: false),
                    mo_ta = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_cpps", x => x.ma_chi_phi);
                    table.CheckConstraint("chk_cpps_loai", "[loai_chi_phi] IN ('no_tien_thue','dien_nuoc','hu_hong','phat_vi_pham','khac')");
                    table.CheckConstraint("chk_cpps_sotien", "[so_tien] >= 0");
                    table.ForeignKey(
                        name: "fk_cpps_doisoat",
                        column: x => x.ma_doi_soat,
                        principalTable: "bang_doi_soat",
                        principalColumn: "ma_doi_soat",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "hoa_don",
                columns: table => new
                {
                    ma_hoa_don = table.Column<string>(type: "nvarchar(12)", maxLength: 12, nullable: false),
                    ma_kh = table.Column<string>(type: "nvarchar(12)", maxLength: 12, nullable: false),
                    ma_ke_toan = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: true),
                    ma_coc = table.Column<string>(type: "nvarchar(12)", maxLength: 12, nullable: true),
                    ma_hop_dong = table.Column<string>(type: "nvarchar(12)", maxLength: 12, nullable: true),
                    ma_doi_soat = table.Column<string>(type: "nvarchar(12)", maxLength: 12, nullable: true),
                    loai_hoa_don = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    loai_chung_tu = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false, defaultValue: "thu"),
                    tong_tien = table.Column<decimal>(type: "decimal(12,2)", nullable: false),
                    phuong_thuc = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false, defaultValue: "chuyen_khoan"),
                    ten_ngan_hang = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    so_tai_khoan = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    chu_tai_khoan = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    ma_giao_dich = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    anh_minh_chung = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ngay_lap = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSUTCDATETIME()"),
                    ngay_thanh_toan = table.Column<DateTime>(type: "datetime2", nullable: true),
                    trang_thai = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false, defaultValue: "cho_thanh_toan"),
                    ky_thanh_toan = table.Column<DateOnly>(type: "date", nullable: true),
                    ghi_chu = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_hoa_don", x => x.ma_hoa_don);
                    table.CheckConstraint("chk_hd2_chungtu", "[loai_chung_tu] IN ('thu','chi')");
                    table.CheckConstraint("chk_hd2_loai", "[loai_hoa_don] IN ('tien_coc','tien_thue','dich_vu','hoan_coc','thu_them')");
                    table.CheckConstraint("chk_hd2_pt", "[phuong_thuc] IN ('tien_mat','chuyen_khoan')");
                    table.CheckConstraint("chk_hd2_trangthai", "[trang_thai] IN ('cho_thanh_toan','da_thanh_toan','huy')");
                    table.ForeignKey(
                        name: "fk_hd2_coc",
                        column: x => x.ma_coc,
                        principalTable: "phieu_dat_coc",
                        principalColumn: "ma_coc",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "fk_hd2_doisoat",
                        column: x => x.ma_doi_soat,
                        principalTable: "bang_doi_soat",
                        principalColumn: "ma_doi_soat");
                    table.ForeignKey(
                        name: "fk_hd2_hopdong",
                        column: x => x.ma_hop_dong,
                        principalTable: "hop_dong_thue",
                        principalColumn: "ma_hop_dong");
                    table.ForeignKey(
                        name: "fk_hd2_ketoan",
                        column: x => x.ma_ke_toan,
                        principalTable: "nhan_vien",
                        principalColumn: "ma_nv",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "fk_hd2_kh",
                        column: x => x.ma_kh,
                        principalTable: "khach_hang",
                        principalColumn: "ma_kh",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "chi_tiet_ban_giao",
                columns: table => new
                {
                    ma_bb = table.Column<string>(type: "nvarchar(12)", maxLength: 12, nullable: false),
                    ma_tai_san = table.Column<string>(type: "nvarchar(12)", maxLength: 12, nullable: false),
                    so_luong = table.Column<short>(type: "smallint", nullable: false, defaultValue: (short)1),
                    tinh_trang = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    ghi_chu = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_ctbg", x => new { x.ma_bb, x.ma_tai_san });
                    table.ForeignKey(
                        name: "fk_ctbg_bb",
                        column: x => x.ma_bb,
                        principalTable: "bien_ban_ban_giao",
                        principalColumn: "ma_bb",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_ctbg_taisan",
                        column: x => x.ma_tai_san,
                        principalTable: "tai_san",
                        principalColumn: "ma_tai_san",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "chi_tiet_hoa_don_dich_vu",
                columns: table => new
                {
                    ma_hoa_don = table.Column<string>(type: "nvarchar(12)", maxLength: 12, nullable: false),
                    ma_dich_vu = table.Column<string>(type: "nvarchar(12)", maxLength: 12, nullable: false),
                    so_luong = table.Column<decimal>(type: "decimal(12,2)", nullable: false, defaultValue: 1m),
                    don_gia = table.Column<decimal>(type: "decimal(12,2)", nullable: false),
                    thanh_tien = table.Column<decimal>(type: "decimal(12,2)", nullable: false),
                    ghi_chu = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_cthddv", x => new { x.ma_hoa_don, x.ma_dich_vu });
                    table.CheckConstraint("chk_cthddv_dongia", "[don_gia] >= 0");
                    table.CheckConstraint("chk_cthddv_soluong", "[so_luong] > 0");
                    table.CheckConstraint("chk_cthddv_thanhtien", "[thanh_tien] >= 0");
                    table.ForeignKey(
                        name: "fk_cthddv_dichvu",
                        column: x => x.ma_dich_vu,
                        principalTable: "dich_vu",
                        principalColumn: "ma_dich_vu",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_cthddv_hoadon",
                        column: x => x.ma_hoa_don,
                        principalTable: "hoa_don",
                        principalColumn: "ma_hoa_don",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_bang_doi_soat_ma_ke_toan",
                table: "bang_doi_soat",
                column: "ma_ke_toan");

            migrationBuilder.CreateIndex(
                name: "IX_bang_doi_soat_ma_quan_ly",
                table: "bang_doi_soat",
                column: "ma_quan_ly");

            migrationBuilder.CreateIndex(
                name: "uq_doisoat_hd",
                table: "bang_doi_soat",
                column: "ma_hop_dong",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_bien_ban_ban_giao_ma_quan_ly",
                table: "bien_ban_ban_giao",
                column: "ma_quan_ly");

            migrationBuilder.CreateIndex(
                name: "uq_bbgiao_hd",
                table: "bien_ban_ban_giao",
                column: "ma_hop_dong",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_bien_ban_tra_phong_ma_quan_ly",
                table: "bien_ban_tra_phong",
                column: "ma_quan_ly");

            migrationBuilder.CreateIndex(
                name: "uq_bbtra_doisoat",
                table: "bien_ban_tra_phong",
                column: "ma_doi_soat",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_chi_phi_phat_sinh_ma_doi_soat",
                table: "chi_phi_phat_sinh",
                column: "ma_doi_soat");

            migrationBuilder.CreateIndex(
                name: "IX_chi_tiet_ban_giao_ma_tai_san",
                table: "chi_tiet_ban_giao",
                column: "ma_tai_san");

            migrationBuilder.CreateIndex(
                name: "IX_chi_tiet_hoa_don_dich_vu_ma_dich_vu",
                table: "chi_tiet_hoa_don_dich_vu",
                column: "ma_dich_vu");

            migrationBuilder.CreateIndex(
                name: "IX_dat_coc_giuong_ma_giuong",
                table: "dat_coc_giuong",
                column: "ma_giuong");

            migrationBuilder.CreateIndex(
                name: "IX_ho_so_dang_ky_ma_kh",
                table: "ho_so_dang_ky",
                column: "ma_kh");

            migrationBuilder.CreateIndex(
                name: "IX_ho_so_dang_ky_ma_sale",
                table: "ho_so_dang_ky",
                column: "ma_sale");

            migrationBuilder.CreateIndex(
                name: "IX_hoa_don_ma_coc",
                table: "hoa_don",
                column: "ma_coc");

            migrationBuilder.CreateIndex(
                name: "IX_hoa_don_ma_doi_soat",
                table: "hoa_don",
                column: "ma_doi_soat");

            migrationBuilder.CreateIndex(
                name: "IX_hoa_don_ma_hop_dong",
                table: "hoa_don",
                column: "ma_hop_dong");

            migrationBuilder.CreateIndex(
                name: "IX_hoa_don_ma_ke_toan",
                table: "hoa_don",
                column: "ma_ke_toan");

            migrationBuilder.CreateIndex(
                name: "IX_hoa_don_ma_kh",
                table: "hoa_don",
                column: "ma_kh");

            migrationBuilder.CreateIndex(
                name: "IX_hop_dong_thue_ma_kh",
                table: "hop_dong_thue",
                column: "ma_kh");

            migrationBuilder.CreateIndex(
                name: "IX_hop_dong_thue_ma_phong",
                table: "hop_dong_thue",
                column: "ma_phong");

            migrationBuilder.CreateIndex(
                name: "IX_hop_dong_thue_ma_sale",
                table: "hop_dong_thue",
                column: "ma_sale");

            migrationBuilder.CreateIndex(
                name: "uq_hopdong_coc",
                table: "hop_dong_thue",
                column: "ma_coc",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_lich_xem_phong_ma_ho_so",
                table: "lich_xem_phong",
                column: "ma_ho_so");

            migrationBuilder.CreateIndex(
                name: "IX_lich_xem_phong_ma_sale",
                table: "lich_xem_phong",
                column: "ma_sale");

            migrationBuilder.CreateIndex(
                name: "IX_lich_xem_phong_phong_ma_phong",
                table: "lich_xem_phong_phong",
                column: "ma_phong");

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
                name: "IX_phieu_dat_coc_ma_ho_so",
                table: "phieu_dat_coc",
                column: "ma_ho_so");

            migrationBuilder.CreateIndex(
                name: "IX_phieu_dat_coc_ma_quan_ly",
                table: "phieu_dat_coc",
                column: "ma_quan_ly");

            migrationBuilder.CreateIndex(
                name: "IX_phieu_dat_coc_ma_sale",
                table: "phieu_dat_coc",
                column: "ma_sale");

            migrationBuilder.CreateIndex(
                name: "IX_tai_san_ma_phong",
                table: "tai_san",
                column: "ma_phong");

            migrationBuilder.CreateIndex(
                name: "IX_thanh_vien_thue_ma_hop_dong",
                table: "thanh_vien_thue",
                column: "ma_hop_dong");

            migrationBuilder.CreateIndex(
                name: "IX_thanh_vien_thue_ma_kh",
                table: "thanh_vien_thue",
                column: "ma_kh");

            migrationBuilder.CreateIndex(
                name: "idx_tb_nguoinhan",
                table: "thong_bao",
                columns: new[] { "ma_nguoi_nhan", "da_doc", "ngay_tao" });

            migrationBuilder.CreateIndex(
                name: "IX_thong_bao_ma_nguoi_gui",
                table: "thong_bao",
                column: "ma_nguoi_gui");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "bien_ban_tra_phong");

            migrationBuilder.DropTable(
                name: "chi_phi_phat_sinh");

            migrationBuilder.DropTable(
                name: "chi_tiet_ban_giao");

            migrationBuilder.DropTable(
                name: "chi_tiet_hoa_don_dich_vu");

            migrationBuilder.DropTable(
                name: "dat_coc_giuong");

            migrationBuilder.DropTable(
                name: "lich_xem_phong_phong");

            migrationBuilder.DropTable(
                name: "nhat_ky_quan_tri");

            migrationBuilder.DropTable(
                name: "thanh_vien_thue");

            migrationBuilder.DropTable(
                name: "thong_bao");

            migrationBuilder.DropTable(
                name: "bien_ban_ban_giao");

            migrationBuilder.DropTable(
                name: "tai_san");

            migrationBuilder.DropTable(
                name: "hoa_don");

            migrationBuilder.DropTable(
                name: "lich_xem_phong");

            migrationBuilder.DropTable(
                name: "bang_doi_soat");

            migrationBuilder.DropTable(
                name: "hop_dong_thue");

            migrationBuilder.DropTable(
                name: "phieu_dat_coc");

            migrationBuilder.DropTable(
                name: "ho_so_dang_ky");
        }
    }
}
