using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class AddResidenceRulesByBranch : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "noi_quy_luu_tru",
                columns: table => new
                {
                    ma_noi_quy = table.Column<string>(type: "nvarchar(12)", maxLength: 12, nullable: false),
                    ma_chi_nhanh = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    tieu_de = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    noi_dung = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    loai_noi_quy = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    muc_do_vi_pham = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false, defaultValue: "nhac_nho"),
                    muc_phat_mac_dinh = table.Column<decimal>(type: "decimal(12,2)", nullable: true),
                    ngay_hieu_luc = table.Column<DateOnly>(type: "date", nullable: false),
                    ngay_het_hieu_luc = table.Column<DateOnly>(type: "date", nullable: true),
                    trang_thai = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false, defaultValue: "hieu_luc"),
                    ngay_tao = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSUTCDATETIME()"),
                    ngay_cap_nhat = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_noi_quy_luu_tru", x => x.ma_noi_quy);
                    table.ForeignKey(
                        name: "fk_noiquy_chinhanh",
                        column: x => x.ma_chi_nhanh,
                        principalTable: "chi_nhanh",
                        principalColumn: "ma_chi_nhanh",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "idx_noiquy_chinhanh_hieuluc",
                table: "noi_quy_luu_tru",
                columns: new[] { "ma_chi_nhanh", "trang_thai", "ngay_hieu_luc" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "noi_quy_luu_tru");
        }
    }
}
