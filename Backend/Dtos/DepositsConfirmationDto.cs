namespace Backend.Dtos;

public class DepositConfirmationDto
{
    public int Id { get; set; }                // id: 1, 2, 3...
    public string ContractCode { get; set; }   // "DC001"
    public string Customer { get; set; }       // "Nguyễn Văn A"
    public string Room { get; set; }           // "Room 501"
    public string DepositAmount { get; set; }  // "2.000.000 VNĐ"
    public string Status { get; set; }         // "Chờ xác nhận"
    public string Date { get; set; }           // "25/6/2026"
}
