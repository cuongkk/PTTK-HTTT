using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class AddRoomPresentationData : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "dien_tich_m2",
                table: "phong",
                type: "decimal(6,2)",
                nullable: true);

            migrationBuilder.AddColumn<TimeOnly>(
                name: "gio_gioi_nghiem",
                table: "phong",
                type: "time",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "gioi_tinh_cho_phep",
                table: "phong",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "mo_ta",
                table: "phong",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<short>(
                name: "tang",
                table: "phong",
                type: "smallint",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "yeu_cau_yen_tinh",
                table: "phong",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateTable(
                name: "hinh_anh_phong",
                columns: table => new
                {
                    ma_hinh_anh = table.Column<string>(type: "nvarchar(12)", maxLength: 12, nullable: false),
                    ma_phong = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    duong_dan = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    mo_ta = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    thu_tu_hien_thi = table.Column<short>(type: "smallint", nullable: false),
                    la_anh_dai_dien = table.Column<bool>(type: "bit", nullable: false, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_hinh_anh_phong", x => x.ma_hinh_anh);
                    table.ForeignKey(
                        name: "fk_hinhanh_phong",
                        column: x => x.ma_phong,
                        principalTable: "phong",
                        principalColumn: "ma_phong",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "tien_nghi",
                columns: table => new
                {
                    ma_tien_nghi = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    ten_tien_nghi = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    mo_ta = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: true),
                    is_active = table.Column<bool>(type: "bit", nullable: false, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_tien_nghi", x => x.ma_tien_nghi);
                });

            migrationBuilder.CreateTable(
                name: "phong_tien_nghi",
                columns: table => new
                {
                    ma_phong = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    ma_tien_nghi = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    so_luong = table.Column<short>(type: "smallint", nullable: false, defaultValue: (short)1),
                    ghi_chu = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_phong_tien_nghi", x => new { x.ma_phong, x.ma_tien_nghi });
                    table.ForeignKey(
                        name: "fk_ptn_phong",
                        column: x => x.ma_phong,
                        principalTable: "phong",
                        principalColumn: "ma_phong",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_ptn_tiennghi",
                        column: x => x.ma_tien_nghi,
                        principalTable: "tien_nghi",
                        principalColumn: "ma_tien_nghi",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "idx_hinhanh_phong_thutu",
                table: "hinh_anh_phong",
                columns: new[] { "ma_phong", "thu_tu_hien_thi" });

            migrationBuilder.CreateIndex(
                name: "IX_phong_tien_nghi_ma_tien_nghi",
                table: "phong_tien_nghi",
                column: "ma_tien_nghi");

            migrationBuilder.CreateIndex(
                name: "uq_tiennghi_ten",
                table: "tien_nghi",
                column: "ten_tien_nghi",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "hinh_anh_phong");

            migrationBuilder.DropTable(
                name: "phong_tien_nghi");

            migrationBuilder.DropTable(
                name: "tien_nghi");

            migrationBuilder.DropColumn(
                name: "dien_tich_m2",
                table: "phong");

            migrationBuilder.DropColumn(
                name: "gio_gioi_nghiem",
                table: "phong");

            migrationBuilder.DropColumn(
                name: "gioi_tinh_cho_phep",
                table: "phong");

            migrationBuilder.DropColumn(
                name: "mo_ta",
                table: "phong");

            migrationBuilder.DropColumn(
                name: "tang",
                table: "phong");

            migrationBuilder.DropColumn(
                name: "yeu_cau_yen_tinh",
                table: "phong");
        }
    }
}
