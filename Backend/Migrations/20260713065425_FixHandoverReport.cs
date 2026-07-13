using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class FixHandoverReport : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "HandoverReportHandoverId",
                table: "chi_tiet_ban_giao",
                type: "nvarchar(12)",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_chi_tiet_ban_giao_HandoverReportHandoverId",
                table: "chi_tiet_ban_giao",
                column: "HandoverReportHandoverId");

            migrationBuilder.AddForeignKey(
                name: "FK_chi_tiet_ban_giao_bien_ban_ban_giao_HandoverReportHandoverId",
                table: "chi_tiet_ban_giao",
                column: "HandoverReportHandoverId",
                principalTable: "bien_ban_ban_giao",
                principalColumn: "ma_bb");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_chi_tiet_ban_giao_bien_ban_ban_giao_HandoverReportHandoverId",
                table: "chi_tiet_ban_giao");

            migrationBuilder.DropIndex(
                name: "IX_chi_tiet_ban_giao_HandoverReportHandoverId",
                table: "chi_tiet_ban_giao");

            migrationBuilder.DropColumn(
                name: "HandoverReportHandoverId",
                table: "chi_tiet_ban_giao");
        }
    }
}
