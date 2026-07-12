using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class AddRentalContract : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "RentalContract",
                columns: table => new
                {
                    RentalContractId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    RoomId = table.Column<string>(type: "nvarchar(10)", nullable: false),
                    CustomerId = table.Column<string>(type: "nvarchar(12)", nullable: false),
                    BedId = table.Column<string>(type: "nvarchar(12)", nullable: true),
                    StartDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EndDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    MonthlyRent = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    DepositAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedByAccountId = table.Column<string>(type: "nvarchar(12)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RentalContract", x => x.RentalContractId);
                    table.ForeignKey(
                        name: "FK_RentalContract_giuong_BedId",
                        column: x => x.BedId,
                        principalTable: "giuong",
                        principalColumn: "ma_giuong");
                    table.ForeignKey(
                        name: "FK_RentalContract_khach_hang_CustomerId",
                        column: x => x.CustomerId,
                        principalTable: "khach_hang",
                        principalColumn: "ma_kh",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_RentalContract_phong_RoomId",
                        column: x => x.RoomId,
                        principalTable: "phong",
                        principalColumn: "ma_phong",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_RentalContract_tai_khoan_UpdatedByAccountId",
                        column: x => x.UpdatedByAccountId,
                        principalTable: "tai_khoan",
                        principalColumn: "ma_tai_khoan");
                });

            migrationBuilder.CreateIndex(
                name: "IX_RentalContract_BedId",
                table: "RentalContract",
                column: "BedId");

            migrationBuilder.CreateIndex(
                name: "IX_RentalContract_CustomerId",
                table: "RentalContract",
                column: "CustomerId");

            migrationBuilder.CreateIndex(
                name: "IX_RentalContract_RoomId",
                table: "RentalContract",
                column: "RoomId");

            migrationBuilder.CreateIndex(
                name: "IX_RentalContract_UpdatedByAccountId",
                table: "RentalContract",
                column: "UpdatedByAccountId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "RentalContract");
        }
    }
}
