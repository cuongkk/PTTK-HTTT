using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class AddCheckInProfileReviewStatuses : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "chk_hoso_trangthai",
                table: "ho_so_dang_ky");

            migrationBuilder.AlterColumn<string>(
                name: "trang_thai",
                table: "ho_so_dang_ky",
                type: "nvarchar(40)",
                maxLength: 40,
                nullable: false,
                defaultValue: "moi",
                oldClrType: typeof(string),
                oldType: "nvarchar(20)",
                oldMaxLength: 20,
                oldDefaultValue: "moi");

            migrationBuilder.AddCheckConstraint(
                name: "chk_hoso_trangthai",
                table: "ho_so_dang_ky",
                sql: "[trang_thai] IN ('moi','da_xem_phong','cho_ra_soat_coc','da_dat_coc','cho_kiem_tra_nhan_phong','du_dieu_kien_nhan_phong','huy')");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "chk_hoso_trangthai",
                table: "ho_so_dang_ky");

            migrationBuilder.AlterColumn<string>(
                name: "trang_thai",
                table: "ho_so_dang_ky",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "moi",
                oldClrType: typeof(string),
                oldType: "nvarchar(40)",
                oldMaxLength: 40,
                oldDefaultValue: "moi");

            migrationBuilder.AddCheckConstraint(
                name: "chk_hoso_trangthai",
                table: "ho_so_dang_ky",
                sql: "[trang_thai] IN ('moi','da_xem_phong','cho_ra_soat_coc','da_dat_coc','huy')");
        }
    }
}
