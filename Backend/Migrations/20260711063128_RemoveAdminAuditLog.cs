using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class RemoveAdminAuditLog : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "nhat_ky_quan_tri");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "nhat_ky_quan_tri",
                columns: table => new
                {
                    ma_nk = table.Column<string>(type: "nvarchar(12)", maxLength: 12, nullable: false),
                    ma_nguoi_thuc = table.Column<string>(type: "nvarchar(12)", maxLength: 12, nullable: false),
                    ma_doi_tuong = table.Column<string>(type: "nvarchar(12)", maxLength: 12, nullable: true),
                    loai_hanh_dong = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    gia_tri_moi = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ghi_chu = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    gia_tri_cu = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    thoi_diem = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSUTCDATETIME()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_nhat_ky_qt", x => x.ma_nk);
                    table.ForeignKey(
                        name: "fk_nkqt_doituong",
                        column: x => x.ma_doi_tuong,
                        principalTable: "tai_khoan",
                        principalColumn: "ma_tai_khoan",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "fk_nkqt_nguoithuc",
                        column: x => x.ma_nguoi_thuc,
                        principalTable: "tai_khoan",
                        principalColumn: "ma_tai_khoan",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "idx_nkqt_doituong",
                table: "nhat_ky_quan_tri",
                columns: new[] { "ma_doi_tuong", "thoi_diem" });

            migrationBuilder.CreateIndex(
                name: "idx_nkqt_hanhdong",
                table: "nhat_ky_quan_tri",
                columns: new[] { "loai_hanh_dong", "thoi_diem" });

            migrationBuilder.CreateIndex(
                name: "idx_nkqt_nguoithuc",
                table: "nhat_ky_quan_tri",
                columns: new[] { "ma_nguoi_thuc", "thoi_diem" });
        }
    }
}
