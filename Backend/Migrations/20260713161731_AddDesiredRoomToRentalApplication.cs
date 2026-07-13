using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class AddDesiredRoomToRentalApplication : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ma_phong_mong_muon",
                table: "ho_so_dang_ky",
                type: "nvarchar(10)",
                maxLength: 10,
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_ho_so_dang_ky_ma_phong_mong_muon",
                table: "ho_so_dang_ky",
                column: "ma_phong_mong_muon");

            migrationBuilder.AddForeignKey(
                name: "fk_hoso_phong_mong_muon",
                table: "ho_so_dang_ky",
                column: "ma_phong_mong_muon",
                principalTable: "phong",
                principalColumn: "ma_phong",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_hoso_phong_mong_muon",
                table: "ho_so_dang_ky");

            migrationBuilder.DropIndex(
                name: "IX_ho_so_dang_ky_ma_phong_mong_muon",
                table: "ho_so_dang_ky");

            migrationBuilder.DropColumn(
                name: "ma_phong_mong_muon",
                table: "ho_so_dang_ky");
        }
    }
}
