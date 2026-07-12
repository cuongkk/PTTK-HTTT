namespace Backend.Dtos;

public class RoomStatusDto
{
    public int Id { get; set; }
    public string Name { get; set; } = default!;      // vd: "Room 501"
    public string Building { get; set; } = default!;  // vd: "Building C"
    public string Status { get; set; } = default!;    // "Available" | "Reserved" | "Deposited"
}

public class RoomStatusFilterRequest
{
    public string? BranchId { get; set; }
    public string? Status { get; set; } // lọc theo trạng thái nếu Quản lý muốn xem riêng 1 loại
}