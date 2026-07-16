using Backend.Data;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations;

[DbContext(typeof(AppDbContext))]
[Migration("20260715133000_AddCustomerDepositTermsStatus")]
public partial class AddCustomerDepositTermsStatus : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropCheckConstraint(name: "chk_hoso_trangthai", table: "ho_so_dang_ky");
        migrationBuilder.AddCheckConstraint(
            name: "chk_hoso_trangthai",
            table: "ho_so_dang_ky",
            sql: "[trang_thai] IN ('moi','da_xem_phong','cho_sale_ra_soat_coc','cho_quan_ly_xac_nhan_coc','cho_khach_xac_nhan_dieu_kien_coc','cho_ke_toan_tinh_tien_coc','cho_khach_thanh_toan_coc','cho_ke_toan_xac_nhan_coc','da_dat_coc','cho_sale_doi_chieu_nhan_phong','cho_quan_ly_duyet_nhan_phong','du_dieu_kien_nhan_phong','huy')");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql("UPDATE [ho_so_dang_ky] SET [trang_thai] = 'cho_khach_thanh_toan_coc' WHERE [trang_thai] IN ('cho_khach_xac_nhan_dieu_kien_coc','cho_ke_toan_tinh_tien_coc')");
        migrationBuilder.DropCheckConstraint(name: "chk_hoso_trangthai", table: "ho_so_dang_ky");
        migrationBuilder.AddCheckConstraint(
            name: "chk_hoso_trangthai",
            table: "ho_so_dang_ky",
            sql: "[trang_thai] IN ('moi','da_xem_phong','cho_sale_ra_soat_coc','cho_quan_ly_xac_nhan_coc','cho_khach_thanh_toan_coc','cho_ke_toan_xac_nhan_coc','da_dat_coc','cho_sale_doi_chieu_nhan_phong','cho_quan_ly_duyet_nhan_phong','du_dieu_kien_nhan_phong','huy')");
    }
}
