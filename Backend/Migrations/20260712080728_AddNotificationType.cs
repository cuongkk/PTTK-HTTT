using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class AddNotificationType : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "loai_thong_bao",
                table: "thong_bao",
                type: "nvarchar(30)",
                maxLength: 30,
                nullable: false,
                defaultValue: "he_thong");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "loai_thong_bao",
                table: "thong_bao");
        }
    }
}
