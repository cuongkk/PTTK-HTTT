using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class AddCustomerDepositRequestWorkflow : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "chk_hoso_trangthai",
                table: "ho_so_dang_ky");

            migrationBuilder.AddColumn<string>(
                name: "anh_giay_to",
                table: "thanh_vien_thue",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "dia_chi_thuong_tru",
                table: "thanh_vien_thue",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "loai_giay_to",
                table: "thanh_vien_thue",
                type: "nvarchar(30)",
                maxLength: 30,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "nghe_nghiep_truong_hoc",
                table: "thanh_vien_thue",
                type: "nvarchar(150)",
                maxLength: 150,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "quoc_tich",
                table: "thanh_vien_thue",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "tai_lieu_tai_chinh",
                table: "thanh_vien_thue",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddCheckConstraint(
                name: "chk_hoso_trangthai",
                table: "ho_so_dang_ky",
                sql: "[trang_thai] IN ('moi','da_xem_phong','cho_ra_soat_coc','da_dat_coc','huy')");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "chk_hoso_trangthai",
                table: "ho_so_dang_ky");

            migrationBuilder.DropColumn(
                name: "anh_giay_to",
                table: "thanh_vien_thue");

            migrationBuilder.DropColumn(
                name: "dia_chi_thuong_tru",
                table: "thanh_vien_thue");

            migrationBuilder.DropColumn(
                name: "loai_giay_to",
                table: "thanh_vien_thue");

            migrationBuilder.DropColumn(
                name: "nghe_nghiep_truong_hoc",
                table: "thanh_vien_thue");

            migrationBuilder.DropColumn(
                name: "quoc_tich",
                table: "thanh_vien_thue");

            migrationBuilder.DropColumn(
                name: "tai_lieu_tai_chinh",
                table: "thanh_vien_thue");

            migrationBuilder.AddCheckConstraint(
                name: "chk_hoso_trangthai",
                table: "ho_so_dang_ky",
                sql: "[trang_thai] IN ('moi','da_xem_phong','da_dat_coc','huy')");
        }
    }
}
