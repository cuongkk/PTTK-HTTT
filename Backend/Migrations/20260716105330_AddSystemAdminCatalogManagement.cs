using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class AddSystemAdminCatalogManagement : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "gia_dich_vu_ap_dung",
                columns: table => new
                {
                    ma_gia_ap_dung = table.Column<string>(type: "nvarchar(12)", maxLength: 12, nullable: false),
                    ma_dich_vu = table.Column<string>(type: "nvarchar(12)", maxLength: 12, nullable: false),
                    ma_chi_nhanh = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: true),
                    ma_phong = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: true),
                    don_gia = table.Column<decimal>(type: "decimal(12,2)", nullable: false),
                    is_active = table.Column<bool>(type: "bit", nullable: false, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_gia_dich_vu_ap_dung", x => x.ma_gia_ap_dung);
                    table.CheckConstraint("chk_giadv_dongia", "[don_gia] >= 0");
                    table.CheckConstraint("chk_giadv_phamvi", "([ma_chi_nhanh] IS NOT NULL AND [ma_phong] IS NULL) OR ([ma_chi_nhanh] IS NULL AND [ma_phong] IS NOT NULL)");
                    table.ForeignKey(
                        name: "FK_gia_dich_vu_ap_dung_chi_nhanh_ma_chi_nhanh",
                        column: x => x.ma_chi_nhanh,
                        principalTable: "chi_nhanh",
                        principalColumn: "ma_chi_nhanh",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_gia_dich_vu_ap_dung_dich_vu_ma_dich_vu",
                        column: x => x.ma_dich_vu,
                        principalTable: "dich_vu",
                        principalColumn: "ma_dich_vu",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_gia_dich_vu_ap_dung_phong_ma_phong",
                        column: x => x.ma_phong,
                        principalTable: "phong",
                        principalColumn: "ma_phong",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_gia_dich_vu_ap_dung_ma_chi_nhanh",
                table: "gia_dich_vu_ap_dung",
                column: "ma_chi_nhanh");

            migrationBuilder.CreateIndex(
                name: "IX_gia_dich_vu_ap_dung_ma_phong",
                table: "gia_dich_vu_ap_dung",
                column: "ma_phong");

            migrationBuilder.CreateIndex(
                name: "uq_giadv_dichvu_chinhanh",
                table: "gia_dich_vu_ap_dung",
                columns: new[] { "ma_dich_vu", "ma_chi_nhanh" },
                unique: true,
                filter: "[ma_chi_nhanh] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "uq_giadv_dichvu_phong",
                table: "gia_dich_vu_ap_dung",
                columns: new[] { "ma_dich_vu", "ma_phong" },
                unique: true,
                filter: "[ma_phong] IS NOT NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "gia_dich_vu_ap_dung");
        }
    }
}
