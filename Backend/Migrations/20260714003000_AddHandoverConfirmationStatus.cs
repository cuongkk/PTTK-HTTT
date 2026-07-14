using Backend.Data;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations;

[DbContext(typeof(AppDbContext))]
[Migration("20260714003000_AddHandoverConfirmationStatus")]
public partial class AddHandoverConfirmationStatus : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropCheckConstraint(name: "chk_lich_trangthai", table: "lich_xem_phong");
        migrationBuilder.AddCheckConstraint(name: "chk_lich_trangthai", table: "lich_xem_phong", sql: "[trang_thai] IN ('sap_den','dang_xem','hoan_thanh','huy')");
        migrationBuilder.DropCheckConstraint(name: "chk_hd_trangthai", table: "hop_dong_thue");
        migrationBuilder.AddCheckConstraint(
            name: "chk_hd_trangthai",
            table: "hop_dong_thue",
            sql: "[trang_thai] IN ('cho_ky','cho_thanh_toan_nhan_phong','cho_xac_nhan_thanh_toan','cho_xac_nhan_ban_giao','hieu_luc','cho_tra_phong','cho_kiem_tra_tra_phong','cho_doi_soat','cho_khach_xac_nhan','cho_hoan_coc','het_han','thanh_ly')");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropCheckConstraint(name: "chk_lich_trangthai", table: "lich_xem_phong");
        migrationBuilder.AddCheckConstraint(name: "chk_lich_trangthai", table: "lich_xem_phong", sql: "[trang_thai] IN ('sap_den','hoan_thanh','huy')");
        migrationBuilder.DropCheckConstraint(name: "chk_hd_trangthai", table: "hop_dong_thue");
        migrationBuilder.AddCheckConstraint(
            name: "chk_hd_trangthai",
            table: "hop_dong_thue",
            sql: "[trang_thai] IN ('cho_ky','cho_thanh_toan_nhan_phong','cho_xac_nhan_thanh_toan','hieu_luc','cho_tra_phong','cho_kiem_tra_tra_phong','cho_doi_soat','cho_khach_xac_nhan','cho_hoan_coc','het_han','thanh_ly')");
    }
}
