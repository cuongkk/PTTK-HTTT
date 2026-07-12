using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class SupportMultipleTenantsInDepositRequest : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "la_nguoi_dung_ten",
                table: "thanh_vien_thue",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "ma_ho_so",
                table: "thanh_vien_thue",
                type: "nvarchar(12)",
                maxLength: 12,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "quan_he_nguoi_dung_ten",
                table: "thanh_vien_thue",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_thanh_vien_thue_ma_ho_so",
                table: "thanh_vien_thue",
                column: "ma_ho_so");

            migrationBuilder.AddForeignKey(
                name: "fk_tv_hoso",
                table: "thanh_vien_thue",
                column: "ma_ho_so",
                principalTable: "ho_so_dang_ky",
                principalColumn: "ma_ho_so");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_tv_hoso",
                table: "thanh_vien_thue");

            migrationBuilder.DropIndex(
                name: "IX_thanh_vien_thue_ma_ho_so",
                table: "thanh_vien_thue");

            migrationBuilder.DropColumn(
                name: "la_nguoi_dung_ten",
                table: "thanh_vien_thue");

            migrationBuilder.DropColumn(
                name: "ma_ho_so",
                table: "thanh_vien_thue");

            migrationBuilder.DropColumn(
                name: "quan_he_nguoi_dung_ten",
                table: "thanh_vien_thue");
        }
    }
}
