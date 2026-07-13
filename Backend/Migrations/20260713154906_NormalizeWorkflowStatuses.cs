using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class NormalizeWorkflowStatuses : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "chk_hoso_trangthai",
                table: "ho_so_dang_ky");

            migrationBuilder.Sql("UPDATE [ho_so_dang_ky] SET [trang_thai] = 'cho_sale_ra_soat_coc' WHERE [trang_thai] = 'cho_ra_soat_coc'");
            migrationBuilder.Sql("UPDATE [ho_so_dang_ky] SET [trang_thai] = 'cho_sale_doi_chieu_nhan_phong' WHERE [trang_thai] = 'cho_kiem_tra_nhan_phong'");

            migrationBuilder.AddCheckConstraint(
                name: "chk_hoso_trangthai",
                table: "ho_so_dang_ky",
                sql: "[trang_thai] IN ('moi','da_xem_phong','cho_sale_ra_soat_coc','cho_quan_ly_xac_nhan_coc','cho_khach_thanh_toan_coc','cho_ke_toan_xac_nhan_coc','da_dat_coc','cho_sale_doi_chieu_nhan_phong','cho_quan_ly_duyet_nhan_phong','du_dieu_kien_nhan_phong','huy')");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "chk_hoso_trangthai",
                table: "ho_so_dang_ky");

            migrationBuilder.Sql("UPDATE [ho_so_dang_ky] SET [trang_thai] = 'cho_ra_soat_coc' WHERE [trang_thai] IN ('cho_sale_ra_soat_coc','cho_quan_ly_xac_nhan_coc','cho_khach_thanh_toan_coc','cho_ke_toan_xac_nhan_coc')");
            migrationBuilder.Sql("UPDATE [ho_so_dang_ky] SET [trang_thai] = 'cho_kiem_tra_nhan_phong' WHERE [trang_thai] IN ('cho_sale_doi_chieu_nhan_phong','cho_quan_ly_duyet_nhan_phong')");

            migrationBuilder.AddCheckConstraint(
                name: "chk_hoso_trangthai",
                table: "ho_so_dang_ky",
                sql: "[trang_thai] IN ('moi','da_xem_phong','cho_ra_soat_coc','da_dat_coc','cho_kiem_tra_nhan_phong','du_dieu_kien_nhan_phong','huy')");
        }
    }
}
